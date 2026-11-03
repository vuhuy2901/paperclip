import React, { useEffect, useMemo, useState } from "react";
import type { Issue } from "@paperclipai/shared";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ExternalLink,
  FileCode,
  FileText,
  GitBranch,
  RotateCcw,
  Terminal,
  User,
  X,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { classifyIssue } from "../lib/issue-classification";

export interface AiTaskDetailDrawerProps {
  issue: Issue | null;
  agentName?: string | null;
  projectName?: string | null;
  liveStatus?: "running" | "idle" | "queued" | "completed" | "failed";
  onClose: () => void;
  onOpenPaperclipDetail?: (issueId: string) => void;
}

export function extractAcceptanceCriteria(description: string | null): string[] {
  if (!description) return [];
  const lines = description.split("\n");
  const criteria: string[] = [];
  let inCriteriaSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/acceptance criteria|tiêu chí|yêu cầu quy trình|mục tiêu/i.test(trimmed)) {
      inCriteriaSection = true;
      continue;
    }
    if (inCriteriaSection && /^#+\s/.test(trimmed)) {
      inCriteriaSection = false;
      continue;
    }
    if (inCriteriaSection || /^[*-]\s|^\[[ xX]\]\s|^\d+\.\s/.test(trimmed)) {
      if (/^[*-]\s|^\[[ xX]\]\s|^\d+\.\s/.test(trimmed)) {
        criteria.push(trimmed.replace(/^[*-]\s*|^\[[ xX]\]\s*|^\d+\.\s*/, ""));
      }
    }
  }
  return criteria.slice(0, 8);
}

const WORKFLOW_STAGES = [
  { id: "planning", label: "Project Manager", role: "AI Project Manager" },
  { id: "architecture", label: "Architect", role: "AI System Architect" },
  { id: "development", label: "Backend & Frontend", role: "AI Engineers" },
  { id: "review", label: "Code Review", role: "AI Code Reviewer" },
  { id: "qa", label: "QA Tester", role: "AI QA Tester" },
  { id: "devops", label: "DevOps Deploy", role: "AI DevOps Engineer" }
];

export function resolveWorkflowStageName(issue: Issue, agentName?: string | null): string {
  const origin = (issue.originId || "").toLowerCase();
  if (origin.includes("node:pm") || origin.includes("coordinator")) return "Project Manager";
  if (origin.includes("node:architect")) return "Solution Architect";
  if (origin.includes("node:uiux")) return "UI/UX Designer";
  if (origin.includes("node:backend")) return "Backend Engineer";
  if (origin.includes("node:frontend")) return "Frontend Engineer";
  if (origin.includes("node:review")) return "Code Reviewer";
  if (origin.includes("node:test")) return "QA Tester";
  if (origin.includes("node:deploy")) return "DevOps Engineer";
  if (origin.includes("node:approval")) return "Product Owner";

  const role = (agentName || "").toLowerCase();
  const title = (issue.title || "").toLowerCase();
  if (role.includes("pm") || role.includes("manager") || title.includes("plan") || title.includes("phân tích")) return "Project Manager";
  if (role.includes("designer") || role.includes("ui") || role.includes("ux") || title.includes("interface") || title.includes("giao diện")) return "UI/UX Designer";
  if (role.includes("architect") || title.includes("kiến trúc") || title.includes("architecture")) return "Solution Architect";
  if (role.includes("backend") || title.includes("backend") || title.includes("api")) return "Backend Engineer";
  if (role.includes("frontend") || title.includes("frontend")) return "Frontend Engineer";
  if (role.includes("review") || title.includes("review")) return "Code Reviewer";
  if (role.includes("tester") || role.includes("qa") || title.includes("test")) return "QA Tester";
  if (role.includes("devops") || title.includes("deploy") || title.includes("docker")) return "DevOps Engineer";
  if (role.includes("approval") || role.includes("owner") || title.includes("approval") || title.includes("nghiệm thu")) return "Product Owner";
  return "Execution Stage";
}

export function AiTaskDetailDrawer({
  issue,
  agentName,
  projectName,
  liveStatus = "idle",
  onClose,
  onOpenPaperclipDetail
}: AiTaskDetailDrawerProps) {
  const [tab, setTab] = useState<"overview" | "execution" | "logs" | "workflow">("overview");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const criteria = useMemo(() => extractAcceptanceCriteria(issue?.description ?? null), [issue?.description]);
  const stageName = useMemo(() => issue ? resolveWorkflowStageName(issue, agentName) : "Execution", [issue, agentName]);

  if (!issue) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-task-title"
    >
      <aside
        className="flex h-screen w-full max-w-[620px] flex-col border-l border-border bg-card shadow-2xl transition-transform animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border bg-muted/30 p-5">
          <div className="min-w-0 flex-1 pr-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                {issue.identifier || issue.id.slice(0, 8)}
              </span>
              <Badge variant="outline" className="text-xs uppercase">
                {issue.status.replaceAll("_", " ")}
              </Badge>
              <span className={`text-xs font-semibold ${liveStatus === "running" ? "text-emerald-500 font-bold" : "text-muted-foreground"}`}>
                {liveStatus.toUpperCase()}
              </span>
            </div>
            <h2 id="drawer-task-title" className="text-base font-semibold leading-snug text-foreground">
              {issue.title}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {classifyIssue(issue) === "ai-execution-task" && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (window.confirm(`Bạn có chắc muốn xóa task ${issue.identifier || issue.id.slice(0, 8)}: "${issue.title}"?`)) {
                  try {
                    await fetch(`/api/issues/${issue.id}`, { method: "DELETE" });
                    onClose();
                    window.location.reload();
                  } catch (err) {
                    console.error("Lỗi khi xóa task:", err);
                  }
                }
              }}
              className="h-8 px-2 text-xs font-medium text-destructive border-destructive/40 hover:bg-destructive/10 gap-1"
              title="Xóa task"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa Task</span>
            </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border bg-muted/20 px-5">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "execution", label: "AI Execution", icon: Bot },
            { id: "logs", label: "Live Logs", icon: Terminal },
            { id: "workflow", label: "Workflow", icon: GitBranch },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as any)}
                className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary font-bold text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Project</span>
                  <div className="mt-0.5 font-semibold text-foreground">{projectName || "Unassigned"}</div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Assigned Agent</span>
                  <div className="mt-0.5 flex items-center gap-1.5 font-semibold text-foreground">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                    {agentName || "Unassigned"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Priority</span>
                  <div className="mt-0.5 font-semibold capitalize text-foreground">{issue.priority}</div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Workflow Stage</span>
                  <div className="mt-0.5 font-semibold text-foreground">{stageName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Created</span>
                  <div className="mt-0.5 text-muted-foreground">{new Date(issue.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Last Activity</span>
                  <div className="mt-0.5 text-muted-foreground">{new Date(issue.updatedAt).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h3 className="mb-1.5 text-xs font-semibold text-foreground">Task Description</h3>
                <div className="rounded-lg border border-border bg-muted/10 p-3.5 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                  {issue.description || "No description provided."}
                </div>
              </div>

              <div>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Acceptance Criteria
                </h3>
                {criteria.length > 0 ? (
                  <div className="space-y-1.5">
                    {criteria.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs text-foreground">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                          {i + 1}
                        </span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    Acceptance criteria defined in project requirements and workflow stage contracts.
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "execution" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground text-sm">{agentName || "Autonomous Agent"}</div>
                  <div className="text-xs text-muted-foreground">Stage: {stageName}</div>
                </div>
                <Badge variant="outline" className={`text-xs uppercase ${liveStatus === "running" ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : ""}`}>
                  {liveStatus}
                </Badge>
              </div>

              <div>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <FileCode className="h-3.5 w-3.5 text-primary" /> Instructions from AI PM
                </h3>
                <div className="rounded-lg border border-border bg-muted/10 p-3 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                  {issue.description || `Autonomous execution instructions for ${issue.title}. Deliver implementation files according to project workflow.`}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Execution State</span>
                  <span className="capitalize text-primary">{issue.status.replaceAll("_", " ")}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: issue.status === "done" ? "100%" : issue.status === "in_progress" ? "60%" : "20%" }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {onOpenPaperclipDetail && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => onOpenPaperclipDetail(issue.id)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Open Issue / Run Agent
                  </Button>
                )}
              </div>
            </div>
          )}

          {tab === "logs" && (
            <div className="rounded-lg border border-border bg-zinc-950 p-4 font-mono text-xs text-zinc-200 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[11px] text-zinc-400">
                <span>Task Execution Terminal</span>
                <span className="text-emerald-400">Live Active</span>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="text-zinc-500">[{new Date(issue.createdAt).toLocaleTimeString()}] [INFO] Task {issue.identifier || issue.id.slice(0, 8)} allocated to {agentName || "Agent"}.</div>
                <div className="text-zinc-400">[{new Date(issue.updatedAt).toLocaleTimeString()}] [TOOL] Reading codebase structure & acceptance criteria.</div>
                <div className="text-emerald-400">[{new Date(issue.updatedAt).toLocaleTimeString()}] [STATE] Status: {issue.status.toUpperCase()}. Stage: {stageName}.</div>
              </div>
            </div>
          )}

          {tab === "workflow" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3.5">
                <div className="text-[10px] font-semibold uppercase text-muted-foreground">Workflow Stage Pipeline</div>
                <div className="mt-2 space-y-1.5">
                  {WORKFLOW_STAGES.map((s, idx) => {
                    const isCurrent = stageName.toLowerCase().includes(s.id) || s.label.toLowerCase().includes(stageName.toLowerCase());
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between rounded-md p-2 text-xs transition-colors ${
                          isCurrent
                            ? "border border-primary bg-primary/10 font-bold text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {idx + 1}
                          </span>
                          <span>{s.label} ({s.role})</span>
                        </div>
                        {isCurrent && <span className="text-[10px] font-bold text-primary">CURRENT</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
