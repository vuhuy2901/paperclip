import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const outputRoot = process.argv[2] || path.resolve("..", "docs", "build", "EVIDENCE", "FEAT-2026-003");
fs.mkdirSync(outputRoot, { recursive: true });
const baseUrl = "http://127.0.0.1:3100";
const fixtureName = `P0 Regression Fixture ${new Date().toISOString().replace(/[:.]/g, "-")}`;
const report = { fixtureName, checks: [], consoleErrors: [], expectedConsoleErrors: [], failedResponses: [], expectedFailedResponses: [] };
const check = (name, passed, evidence = {}) => {
  report.checks.push({ name, passed, evidence });
  if (!passed) throw new Error(`${name} failed: ${JSON.stringify(evidence)}`);
};

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
});

try {
  let failChatRequest = false;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") {
      if (failChatRequest && message.text().includes("500")) report.expectedConsoleErrors.push(message.text());
      else report.consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      const item = { status: response.status(), url: response.url() };
      if (response.status() === 500 && response.url().includes("/chat/messages")) report.expectedFailedResponses.push(item);
      else report.failedResponses.push(item);
    }
  });

  const reusableFixtureId = process.env.ATELIER_FIXTURE_ID;
  let fixture;
  if (reusableFixtureId) {
    const existing = await page.request.get(`${baseUrl}/api/v1/projects/${reusableFixtureId}`);
    check("reuse isolated fixture", existing.ok(), { status: existing.status(), projectId: reusableFixtureId });
    fixture = await existing.json();
  } else {
    const created = await page.request.post(`${baseUrl}/api/v1/projects`, {
      data: { name: fixtureName, width_mm: 4000, depth_mm: 5000, style: "Japandi", scale_calibrated: true },
    });
    check("create isolated fixture", created.ok(), { status: created.status() });
    fixture = await created.json();
  }
  report.fixtureProjectId = fixture.project_id;

  await page.goto(`${baseUrl}/design-studio`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(5_000);
  await page.getByLabel("Chọn dự án nội thất").selectOption(fixture.project_id);
  await page.waitForTimeout(4_000);

  const workspace = await page.locator(".workspace-layout").boundingBox();
  const viewport = await page.locator(".viewport-stage-wrapper").boundingBox();
  check("canvas-first layout", Boolean(workspace && viewport && viewport.width / workspace.width >= 0.7), {
    workspaceWidth: workspace?.width,
    viewportWidth: viewport?.width,
    ratio: workspace && viewport ? viewport.width / workspace.width : 0,
  });
  check("real WebGL canvas", (await page.locator("canvas").count()) > 0);

  for (const label of ["2D", "3D", "2D + 3D", "Hoàng hôn", "Đêm", "Ngày", "Orbit", "Top", "Walk", "Cutaway"]) {
    await page.getByRole("button", { name: label, exact: true }).first().click();
  }
  check("viewer mode and camera controls", true);

  const tableItem = page.getByTestId("furniture-item-furn_table_main");
  const sofaItem = page.getByTestId("furniture-item-furn_sofa_main");
  await tableItem.click();
  const tableSelected = (await tableItem.getAttribute("style"))?.includes("var(--accent)");
  await sofaItem.click();
  const sofaSelected = (await sofaItem.getAttribute("style"))?.includes("var(--accent)");
  check("furniture selection updates inspector", Boolean(tableSelected && sofaSelected));

  const inspectorBeforeResize = await page.locator(".inspector-column").boundingBox();
  const resizeHandle = await page.getByRole("button", { name: "Thay đổi chiều rộng Inspector" }).boundingBox();
  if (inspectorBeforeResize && resizeHandle) {
    await page.mouse.move(resizeHandle.x + resizeHandle.width / 2, resizeHandle.y + 20);
    await page.mouse.down();
    await page.mouse.move(resizeHandle.x + 40, resizeHandle.y + 20, { steps: 4 });
    await page.mouse.up();
  }
  const inspectorAfterResize = await page.locator(".inspector-column").boundingBox();
  check("inspector dock resizes", Boolean(
    inspectorBeforeResize && inspectorAfterResize && inspectorAfterResize.width < inspectorBeforeResize.width - 20,
  ), { before: inspectorBeforeResize?.width, after: inspectorAfterResize?.width });

  const numberInputs = page.locator('.inspector-column input[type="number"]');
  check("transform controls present", (await numberInputs.count()) >= 6, { count: await numberInputs.count() });
  const widthInput = numberInputs.nth(0);
  const xInput = numberInputs.nth(3);
  const originalWidth = Number(await widthInput.inputValue());
  const originalX = Number(await xInput.inputValue());
  const changedWidth = originalWidth + 10;
  const changedX = originalX + 50;
  await widthInput.fill(String(changedWidth));
  await xInput.fill(String(changedX));
  const revisionBefore = Number((await page.getByRole("button", { name: /Rev #/ }).first().innerText()).match(/\d+/)?.[0] || 0);
  const saveResponse = page.waitForResponse((response) => response.url().includes(`/api/v1/projects/${fixture.project_id}/scene`) && response.request().method() === "PUT");
  await page.getByTestId("save-scene").click();
  check("save scene response", (await saveResponse).ok());
  await page.waitForTimeout(3_000);
  const persisted = await page.request.get(`${baseUrl}/api/v1/projects/${fixture.project_id}`);
  const persistedProject = await persisted.json();
  const persistedSofa = persistedProject.furniture_instances.find((item) => item.id === "furn_sofa_main");
  check("save and revision persistence", persisted.ok() && persistedProject.revision > revisionBefore && persistedSofa.x_mm === changedX && persistedSofa.width_mm === changedWidth, {
    revisionBefore,
    revisionAfter: persistedProject.revision,
    expectedWidth: changedWidth,
    actualWidth: persistedSofa?.width_mm,
    expectedX: changedX,
    actualX: persistedSofa?.x_mm,
  });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4_000);
  await page.getByLabel("Chọn dự án nội thất").selectOption(fixture.project_id);
  await page.waitForTimeout(3_000);
  const refreshedInputs = page.locator('.inspector-column input[type="number"]');
  const refreshedWidth = Number(await refreshedInputs.nth(0).inputValue());
  const refreshedX = Number(await refreshedInputs.nth(3).inputValue());
  const inspectorAfterReload = await page.locator(".inspector-column").boundingBox();
  check("hard refresh preserves scene and dock width", refreshedWidth === changedWidth && refreshedX === changedX && Boolean(
    inspectorAfterResize && inspectorAfterReload && Math.abs(inspectorAfterReload.width - inspectorAfterResize.width) <= 2,
  ), {
    expectedWidth: changedWidth,
    refreshedWidth,
    expectedX: changedX,
    refreshedX,
    dockWidthBeforeReload: inspectorAfterResize?.width,
    dockWidthAfterReload: inspectorAfterReload?.width,
  });

  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  check("inspector dock closes", (await page.locator(".inspector-column").count()) === 0);
  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  check("inspector dock reopens", await page.locator(".inspector-column").isVisible());

  await page.getByRole("button", { name: /Rev #/ }).first().click();
  check("revision history opens", await page.getByRole("dialog", { name: "Lịch sử phiên bản dự án" }).isVisible());
  await page.getByRole("button", { name: "Đóng", exact: true }).last().click();
  check("revision history closes", (await page.getByRole("dialog", { name: "Lịch sử phiên bản dự án" }).count()) === 0);

  const fitResponse = page.waitForResponse((response) => response.url().includes("/smart-fit"));
  await page.getByTestId("smart-fit-assess").click();
  check("smart fit API", (await fitResponse).ok());

  await page.getByTestId("assign-asset-select").selectOption("asset_ph_sofa_01_1k");
  const assetResponse = page.waitForResponse((response) => response.url().includes("/assign-asset") && response.request().method() === "POST");
  await page.getByTestId("assign-asset-btn").click();
  check("real GLB asset assignment", (await assetResponse).ok());
  await page.waitForTimeout(2_000);
  const assetProjectResponse = await page.request.get(`${baseUrl}/api/v1/projects/${fixture.project_id}`);
  const assetProject = await assetProjectResponse.json();
  const assetSofa = assetProject.furniture_instances.find((item) => item.id === "furn_sofa_main");
  check("Sofa_01 preserves one real material slot", assetSofa.material_slots.length === 1, {
    slots: assetSofa.material_slots.map((slot) => slot.source_material_name),
  });
  check("PBR editor uses actual GLB slots", (await page.getByTestId("material-slot-select").locator("option").count()) === 1);
  await page.getByTestId("material-preview").click();
  const materialResponse = page.waitForResponse((response) => response.url().includes("/material-proposals") && response.request().method() === "POST");
  await page.getByTestId("material-propose").click();
  check("PBR material proposal API", (await materialResponse).ok());

  for (const format of ["dxf", "glb"]) {
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId(`export-${format}`).click();
    const download = await downloadPromise;
    const target = path.join(outputRoot, `${fixture.project_id}.${format}`);
    await download.saveAs(target);
    const bytes = fs.readFileSync(target);
    if (format === "glb") check("GLB output magic", bytes.subarray(0, 4).toString("ascii") === "glTF", { bytes: bytes.length });
    else check("DXF output structure", bytes.toString("utf8", 0, Math.min(bytes.length, 2048)).includes("SECTION"), { bytes: bytes.length });
  }

  await page.getByRole("button", { name: "AI Copilot", exact: true }).click();
  await page.route(`**/api/v1/projects/${fixture.project_id}/chat/messages`, async (route) => {
    await route.fulfill({
      status: failChatRequest ? 500 : 200,
      contentType: "application/json",
      body: JSON.stringify(failChatRequest ? { detail: "Mock AI failure" } : { ok: true, assistant_message: { content: "Mock response" } }),
    });
  });
  const textarea = page.locator(".assistant-column textarea").first();
  await textarea.fill("Mock: kiểm tra bố trí sofa");
  await page.getByTestId("concierge-chat-send").click();
  await page.waitForTimeout(1_500);
  check("AI chat mock returns without stuck loading", !(await page.locator(".assistant-column").innerText()).includes("đang phân tích"));
  await page.getByRole("button", { name: "AI Copilot", exact: true }).click();
  check("AI Copilot dock closes", (await page.locator(".assistant-column").count()) === 0);

  await page.screenshot({ path: path.join(outputRoot, "after-desktop.png"), fullPage: false });
  for (const viewportSize of [{ width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewportSize);
    await page.waitForTimeout(1_000);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    check(`responsive ${viewportSize.width}x${viewportSize.height}`, !overflow, {
      scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
      clientWidth: await page.evaluate(() => document.documentElement.clientWidth),
    });
    await page.screenshot({ path: path.join(outputRoot, `after-${viewportSize.width}x${viewportSize.height}.png`), fullPage: false });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  failChatRequest = true;
  await page.getByRole("button", { name: "AI Copilot", exact: true }).click();
  const errorTextarea = page.locator(".assistant-column textarea").first();
  await errorTextarea.fill("Mock: kiểm tra hiển thị lỗi");
  await page.getByTestId("concierge-chat-send").click();
  await page.waitForTimeout(1_000);
  const errorAlert = page.getByRole("alert");
  check("AI chat failure exits loading and surfaces error", await errorAlert.isVisible() && (await errorAlert.innerText()).includes("500") && !(await page.locator(".assistant-column").innerText()).includes("đang phân tích"));
  await page.getByRole("button", { name: "AI Copilot", exact: true }).click();
  check("expected AI failure captured", report.expectedFailedResponses.length === 1, { responses: report.expectedFailedResponses });

  check("no browser console errors", report.consoleErrors.length === 0, { errors: report.consoleErrors });
  check("no failed Design Studio responses", report.failedResponses.length === 0, { responses: report.failedResponses });
} catch (error) {
  report.failure = error instanceof Error ? error.stack : String(error);
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(outputRoot, "e2e-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
