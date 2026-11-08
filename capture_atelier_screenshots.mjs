import { chromium } from "@playwright/test";
import path from "node:path";

const BASE = "http://127.0.0.1:3100";
const OUT_DIR = "C:/Users/TUAN/Downloads/qldapm_fina/docs/screenshots";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  });
  
  // 1. Desktop viewport (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "vi-VN",
  });
  const page = await desktopContext.newPage();

  console.log("Navigating to http://127.0.0.1:3100 ...");
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(4000);

  console.log("Capturing desktop-01-dashboard.png...");
  await page.screenshot({ path: path.join(OUT_DIR, "desktop-01-dashboard.png"), fullPage: false });

  console.log("Capturing desktop-02-conversation-sidecar.png...");
  await page.goto(`${BASE}/chats`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT_DIR, "desktop-02-conversation-sidecar.png"), fullPage: false });

  console.log("Capturing desktop-03-design-studio.png...");
  await page.goto(`${BASE}/design-studio`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(OUT_DIR, "desktop-03-design-studio.png"), fullPage: false });

  console.log("Capturing desktop-04-skills-catalog.png...");
  await page.goto(`${BASE}/skills`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT_DIR, "desktop-04-skills-catalog.png"), fullPage: false });

  console.log("Capturing desktop-05-cost-estimation.png...");
  await page.goto(`${BASE}/cost-estimation`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT_DIR, "desktop-05-cost-estimation.png"), fullPage: false });

  console.log("Capturing desktop-06-system-health.png...");
  await page.goto(`${BASE}/system-health`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT_DIR, "desktop-06-system-health.png"), fullPage: false });

  // 2. Mobile viewport (390x844 - iPhone 14)
  console.log("Capturing mobile views...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: "vi-VN",
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(OUT_DIR, "mobile-01-dashboard.png"), fullPage: false });

  await mobilePage.goto(`${BASE}/chats`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(OUT_DIR, "mobile-02-conversation.png"), fullPage: false });

  await browser.close();
  console.log("All screenshots captured successfully in", OUT_DIR);
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
