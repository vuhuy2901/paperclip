export type GraphNode = { id: string; data: { kind: string } };
export type GraphEdge = { source: string; target: string };
export const isExecutableStep = (node: GraphNode) => node.data.kind === 'task' || node.data.kind === 'approval';

// Compile a template into a provisioning plan. Native issue dependencies own runtime execution.
export function compileTaskPlan<T extends GraphNode>(nodes: T[], edges: GraphEdge[]) {
  const byId = new Map(nodes.map(node => [node.id, node]));
  if (byId.size !== nodes.length) throw new Error('Workflow step IDs must be unique.');
  const incoming = new Map(nodes.map(node => [node.id, [] as string[]]));
  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) throw new Error('A connection points to a missing step.');
    incoming.get(edge.target)!.push(edge.source);
  }
  const visiting = new Set<string>(), visited = new Set<string>(), ordered: T[] = [];
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error('Workflow dependencies contain a cycle.');
    if (visited.has(id)) return;
    visiting.add(id);
    for (const parent of incoming.get(id)!) visit(parent);
    visiting.delete(id); visited.add(id); ordered.push(byId.get(id)!);
  };
  for (const node of nodes) visit(node.id);
  const upstream = (id: string): string[] => incoming.get(id)!.flatMap(parent => isExecutableStep(byId.get(parent)!) ? [parent] : upstream(parent));
  return ordered.filter(isExecutableStep).map(node => ({ node, blockedByStepIds: [...new Set(upstream(node.id))] }));
}
