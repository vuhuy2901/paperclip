import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const phase = process.argv[2] || "before";
const outputRoot = process.argv[3] || "C:\\Users\\TUAN\\Downloads\\atelier-p0-geometry-evidence-20261110";
fs.mkdirSync(outputRoot, { recursive: true });

const report = {
  phase,
  projectId: "proj_demo_4x5m",
  consoleErrors: [],
  failedResponses: [],
  requestCount: 0,
};

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
});

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__ATELIER_AUDIT__ = { longTasks: [] };
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__ATELIER_AUDIT__.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
          }
        });
        observer.observe({ entryTypes: ["longtask"] });
      } catch {}
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") report.consoleErrors.push(message.text());
  });
  page.on("request", () => {
    report.requestCount += 1;
  });
  page.on("response", (response) => {
    if (response.status() >= 400) report.failedResponses.push({ status: response.status(), url: response.url() });
  });

  await page.goto("http://127.0.0.1:3100/design-studio", { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(6_000);
  await page.getByLabel("Chọn dự án nội thất").selectOption(report.projectId);
  await page.waitForTimeout(5_000);

  const projectResponse = await page.request.get(`http://127.0.0.1:3100/api/v1/projects/${report.projectId}`);
  const project = await projectResponse.json();
  report.revision = project.revision;
  const primaryRoom = project.rooms[0];
  const xs = primaryRoom.polygon_mm.map((point) => point[0]);
  const ys = primaryRoom.polygon_mm.map((point) => point[1]);
  const primaryBounds = { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  report.geometry = {
    roomCount: project.rooms.length,
    wallCount: project.walls.length,
    openingCount: project.openings.length,
    primaryBounds,
    wallsOutsidePrimaryBounds: project.walls.filter((wall) => [...wall.start_mm, ...wall.end_mm].some((value, index) => {
      const isX = index % 2 === 0;
      return isX ? value < primaryBounds.minX || value > primaryBounds.maxX : value < primaryBounds.minY || value > primaryBounds.maxY;
    })).map((wall) => wall.id),
    diagonalWalls: project.walls.filter((wall) => wall.start_mm[0] !== wall.end_mm[0] && wall.start_mm[1] !== wall.end_mm[1]).map((wall) => wall.id),
  };

  await page.getByRole("button", { name: "2D", exact: true }).click();
  await page.waitForTimeout(1_500);
  const svg = page.locator('svg[aria-label="Bản vẽ mặt bằng kỹ thuật 2D tỷ lệ 1:1"]');
  report.twoD = await svg.evaluate((element) => ({
    viewBox: element.getAttribute("viewBox"),
    bounds: element.getBoundingClientRect().toJSON(),
    lineCount: element.querySelectorAll("line").length,
    polygonCount: element.querySelectorAll("polygon").length,
  }));
  const beforeWheelViewBox = await svg.getAttribute("viewBox");
  await svg.hover();
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(250);
  report.twoD.wheelChangesCamera = beforeWheelViewBox !== await svg.getAttribute("viewBox");
  await page.screenshot({ path: path.join(outputRoot, `${phase}-full-2d.png`), fullPage: false });

  const scrollProbe = async (rootSelector) => page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) return { found: false };
    const candidates = [root, ...root.querySelectorAll("*")];
    const target = candidates.find((element) => {
      const style = getComputedStyle(element);
      return /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 20;
    });
    if (!target) return { found: false };
    const before = target.scrollTop;
    target.scrollTop = Math.min(target.scrollHeight, before + 300);
    return { found: true, before, after: target.scrollTop, clientHeight: target.clientHeight, scrollHeight: target.scrollHeight };
  }, rootSelector);
  report.inspectorScroll = await scrollProbe(".inspector-dock");

  await page.getByRole("button", { name: "AI Copilot", exact: true }).click();
  await page.waitForTimeout(600);
  report.chatMessageCount = await page.locator('[data-testid^="chat-message-"]').count();
  report.aiScroll = await scrollProbe(".ai-assistant-dock");
  await page.screenshot({ path: path.join(outputRoot, `${phase}-copilot-open.png`), fullPage: false });
  await page.getByRole("button", { name: "AI Copilot", exact: true }).click();

  await page.getByRole("button", { name: "3D", exact: true }).click();
  await page.waitForTimeout(4_000);
  const glbBeforeSelection = await page.evaluate(() => window.__ATELIER_MATERIAL_METRICS__?.glbLoadCount || 0);
  await page.getByTestId("furniture-item-furn_table_main").click();
  await page.waitForTimeout(2_500);
  await page.getByTestId("furniture-item-furn_sofa_main").click();
  await page.waitForTimeout(2_500);
  const glbAfterSelection = await page.evaluate(() => window.__ATELIER_MATERIAL_METRICS__?.glbLoadCount || 0);
  report.renderer = {
    canvasCount: await page.locator("canvas").count(),
    glbBeforeSelection,
    glbAfterSelection,
    glbReloadsFromTwoSelections: glbAfterSelection - glbBeforeSelection,
  };
  report.frameTiming = await page.evaluate(() => new Promise((resolve) => {
    const samples = [];
    let last = performance.now();
    const tick = (now) => {
      samples.push(now - last);
      last = now;
      if (samples.length >= 120) {
        const sorted = [...samples].sort((a, b) => a - b);
        resolve({
          averageMs: samples.reduce((sum, value) => sum + value, 0) / samples.length,
          p95Ms: sorted[Math.floor(sorted.length * 0.95)],
          maxMs: Math.max(...samples),
          estimatedFps: 1000 / (samples.reduce((sum, value) => sum + value, 0) / samples.length),
        });
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
  await page.screenshot({ path: path.join(outputRoot, `${phase}-full-3d.png`), fullPage: false });

  await page.getByRole("button", { name: "2D + 3D", exact: true }).click();
  await page.waitForTimeout(2_000);
  await page.screenshot({ path: path.join(outputRoot, `${phase}-split.png`), fullPage: false });
  report.longTasks = await page.evaluate(() => window.__ATELIER_AUDIT__?.longTasks || []);
  report.longTaskSummary = {
    count: report.longTasks.length,
    totalMs: report.longTasks.reduce((sum, item) => sum + item.duration, 0),
    maxMs: Math.max(0, ...report.longTasks.map((item) => item.duration)),
  };
  report.finalRequestCount = report.requestCount;
} catch (error) {
  report.failure = error instanceof Error ? error.stack : String(error);
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(outputRoot, `${phase}-audit.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
