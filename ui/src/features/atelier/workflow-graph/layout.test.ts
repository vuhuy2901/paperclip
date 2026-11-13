import { describe, expect, it } from "vitest";
import { graphTopologySignature, hasNodeOverlap, layoutWorkflowGraph } from "./layout";
import type { WorkflowEdge, WorkflowNode } from "./types";

describe("orthogonal workflow layout", () => {
  const nodes: WorkflowNode[] = [
    { id: "start", type: "START", name: "Start" },
    { id: "a", type: "AGENT_TASK", name: "A" },
    { id: "b", type: "AGENT_TASK", name: "B" },
    { id: "join", type: "JOIN", name: "Join" },
    { id: "end", type: "END", name: "End" },
  ];
  const edges: WorkflowEdge[] = [
    { id: "1", source: "start", target: "a" }, { id: "2", source: "start", target: "b" },
    { id: "3", source: "a", target: "join", outcome: "Passed" }, { id: "4", source: "b", target: "join" },
    { id: "5", source: "join", target: "end" },
  ];

  it("preserves topology, separates nodes and returns orthogonal routes", async () => {
    const before = graphTopologySignature(edges);
    const result = await layoutWorkflowGraph(nodes, edges);
    expect(graphTopologySignature(edges)).toEqual(before);
    expect(hasNodeOverlap(result.nodes)).toBe(false);
    expect(result.nodes.find((node) => node.id === "start")!.position!.x).toBeLessThan(result.nodes.find((node) => node.id === "end")!.position!.x);
    expect(Object.keys(result.routes)).toHaveLength(edges.length);
    for (const points of Object.values(result.routes)) {
      expect(points.length).toBeGreaterThanOrEqual(2);
      for (let index = 1; index < points.length; index += 1) expect(points[index].x === points[index - 1].x || points[index].y === points[index - 1].y).toBe(true);
    }
  });
});
