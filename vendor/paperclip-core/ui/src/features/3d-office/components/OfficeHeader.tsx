import React from "react";
import type { Project } from "@paperclipai/shared";
import {
  Building2,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  Camera,
  Maximize2,
  Minimize2,
  RotateCcw,
  Radio,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OfficeHeaderProps {
  companyName: string;
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  stats: {
    totalAgents: number;
    activeAgents: number;
    runningTasks: number;
    completedTasks: number;
    failedAgents: number;
  };
  connectionStatus: "live" | "polling" | "connecting";
  activePresetKey: string;
  onSelectPreset: (key: string) => void;
  followActiveAgent: boolean;
  onToggleFollow: () => void;
  onResetCamera: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  activeSideTab: "agent" | "files" | "contributions";
  onSelectSideTab: (tab: "agent" | "files" | "contributions") => void;
}

export function OfficeHeader({
  companyName,
  projects,
  selectedProjectId,
  onSelectProject,
  stats,
  connectionStatus,
  activePresetKey,
  onSelectPreset,
  followActiveAgent,
  onToggleFollow,
  onResetCamera,
  isFullscreen,
  onToggleFullscreen,
  activeSideTab,
  onSelectSideTab,
}: OfficeHeaderProps) {
  const presets = [
    { key: "overview", label: "Full Office" },
    { key: "management", label: "Management" },
    { key: "product", label: "Product & Planning" },
    { key: "engineering", label: "Engineering" },
    { key: "design", label: "Design Studio" },
    { key: "qa", label: "QA & Testing" },
    { key: "devops", label: "DevOps & Infra" },
  ];

  return (
    <header className="flex flex-col border-b border-border/60 bg-card/90 backdrop-blur px-4 py-2.5 gap-2.5 z-10 shrink-0">
      {/* Top row: Title, Stats & Status */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground tracking-tight">3D Virtual AI Company Office</h1>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                  Native Paperclip
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{companyName}</p>
            </div>
          </div>

          {/* Connection status pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/40 text-xs">
            <Radio
              className={`h-3 w-3 ${
                connectionStatus === "live"
                  ? "text-green-500 animate-pulse"
                  : connectionStatus === "polling"
                    ? "text-blue-500"
                    : "text-amber-500 animate-spin"
              }`}
            />
            <span className="font-medium text-[11px] text-muted-foreground capitalize">
              {connectionStatus === "live" ? "Live Socket" : connectionStatus === "polling" ? "Synced" : "Connecting"}
            </span>
          </div>
        </div>

        {/* Live KPIs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/50 text-xs font-medium">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{stats.totalAgents} Employees</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-500">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>{stats.activeAgents} Working</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{stats.completedTasks} Completed</span>
          </div>

          {stats.failedAgents > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-500">
              <XCircle className="h-3.5 w-3.5" />
              <span>{stats.failedAgents} Blocked</span>
            </div>
          )}

          {/* Project filter selector */}
          <div className="flex items-center gap-1.5 ml-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedProjectId ?? ""}
              onChange={(e) => onSelectProject(e.target.value || null)}
              className="text-xs bg-muted/60 border border-border/50 rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bottom row: Camera Presets & Mode Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border/40 text-xs">
        {/* Preset buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
            <Camera className="h-3 w-3" /> Rooms:
          </span>
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelectPreset(p.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activePresetKey === p.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* View toggles & side tabs */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-border/50 p-0.5 bg-muted/30 mr-2">
            <button
              type="button"
              onClick={() => onSelectSideTab("agent")}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                activeSideTab === "agent" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Agent Details
            </button>
            <button
              type="button"
              onClick={() => onSelectSideTab("files")}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                activeSideTab === "files" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Project Files
            </button>
            <button
              type="button"
              onClick={() => onSelectSideTab("contributions")}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                activeSideTab === "contributions" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Contributions
            </button>
          </div>

          <Button
            variant={followActiveAgent ? "default" : "outline"}
            size="sm"
            onClick={onToggleFollow}
            className="h-7 text-xs gap-1"
          >
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">Follow Active</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={onResetCamera} className="h-7 text-xs px-2" title="Reset Camera">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            className="h-7 text-xs px-2"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
