import React, { useState, useRef, useEffect } from "react";
import { usePaperclipOfficeData } from "../data/PaperclipOfficeAdapter";
import { OfficeHeader } from "../components/OfficeHeader";
import { OfficeCanvas } from "../components/OfficeCanvas";
import { AgentDetailsPanel } from "../components/AgentDetailsPanel";
import { LiveActivityFeed } from "../components/LiveActivityFeed";
import { ProjectFilesPanel } from "../components/ProjectFilesPanel";
import { AgentContributionsPanel } from "../components/AgentContributionsPanel";
import { Office2DFallback } from "../components/Office2DFallback";
import { ArrowRight, Bot, CheckCircle2, Sparkles, X } from "lucide-react";

export function OfficeViewPage() {
  const {
    companyName,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    officeAgents,
    recentEvents,
    agentContributions,
    workspaceFiles,
    isWorkspaceFilesLoading,
    selectedAgentId,
    setSelectedAgentId,
    connectionStatus,
    stats,
  } = usePaperclipOfficeData();

  const [activePresetKey, setActivePresetKey] = useState("overview");
  const [followActiveAgent, setFollowActiveAgent] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<"agent" | "files" | "contributions">("agent");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [handoffBanner, setHandoffBanner] = useState<string | null>(null);
  const [use2DFallback, setUse2DFallback] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // When an agent is selected, switch to Agent Details tab automatically
  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setActiveSideTab("agent");
    setIsSidePanelOpen(true);
  };

  // Banner dismiss timer
  useEffect(() => {
    if (handoffBanner) {
      const timer = setTimeout(() => setHandoffBanner(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [handoffBanner]);

  const selectedOfficeAgent = officeAgents.find((a) => a.agentId === selectedAgentId) ?? null;

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-[calc(100vh-3.5rem)] bg-background text-foreground overflow-hidden select-none"
    >
      {/* Top Header */}
      <OfficeHeader
        companyName={companyName}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        stats={stats}
        connectionStatus={connectionStatus}
        activePresetKey={activePresetKey}
        onSelectPreset={setActivePresetKey}
        followActiveAgent={followActiveAgent}
        onToggleFollow={() => setFollowActiveAgent(!followActiveAgent)}
        onResetCamera={() => setActivePresetKey("overview")}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        activeSideTab={activeSideTab}
        onSelectSideTab={(tab) => {
          setActiveSideTab(tab);
          setIsSidePanelOpen(true);
        }}
      />

      {/* Main Workspace (3D Canvas + Right Panel) */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Left / Center 3D Office Scene */}
        <div className="flex-1 relative h-full min-w-0 bg-slate-950">
          {!use2DFallback ? (
            <OfficeCanvas
              officeAgents={officeAgents}
              selectedAgentId={selectedAgentId}
              onSelectAgent={handleSelectAgent}
              followActiveAgent={followActiveAgent}
              activePresetKey={activePresetKey}
              onHandoffBanner={setHandoffBanner}
            />
          ) : (
            <Office2DFallback
              officeAgents={officeAgents}
              selectedAgentId={selectedAgentId}
              onSelectAgent={handleSelectAgent}
            />
          )}

          {/* Floating Live Delegation Handoff Banner */}
          {handoffBanner && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/95 border border-primary/40 text-primary-foreground shadow-2xl backdrop-blur animate-in fade-in slide-in-from-top-4 duration-300">
              <Sparkles className="h-4 w-4 text-primary animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-slate-100">{handoffBanner}</span>
              <button
                type="button"
                onClick={() => setHandoffBanner(null)}
                className="text-slate-400 hover:text-slate-100 ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Toggle between 3D / 2D fallback button */}
          <div className="absolute bottom-4 left-4 z-10">
            <button
              type="button"
              onClick={() => setUse2DFallback(!use2DFallback)}
              className="text-[11px] font-medium px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 backdrop-blur transition-colors"
            >
              {use2DFallback ? "Switch to 3D Scene" : "Switch to 2D Blueprint"}
            </button>
          </div>
        </div>

        {/* Right Context Panel (25%) */}
        {isSidePanelOpen && (
          <aside className="w-80 sm:w-96 border-l border-border/60 bg-card/95 backdrop-blur flex flex-col h-full z-10 shrink-0">
            {activeSideTab === "agent" && (
              <AgentDetailsPanel
                officeAgent={selectedOfficeAgent}
                onFocusCamera={(agentId) => {
                  setSelectedAgentId(agentId);
                }}
                onClose={() => setIsSidePanelOpen(false)}
              />
            )}

            {activeSideTab === "files" && (
              <ProjectFilesPanel
                files={workspaceFiles}
                isLoading={isWorkspaceFilesLoading}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                projects={projects}
              />
            )}

            {activeSideTab === "contributions" && (
              <AgentContributionsPanel
                contributions={agentContributions}
                onFocusAgent={(agentId) => {
                  setSelectedAgentId(agentId);
                  setActiveSideTab("agent");
                }}
              />
            )}
          </aside>
        )}
      </div>

      {/* Bottom Collapsible Live Activity Feed */}
      <LiveActivityFeed
        events={recentEvents}
        onFocusAgent={(agentId) => {
          setSelectedAgentId(agentId);
        }}
      />
    </div>
  );
}
