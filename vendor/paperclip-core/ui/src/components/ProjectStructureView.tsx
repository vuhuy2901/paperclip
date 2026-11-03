import { useState, useEffect, useMemo, useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export function ProjectStructureView({
  projectId,
  companyId,
  projectRef,
}: {
  projectId: string;
  companyId: string;
  projectRef: string;
}) {
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"code" | "diff">("code");
  const [copied, setCopied] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});
  const [flashFiles, setFlashFiles] = useState<Set<string>>(new Set());
  const prevFilesRef = useRef<Map<string, number>>(new Map());

  // 1. Fetch workspace tree files
  const treeQuery = useQuery({
    queryKey: ["project-workspace-tree-view", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/workspace/tree`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as WorkspaceTreeResponse;
    },
    refetchInterval: 2000,
  });

  const data = treeQuery.data ?? null;
  const loading = treeQuery.isLoading;
  const isError = treeQuery.isError;

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

  // 2. Fetch selected file content
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
    const blob = new Blob([fileDetails.content], { type: fileDetails.mime });
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
        <div key={node.path} className="select-none">
          <button
            type="button"
            onClick={() => toggleDir(node.path)}
            className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs font-medium text-foreground hover:bg-muted/60 transition-colors"
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-amber-500 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {isExpanded && (
            <div className="space-y-0.5">
              {Object.values(node.children).map((child) => renderTree(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const file = node.fileData!;
    const isSelected = selectedFilePath === file.path;
    const isFlashing = flashFiles.has(file.path);

    return (
      <button
        key={file.path}
        type="button"
        onClick={() => setSelectedFilePath(file.path)}
        className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs transition-all ${
          isSelected
            ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
            : "text-foreground hover:bg-muted/50"
        } ${isFlashing ? "bg-amber-400/20 ring-2 ring-amber-400 animate-pulse" : ""}`}
        style={{ paddingLeft: `${depth * 14 + 18}px` }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          {getFileIcon(file.name)}
          <span className="truncate">{node.name}</span>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          {file.is_new && (
            <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Mới
            </span>
          )}
          {file.is_modified && (
            <span className="rounded bg-amber-500/10 px-1 py-0.2 text-[9px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Đã sửa
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
            {formatBytes(file.size)}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Cấu trúc dự án & Mã nguồn</h2>
            {isError ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-3 w-3" /> Mất kết nối, đang thử lại…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-time Sync
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Theo dõi cây thư mục và file code được AI Agent tạo ra hoặc chỉnh sửa theo thời gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative w-44 sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm file…"
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
              <option value="all">Tất cả Agent ({data?.files.length ?? 0})</option>
              {uniqueAgents.map((ag) => (
                <option key={ag} value={ag}>
                  Chỉ file: {ag}
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
            title="Tải toàn bộ mã nguồn của workspace về máy"
          >
            <Download className="h-3.5 w-3.5" /> Tải toàn bộ ZIP
          </Button>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
        {/* Left Column: Explorer Tree (4 cols on lg) */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-border/80 px-3 py-2 bg-muted/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Folder className="h-3.5 w-3.5 text-primary" />
              <span>{data?.root_name ? `${data.root_name}/` : "Workspace Files"}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {filteredFiles.length} file{filteredFiles.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 max-h-[620px]">
            {loading && !data ? (
              <div className="flex items-center justify-center p-8 text-xs text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Đang tải cây thư mục…
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <FileCode2 className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="font-medium">Chưa có file mã nguồn nào</p>
                <p className="mt-1 text-[11px]">
                  Khi AI Agent (Backend, Frontend...) bắt đầu viết code, các file sẽ lập tức xuất hiện tại đây.
                </p>
              </div>
            ) : (
              renderTree(treeRoot)
            )}
          </div>
        </div>

        {/* Right Column: Code & Diff Viewer (8 cols on lg) */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          {selectedFilePath && fileDetails ? (
            <>
              {/* File Viewer Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 px-4 py-2.5 bg-muted/20">
                <div className="flex items-center gap-2 min-w-0">
                  {getFileIcon(fileDetails.name)}
                  <span className="font-mono text-xs font-semibold text-foreground truncate">
                    {fileDetails.path}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    ({formatBytes(fileDetails.size)})
                  </span>
                  {data?.files.find((f) => f.path === fileDetails.path)?.agent && (
                    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      <Bot className="h-2.5 w-2.5" />
                      {data.files.find((f) => f.path === fileDetails.path)!.agent}
                    </span>
                  )}
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
                        Mã nguồn
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
                    title="Sao chép toàn bộ nội dung file"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </Button>

                  {/* Single Download */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={downloadSingleFile}
                    title="Tải file này về máy"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* File Content Body */}
              <div className="flex-1 overflow-auto bg-background p-4 font-mono text-xs leading-relaxed max-h-[580px]">
                {fileLoading ? (
                  <div className="flex items-center justify-center p-12 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Đang tải nội dung file…
                  </div>
                ) : fileError ? (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400">
                    Lỗi đọc file: {fileError}
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
              <p className="text-sm font-medium">Chọn một file bên trái để xem nội dung</p>
              <p className="mt-1 text-xs text-muted-foreground/70 max-w-sm">
                Bạn có thể xem mã nguồn, so sánh bản Diff đã sửa, sao chép code hoặc tải file về máy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
