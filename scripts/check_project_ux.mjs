import { chromium } from "../vendor/paperclip-core/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs";

const phase = process.argv[2] ?? "after";
const projectId = "38336b9c-9469-49c0-b49c-3019823bd01f";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/**", (route) => {
  const request = route.request();
  const readOnlyPluginData = /\/api\/plugins\/[^/]+\/data\//.test(request.url());
  if (["GET", "HEAD", "OPTIONS"].includes(request.method()) ||
    (request.method() === "POST" && readOnlyPluginData)) return route.continue();
  return route.abort();
});
await page.goto(`http://localhost:3100/AIS/projects/${projectId}`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3500);
const before = {
  url: page.url(),
  title: await page.title(),
  headings: await page.locator("h1,h2,h3").allTextContents(),
  body: (await page.locator("body").innerText()).slice(0, 4000),
  errors,
};
await page.screenshot({ path: `data/project-ux-${phase}.png`, fullPage: true });
if (phase === "after") {
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText("Yêu cầu gần nhất", { exact: true }).waitFor({ timeout: 30000 });
  before.hardRefresh = {
    url: page.url(),
    requirementVisible: await page.getByText("Yêu cầu gần nhất", { exact: true }).isVisible(),
    actionVisible: await page.getByText("Cần bạn xử lý", { exact: true }).isVisible(),
  };
}
console.log(JSON.stringify(before, null, 2));
await browser.close();
