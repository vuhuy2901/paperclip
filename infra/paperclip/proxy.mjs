import http from "node:http";
import { pathToFileURL } from "node:url";

const listenPort = Number(process.env.PAPERCLIP_PROXY_PORT ?? 3100);
const targetPort = Number(process.env.PAPERCLIP_INTERNAL_PORT ?? 3101);
const maxMutationBodyBytes = 1024 * 1024;

export function checkoutIssueId(method, requestUrl) {
  if (method !== "POST" || !requestUrl) return null;
  const pathname = new URL(requestUrl, "http://paperclip.local").pathname;
  const match = pathname.match(/^\/api\/issues\/([^/]+)\/checkout$/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxMutationBodyBytes) throw new Error("Request body is too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function forward(request, response, body) {
  const headers = { ...request.headers, host: `127.0.0.1:${targetPort}` };
  if (body) headers["content-length"] = String(body.length);
  const upstream = http.request(
    { hostname: "127.0.0.1", port: targetPort, path: request.url, method: request.method, headers },
    (targetResponse) => {
      response.writeHead(targetResponse.statusCode ?? 502, targetResponse.headers);
      targetResponse.pipe(response);
    },
  );
  upstream.on("error", () => {
    if (!response.headersSent) response.writeHead(502, { "content-type": "text/plain" });
    response.end("Paperclip is starting");
  });
  if (body) upstream.end(body);
  else request.pipe(upstream);
}

async function jsonFromInternal(path, init, requestHeaders) {
  const headers = {
    "content-type": "application/json",
    ...(requestHeaders.authorization ? { authorization: requestHeaders.authorization } : {}),
    ...(requestHeaders["x-paperclip-run-id"] ? { "x-paperclip-run-id": requestHeaders["x-paperclip-run-id"] } : {}),
  };
  const result = await fetch(`http://127.0.0.1:${targetPort}${path}`, { ...init, headers, signal: AbortSignal.timeout(10_000) });
  const payload = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(payload?.message ?? payload?.error ?? `Paperclip returned HTTP ${result.status}`);
  return payload;
}

async function enforceCheckoutGate(issueId, body, requestHeaders) {
  const checkout = JSON.parse(body.toString("utf8") || "{}");
  if (typeof checkout.agentId !== "string" || !checkout.agentId.trim()) {
    return { allowed: false, code: "AGENT_ID_REQUIRED", reason: "Checkout requires agentId for Workflow Execution Gate enforcement." };
  }
  const issue = await jsonFromInternal(`/api/issues/${encodeURIComponent(issueId)}`, { method: "GET" }, requestHeaders);
  const companyId = issue.companyId;
  if (typeof companyId !== "string" || !companyId) {
    return { allowed: false, code: "ISSUE_COMPANY_REQUIRED", reason: "Issue company could not be resolved for Workflow Execution Gate enforcement." };
  }
  const envelope = await jsonFromInternal(
    "/api/plugins/ai-company-workflow-studio/actions/can-execute",
    {
      method: "POST",
      body: JSON.stringify({ companyId, params: { companyId, issueId, agentId: checkout.agentId } })
    },
    requestHeaders
  );
  return envelope?.data ?? envelope;
}

export function createProxyServer() {
  return http.createServer(async (request, response) => {
    const issueId = checkoutIssueId(request.method, request.url);
    if (!issueId) {
      forward(request, response);
      return;
    }
    try {
      const body = await readBody(request);
      const decision = await enforceCheckoutGate(issueId, body, request.headers);
      if (!decision || decision.allowed !== true) {
        response.writeHead(409, { "content-type": "application/json" });
        response.end(JSON.stringify({
          error: "WORKFLOW_EXECUTION_DENIED",
          code: decision?.code ?? "WORKFLOW_GATE_UNAVAILABLE",
          reason: decision?.reason ?? "Workflow Execution Gate returned no valid admission decision."
        }));
        return;
      }
      forward(request, response, body);
    } catch (error) {
      response.writeHead(503, { "content-type": "application/json" });
      response.end(JSON.stringify({
        error: "WORKFLOW_GATE_UNAVAILABLE",
        reason: error instanceof Error ? error.message : String(error)
      }));
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createProxyServer().listen(listenPort, "0.0.0.0");
}
