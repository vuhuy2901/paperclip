import { chromium } from "../vendor/paperclip-core/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs";

const label = process.argv[2] ?? "after";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  // Viewing the issue must not start agents, send messages, or change task status.
  await page.route("**/api/**", route => {
    const request = route.request();
    const dataQuery = /\/(?:bridge\/data|data\/[^/]+)$/.test(new URL(request.url()).pathname);
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method()) && !dataQuery) return route.abort();
    return route.continue();
  });
  await page.goto("http://localhost:3100/AIS/issues/AIS-22", { waitUntil: "domcontentloaded" });
  const notice = page.getByRole("status", { name: "Task recovery", exact: true });
  await notice.waitFor({ timeout: 60000 });
  if (label !== "before") await notice.getByText("AI connection restored.", { exact: false }).waitFor({ timeout: 15000 });
  await page.screenshot({ path: `data/recovery-${label}.png`, fullPage: true });
  console.log(JSON.stringify({ phase: label, url: page.url(), notice: await notice.innerText(), errors }));
  if (label !== "before") {
    await page.reload({ waitUntil: "domcontentloaded" });
    await notice.getByText("AI connection restored.", { exact: false }).waitFor({ timeout: 30000 });
    console.log(JSON.stringify({ hardRefresh: "pass", retryVisible: await notice.getByRole("button", { name: "Retry task", exact: true }).isVisible() }));
  }
} finally {
  await browser.close();
}
