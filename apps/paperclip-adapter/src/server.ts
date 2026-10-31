import { createServer } from "node:http";

const coreUrl = process.env.CORE_API_URL ?? "http://localhost:8000";
const token = process.env.SERVICE_TOKEN ?? "dev-service-token";
const seen = new Set<string>();

async function forward(path: string, method: string, body: unknown) {
  const response = await fetch(`${coreUrl}${path}`, { method, headers: { "content-type": "application/json", "x-service-token": token }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, body: await response.text() };
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/adapter/wake") { res.writeHead(404); res.end("not found"); return; }
  let raw = ""; for await (const chunk of req) raw += chunk;
  try {
    const payload = JSON.parse(raw || "{}"); const key = String(payload.idempotency_key ?? "");
    if (key && seen.has(key)) { res.writeHead(202, { "content-type": "application/json" }); res.end(JSON.stringify({ accepted: true, deduplicated: true })); return; }
    if (key) seen.add(key); const result = await forward("/api/integrations/paperclip/wake", "POST", payload);
    res.writeHead(result.status, { "content-type": "application/json" }); res.end(result.body);
  } catch { res.writeHead(400, { "content-type": "application/json" }); res.end(JSON.stringify({ error: "invalid JSON payload" })); }
});

server.listen(Number(process.env.PORT ?? 8090), "0.0.0.0", () => console.log("Paperclip adapter listening"));
