import { startServer } from "./index.js";

console.log("=================================================");
console.log(" Starting ATELIER AI 2.0 (Paperclip Local-Lite)");
console.log(" URL: http://localhost:3100");
console.log(" Database: Embedded PostgreSQL (port 54329)");
console.log("=================================================");

try {
  const result = await startServer();
  console.log(`\n>>> ATELIER AI 2.0 is listening at http://127.0.0.1:${result.listenPort} <<<`);
  console.log(`>>> Mode: Local-Lite (Zero Docker, Zero Redis, Zero RabbitMQ) <<<\n`);
} catch (error) {
  console.error("FATAL: Failed to start ATELIER AI server:", error);
  process.exit(1);
}
