import { chromium } from "../vendor/paperclip-core/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs";

const projectId = "38336b9c-9469-49c0-b49c-3019823bd01f";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const blockedMutations = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/**", (route) => {
  const request = route.request();
  const readOnly = ["GET", "HEAD", "OPTIONS"].includes(request.method()) ||
    (request.method() === "POST" && /\/api\/plugins\/[^/]+\/data\//.test(request.url())) ||
    (request.method() === "POST" && /\/api\/plugins\/[^/]+\/actions\/preflight-check$/.test(new URL(request.url()).pathname));
  if (readOnly) return route.continue();
  blockedMutations.push(`${request.method()} ${new URL(request.url()).pathname}`);
  return route.abort();
});
const projectUrl = `http://localhost:3100/AIS/projects/${projectId}`;
await page.goto(projectUrl, { waitUntil: "domcontentloaded" });
await page.getByText("Yêu cầu gần nhất", { exact: true }).waitFor();
await page.getByRole("link", { name: "Xem Tasks" }).click();
await page.getByText("Chưa có công việc AI thực hiện", { exact: true }).waitFor();
const tasks = {
  url: page.url(),
  emptyState: await page.getByText("Chưa có công việc AI thực hiện", { exact: true }).isVisible(),
  manualAction: await page.getByRole("button", { name: "Thêm Task thủ công" }).isVisible(),
  oldStageVisible: await page.getByText("Analyze and plan", { exact: true }).count(),
};
await page.screenshot({ path: "data/project-ux-tasks.png", fullPage: true });

await page.goto("http://localhost:3100/issues", { waitUntil: "domcontentloaded" });
await page.getByText("Công việc AI thực hiện", { exact: true }).waitFor();
const globalTasks = {
  url: page.url(),
  advanced: await page.getByRole("button", { name: "Advanced / History" }).isVisible(),
  today: await page.getByText("Today", { exact: true }).count(),
  yesterday: await page.getByText("Yesterday", { exact: true }).count(),
};
await page.screenshot({ path: "data/project-ux-global-tasks.png", fullPage: true });

await page.goto(projectUrl, { waitUntil: "domcontentloaded" });
await page.getByRole("link", { name: "Mở Live Monitor" }).click();
await page.getByText("Live Workflow Monitor", { exact: false }).first().waitFor({ timeout: 30000 });
await page.reload({ waitUntil: "domcontentloaded" });
const canvas = page.locator(".react-flow").first();
await canvas.waitFor();
const monitor = {
  url: page.url(),
  canvas: await canvas.boundingBox(),
  nodes: await page.locator(".react-flow__node").count(),
};
if (monitor.canvas.width < 500 || monitor.canvas.height < 400) {
  throw new Error(`Monitor canvas is too small: ${JSON.stringify(monitor.canvas)}`);
}
const pmNode = page.locator(".react-flow__node").filter({ hasText: "Analyze and plan" }).first();
await pmNode.click();
monitor.pmNode = await pmNode.innerText();
monitor.pmBounds = await pmNode.boundingBox();
monitor.inspector = await page.getByRole("button", { name: /Live Logs/ }).count();
await page.screenshot({ path: "data/project-ux-monitor.png", fullPage: true });

await page.goto(projectUrl, { waitUntil: "domcontentloaded" });
await page.getByRole("link", { name: "Giao yêu cầu cho AI" }).click();
const dialog = page.getByRole("dialog");
await dialog.getByText("Giao yêu cầu cho AI", { exact: true }).waitFor({ timeout: 30000 });
const form = {
  url: page.url(),
  emptyRequirement: (await dialog.locator("textarea").inputValue()) === "",
  projectSelected: (await dialog.locator("select").first().inputValue()) === projectId,
  draftOptionCount: await dialog.locator("select").nth(1).locator("option", { hasText: "[Draft]" }).count(),
  noPublishedNotice: await dialog.getByText("Chưa có Workflow đã Publish.", { exact: false }).count(),
};
await page.screenshot({ path: "data/project-ux-requirement-form.png", fullPage: true });
await browser.close();
console.log(JSON.stringify({ tasks, globalTasks, monitor, form, errors, blockedMutations }, null, 2));
if (errors.length || !tasks.emptyState || !tasks.manualAction || !form.emptyRequirement || !form.projectSelected || form.draftOptionCount || !monitor.inspector) process.exitCode = 1;
