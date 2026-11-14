import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bed,
  Camera,
  Download,
  FileText,
  History,
  MessageCircle,
  Moon,
  Focus,
  RotateCcw,
  Save,
  Sliders,
  Sun,
  Sunset,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "@/lib/router";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";
import { useTheme } from "@/context/ThemeContext";
import { useAtelierStudio } from "./AtelierStudioContext";
import { ObjectInspector } from "./ObjectInspector";
import { AIDesignAssistant } from "./AIDesignAssistant";
import { RevisionHistoryDrawer } from "./RevisionHistoryDrawer";

const LazyStudioViewport = lazy(() =>
  import("./StudioViewport").then((mod) => ({ default: mod.StudioViewport })),
);

type DockId = "inspector" | "assistant";

function formatVND(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value || 0)) + " ₫";
}
function readDockWidth(key: string, fallback: number) {
  const value = Number(window.localStorage.getItem(key));
  return Number.isFinite(value) && value >= 260 && value <= 480 ? value : fallback;
}

export function AtelierDesignStudioPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    projects, activeProjectId, setActiveProjectId, project, estimate,
    materialsCatalog, pbrMaterials, assetLibrary, chatHistory, revisions,
    selectedEntityId, setSelectedEntityId, viewMode, setViewMode,
    cameraPreset, setCameraPreset, lightingPreset, setLightingPreset,
    busyMessage, errorMessage, handleSendChat,
    handleAnswerQuestion, handleProposalDecision, handleRestoreRevision,
    handleUpdateFurnitureField, handleAssignElementMaterial, handleApplyStylePreset,
    handleSaveScene, handleExport, handleAssignAsset,
    handleRequestSmartFit, handleRequestPlacementOptions, handleCreatePlacementProposal,
  } = useAtelierStudio();

  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [revisionDrawerOpen, setRevisionDrawerOpen] = useState(false);
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0);
  const [cameraCommand, setCameraCommand] = useState<{ id: number; type: "fit" | "focus" | "reset" }>({ id: 0, type: "fit" });
  const [cutawayEnabled, setCutawayEnabled] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [inspectorWidth, setInspectorWidth] = useState(() => readDockWidth("atelier.inspectorWidth", 320));
  const [assistantWidth, setAssistantWidth] = useState(() => readDockWidth("atelier.assistantWidth", 360));
  const resizeOrigin = useRef<{ dock: DockId; x: number; width: number } | null>(null);

  // PHẦN 3: Blender Cycles Render Job & Credits Modal State
  const [renderModalOpen, setRenderModalOpen] = useState(false);
  const [renderTab, setRenderTab] = useState<"render" | "gallery" | "credits">("render");
  const [renderCamera, setRenderCamera] = useState<"dollhouse" | "eye_level">("dollhouse");
  const [renderQuality, setRenderQuality] = useState<"preview" | "final">("final");
  const [renderResolution, setRenderResolution] = useState<"1280x960" | "960x720" | "1600x1200">("1280x960");
  const [activeRenderJob, setActiveRenderJob] = useState<any | null>(null);
  const [renderGallery, setRenderGallery] = useState<any[]>([]);
  const [creditsData, setCreditsData] = useState<any | null>(null);

  const refreshRenderGalleryAndCredits = async (pid: string) => {
    if (!pid) return;
    try {
      const [galRes, credRes] = await Promise.all([
        fetch(`/api/v1/projects/${pid}/render-gallery`),
        fetch(`/api/v1/projects/${pid}/credits`),
      ]);
      if (galRes.ok) {
        const galJson = await galRes.json();
        setRenderGallery(galJson.gallery || []);
      }
      if (credRes.ok) {
        const credJson = await credRes.json();
        setCreditsData(credJson);
      }
    } catch {
      // ignore transient network errors
    }
  };

  useEffect(() => {
    if (renderModalOpen && activeProjectId) {
      void refreshRenderGalleryAndCredits(activeProjectId);
    }
  }, [renderModalOpen, activeProjectId, project?.revision]);

  useEffect(() => {
    if (!activeRenderJob || !["QUEUED", "RUNNING"].includes(activeRenderJob.status)) return;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/render-jobs/${activeRenderJob.job_id}`);
        if (res.ok) {
          const updated = await res.json();
          setActiveRenderJob(updated);
          if (!["QUEUED", "RUNNING"].includes(updated.status) && activeProjectId) {
            void refreshRenderGalleryAndCredits(activeProjectId);
          }
        }
      } catch {
        // ignore
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [activeRenderJob, activeProjectId]);

  const handleStartBlenderRender = async () => {
    if (!project?.project_id) return;
    await handleSaveScene();
    const [wPx, hPx] = renderResolution.split("x").map(Number);
    setActiveRenderJob({
      job_id: "pending",
      status: "QUEUED",
      camera_id: renderCamera,
      mode: renderQuality,
      resolution: [wPx, hPx],
    });
    try {
      const res = await fetch(`/api/v1/projects/${project.project_id}/render-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camera: renderCamera,
          time_of_day: lightingPreset,
          mode: renderQuality,
          width_px: wPx,
          height_px: hPx,
          samples: renderQuality === "final" ? 48 : 24,
          use_cache: false,
          async_exec: true,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        setActiveRenderJob({
          job_id: "error",
          status: "FAILED",
          error_message: errText || `HTTP ${res.status}`,
        });
        return;
      }
      const jobDoc = await res.json();
      setActiveRenderJob(jobDoc);
    } catch (err: any) {
      setActiveRenderJob({
        job_id: "error",
        status: "FAILED",
        error_message: err?.message || "Không thể kết nối máy chủ Render",
      });
    }
  };

  useEffect(() => {
    setBreadcrumbs([{ label: "Thiết kế Nội thất" }, { label: "Không gian thiết kế 2D/3D (Pascal BIM)" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const origin = resizeOrigin.current;
      if (!origin) return;
      const next = Math.max(260, Math.min(480, origin.width + origin.x - event.clientX));
      if (origin.dock === "inspector") setInspectorWidth(next);
      else setAssistantWidth(next);
    };
    const onPointerUp = () => {
      if (!resizeOrigin.current) return;
      window.localStorage.setItem("atelier.inspectorWidth", String(inspectorWidth));
      window.localStorage.setItem("atelier.assistantWidth", String(assistantWidth));
      resizeOrigin.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [assistantWidth, inspectorWidth]);

  const beginResize = (dock: DockId, event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    resizeOrigin.current = { dock, x: event.clientX, width: dock === "inspector" ? inspectorWidth : assistantWidth };
  };

  const selectedEntity =
    project?.furniture_instances?.find((item: any) => item.id === selectedEntityId) ||
    project?.walls?.find((item: any) => item.id === selectedEntityId) || null;
  const linkedIssueIdentifier = new URLSearchParams(location.search).get("issueIdentifier");

  return (
    <div className="atelier-surface-root flex h-full w-full flex-col overflow-hidden" data-theme={theme}>
      {linkedIssueIdentifier ? (
        <div className="atelier-context-banner">
          <span>Đang mở Scene liên kết với công việc {linkedIssueIdentifier}</span>
          <button type="button" className="btn btn-sm" onClick={() => navigate(`/issues/${linkedIssueIdentifier}`)}>Quay lại công việc</button>
        </div>
      ) : null}

      <header className="atelier-studio-header">
        <div className="atelier-header-group">
          <Link to="/chats" className="btn btn-sm" title="Quay lại Hội thoại"><ArrowLeft size={13} /> Hội thoại</Link>
          <Link to="/bedroom-studio" className="btn btn-sm btn-soft" title="Mở Studio Thiết Kế Phòng Ngủ (Brief & Decision Ledger)"><Bed size={13} /> Phòng ngủ 2D</Link>
          <select aria-label="Chọn dự án nội thất" className="field-select atelier-project-select" value={activeProjectId} onChange={(event) => setActiveProjectId(event.target.value)}>
            {projects.map((item: any) => <option key={item.project_id} value={item.project_id}>{item.name} (Rev #{item.revision})</option>)}
          </select>
          <span className={`status-badge ${project?.scale_calibrated ? "emerald" : "amber"}`}>
            {project?.scale_calibrated ? "Tỷ lệ 1:1 mm" : "Chờ xác nhận tỷ lệ"}
          </span>
        </div>
        <div className="atelier-header-actions">
          <span className="atelier-estimate" title="Dự toán hiện tại">{formatVND(estimate?.grand_total_vnd)}</span>
          <button type="button" className="btn btn-sm" data-testid="save-scene" onClick={() => void handleSaveScene()} disabled={Boolean(busyMessage)}><Save size={13} /> {busyMessage?.includes("lưu Scene") ? "Đang lưu" : "Lưu Scene"}</button>
          <button type="button" className="btn btn-sm" onClick={() => setRevisionDrawerOpen(true)}><History size={13} /> Rev #{project?.revision || 0}</button>
          <button type="button" className="btn btn-sm" data-testid="export-dxf" onClick={() => void handleExport("dxf")}><Download size={13} /> DXF</button>
          <button type="button" className="btn btn-sm btn-primary" data-testid="export-glb" onClick={() => void handleExport("glb")}><Download size={13} /> GLB</button>
        </div>
      </header>

      <div className="atelier-view-toolbar" role="toolbar" aria-label="Điều khiển không gian thiết kế">
        <div className="segmented-group" aria-label="Chế độ hiển thị">
          {(["split", "2d", "3d"] as const).map((mode) => <button key={mode} type="button" className={`seg-btn ${viewMode === mode ? "active" : ""}`} onClick={() => { setViewMode(mode); if (mode === "2d" && cameraPreset === "walk") setCameraPreset("orbit"); }}>{mode === "split" ? "2D + 3D" : mode.toUpperCase()}</button>)}
        </div>
        <div className="segmented-group" aria-label="Ánh sáng">
          <button type="button" className={`seg-btn ${lightingPreset === "day" ? "active" : ""}`} onClick={() => setLightingPreset("day")}><Sun size={12} /> Ngày</button>
          <button type="button" className={`seg-btn ${lightingPreset === "sunset" ? "active" : ""}`} onClick={() => setLightingPreset("sunset")}><Sunset size={12} /> Hoàng hôn</button>
          <button type="button" className={`seg-btn ${lightingPreset === "night" ? "active" : ""}`} onClick={() => setLightingPreset("night")}><Moon size={12} /> Đêm</button>
        </div>
        <div className="segmented-group" aria-label="Camera">
          {(["orbit", "top", "walk"] as const).map((preset) => <button key={preset} type="button" disabled={viewMode === "2d"} className={`seg-btn ${viewMode !== "2d" && cameraPreset === preset ? "active" : ""}`} onClick={() => setCameraPreset(preset)}>{preset === "orbit" ? "Orbit" : preset === "top" ? "Top" : "Walk"}</button>)}
          <button type="button" disabled={viewMode === "2d"} className={`seg-btn ${cutawayEnabled ? "active" : ""}`} onClick={() => setCutawayEnabled((value) => !value)}>Cutaway</button>
        </div>
        <button type="button" className="btn btn-sm" onClick={() => setCameraCommand((current) => ({ id: current.id + 1, type: "fit" }))} title="Đưa toàn bộ phòng vào khung hình">Fit Room</button>
        <button type="button" className="btn btn-sm" disabled={!selectedEntityId} onClick={() => setCameraCommand((current) => ({ id: current.id + 1, type: "focus" }))} title="Đưa đối tượng đang chọn vào giữa khung hình"><Focus size={12} /> Focus</button>
        <button type="button" className="btn btn-sm" onClick={() => setCameraCommand((current) => ({ id: current.id + 1, type: "reset" }))} title="Khôi phục camera mặc định"><RotateCcw size={12} /> Reset</button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          data-testid="open-blender-render-modal"
          onClick={() => {
            setRenderModalOpen(true);
            setRenderTab("render");
          }}
          title="Kết xuất ảnh 3D Blender Cycles theo vật liệu đã chọn"
        >
          <Camera size={12} /> Render
        </button>
        <button
          type="button"
          className="btn btn-sm"
          data-testid="open-credits-modal"
          onClick={() => {
            setRenderModalOpen(true);
            setRenderTab("credits");
          }}
          title="Trang ghi nguồn model CC-BY & vật liệu PBR CC0"
        >
          <FileText size={12} /> Credits
        </button>
        <span className="atelier-toolbar-spacer" />
        <button type="button" className={`btn btn-sm ${inspectorOpen ? "btn-soft" : ""}`} onClick={() => setInspectorOpen((value) => !value)}><Sliders size={12} /> Inspector</button>
        <button type="button" className={`btn btn-sm ${assistantOpen ? "btn-soft" : ""}`} onClick={() => setAssistantOpen((value) => !value)}><MessageCircle size={12} /> AI Copilot</button>
      </div>

      {errorMessage ? <div className="atelier-error-banner" role="alert">{errorMessage}</div> : null}

      <div className="workspace-layout flex-1 min-h-0" style={{ "--inspector-width": `${inspectorWidth}px`, "--assistant-width": `${assistantWidth}px` } as React.CSSProperties}>
        {project ? (
          <>
            <Suspense fallback={<div className="atelier-loading-state">Đang tải Pascal 3D BIM...</div>}>
              <LazyStudioViewport project={project} materialsDb={materialsCatalog} pbrMaterials={pbrMaterials} viewMode={viewMode} cameraPreset={cameraPreset} lightingPreset={lightingPreset} cameraResetTrigger={cameraResetTrigger} cameraCommand={cameraCommand} cutawayEnabled={cutawayEnabled} selectedEntityId={selectedEntityId} onSelectEntity={setSelectedEntityId} theme={theme} />
            </Suspense>

            {inspectorOpen ? (
              <div className="dock-column inspector-column">
                <button className="dock-resize-handle" type="button" onPointerDown={(event) => beginResize("inspector", event)} aria-label="Thay đổi chiều rộng Inspector" />
                <ObjectInspector project={project} assetLibrary={assetLibrary} selectedEntityId={selectedEntityId} onSelectEntity={setSelectedEntityId} onUpdateFurnitureField={handleUpdateFurnitureField} onAssignElementMaterial={handleAssignElementMaterial} onApplyStylePreset={handleApplyStylePreset} onCommitCanvasPosition={() => void handleSaveScene()} onAssignAsset={handleAssignAsset} onOpenAICopilot={() => setAssistantOpen(true)} onRequestSmartFit={handleRequestSmartFit} onRequestPlacementOptions={handleRequestPlacementOptions} onCreatePlacementProposal={handleCreatePlacementProposal} onClose={() => setInspectorOpen(false)} savingScene={Boolean(busyMessage?.includes("lưu"))} />
              </div>
            ) : null}

            {assistantOpen ? (
              <div className="dock-column assistant-column">
                <button className="dock-resize-handle" type="button" onPointerDown={(event) => beginResize("assistant", event)} aria-label="Thay đổi chiều rộng AI Copilot" />
                <AIDesignAssistant project={project} chatHistory={chatHistory} sendingChat={Boolean(busyMessage?.includes("Chief Architect"))} chatInput={chatInput} onChatInputChange={setChatInput} onSendChat={(text) => { const message = (text ?? chatInput).trim(); if (!message) return; void handleSendChat(message); if (!text) setChatInput(""); }} onAnswerQuestion={(questionId, answer) => void handleAnswerQuestion(questionId, answer)} onApproveProposal={(proposalId) => void handleProposalDecision(proposalId, "approve")} onRejectProposal={(proposalId) => void handleProposalDecision(proposalId, "reject")} onUndoLastRevision={() => void handleRestoreRevision(Math.max(1, (project.revision || 1) - 1))} onCloseMobile={() => setAssistantOpen(false)} />
              </div>
            ) : null}
          </>
        ) : <div className="atelier-loading-state">Đang kết nối Pascal SceneGraph...</div>}
      </div>

      <RevisionHistoryDrawer isOpen={revisionDrawerOpen} onClose={() => setRevisionDrawerOpen(false)} project={project ? { ...project, revisions } : project} onRestoreRevision={handleRestoreRevision} />

      {renderModalOpen && project ? (
        <div
          role="dialog"
          aria-label="Kết xuất Blender Cycles & Thư viện ảnh"
          data-testid="blender-render-modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(9, 9, 11, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(920px, 96vw)",
              maxHeight: "88vh",
              background: "var(--surface-primary, #FFFFFF)",
              color: "var(--text-primary, #171717)",
              border: "1px solid var(--border-strong, #D4D4D8)",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border-subtle, #E5E7EB)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Camera size={16} />
                <strong>Render theo vật liệu đã chọn (Blender 4.2 Cycles Headless)</strong>
                <span className="status-badge emerald">Rev #{project.revision}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className={`btn btn-sm ${renderTab === "render" ? "btn-primary" : ""}`} onClick={() => setRenderTab("render")}>Cấu hình & Render</button>
                <button type="button" className={`btn btn-sm ${renderTab === "gallery" ? "btn-primary" : ""}`} onClick={() => setRenderTab("gallery")}>Thư viện ảnh ({renderGallery.length})</button>
                <button type="button" className={`btn btn-sm ${renderTab === "credits" ? "btn-primary" : ""}`} onClick={() => setRenderTab("credits")}>Trang Credits (CC-BY / CC0)</button>
                <button type="button" className="btn btn-sm" onClick={() => setRenderModalOpen(false)} aria-label="Đóng"><X size={14} /></button>
              </div>
            </div>

            <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
              {renderTab === "render" && (
                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label className="field-label" style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Preset Camera</label>
                      <select
                        className="field-select"
                        style={{ width: "100%" }}
                        data-testid="render-camera-select"
                        value={renderCamera}
                        onChange={(e) => setRenderCamera(e.target.value as "dollhouse" | "eye_level")}
                      >
                        <option value="dollhouse">(a) Nhà búp bê cắt tường (38°, 45°, tường 1.12m, nền khay + PNG trong suốt)</option>
                        <option value="eye_level">(b) Nội thất ngang tầm mắt (Cao 1.50m, ống kính 26mm)</option>
                      </select>
                    </div>

                    <div>
                      <label className="field-label" style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Độ phân giải</label>
                      <select
                        className="field-select"
                        style={{ width: "100%" }}
                        value={renderResolution}
                        onChange={(e) => setRenderResolution(e.target.value as any)}
                      >
                        <option value="1280x960">1280 × 960 px (4:3 Chuẩn kiến trúc)</option>
                        <option value="1600x1200">1600 × 1200 px (Cao cấp)</option>
                        <option value="960x720">960 × 720 px (Nhanh)</option>
                      </select>
                    </div>

                    <div>
                      <label className="field-label" style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Chất lượng (Cycles GI + AgX + Denoise)</label>
                      <select
                        className="field-select"
                        style={{ width: "100%" }}
                        value={renderQuality}
                        onChange={(e) => setRenderQuality(e.target.value as "preview" | "final")}
                      >
                        <option value="final">Final (48 samples + OpenImageDenoise + AgX)</option>
                        <option value="preview">Preview (24 samples + OpenImageDenoise + AgX)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      data-testid="trigger-blender-render-btn"
                      disabled={activeRenderJob && ["QUEUED", "RUNNING"].includes(activeRenderJob.status)}
                      onClick={() => void handleStartBlenderRender()}
                      style={{ marginTop: 4, justifyContent: "center", padding: "9px 14px" }}
                    >
                      <Camera size={14} />{" "}
                      {activeRenderJob && ["QUEUED", "RUNNING"].includes(activeRenderJob.status)
                        ? "Đang chạy Blender Cycles..."
                        : "Bắt đầu Render theo vật liệu đã chọn"}
                    </button>

                    {activeRenderJob && (
                      <div
                        data-testid="render-job-status-box"
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          background: "var(--surface-secondary, #F5F6F6)",
                          border: "1px solid var(--border-subtle, #E5E7EB)",
                          fontSize: 12,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span>Trạng thái Job:</span>
                          <strong data-testid="render-job-status-label">
                            {activeRenderJob.status === "QUEUED"
                              ? "Chờ (QUEUED)"
                              : activeRenderJob.status === "RUNNING"
                              ? "Đang chạy (RUNNING)"
                              : activeRenderJob.status === "COMPLETED"
                              ? "Xong (COMPLETED)"
                              : `Lỗi (${activeRenderJob.status})`}
                          </strong>
                        </div>
                        <div>Mã Job: <code>{activeRenderJob.job_id}</code></div>
                        <div>Camera: <code>{activeRenderJob.camera_id}</code> | Tone Mapping: <code>AgX</code></div>
                        {activeRenderJob.material_hash && (
                          <div>Material Hash: <code>{activeRenderJob.material_hash}</code></div>
                        )}
                        {activeRenderJob.error_message && (
                          <div style={{ color: "#FCA5A5", marginTop: 6 }}>
                            Lý do lỗi: {activeRenderJob.error_message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", justifyContent: "center", minHeight: 320, background: "var(--surface-secondary, #F5F6F6)", border: "1px solid var(--border-subtle, #E5E7EB)", borderRadius: 10, padding: 12 }}>
                    {activeRenderJob?.status === "COMPLETED" && activeRenderJob.render_url ? (
                      <>
                        <img
                          src={activeRenderJob.render_url}
                          alt="Ảnh kết xuất Blender Cycles"
                          data-testid="rendered-result-img"
                          style={{ maxWidth: "100%", maxHeight: 380, borderRadius: 8, objectFit: "contain", border: "1px solid #3F3F46" }}
                        />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 12 }}>
                          <a className="btn btn-sm btn-primary" href={activeRenderJob.render_url} target="_blank" rel="noreferrer">
                            <Download size={12} /> Tải PNG ({activeRenderJob.resolution?.[0]}×{activeRenderJob.resolution?.[1]})
                          </a>
                          {activeRenderJob.transparent_render_url && (
                            <a className="btn btn-sm" href={activeRenderJob.transparent_render_url} target="_blank" rel="noreferrer">
                              <Download size={12} /> Tải PNG nền trong suốt
                            </a>
                          )}
                          {activeRenderJob.metadata_url && (
                            <a className="btn btn-sm" href={activeRenderJob.metadata_url} target="_blank" rel="noreferrer">
                              <FileText size={12} /> Metadata JSON
                            </a>
                          )}
                        </div>
                      </>
                    ) : renderGallery.length > 0 ? (
                      <>
                        <img
                          src={renderGallery[0].render_url}
                          alt="Ảnh kết xuất gần nhất"
                          style={{ maxWidth: "100%", maxHeight: 360, borderRadius: 8, objectFit: "contain" }}
                        />
                        <span style={{ fontSize: 12, opacity: 0.75 }}>Ảnh kết xuất gần nhất (Rev #{renderGallery[0].revision} — {renderGallery[0].camera_id})</span>
                      </>
                    ) : (
                      <div style={{ fontSize: 13, opacity: 0.7, textAlign: "center" }}>
                        Chọn Camera Preset (Nhà búp bê cắt tường hoặc Nội thất ngang tầm mắt) và bấm <strong>Bắt đầu Render</strong>.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {renderTab === "gallery" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                  {renderGallery.map((item: any) => (
                    <div key={item.job_id} style={{ border: "1px solid var(--border-subtle, #27272A)", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      <img src={item.render_url} alt={item.job_id} style={{ width: "100%", height: 170, objectFit: "cover", borderRadius: 6 }} />
                      <div style={{ fontSize: 12, fontWeight: 600 }}>Rev #{item.revision} — {item.camera_id === "dollhouse" ? "Nhà búp bê cắt tường" : "Ngang tầm mắt"}</div>
                      <div style={{ fontSize: 11, opacity: 0.75 }}>Hash: <code>{item.material_hash}</code> | {item.resolution?.[0]}×{item.resolution?.[1]}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                        <a className="btn btn-sm" href={item.render_url} target="_blank" rel="noreferrer">PNG</a>
                        {item.transparent_render_url && (
                          <a className="btn btn-sm" href={item.transparent_render_url} target="_blank" rel="noreferrer">PNG Trong suốt</a>
                        )}
                        {item.metadata_url && (
                          <a className="btn btn-sm" href={item.metadata_url} target="_blank" rel="noreferrer">Metadata</a>
                        )}
                      </div>
                    </div>
                  ))}
                  {renderGallery.length === 0 && <div style={{ fontSize: 13, opacity: 0.7 }}>Chưa có ảnh kết xuất nào cho dự án này.</div>}
                </div>
              )}

              {renderTab === "credits" && (
                <div data-testid="credits-tab-content" style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12 }}>
                  <div style={{ padding: 10, borderRadius: 8, background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.35)" }}>
                    <strong>Chính sách Giấy phép:</strong> Chỉ sử dụng model <strong>CC-0 / CC-BY</strong> và vật liệu PBR <strong>Poly Haven CC0</strong>. Không dùng <code>Free Art 1.3</code> hay <code>Furniture.jar (GPL)</code>.
                  </div>
                  <h4 style={{ margin: "4px 0", fontSize: 13 }}>1. Model CC-BY đang dùng trong Scene ({creditsData?.cc_by_models_in_scene?.length || 0} món)</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #3F3F46", textAlign: "left" }}>
                        <th style={{ padding: 6 }}>Món trong Scene</th>
                        <th style={{ padding: 6 }}>Model gốc</th>
                        <th style={{ padding: 6 }}>Tác giả</th>
                        <th style={{ padding: 6 }}>Giấy phép</th>
                        <th style={{ padding: 6 }}>Nguồn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(creditsData?.cc_by_models_in_scene || []).map((m: any) => (
                        <tr key={m.furniture_id} style={{ borderBottom: "1px solid #27272A" }}>
                          <td style={{ padding: 6 }}>{m.furniture_name} (<code>{m.furniture_id}</code>)</td>
                          <td style={{ padding: 6 }}>{m.model_name} (<code>{m.sh3d_id}</code>)</td>
                          <td style={{ padding: 6 }}><strong>{m.creator}</strong></td>
                          <td style={{ padding: 6 }}><code>{m.license}</code></td>
                          <td style={{ padding: 6 }}>{m.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h4 style={{ margin: "8px 0 4px", fontSize: 13 }}>2. Vật liệu PBR đang dùng trong Scene ({creditsData?.materials_in_scene?.length || 0} vật liệu — CC0)</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #3F3F46", textAlign: "left" }}>
                        <th style={{ padding: 6 }}>Mã vật liệu</th>
                        <th style={{ padding: 6 }}>Tên vật liệu</th>
                        <th style={{ padding: 6 }}>Bề mặt</th>
                        <th style={{ padding: 6 }}>Giấy phép & Nguồn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(creditsData?.materials_in_scene || []).map((mat: any) => (
                        <tr key={mat.id} style={{ borderBottom: "1px solid #27272A" }}>
                          <td style={{ padding: 6 }}><code>{mat.id}</code></td>
                          <td style={{ padding: 6 }}><strong>{mat.name}</strong></td>
                          <td style={{ padding: 6 }}><code>{mat.surface_type}</code></td>
                          <td style={{ padding: 6 }}>{mat.source} (<code>{mat.license}</code>)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {selectedEntity ? <span className="sr-only">Đang chọn {selectedEntity.name || selectedEntity.id}</span> : null}
    </div>
  );
}
