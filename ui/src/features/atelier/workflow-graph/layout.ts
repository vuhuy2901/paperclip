import ELK from "elkjs/lib/elk.bundled.js";
import type { WorkflowEdge, WorkflowNode, RoutedPoint } from "./types";

const elk = new ELK();
export const WORKFLOW_NODE_WIDTH = 244;
export const WORKFLOW_NODE_HEIGHT = 104;

export type LayoutResult = {
  nodes: WorkflowNode[];
  routes: Record<string, RoutedPoint[]>;
};

export async function layoutWorkflowGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]): Promise<LayoutResult> {
  const graph = await elk.layout({
    id: "atelier-workflow",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.nodeNode": "64",
      "elk.layered.spacing.nodeNodeBetweenLayers": "112",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.layered.mergeEdges": "false",
      "elk.padding": "[top=56,left=56,bottom=56,right=56]",
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: WORKFLOW_NODE_WIDTH,
      height: WORKFLOW_NODE_HEIGHT,
      layoutOptions: { "elk.portConstraints": "FIXED_SIDE" },
      ports: [
        { id: `${node.id}:in`, width: 1, height: 1, layoutOptions: { "elk.port.side": "WEST" } },
        { id: `${node.id}:out`, width: 1, height: 1, layoutOptions: { "elk.port.side": "EAST" } },
      ],
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [`${edge.source}:out`],
      targets: [`${edge.target}:in`],
    })),
  });

  const positioned = new Map((graph.children ?? []).map((child) => [child.id, { x: child.x ?? 0, y: child.y ?? 0 }]));
  const routes: Record<string, RoutedPoint[]> = {};
  for (const edge of graph.edges ?? []) {
    const section = edge.sections?.[0];
    if (section) routes[edge.id] = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint];
  }
  return {
    nodes: nodes.map((node) => ({ ...node, position: positioned.get(node.id) ?? node.position ?? { x: 0, y: 0 } })),
    routes,
  };
}

export function graphTopologySignature(edges: WorkflowEdge[]) {
  return edges.map(({ source, target, outcome }) => `${source}>${target}:${outcome ?? ""}`).sort();
}

export function hasNodeOverlap(nodes: WorkflowNode[], gap = 8) {
  return nodes.some((node, index) => nodes.slice(index + 1).some((other) => {
    const a = node.position ?? { x: 0, y: 0 };
    const b = other.position ?? { x: 0, y: 0 };
    return a.x < b.x + WORKFLOW_NODE_WIDTH + gap && a.x + WORKFLOW_NODE_WIDTH + gap > b.x
      && a.y < b.y + WORKFLOW_NODE_HEIGHT + gap && a.y + WORKFLOW_NODE_HEIGHT + gap > b.y;
  }));
}
