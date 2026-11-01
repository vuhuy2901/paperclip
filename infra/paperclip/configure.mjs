import fs from "node:fs";

const path = "/home/node/.paperclip/instances/default/config.json";
const config = JSON.parse(fs.readFileSync(path, "utf8"));
const localTrusted = process.env.PAPERCLIP_DEPLOYMENT_MODE === "local_trusted";
// Keep Paperclip itself on loopback in local-trusted mode. The entrypoint
// starts a same-container loopback proxy so Docker can publish localhost:3100
// without weakening Paperclip's local-trusted validation.
config.server.bind = "loopback";
config.server.host = "127.0.0.1";
config.server.port = localTrusted ? 3101 : 3100;
config.server.deploymentMode = localTrusted ? "local_trusted" : "authenticated";
config.server.exposure = "private";
config.server.allowedHostnames = ["localhost", "127.0.0.1", "paperclip"];
fs.writeFileSync(path, JSON.stringify(config, null, 2));
