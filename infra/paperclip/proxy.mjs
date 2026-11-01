import http from "node:http";

const listenPort = 3100;
const targetPort = 3101;

const server = http.createServer((request, response) => {
  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: targetPort,
      path: request.url,
      method: request.method,
      headers: { ...request.headers, host: `127.0.0.1:${targetPort}` },
    },
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
});

server.listen(listenPort, "0.0.0.0");
