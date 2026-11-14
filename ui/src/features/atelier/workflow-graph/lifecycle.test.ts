import { describe, expect, it } from "vitest";
import { hasNodeOverlap } from "./layout";
import { TASK_LIFECYCLE_STATES, taskLifecycleGraph } from "./lifecycle";

describe("simplified 6-state Task Lifecycle", () => {
  it("contains only the 6 required Vietnamese statuses as display-only nodes without overlap", () => {
    expect(TASK_LIFECYCLE_STATES.map((item) => item.name)).toEqual([
      "Chờ",
      "Đang chạy",
      "Chờ duyệt",
      "Hoàn thành",
      "Lỗi",
      "Đã hủy",
    ]);

    const graph = taskLifecycleGraph();
    expect(graph.nodes).toHaveLength(6);
    expect(graph.nodes.map((node) => node.name)).toEqual([
      "Chờ",
      "Đang chạy",
      "Chờ duyệt",
      "Hoàn thành",
      "Lỗi",
      "Đã hủy",
    ]);
    expect(graph.nodes.every((node) => node.lifecycleStateOnly === true)).toBe(true);
    expect(graph.nodes.some((node) => ["RETRY_RECOVERY", "NOTIFICATION", "APPROVAL_GATE"].includes(node.type))).toBe(false);
    expect(hasNodeOverlap(graph.nodes)).toBe(false);
  });
});
