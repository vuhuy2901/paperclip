import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  FileJson,
  File,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  GitCommit,
  Bot,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  ListTodo,
  Calendar,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../api/client";
import { issuesApi } from "../api/issues";
import { queryKeys } from "../lib/queryKeys";
import type { ProjectWorkflowSnapshot } from "../lib/project-operations";

export interface WorkspaceFileEntry {
  path: string;
  name: string;
  size: number;
  modified_at: number;
  status: "new" | "modified" | "unchanged";
  agent: string;
  is_new: boolean;
  is_modified: boolean;
}

interface WorkspaceTreeResponse {
  project_id: string;
  root_name: string;
  files: WorkspaceFileEntry[];
}

interface FileContentResponse {
  path: string;
  name: string;
  size: number;
  content: string;
  diff: string | null;
  language: string;
  mime: string;
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: Record<string, TreeNode>;
  fileData?: WorkspaceFileEntry;
}

function buildTree(files: WorkspaceFileEntry[]): TreeNode {
  const root: TreeNode = { name: "root", path: "", isDir: true, children: {} };

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const curPath = parts.slice(0, i + 1).join("/");

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: curPath,
          isDir: !isLast,
          children: {},
          fileData: isLast ? file : undefined,
        };
      }
      current = current.children[part];
    }
  }

  return root;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".json")) return <FileJson className="h-4 w-4 text-amber-500 shrink-0" />;
  if (lower.endsWith(".js") || lower.endsWith(".ts") || lower.endsWith(".jsx") || lower.endsWith(".tsx")) {
    return <FileCode2 className="h-4 w-4 text-blue-500 shrink-0" />;
  }
  if (lower.endsWith(".py")) return <FileCode2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (lower.endsWith(".html") || lower.endsWith(".css")) return <FileCode2 className="h-4 w-4 text-purple-500 shrink-0" />;
  if (lower.endsWith(".md") || lower.endsWith(".txt")) return <FileText className="h-4 w-4 text-slate-500 shrink-0" />;
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function getFileCategory(path: string): string {
  const lower = path.toLowerCase();
  if (lower.includes("test") || lower.includes("spec")) return "Test Suite";
  if (lower.endsWith(".md") || lower.endsWith(".txt")) return "Documentation / Specification";
  if (lower.includes("api") || lower.includes("server") || lower.includes("backend")) return "Backend API Service";
  if (lower.includes("ui") || lower.includes("front") || lower.endsWith(".tsx") || lower.endsWith(".jsx") || lower.endsWith(".css")) return "Frontend UI Component";
  if (lower.endsWith(".json") || lower.endsWith(".yaml") || lower.endsWith(".yml") || lower.includes("docker")) return "Configuration & Infrastructure";
  return "Source Code";
}

export function ProjectStructureView({
  projectId,
  companyId,
  projectRef,
  initialFilePath,
  onNavigateTab,
}: {
  projectId: string;
  companyId: string;
  projectRef: string;
  initialFilePath?: string | null;
  onNavigateTab?: (tab: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(initialFilePath ?? null);
  const [viewMode, setViewMode] = useState<"code" | "diff">("code");
  const [copied, setCopied] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});
  const [flashFiles, setFlashFiles] = useState<Set<string>>(new Set());
  const prevFilesRef = useRef<Map<string, number>>(new Map());

  // 1. Fetch workspace tree files (polling every 3s)
  const treeQuery = useQuery({
    queryKey: ["project-workspace-tree-view", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/workspace/tree`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as WorkspaceTreeResponse;
    },
    refetchInterval: 3000,
  });

  const data = treeQuery.data ?? null;
  const loading = treeQuery.isLoading;
  const isError = treeQuery.isError;

  // Workflow Studio was removed; native Paperclip task hierarchy is the
  // project structure source of truth.
  const workflowQuery = useQuery({
    queryKey: ["project-native-structure", companyId, projectId],
    queryFn: async () => ({ binding: null, activeRun: null, recentRuns: [], monitor: [] } as ProjectWorkflowSnapshot),
    enabled: false,
    initialData: { binding: null, activeRun: null, recentRuns: [], monitor: [] } as ProjectWorkflowSnapshot,
  });

  // 3. Fetch project issues for task mapping
  const issuesQuery = useQuery({
    queryKey: queryKeys.issues.listByProject(companyId, projectId),
    queryFn: () => issuesApi.listAll(companyId, { projectId }),
    refetchInterval: 5000,
  });

  // Flash detection on new/modified files
  useEffect(() => {
    if (!data) return;
    const newlyFlashed = new Set<string>();
    for (const file of data.files) {
      const prevMtime = prevFilesRef.current.get(file.path);
      if (prevMtime !== undefined && prevMtime !== file.modified_at) {
        newlyFlashed.add(file.path);
      }
      prevFilesRef.current.set(file.path, file.modified_at);
    }
    if (newlyFlashed.size > 0) {
      setFlashFiles(newlyFlashed);
      const timer = window.setTimeout(() => setFlashFiles(new Set()), 2000);
      return () => window.clearTimeout(timer);
    }
  }, [data]);

  // Auto select first file if none selected
  useEffect(() => {
    if (!selectedFilePath && data && data.files.length > 0) {
      const firstCodeFile = data.files.find((f) => f.path.startsWith("src/")) ?? data.files[0];
      setSelectedFilePath(firstCodeFile.path);
    }
  }, [data, selectedFilePath]);

  // Fetch selected file content
  const fileQuery = useQuery({
    queryKey: ["project-workspace-file-content", projectId, selectedFilePath],
    queryFn: async () => {
      if (!selectedFilePath) return null;
      const res = await fetch(`/api/projects/${projectId}/workspace/file?path=${encodeURIComponent(selectedFilePath)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return (await res.json()) as FileContentResponse;
    },
    enabled: Boolean(selectedFilePath),
  });

  const fileDetails = fileQuery.data ?? null;
  const fileLoading = fileQuery.isLoading;
  const fileError = fileQuery.error ? (fileQuery.error as Error).message : null;

  // Auto expand all directories initially
  useEffect(() => {
    if (data?.files) {
      const dirs: Record<string, boolean> = {};
      for (const file of data.files) {
        const parts = file.path.split("/");
        for (let i = 1; i < parts.length; i++) {
          dirs[parts.slice(0, i).join("/")] = true;
        }
      }
      setExpandedDirs((prev) => ({ ...dirs, ...prev }));
    }
  }, [data?.files]);

  const toggleDir = (dirPath: string) => {
    setExpandedDirs((prev) => ({ ...prev, [dirPath]: !prev[dirPath] }));
  };

  const copyContent = () => {
    if (!fileDetails?.content) return;
    navigator.clipboard.writeText(fileDetails.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSingleFile = () => {
    if (!fileDetails) return;
    const blob = new Blob([fileDetails.content], { type: fileDetails.mime || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileDetails.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllZip = () => {
    window.open(`/api/projects/${projectId}/workspace/download-zip`, "_blank");
  };

  // Filtered files
  const filteredFiles = useMemo(() => {
    if (!data?.files) return [];
    return data.files.filter((f) => {
      if (search && !f.path.toLowerCase().includes(search.toLowerCase())) return false;
      if (agentFilter !== "all" && f.agent.toLowerCase() !== agentFilter.toLowerCase()) return false;
      return true;
    });
  }, [data?.files, search, agentFilter]);

  const treeRoot = useMemo(() => buildTree(filteredFiles), [filteredFiles]);

  const uniqueAgents = useMemo(() => {
    if (!data?.files) return [];
    return [...new Set(data.files.map((f) => f.agent))];
  }, [data?.files]);

  // Selected file entry from tree
  const selectedFileEntry = useMemo(() => {
    if (!selectedFilePath || !data?.files) return null;
    return data.files.find((f) => f.path === selectedFilePath) ?? null;
  }, [selectedFilePath, data?.files]);

  // Attributed Workflow Stage
  const relatedNode = useMemo(() => {
    if (!selectedFileEntry) return null;
    const author = selectedFileEntry.agent.toLowerCase();
    const nodes = workflowQuery.data?.binding?.workflow?.nodes ?? [];
    return nodes.find((n) => {
      const nodeData = n.data as { agentName?: string | null; agentRole?: string | null; title?: string } | undefined;
      const nodeAgent = (nodeData?.agentName || nodeData?.agentRole || "").toLowerCase();
      return nodeAgent && (author.includes(nodeAgent) || nodeAgent.includes(author));
    }) ?? null;
  }, [selectedFileEntry, workflowQuery.data]);

  // Attributed Task
  const relatedTask = useMemo(() => {
    if (!selectedFileEntry) return null;
    const author = selectedFileEntry.agent.toLowerCase();
    const issues = issuesQuery.data ?? [];
    return issues.find((issue) => {
      const titleLower = issue.title.toLowerCase();
      const matchAgent = issue.assigneeAgentId && author.includes(issue.assigneeAgentId.toLowerCase());
      return matchAgent || titleLower.includes(selectedFileEntry.name.toLowerCase());
    }) ?? issues[0] ?? null;
  }, [selectedFileEntry, issuesQuery.data]);

  // Diff stats calculation
  const diffStats = useMemo(() => {
    if (!fileDetails?.diff) return null;
    const lines = fileDetails.diff.split("\n");
    let additions = 0;
    let deletions = 0;
    for (const line of lines) {
      if (line.startsWith("+") && !line.startsWith("+++")) additions++;
      else if (line.startsWith("-") && !line.startsWith("---")) deletions++;
    }
    return { additions, deletions };
  }, [fileDetails?.diff]);

  // Recursive tree renderer
  const renderTree = (node: TreeNode, depth = 0) => {
    if (node.name === "root") {
      return (
        <div className="space-y-0.5">
          {Object.values(node.children).map((child) => renderTree(child, 0))}
        </div>
      );
    }

    if (node.isDir) {
      const isExpanded = expandedDirs[node.path] !== false;
      return (
        <div key={node.path} className="select-none text-xs">
          <div
            onClick={() => toggleDir(node.path)}
            className="flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer hover:bg-muted/40 transition-colors text-foreground font-medium"
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            ) : (
              <Folder className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>
          {isExpanded && (
            <div className="space-y-0.5">
              {Object.values(node.children).map((child) => renderTree(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isSelected = selectedFilePath === node.path;
    const isFlashed = flashFiles.has(node.path);
    const file = node.fileData;

    return (
      <div
        key={node.path}
        onClick={() => setSelectedFilePath(node.path)}
        className={`group flex items-center justify-between rounded px-2 py-1 cursor-pointer text-xs transition-colors select-none ${
          isSelected
            ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
            : isFlashed
            ? "bg-amber-500/20 text-foreground animate-pulse"
            : "hover:bg-muted/40 text-foreground/80 hover:text-foreground"
        }`}
        style={{ paddingLeft: `${depth * 14 + 18}px` }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {getFileIcon(node.name)}
          <span className="truncate">{node.name}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {file?.status === "new" && (
            <span className="rounded bg-emerald-500/15 px-1 py-0.2 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
              NEW
            </span>
          )}
          {file?.status === "modified" && (
            <span className="rounded bg-amber-500/15 px-1 py-0.2 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
              MOD
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5" data-testid="project-outputs">
      {/* ── Top Header Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-foreground">Outputs & Deliverables</h2>
            {isError ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-3 w-3" /> Connection error, retrying...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
                Real-time Sync
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Explore agent-generated files, code deliverables, and inspect real-time diffs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-44 sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-2 text-xs"
            />
          </div>

          {/* Agent Filter */}
          {uniqueAgents.length > 1 && (
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Agents ({data?.files.length ?? 0})</option>
              {uniqueAgents.map((ag) => (
                <option key={ag} value={ag}>
                  Author: {ag}
                </option>
              ))}
            </select>
          )}

          {/* Download ZIP */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={downloadAllZip}
            disabled={!data?.files?.length}
            title="Download complete workspace ZIP archive"
          >
            <Download className="h-3.5 w-3.5" /> Download ZIP
          </Button>
        </div>
      </div>

      {/* ── Main 3-Column Split Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[620px]">
        {/* ── Left Column: Explorer Tree (3.5 cols on lg) ── */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-xs">
          <div className="flex items-center justify-between border-b border-border/80 px-3.5 py-2.5 bg-muted/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Folder className="h-3.5 w-3.5 text-primary" />
              <span className="truncate">{data?.root_name ? `${data.root_name}/` : "Workspace Files"}</span>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              {filteredFiles.length} file{filteredFiles.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 max-h-[660px]">
            {loading && !data ? (
              <div className="flex items-center justify-center p-8 text-xs text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading directory tree...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <FileCode2 className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="font-medium text-foreground">No generated files yet</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Files and deliverables generated by agents will appear here in real time.
                </p>
              </div>
            ) : (
              renderTree(treeRoot)
            )}
          </div>
        </div>

        {/* ── Center Column: Code & Diff Viewer (6 cols on lg) ── */}
        <div className="lg:col-span-6 rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-xs">
          {selectedFilePath && fileDetails ? (
            <>
              {/* File Viewer Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 px-4 py-2.5 bg-muted/20">
                <div className="flex items-center gap-2 min-w-0">
                  {getFileIcon(fileDetails.name)}
                  <span className="font-mono text-xs font-semibold text-foreground truncate" title={fileDetails.path}>
                    {fileDetails.path}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    ({formatBytes(fileDetails.size)})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Code vs Diff Switcher */}
                  {fileDetails.diff && (
                    <div className="flex rounded-md border border-border p-0.5 bg-background">
                      <button
                        type="button"
                        onClick={() => setViewMode("code")}
                        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                          viewMode === "code" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Source Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("diff")}
                        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                          viewMode === "diff" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <GitCommit className="h-3 w-3 text-amber-500" /> Diff
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Copy Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={copyContent}
                    title="Copy full file content"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </Button>

                  {/* Single Download */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={downloadSingleFile}
                    title="Download this file"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* File Content Body */}
              <div className="flex-1 overflow-auto bg-background p-4 font-mono text-xs leading-relaxed max-h-[620px]">
                {fileLoading ? (
                  <div className="flex items-center justify-center p-12 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading file content...
                  </div>
                ) : fileError ? (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400">
                    Failed to load file: {fileError}
                  </div>
                ) : viewMode === "diff" && fileDetails.diff ? (
                  <pre className="text-xs font-mono whitespace-pre-wrap select-text">
                    {fileDetails.diff.split("\n").map((line, i) => {
                      const isAdd = line.startsWith("+");
                      const isDel = line.startsWith("-");
                      const isHdr = line.startsWith("@");
                      return (
                        <div
                          key={i}
                          className={`${
                            isAdd
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                              : isDel
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 font-medium"
                              : isHdr
                              ? "text-blue-500 font-bold"
                              : "text-foreground/80"
                          }`}
                        >
                          {line || " "}
                        </div>
                      );
                    })}
                  </pre>
                ) : (
                  <div className="relative">
                    <pre className="whitespace-pre overflow-x-auto text-xs font-mono text-foreground select-text">
                      {fileDetails.content.split("\n").map((line, idx) => (
                        <div key={idx} className="table-row hover:bg-muted/40">
                          <span className="table-cell pr-4 text-right select-none text-[10px] text-muted-foreground/50 w-8">
                            {idx + 1}
                          </span>
                          <span className="table-cell">{line || " "}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <FileCode2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-foreground">Select a file to inspect</p>
              <p className="mt-1 text-xs text-muted-foreground/70 max-w-sm">
                Preview source code, compare changes, and review agent authorship metadata.
              </p>
            </div>
          )}
        </div>

        {/* ── Right Column: Artifact & File Metadata Panel (2.5 cols on lg) ── */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-xs">
          <div className="border-b border-border/80 px-4 py-2.5 bg-muted/30 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" />
              File & Artifact Metadata
            </span>
          </div>

          {selectedFileEntry ? (
            <div className="p-4 space-y-4 text-xs overflow-y-auto max-h-[660px]">
              {/* File Identity */}
              <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">File Name</span>
                  <p className="font-mono font-bold text-foreground break-all">{selectedFileEntry.name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Path</span>
                  <p className="font-mono text-[11px] text-muted-foreground break-all">{selectedFileEntry.path}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      selectedFileEntry.status === "new"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : selectedFileEntry.status === "modified"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedFileEntry.status === "new" ? "New File" : selectedFileEntry.status === "modified" ? "Modified" : "Unchanged"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{getFileCategory(selectedFileEntry.path)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-mono tabular-nums">{formatBytes(selectedFileEntry.size)}</span>
                </div>
              </div>

              {/* Agent Authorship */}
              <div className="rounded-lg border border-border p-3 space-y-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Agent Authorship
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedFileEntry.agent}</p>
                    <span className="text-[10px] text-muted-foreground">AI Role Author</span>
                  </div>
                </div>
              </div>

              {/* Workflow Stage & Task Attribution */}
              <div className="rounded-lg border border-border p-3 space-y-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Workflow Attribution
                </span>
                <div>
                  <span className="text-[10px] text-muted-foreground">Related Stage:</span>
                  <p className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    {(relatedNode?.data as any)?.title ?? `${selectedFileEntry.agent} Stage`}
                  </p>
                </div>
                {onNavigateTab && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-[11px] gap-1"
                    onClick={() => onNavigateTab("live-monitor")}
                  >
                    <ExternalLink className="h-3 w-3" /> Jump to Workflow Node
                  </Button>
                )}
                {relatedTask && (
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground">Related Task:</span>
                    <p className="font-medium text-foreground flex items-center gap-1.5 mt-0.5 truncate">
                      <ListTodo className="h-3.5 w-3.5 text-blue-500" />
                      {relatedTask.title}
                    </p>
                  </div>
                )}
              </div>

              {/* Change Summary */}
              {diffStats && (
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Change Summary
                  </span>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400">+{diffStats.additions} lines</span>
                    <span className="text-red-600 dark:text-red-400">-{diffStats.deletions} lines</span>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="rounded-lg border border-border p-3 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Last Modified:
                  </span>
                  <span className="font-mono">
                    {new Date(selectedFileEntry.modified_at * 1000).toLocaleString("en-US")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Info className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs">Select a file to inspect metadata and agent authorship.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
