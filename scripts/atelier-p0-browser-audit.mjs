import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const phase = process.argv[2] || "audit";
const outputRoot = process.argv[3] || path.resolve("..", "docs", "build", "EVIDENCE", "FEAT-2026-003");
fs.mkdirSync(outputRoot, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
});

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedResponses = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
  });

  await page.goto("http://127.0.0.1:3100/design-studio", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.waitForTimeout(8_000);

  const metrics = await page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const bounds = element.getBoundingClientRect();
      return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
    };
    return {
      title: document.title,
      bodyText: document.body.innerText.slice(0, 4_000),
      workspace: rect(".workspace-layout"),
      viewport: rect(".viewport-stage-wrapper"),
      inspector: rect(".inspector-dock"),
      inspectorColumn: rect(".inspector-column"),
      assistant: rect(".ai-assistant-dock"),
      viewportStage: rect(".viewport-stage-wrapper"),
      canvasCount: document.querySelectorAll("canvas").length,
      buttons: [...document.querySelectorAll("button")]
        .map((button) => button.innerText.trim())
        .filter(Boolean),
    };
  });

  await page.screenshot({ path: path.join(outputRoot, `${phase}-design-studio.png`), fullPage: false });
  const report = { phase, url: page.url(), metrics, consoleErrors, failedResponses };
  fs.writeFileSync(path.join(outputRoot, `${phase}-browser-audit.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
