import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  History,
  MapPin,
  MessageCircle,
  PanelRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
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

const API_BASE = "/api/v1";

function formatVND(val?: number | null): string {
  if (val === undefined || val === null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN").format(Math.round(val)) + " ₫";
}

export function AtelierDesignStudioPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    project,
    estimate,
    materialsCatalog,
    chatHistory,
    revisions,
    pins,
    selectedEntityId,
    setSelectedEntityId,
    viewMode,
    setViewMode,
    cameraPreset,
    setCameraPreset,
    busyMessage,
    handleMaterialChange,
    handleSendChat,
    handleAnswerQuestion,
    handleProposalDecision,
    handleRestoreRevision,
    handleApplyDesignOption,
    handleSaveSelectedFurnitureTransform,
    handleCreateSpatialPin,
  } = useAtelierStudio();

  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [revisionDrawerOpen, setRevisionDrawerOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinComment, setPinComment] = useState("");
  const [designOptions, setDesignOptions] = useState<any[]>([]);
  const [generatingOptions, setGeneratingOptions] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Thiết kế Nội thất" },
      { label: "Không gian thiết kế 2D/3D (Pascal BIM)" },
    ]);
  }, [setBreadcrumbs]);

  const selectedEntity =
    project?.furniture?.find((f: any) => f.id === selectedEntityId) ||
    project?.walls?.find((w: any) => w.id === selectedEntityId) ||
    null;

  const isScaleVerified =
    project?.scale_confidence === "HIGH_VERIFIED_SCALE";

  const handleGenerateOptions = async () => {
    setGeneratingOptions(true);
    try {
      const res = await fetch(
        `${API_BASE}/projects/${activeProjectId}/generate-options`,
        { method: "POST" },
      );
      if (res.ok) {
        const data = await res.json();
        setDesignOptions(data.options || []);
      }
    } finally {
      setGeneratingOptions(false);
    }
  };

  const handleSubmitPin = async () => {
    if (!pinComment.trim()) return;
    const entityName = selectedEntity
      ? selectedEntity.name || selectedEntity.id
      : "Vị trí trung tâm phòng 4×5m";
    const pos: [number, number, number] = selectedEntity?.position_mm
      ? [
          selectedEntity.position_mm[0] ?? 2000,
          selectedEntity.position_mm[1] ?? 2500,
          selectedEntity.position_mm[2] ?? 400,
        ]
      : [2000, 2500, 400];
    await handleCreateSpatialPin({
      entityId: selectedEntity?.id ?? null,
      entityName,
      positionMm: pos,
      comment: pinComment.trim(),
    });
    setPinComment("");
    setPinModalOpen(false);
  };

  const searchParams = new URLSearchParams(location.search);
  const linkedIssueId = searchParams.get("issueId");
  const linkedIssueIdentifier = searchParams.get("issueIdentifier");
  const linkedAgent = searchParams.get("agent");

  return (
    <div
      className="atelier-surface-root flex h-full w-full flex-col overflow-hidden"
      data-theme={theme}
    >
      {/* Linked Task Context Banner */}
      {linkedIssueIdentifier && (
        <div className="flex shrink-0 items-center justify-between border-b border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs text-teal-800 dark:text-teal-200">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="size-3.5 text-teal-600 dark:text-teal-400" />
            <span>
              Đang mở không gian 3D liên kết với Công việc:{" "}
              <strong className="underline underline-offset-2">{linkedIssueIdentifier}</strong>
            </span>
            {linkedAgent && <span className="opacity-80">({linkedAgent})</span>}
          </div>
          <button
            type="button"
            onClick={() => navigate(`/issues/${linkedIssueIdentifier}`)}
            className="rounded bg-teal-600/20 px-2 py-0.5 text-[11px] font-semibold text-teal-900 hover:bg-teal-600/30 dark:text-teal-100"
          >
            Quay lại Công việc &rarr;
          </button>
        </div>
      )}

      {/* Compact Studio Header inside Paperclip Workspace */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            to="/chats"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
            title="Quay lại Hội thoại với Kiến Trúc Sư Trưởng"
          >
            <ArrowLeft className="size-3.5" />
            <span>Hội thoại AI</span>
          </Link>

          <select
            aria-label="Chọn dự án nội thất"
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground"
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Rev #{p.revision})
              </option>
            ))}
          </select>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              isScaleVerified
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25"
            }`}
          >
            {isScaleVerified ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <AlertTriangle className="size-3" />
            )}
            {isScaleVerified ? "Tỷ lệ chuẩn 1:1 (mm)" : "Chờ xác nhận tỷ lệ"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPinModalOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-teal-700/30 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-800 dark:text-teal-300 hover:bg-teal-500/20"
            title="Ghim nhận xét trực tiếp vào đồ vật hoặc vị trí 3D để tạo Task & Đề xuất"
          >
            <MapPin className="size-3.5" />
            <span>Ghim nhận xét 3D ({pins.length})</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/cost-estimation")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs font-mono font-semibold text-foreground hover:bg-accent"
            title="Xem Bảng dự toán BOQ xác định"
          >
            <span className="text-muted-foreground font-sans font-normal">Dự toán:</span>
            <span className="text-teal-700 dark:text-teal-400">
              {formatVND(estimate?.grand_total_vnd)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRevisionDrawerOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-mono font-medium hover:bg-accent"
            title="Lịch sử phiên bản & Khôi phục (Restore)"
          >
            <History className="size-3.5" />
            <span>Rev #{project?.revision ?? 1}</span>
          </button>

          <a
            href={`${API_BASE}/projects/${activeProjectId}/export/dxf`}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-accent"
            title="Xuất bản vẽ kỹ thuật AutoCAD DXF R2007 (Đơn vị mm)"
          >
            <Download className="size-3.5" />
            <span>DXF</span>
          </a>

          <a
            href={`${API_BASE}/projects/${activeProjectId}/export/glb`}
            className="inline-flex items-center gap-1 rounded-md bg-teal-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-800"
            title="Xuất mô hình 3D glTF Binary (.glb)"
          >
            <Download className="size-3.5" />
            <span>Xuất 3D GLB</span>
          </a>
        </div>
      </div>

      {/* 3D Spatial Pin Popover Bar when active */}
      {pinModalOpen ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-700/25 bg-teal-50/80 dark:bg-teal-950/30 px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-teal-700 dark:text-teal-400" />
            <span className="font-semibold text-foreground">
              Ghim nhận xét lên đối tượng 3D đang chọn:
            </span>
            <span className="rounded bg-teal-700/15 px-2 py-0.5 font-mono text-teal-800 dark:text-teal-200">
              {selectedEntity
                ? `${selectedEntity.name || selectedEntity.id} (${selectedEntity.position_mm?.[0] ?? 0}, ${selectedEntity.position_mm?.[1] ?? 0} mm)`
                : "Phòng khách 4×5m"}
            </span>
          </div>
          <div className="flex flex-1 items-center gap-2 max-w-xl">
            <input
              type="text"
              value={pinComment}
              onChange={(e) => setPinComment(e.target.value)}
              placeholder="Nhập nhận xét tại vị trí này (VD: Đổi sofa ngắn hơn 30cm để rộng lối đi...)"
              className="flex-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSubmitPin();
              }}
            />
            <button
              type="button"
              onClick={() => void handleSubmitPin()}
              className="rounded-md bg-teal-700 px-3 py-1 text-xs font-medium text-white hover:bg-teal-800"
            >
              Tạo Task & Đề xuất Diff
            </button>
            <button
              type="button"
              onClick={() => setPinModalOpen(false)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      ) : null}

      {/* Main 3-Column Studio Body */}
      <div className="workspace-layout flex-1 min-h-0">
        {project ? (
          <>
            <Suspense
              fallback={
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                  Đang tải Pascal 3D BIM Viewport (Lazy-load Three.js)...
                </div>
              }
            >
              <LazyStudioViewport
                project={project}
                estimate={estimate}
                materialsCatalog={materialsCatalog}
                viewMode={viewMode}
                setViewMode={setViewMode}
                cameraPreset={cameraPreset}
                setCameraPreset={setCameraPreset}
                selectedEntityId={selectedEntityId}
                setSelectedEntityId={setSelectedEntityId}
                theme={theme}
                inspectorOpen={inspectorOpen}
                setInspectorOpen={setInspectorOpen}
                assistantOpen={assistantOpen}
                setAssistantOpen={setAssistantOpen}
                onOpenFloorplanImport={() => navigate("/floorplan-import")}
              />
            </Suspense>

            <ObjectInspector
              open={inspectorOpen}
              onClose={() => setInspectorOpen(false)}
              project={project}
              materialsCatalog={materialsCatalog}
              selectedEntityId={selectedEntityId}
              setSelectedEntityId={setSelectedEntityId}
              onSaveTransform={handleSaveSelectedFurnitureTransform}
              onMaterialChange={handleMaterialChange}
              onOpenFullMaterials={() => navigate("/materials-catalog")}
              onOpenCatalog={() => navigate("/shopping-catalog")}
            />

            <AIDesignAssistant
              open={assistantOpen}
              onClose={() => setAssistantOpen(false)}
              project={project}
              chatHistory={chatHistory}
              busyMessage={busyMessage}
              onSendMessage={handleSendChat}
              onAnswerQuestion={handleAnswerQuestion}
              onProposalDecision={handleProposalDecision}
              onUndoLastRevision={() => {
                const prevRev = Math.max(1, (project.revision || 2) - 1);
                return handleRestoreRevision(prevRev);
              }}
              designOptions={designOptions}
              generatingOptions={generatingOptions}
              onGenerateOptions={handleGenerateOptions}
              onApplyDesignOption={handleApplyDesignOption}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Đang kết nối dữ liệu Pascal 3D SceneGraph...
          </div>
        )}
      </div>

      <RevisionHistoryDrawer
        open={revisionDrawerOpen}
        onClose={() => setRevisionDrawerOpen(false)}
        project={project}
        revisions={revisions}
        onRestoreRevision={handleRestoreRevision}
      />
    </div>
  );
}
