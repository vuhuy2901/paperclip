import React, { useEffect, useState, useRef, useMemo } from "react";
import type { Project } from "@paperclipai/shared";
import type { AgentOfficeState } from "../types/OfficeTypes";
import {
  Building2,
  Users,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Camera,
  Maximize2,
  Minimize2,
  RotateCcw,
  Radio,
  Filter,
  Play,
  Pause,
  Sparkles,
  ChevronDown,
  Search,
  ArrowRight,
  Bot,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOfficeStore } from "../store/useOfficeStore";
import { officeMockSimulation } from "../services/OfficeMockSimulation";

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
  officeAgents?: AgentOfficeState[];
  onSelectAgent?: (agentId: string) => void;
}

function AnimatedCounter({ value, colorClass }: { value: number; colorClass: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isBumping, setIsBumping] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsBumping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsBumping(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <span
      className={`font-bold transition-all duration-300 inline-block ${colorClass} ${
        isBumping ? "scale-125 -translate-y-0.5" : "scale-100"
      }`}
    >
      {displayValue}
    </span>
  );
}

export function OfficeHeader({
  companyName,
  projects,
  selectedProjectId,
  onSelectProject,
  stats: propStats,
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
  officeAgents = [],
  onSelectAgent,
}: OfficeHeaderProps) {
  const storeStats = useOfficeStore((state) => state.stats);
  const isSimulationRunning = useOfficeStore((state) => state.isSimulationRunning);

  // Exact employee count from actual office agents list
  const totalAgents = officeAgents.length > 0 ? officeAgents.length : propStats.totalAgents;
  const activeWorking = isSimulationRunning
    ? Math.max(propStats.activeAgents, storeStats.workingCount)
    : propStats.activeAgents;
  const completedCount = isSimulationRunning
    ? Math.max(propStats.completedTasks, storeStats.completedCount)
    : propStats.completedTasks;
  const blockedCount = isSimulationRunning
    ? Math.max(propStats.failedAgents, storeStats.blockedCount)
    : propStats.failedAgents;

  // Employee Dropdown Menu / Filter State
  const [isEmployeeMenuOpen, setIsEmployeeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "working" | "idle" | "blocked">("all");
  const employeeMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (employeeMenuRef.current && !employeeMenuRef.current.contains(e.target as Node)) {
        setIsEmployeeMenuOpen(false);
      }
    };
    if (isEmployeeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEmployeeMenuOpen]);

  // Filtered employee list
  const filteredEmployees = useMemo(() => {
    return officeAgents.filter((agent) => {
      // Status filter
      if (statusFilter === "working" && agent.visualStatus !== "running") return false;
      if (statusFilter === "idle" && agent.visualStatus !== "idle" && agent.visualStatus !== "waiting") return false;
      if (statusFilter === "blocked" && agent.visualStatus !== "blocked" && agent.visualStatus !== "error") return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = agent.agent.name.toLowerCase().includes(q);
      const matchRole = (agent.agent.role ?? "").toLowerCase().includes(q);
      const matchRoom = (agent.assignedDesk.label ?? "").toLowerCase().includes(q);
      const matchTask = (agent.activeTask?.title ?? "").toLowerCase().includes(q);
      return matchName || matchRole || matchRoom || matchTask;
    });
  }, [officeAgents, statusFilter, searchQuery]);

  const presets = [
    { key: "overview", label: "Full Office" },
    { key: "management", label: "Management" },
    { key: "product", label: "Product & Planning" },
    { key: "engineering", label: "Engineering" },
    { key: "design", label: "Design Studio" },
    { key: "qa", label: "QA & Testing" },
    { key: "devops", label: "DevOps & Infra" },
  ];

  const handleToggleSimulation = () => {
    if (officeAgents && officeAgents.length > 0) {
      officeMockSimulation.setOfficeAgents(officeAgents);
    }
    officeMockSimulation.toggle();
  };

  const handleSelectEmployee = (agentId: string) => {
    onSelectAgent?.(agentId);
    setIsEmployeeMenuOpen(false);
  };

  return (
    <header className="flex flex-col border-b border-border/60 bg-card/95 backdrop-blur px-4 py-2.5 gap-2.5 z-20 shrink-0">
      {/* Top row: Title, Stats & Status */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
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
                  ? "text-emerald-500 animate-pulse"
                  : connectionStatus === "polling"
                    ? "text-sky-500"
                    : "text-amber-500 animate-spin"
              }`}
            />
            <span className="font-medium text-[11px] text-muted-foreground capitalize">
              {connectionStatus === "live" ? "Live Socket" : connectionStatus === "polling" ? "Synced" : "Connecting"}
            </span>
          </div>
        </div>

        {/* Live Counters with Animated Numbers & Interactive Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulation Toggle Demo Button */}
          <Button
            variant={isSimulationRunning ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSimulation}
            className={`h-8 text-xs font-semibold gap-1.5 transition-all shadow-xs ${
              isSimulationRunning
                ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                : "border-primary/40 text-primary hover:bg-primary/10"
            }`}
            title="Toggle autonomous mock simulation"
          >
            {isSimulationRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Simulation Active</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Simulation Demo</span>
              </>
            )}
          </Button>

          {/* Interactive Employees Button & Dropdown Filter */}
          <div className="relative" ref={employeeMenuRef}>
            <button
              type="button"
              onClick={() => setIsEmployeeMenuOpen(!isEmployeeMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all shadow-xs ${
                isEmployeeMenuOpen
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 hover:bg-muted/80 border-border/50 text-foreground"
              }`}
              title="Click to view employees, filter, and jump directly to any desk in 3D"
            >
              <Users className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                <AnimatedCounter value={totalAgents} colorClass={isEmployeeMenuOpen ? "text-primary-foreground" : "text-foreground"} /> Employees
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isEmployeeMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Employee Dropdown Filter Panel */}
            {isEmployeeMenuOpen && (
              <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card/98 shadow-2xl backdrop-blur-xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header & Search */}
                <div className="p-3 border-b border-border/50 flex flex-col gap-2.5 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      Company Employees ({totalAgents})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEmployeeMenuOpen(false)}
                      className="text-muted-foreground hover:text-foreground p-0.5 rounded-md"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search employee by name, role, task..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-background border border-border/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 text-[11px] font-medium overflow-x-auto pb-0.5">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        statusFilter === "all"
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All ({officeAgents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("working")}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        statusFilter === "working"
                          ? "bg-sky-500 text-white font-semibold"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Working ({officeAgents.filter((a) => a.visualStatus === "running").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("idle")}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        statusFilter === "idle"
                          ? "bg-slate-500 text-white font-semibold"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Idle ({officeAgents.filter((a) => a.visualStatus === "idle" || a.visualStatus === "waiting").length})
                    </button>
                    {blockedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("blocked")}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          statusFilter === "blocked"
                            ? "bg-rose-500 text-white font-semibold"
                            : "bg-muted/60 text-rose-500 hover:text-rose-600"
                        }`}
                      >
                        Blocked ({blockedCount})
                      </button>
                    )}
                  </div>
                </div>

                {/* Employee List */}
                <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-1">
                  {filteredEmployees.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No employees match your filter.
                    </div>
                  ) : (
                    filteredEmployees.map((agent) => {
                      const isWorking = agent.visualStatus === "running";
                      const isBlocked = agent.visualStatus === "blocked" || agent.visualStatus === "error";

                      return (
                        <div
                          key={agent.agentId}
                          onClick={() => handleSelectEmployee(agent.agentId)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/20 cursor-pointer transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Status Dot */}
                            <span
                              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                isWorking
                                  ? "bg-sky-400 ring-4 ring-sky-400/20 animate-pulse"
                                  : isBlocked
                                    ? "bg-rose-500 ring-4 ring-rose-500/20 animate-ping"
                                    : agent.visualStatus === "waiting"
                                      ? "bg-amber-400"
                                      : "bg-slate-400"
                              }`}
                            />

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-foreground truncate group-hover:text-primary">
                                  {agent.agent.name}
                                </span>
                                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
                                  {agent.agent.role ?? "Agent"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                <span>{agent.assignedDesk.label}</span>
                                {agent.activeTask && (
                                  <>
                                    <span>•</span>
                                    <span className="text-sky-500 font-medium truncate">
                                      {agent.activeTask.title}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary pl-2 shrink-0">
                            <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              Jump to desk
                            </span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Working Pill */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter("working");
              setIsEmployeeMenuOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-xs font-medium text-sky-500 cursor-pointer transition-colors"
            title="Filter working agents"
          >
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>
              <AnimatedCounter value={activeWorking} colorClass="text-sky-500" /> Working
            </span>
          </button>

          {/* Completed Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              <AnimatedCounter value={completedCount} colorClass="text-emerald-500" /> Completed
            </span>
          </div>

          {/* Blocked Pill */}
          {blockedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("blocked");
                setIsEmployeeMenuOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium text-rose-500 cursor-pointer transition-colors"
              title="Filter blocked agents"
            >
              <AlertOctagon className="h-3.5 w-3.5 animate-bounce" />
              <span>
                <AnimatedCounter value={blockedCount} colorClass="text-rose-500" /> Blocked
              </span>
            </button>
          )}

          {/* Project filter selector */}
          <div className="flex items-center gap-1.5 ml-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedProjectId ?? ""}
              onChange={(e) => onSelectProject(e.target.value || null)}
              className="text-xs bg-muted/60 border border-border/50 rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
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
        {/* Room Presets */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
            <Camera className="h-3.5 w-3.5 text-primary" /> Rooms:
          </span>
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelectPreset(p.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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
          <div className="flex items-center rounded-lg border border-border/50 p-0.5 bg-muted/40 mr-2">
            <button
              type="button"
              onClick={() => onSelectSideTab("agent")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeSideTab === "agent" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Agent Details
            </button>
            <button
              type="button"
              onClick={() => onSelectSideTab("files")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeSideTab === "files" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Project Files
            </button>
            <button
              type="button"
              onClick={() => onSelectSideTab("contributions")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
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
            className="h-7 text-xs font-semibold gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
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
