import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import "./atelier-studio.css";

export interface SpatialPinItem {
  id: string;
  project_id: string;
  entity_id: string | null;
  entity_name: string;
  position_mm: [number, number, number];
  comment: string;
  author: string;
  status: "open" | "in_progress" | "resolved";
  paperclip_issue_id: string | null;
  paperclip_issue_identifier: string | null;
  proposal_id: string | null;
  created_at: string;
}

interface AtelierStudioContextValue {
  projects: any[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  project: any | null;
  estimate: any | null;
  materialsCatalog: any | null;
  productsCatalog: any[];
  chatHistory: { messages: any[]; questions: any[]; proposals: any[] };
  revisions: any[];
  pins: SpatialPinItem[];
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  viewMode: "split" | "2d" | "3d";
  setViewMode: (mode: "split" | "2d" | "3d") => void;
  cameraPreset: "orbit" | "top" | "walk" | "cutaway";
  setCameraPreset: (preset: "orbit" | "top" | "walk" | "cutaway") => void;
  workflows: any[];
  runs: any[];
  agents: any[];
  connections: any[];
  mcpTools: any[];
  handleRunWorkflow: (wfId: string) => Promise<void>;
  handleUpdateWorkflow: (wf: any) => Promise<void>;
  handleUpdateAgent: (agent: any) => Promise<void>;
  handleTestConnection: (connId: string) => Promise<void>;
  handleSaveConnection: (conn: any) => Promise<void>;
  busyMessage: string | null;
  toast: string | null;
  showToast: (msg: string) => void;
  refreshProjectBundle: (pid?: string) => Promise<void>;
  handleMaterialChange: (
    basePaintId?: string,
    accentPaintId?: string,
    floorMatId?: string,
  ) => Promise<void>;
  handleSendChat: (text?: string) => Promise<void>;
  handleAnswerQuestion: (questionId: string, answer: string) => Promise<void>;
  handleProposalDecision: (
    proposalId: string,
    decision: "approve" | "reject",
  ) => Promise<void>;
  handleRestoreRevision: (revNum: number) => Promise<void>;
  handleApplyDesignOption: (opt: any) => Promise<void>;
  handleReplaceProduct: (productId: string) => Promise<void>;
  handleSaveSelectedFurnitureTransform: (
    entityId: string,
    xMm: number,
    yMm: number,
    rotDeg: number,
  ) => Promise<void>;
  handleCreateProject: (
    name: string,
    style: string,
    budgetVnd: number,
  ) => Promise<void>;
  handleCreateSpatialPin: (input: {
    entityId: string | null;
    entityName: string;
    positionMm: [number, number, number];
    comment: string;
  }) => Promise<void>;
}

const AtelierStudioContext = createContext<AtelierStudioContextValue | null>(null);

const API_BASE = "/api/v1";

export function AtelierStudioProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("proj_demo_4x5m");
  const [project, setProject] = useState<any | null>(null);
  const [estimate, setEstimate] = useState<any | null>(null);
  const [materialsCatalog, setMaterialsCatalog] = useState<any | null>(null);
  const [productsCatalog, setProductsCatalog] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<{
    messages: any[];
    questions: any[];
    proposals: any[];
  }>({ messages: [], questions: [], proposals: [] });
  const [revisions, setRevisions] = useState<any[]>([]);
  const [pins, setPins] = useState<SpatialPinItem[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>("furn_sofa_main");
  const [viewMode, setViewMode] = useState<"split" | "2d" | "3d">("split");
  const [cameraPreset, setCameraPreset] = useState<"orbit" | "top" | "walk" | "cutaway">(
    "cutaway",
  );
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const refreshProjectBundle = useCallback(
    async (pid: string = activeProjectId) => {
      try {
        const [projRes, estRes, chatRes, revRes, listRes, pinsRes, wfRes, runsRes, agRes, connRes, mcpRes] =
          await Promise.all([
            fetch(`${API_BASE}/projects/${pid}`),
            fetch(`${API_BASE}/projects/${pid}/estimates`),
            fetch(`${API_BASE}/projects/${pid}/chat`),
            fetch(`${API_BASE}/projects/${pid}/revisions`),
            fetch(`${API_BASE}/projects`),
            fetch(`/api/atelier/pins/${pid}`),
            fetch(`${API_BASE}/workflows`),
            fetch(`${API_BASE}/runs`),
            fetch(`${API_BASE}/agents`),
            fetch(`${API_BASE}/connections`),
            fetch(`${API_BASE}/mcp/tools`),
          ]);
        if (projRes.ok) setProject(await projRes.json());
        if (estRes.ok) setEstimate(await estRes.json());
        if (chatRes.ok) setChatHistory(await chatRes.json());
        if (revRes.ok) {
          const revJson = await revRes.json();
          setRevisions(revJson.revisions || []);
        }
        if (listRes.ok) {
          const listJson = await listRes.json();
          setProjects(listJson.projects || []);
        }
        if (pinsRes.ok) {
          const pinsJson = await pinsRes.json();
          setPins(pinsJson.pins || []);
        }
        if (wfRes.ok) setWorkflows(await wfRes.json());
        if (runsRes.ok) setRuns(await runsRes.json());
        if (agRes.ok) setAgents(await agRes.json());
        if (connRes.ok) setConnections(await connRes.json());
        if (mcpRes.ok) setMcpTools(await mcpRes.json());
      } catch {
        // retry silently when sidecar wakes
      }
    },
    [activeProjectId],
  );

  useEffect(() => {
    void (async () => {
      try {
        const [matRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/catalog/materials`),
          fetch(`${API_BASE}/catalog/products`),
        ]);
        if (matRes.ok) setMaterialsCatalog(await matRes.json());
        if (prodRes.ok) {
          const pj = await prodRes.json();
          setProductsCatalog(pj.products || []);
        }
      } catch {
        // ignore
      }
      await refreshProjectBundle(activeProjectId);
    })();
  }, [activeProjectId, refreshProjectBundle]);

  const handleMaterialChange = useCallback(
    async (basePaintId?: string, accentPaintId?: string, floorMatId?: string) => {
      if (!project) return;
      setBusyMessage("Đang cập nhật vật liệu Mục 7B & tính lại dự toán...");
      try {
        const res = await fetch(
          `${API_BASE}/projects/${activeProjectId}/surface-materials`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base_wall_paint_id:
                basePaintId ?? project.surface_materials.base_wall_paint_id,
              accent_wall_paint_id:
                accentPaintId ?? project.surface_materials.accent_wall_paint_id,
              floor_material_id:
                floorMatId ?? project.surface_materials.floor_material_id,
            }),
          },
        );
        if (res.ok) {
          await refreshProjectBundle(activeProjectId);
          showToast(
            "Đã áp dụng vật liệu Sơn/Gạch 7B & cập nhật Dự toán BOQ (giữ nguyên khối tường 3D).",
          );
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, project, refreshProjectBundle, showToast],
  );

  const handleSendChat = useCallback(
    async (customMessage?: string) => {
      const msg = (customMessage ?? "").trim();
      if (!msg) return;
      setBusyMessage("Chief Architect Agent đang phân tích & điều phối...");
      try {
        const res = await fetch(
          `${API_BASE}/projects/${activeProjectId}/chat/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg }),
          },
        );
        if (res.ok) {
          await refreshProjectBundle(activeProjectId);
          showToast(
            "Kiến Trúc Sư Trưởng đã phản hồi và đồng bộ với Paperclip Conversation.",
          );
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, refreshProjectBundle, showToast],
  );

  const handleAnswerQuestion = useCallback(
    async (questionId: string, answer: string) => {
      setBusyMessage("Đang ghi nhận vào DesignBrief & tiếp tục quy trình...");
      try {
        const res = await fetch(
          `${API_BASE}/projects/${activeProjectId}/questions/${questionId}/answer`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer }),
          },
        );
        if (res.ok) {
          await refreshProjectBundle(activeProjectId);
          showToast("Đã lưu câu trả lời vào DesignBrief & tạo phương án A/B!");
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, refreshProjectBundle, showToast],
  );

  const handleProposalDecision = useCallback(
    async (proposalId: string, decision: "approve" | "reject") => {
      setBusyMessage(
        decision === "approve"
          ? "Đang áp dụng đề xuất vào Pascal 3D Scene & BOQ..."
          : "Đang từ chối đề xuất...",
      );
      try {
        const res = await fetch(
          `${API_BASE}/projects/${activeProjectId}/proposals/${proposalId}/${decision}`,
          { method: "POST" },
        );
        if (res.ok) {
          await refreshProjectBundle(activeProjectId);
          showToast(
            decision === "approve"
              ? "Đã duyệt & đồng bộ trực tiếp vào Pascal 3D Scene + Dự toán BOQ!"
              : "Đã từ chối đề xuất (Scene 3D giữ nguyên).",
          );
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, refreshProjectBundle, showToast],
  );

  const handleRestoreRevision = useCallback(
    async (revNum: number) => {
      setBusyMessage(`Đang khôi phục dự án về Phiên bản #${revNum}...`);
      try {
        const res = await fetch(
          `${API_BASE}/projects/${activeProjectId}/revisions/${revNum}/restore`,
          { method: "POST" },
        );
        if (res.ok) {
          await refreshProjectBundle(activeProjectId);
          showToast(`Đã khôi phục thành công trạng thái Phiên bản #${revNum}!`);
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, refreshProjectBundle, showToast],
  );

  const handleApplyDesignOption = useCallback(
    async (opt: any) => {
      if (!project) return;
      setBusyMessage(`Đang áp dụng ${opt.title} vào Scene 3D...`);
      try {
        await fetch(`${API_BASE}/projects/${activeProjectId}/surface-materials`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base_wall_paint_id: opt.surface_materials.base_wall_paint_id,
            accent_wall_paint_id: opt.surface_materials.accent_wall_paint_id,
            floor_material_id: opt.surface_materials.floor_material_id,
          }),
        });
        await fetch(`${API_BASE}/projects/${activeProjectId}/furniture`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            furniture: opt.furniture,
            reason: `Áp dụng ${opt.title}`,
          }),
        });
        await refreshProjectBundle(activeProjectId);
        showToast(`Đã áp dụng ${opt.title} vào Pascal Scene 3D & Dự toán!`);
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, project, refreshProjectBundle, showToast],
  );

  const handleReplaceProduct = useCallback(
    async (productId: string) => {
      if (!project) return;
      const targetInstance =
        project.furniture.find((f: any) => f.id === selectedEntityId) ||
        project.furniture[0];
      if (!targetInstance) return;
      setBusyMessage("Đang kiểm tra kích thước lọt cửa & tạo đề xuất thay thế...");
      try {
        const res = await fetch(
          `${API_BASE}/projects/${activeProjectId}/catalog/replace`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              furniture_instance_id: targetInstance.id,
              new_product_id: productId,
            }),
          },
        );
        if (res.ok) {
          await refreshProjectBundle(activeProjectId);
          showToast("Đã tạo Đề xuất thay thế sản phẩm (Chờ duyệt)!");
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, project, refreshProjectBundle, selectedEntityId, showToast],
  );

  const handleSaveSelectedFurnitureTransform = useCallback(
    async (entityId: string, xMm: number, yMm: number, rotDeg: number) => {
      if (!project) return;
      const updated = project.furniture.map((f: any) =>
        f.id === entityId
          ? {
              ...f,
              position_mm: [xMm, yMm, f.position_mm?.[2] ?? 0],
              rotation_deg: rotDeg,
            }
          : f,
      );
      setBusyMessage("Đang lưu tọa độ nội thất & kiểm tra va chạm...");
      try {
        const res = await fetch(
          `${API_BASE}/projects/${activeProjectId}/furniture`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              furniture: updated,
              reason: `Cập nhật vị trí nội thất (${entityId}) từ Object Inspector`,
            }),
          },
        );
        if (res.ok) {
          await refreshProjectBundle(activeProjectId);
          showToast("Đã lưu vị trí nội thất mới vào Pascal SceneGraph!");
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, project, refreshProjectBundle, showToast],
  );

  const handleCreateProject = useCallback(
    async (name: string, style: string, budgetVnd: number) => {
      if (!name.trim()) return;
      setBusyMessage("Đang khởi tạo dự án mới...");
      try {
        const res = await fetch(`${API_BASE}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            room_type: "living_room",
            style_goal: style,
            budget_vnd: budgetVnd,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          setActiveProjectId(created.id);
          await refreshProjectBundle(created.id);
          showToast(`Đã tạo dự án "${created.name}" thành công!`);
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [refreshProjectBundle, showToast],
  );

  const handleCreateSpatialPin = useCallback(
    async (input: {
      entityId: string | null;
      entityName: string;
      positionMm: [number, number, number];
      comment: string;
    }) => {
      setBusyMessage("Đang ghim nhận xét lên 3D & tạo Task + Đề xuất Paperclip...");
      try {
        const res = await fetch(`/api/atelier/pins/${activeProjectId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity_id: input.entityId,
            entity_name: input.entityName,
            position_mm: input.positionMm,
            comment: input.comment,
            create_proposal: true,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          await refreshProjectBundle(activeProjectId);
          showToast(
            `Đã ghim nhận xét 3D & tạo công việc ${data.pin?.paperclip_issue_identifier ?? "Paperclip"}!`,
          );
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, refreshProjectBundle, showToast],
  );

  const handleRunWorkflow = useCallback(
    async (wfId: string) => {
      setBusyMessage("Đang thực thi luồng 14 Node Multi-Agent...");
      try {
        const res = await fetch(
          `${API_BASE}/workflows/${wfId}/runs?project_id=${activeProjectId}`,
          { method: "POST" },
        );
        if (res.ok) {
          const runsRes = await fetch(`${API_BASE}/runs`);
          if (runsRes.ok) setRuns(await runsRes.json());
          await refreshProjectBundle(activeProjectId);
          showToast("Đã thực thi luồng 14 Node Multi-Agent thành công!");
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [activeProjectId, refreshProjectBundle, showToast],
  );

  const handleUpdateWorkflow = useCallback(
    async (wf: any) => {
      setBusyMessage("Đang cập nhật cấu hình quy trình...");
      try {
        const res = await fetch(`${API_BASE}/workflows/${wf.workflow_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wf),
        });
        if (res.ok) {
          const updated = await res.json();
          setWorkflows((prev) =>
            prev.map((w) => (w.workflow_id === updated.workflow_id ? updated : w)),
          );
          showToast("Đã lưu cấu hình luồng Multi-Agent!");
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [showToast],
  );

  const handleUpdateAgent = useCallback(
    async (agent: any) => {
      setBusyMessage("Đang cập nhật thuộc tính Agent...");
      try {
        const res = await fetch(`${API_BASE}/agents/${agent.agent_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(agent),
        });
        if (res.ok) {
          const updated = await res.json();
          setAgents((prev) =>
            prev.map((a) => (a.agent_id === updated.agent_id ? updated : a)),
          );
          showToast(`Đã lưu cấu hình Tác tử: ${updated.name}`);
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [showToast],
  );

  const handleTestConnection = useCallback(
    async (connId: string) => {
      setBusyMessage("Đang kiểm tra kết nối...");
      try {
        const res = await fetch(`${API_BASE}/connections/${connId}/test`, {
          method: "POST",
        });
        if (res.ok) {
          const updated = await res.json();
          setConnections((prev) =>
            prev.map((c) => (c.connection_id === connId ? updated : c)),
          );
          showToast(`Kiểm tra kết nối ${updated.name}: ${updated.status} (${updated.latency_ms}ms)`);
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [showToast],
  );

  const handleSaveConnection = useCallback(
    async (conn: any) => {
      setBusyMessage("Đang lưu kết nối...");
      try {
        const res = await fetch(`${API_BASE}/connections/${conn.connection_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(conn),
        });
        if (res.ok) {
          const updated = await res.json();
          setConnections((prev) =>
            prev.map((c) => (c.connection_id === updated.connection_id ? updated : c)),
          );
          showToast(`Đã lưu thông số kết nối ${updated.name}`);
        }
      } finally {
        setBusyMessage(null);
      }
    },
    [showToast],
  );

  const value = useMemo(
    () => ({
      projects,
      activeProjectId,
      setActiveProjectId,
      project,
      estimate,
      materialsCatalog,
      productsCatalog,
      chatHistory,
      revisions,
      pins,
      selectedEntityId,
      setSelectedEntityId,
      viewMode,
      setViewMode,
      cameraPreset,
      setCameraPreset,
      workflows,
      runs,
      agents,
      connections,
      mcpTools,
      handleRunWorkflow,
      handleUpdateWorkflow,
      handleUpdateAgent,
      handleTestConnection,
      handleSaveConnection,
      busyMessage,
      toast,
      showToast,
      refreshProjectBundle,
      handleMaterialChange,
      handleSendChat,
      handleAnswerQuestion,
      handleProposalDecision,
      handleRestoreRevision,
      handleApplyDesignOption,
      handleReplaceProduct,
      handleSaveSelectedFurnitureTransform,
      handleCreateProject,
      handleCreateSpatialPin,
    }),
    [
      projects,
      activeProjectId,
      project,
      estimate,
      materialsCatalog,
      productsCatalog,
      chatHistory,
      revisions,
      pins,
      selectedEntityId,
      viewMode,
      cameraPreset,
      workflows,
      runs,
      agents,
      connections,
      mcpTools,
      handleRunWorkflow,
      handleUpdateWorkflow,
      handleUpdateAgent,
      handleTestConnection,
      handleSaveConnection,
      busyMessage,
      toast,
      showToast,
      refreshProjectBundle,
      handleMaterialChange,
      handleSendChat,
      handleAnswerQuestion,
      handleProposalDecision,
      handleRestoreRevision,
      handleApplyDesignOption,
      handleReplaceProduct,
      handleSaveSelectedFurnitureTransform,
      handleCreateProject,
      handleCreateSpatialPin,
    ],
  );

  return (
    <AtelierStudioContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 rounded-lg border border-teal-700/30 bg-teal-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </AtelierStudioContext.Provider>
  );
}

export function useAtelierStudio() {
  const ctx = useContext(AtelierStudioContext);
  if (!ctx) {
    throw new Error("useAtelierStudio must be used within AtelierStudioProvider");
  }
  return ctx;
}
