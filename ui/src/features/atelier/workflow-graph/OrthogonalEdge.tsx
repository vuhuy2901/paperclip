import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";
import type { RoutedEdgeData, RoutedPoint } from "./types";

function pathFrom(points: RoutedPoint[]) {
  return points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
}

function midpoint(points: RoutedPoint[]) {
  if (points.length < 2) return points[0] ?? { x: 0, y: 0 };
  const lengths = points.slice(1).map((point, index) => Math.abs(point.x - points[index].x) + Math.abs(point.y - points[index].y));
  const half = lengths.reduce((sum, value) => sum + value, 0) / 2;
  let walked = 0;
  for (let index = 0; index < lengths.length; index += 1) {
    if (walked + lengths[index] >= half) {
      const start = points[index], end = points[index + 1], ratio = lengths[index] ? (half - walked) / lengths[index] : 0;
      return { x: start.x + (end.x - start.x) * ratio, y: start.y + (end.y - start.y) * ratio };
    }
    walked += lengths[index];
  }
  return points.at(-1)!;
}

export function OrthogonalEdge(props: EdgeProps) {
  const data = (props.data ?? {}) as RoutedEdgeData;
  const fallback = [{ x: props.sourceX, y: props.sourceY }, { x: (props.sourceX + props.targetX) / 2, y: props.sourceY }, { x: (props.sourceX + props.targetX) / 2, y: props.targetY }, { x: props.targetX, y: props.targetY }];
  const points = data.points?.length ? data.points : fallback;
  const label = midpoint(points);
  return <>
    <BaseEdge id={props.id} path={pathFrom(points)} markerEnd={props.markerEnd} style={{ ...props.style, strokeWidth: props.selected ? 2.4 : 1.6 }} interactionWidth={20} />
    {data.outcome ? <EdgeLabelRenderer><div className={`nodrag nopan absolute rounded-md border bg-card px-2 py-1 text-[10px] font-semibold shadow-sm ${props.selected ? "border-primary text-primary" : "border-border text-muted-foreground"}`} style={{ transform: `translate(-50%, -50%) translate(${label.x}px,${label.y}px)` }}>{data.outcome}</div></EdgeLabelRenderer> : null}
  </>;
}
