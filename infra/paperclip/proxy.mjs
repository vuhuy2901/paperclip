import http from "node:http";
import { pathToFileURL } from "node:url";

const listenPort = Number(process.env.PAPERCLIP_PROXY_PORT ?? 3100);
const targetPort = Number(process.env.PAPERCLIP_INTERNAL_PORT ?? 3101);

function forward(request, response) {
  const headers = { ...request.headers, host: `127.0.0.1:${targetPort}` };
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
  request.pipe(upstream);
}

export function createProxyServer() {
  return http.createServer(async (request, response) => {
    forward(request, response);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createProxyServer().listen(listenPort, "0.0.0.0");
}
