import fs from "node:fs";

const path = "/home/node/.paperclip/instances/default/config.json";
const config = JSON.parse(fs.readFileSync(path, "utf8"));
config.server.bind = "lan";
config.server.host = "0.0.0.0";
config.server.deploymentMode = "authenticated";
config.server.exposure = "private";
config.server.allowedHostnames = ["localhost", "127.0.0.1", "paperclip"];
fs.writeFileSync(path, JSON.stringify(config, null, 2));
