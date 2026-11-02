import React, { useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  FolderGit2,
  Layers,
  ListTree,
  ExternalLink
} from "lucide-react";
import type { PaperclipAgent, PaperclipIssue } from "../types.js";

type TreeNode = {
  issue: PaperclipIssue;
  children: TreeNode[];
};

export function ProjectTaskTreeView({
  issues,
  agents,
  onOpenIssue
}: {
  issues: PaperclipIssue[];
  agents: PaperclipAgent[];
  onOpenIssue: (id: string) => void;
}) {
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  // Build tree from parentId relations
  const roots: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  for (const issue of issues) {
    nodeMap.set(issue.id, { issue, children: [] });
  }

  for (const issue of issues) {
    const node = nodeMap.get(issue.id)!;
    const parentId = (issue as any).parentId as string | undefined;
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return (
    <div className="wfs-task-tree">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 }}>
          <ListTree size={15} color="var(--wfs-accent)" />
          <span>Project Work Breakdown & Tasks ({issues.length})</span>
        </div>
        <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
          {roots.length} Root Requirements • {issues.length - roots.length} Subtasks
        </span>
      </div>

      {roots.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--muted-foreground)", fontSize: 11 }}>
          No tasks found for this project yet. Use "Run Project Workflow" to plan and generate tasks.
        </div>
      ) : (
        roots.map((root) => (
          <TreeItem
            key={root.issue.id}
            node={root}
            agentMap={agentMap}
            onOpenIssue={onOpenIssue}
            level={0}
          />
        ))
      )}
    </div>
  );
}

function TreeItem({
  node,
  agentMap,
  onOpenIssue,
  level
}: {
  node: TreeNode;
  agentMap: Map<string, PaperclipAgent>;
  onOpenIssue: (id: string) => void;
  level: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const issue = node.issue;
  const agent = issue.assigneeAgentId ? agentMap.get(issue.assigneeAgentId) : null;
  const hasChildren = node.children.length > 0;

  const statusClass =
    issue.status === "done"
      ? "wfs-badge-published"
      : issue.status === "in_progress"
      ? "wfs-badge-published"
      : issue.status === "blocked"
      ? "wfs-badge-draft"
      : "";

  return (
    <div className="wfs-tree-item" style={{ marginLeft: level * 14 }}>
      <div className="wfs-tree-head" onClick={() => hasChildren && setExpanded((v) => !v)}>
        {hasChildren ? (
          expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        ) : (
          <span style={{ width: 14 }} />
        )}

        <FolderGit2 size={14} color="var(--wfs-accent)" />

        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {issue.identifier ? `[${issue.identifier}] ` : ""}
            {issue.title}
          </strong>
        </div>

        {agent && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--muted-foreground)" }}>
            <Bot size={12} />
            {agent.name}
          </span>
        )}

        <span className={`wfs-badge ${statusClass}`} style={{ fontSize: 9 }}>
          {issue.status.replaceAll("_", " ")}
        </span>

        <button
          className="wfs-button wfs-icon-button"
          style={{ width: 22, height: 22 }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenIssue(issue.id);
          }}
          title="Open in Paperclip"
        >
          <ExternalLink size={11} />
        </button>
      </div>

      {hasChildren && expanded && (
        <div className="wfs-tree-children">
          {node.children.map((child) => (
            <TreeItem
              key={child.issue.id}
              node={child}
              agentMap={agentMap}
              onOpenIssue={onOpenIssue}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
