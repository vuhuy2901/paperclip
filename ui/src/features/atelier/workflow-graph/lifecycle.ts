import type { RoutedPoint, WorkflowEdge, WorkflowNode } from "./types";

export const TASK_LIFECYCLE_STATES = [
  { key: "waiting", name: "Chờ", description: "Việc đang chờ tới lượt hoặc chờ bước trước hoàn tất." },
  { key: "running", name: "Đang chạy", description: "Việc đang được thực thi ở bước hiện tại." },
  { key: "pending_approval", name: "Chờ duyệt", description: "Đang dừng tại cổng NGƯỜI DUYỆT để chờ xác nhận." },
  { key: "completed", name: "Hoàn thành", description: "Việc đã hoàn tất và qua kiểm tra." },
  { key: "failed", name: "Lỗi", description: "Gặp lỗi trong khi thực thi; xem chi tiết lỗi ở tab Execution." },
  { key: "cancelled", name: "Đã hủy", description: "Việc đã bị hủy hoặc không được duyệt." },
] as const;

export type TaskLifecycleStateKey = (typeof TASK_LIFECYCLE_STATES)[number]["key"];

// Display-only 6-state reference map. Retry, logging and notification settings
// live inside each step of Pipeline Workflow rather than on Task Lifecycle.
export function taskLifecycleGraph(): { nodes: WorkflowNode[]; edges: WorkflowEdge[]; routes: Record<string, RoutedPoint[]> } {
  const positions: Record<TaskLifecycleStateKey, { x: number; y: number }> = {
    waiting: { x: 40, y: 180 },
    running: { x: 340, y: 180 },
    pending_approval: { x: 640, y: 180 },
    completed: { x: 940, y: 180 },
    failed: { x: 640, y: 360 },
    cancelled: { x: 340, y: 360 },
  };
  const nodes: WorkflowNode[] = TASK_LIFECYCLE_STATES.map((state) => ({
    id: `state_${state.key}`,
    type: state.key === "completed" || state.key === "cancelled" ? "END" : state.key === "waiting" ? "START" : "AGENT_TASK",
    name: state.name,
    description: state.description,
    lifecycleStateOnly: true,
    position: positions[state.key],
  }));
  const edges: WorkflowEdge[] = [
    { id: "lc_wait_run", source: "state_waiting", target: "state_running" },
    { id: "lc_run_review", source: "state_running", target: "state_pending_approval" },
    { id: "lc_review_done", source: "state_pending_approval", target: "state_completed" },
    { id: "lc_run_failed", source: "state_running", target: "state_failed" },
    { id: "lc_wait_cancelled", source: "state_waiting", target: "state_cancelled" },
  ];
  const routes: Record<string, RoutedPoint[]> = {
    lc_wait_run: [{ x: 284, y: 232 }, { x: 340, y: 232 }],
    lc_run_review: [{ x: 584, y: 232 }, { x: 640, y: 232 }],
    lc_review_done: [{ x: 884, y: 232 }, { x: 940, y: 232 }],
    lc_run_failed: [{ x: 584, y: 232 }, { x: 612, y: 232 }, { x: 612, y: 412 }, { x: 640, y: 412 }],
    lc_wait_cancelled: [{ x: 284, y: 232 }, { x: 312, y: 232 }, { x: 312, y: 412 }, { x: 340, y: 412 }],
  };
  return { nodes, edges, routes };
}
