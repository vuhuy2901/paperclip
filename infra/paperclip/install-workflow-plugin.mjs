const baseUrl = "http://127.0.0.1:3101";
const pluginPath = "/opt/workflow-studio";
const deadline = Date.now() + 120_000;

async function waitForPaperclip() {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // Paperclip is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("Paperclip did not become ready before the plugin install timeout");
}

await waitForPaperclip();

const listResponse = await fetch(`${baseUrl}/api/plugins`);
if (!listResponse.ok) throw new Error(`Could not inspect installed plugins (${listResponse.status})`);
const installed = await listResponse.json();
let plugin = installed.find((item) => item.pluginKey === "ai-company-workflow-studio");
if (!plugin) {
  const response = await fetch(`${baseUrl}/api/plugins/install`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ packageName: pluginPath, isLocalPath: true })
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Workflow Studio install failed (${response.status}): ${body}`);
  plugin = JSON.parse(body);
}
if (plugin.status === "upgrade_pending") {
  const enableResponse = await fetch(`${baseUrl}/api/plugins/${plugin.id}/enable`, { method: "POST" });
  const enableBody = await enableResponse.text();
  if (!enableResponse.ok) throw new Error(`Workflow Studio capability approval failed (${enableResponse.status}): ${enableBody}`);
  plugin = JSON.parse(enableBody);
}
if (plugin.status !== "ready") throw new Error(`Workflow Studio installed with status ${plugin.status ?? "unknown"}`);

console.log(`Workflow Studio ready: ${plugin.pluginKey ?? plugin.id}`);
