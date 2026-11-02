import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  Check,
  Copy,
  Download,
  Filter,
  Search,
  Terminal,
  Trash2,
  Wrench
} from "lucide-react";
import type { WorkflowRunHistoryEntry } from "../types.js";

export function TerminalViewer({
  logs,
  isRunning = false,
  title = "Agent Terminal",
  agentName,
  onClearView
}: {
  logs: WorkflowRunHistoryEntry[];
  isRunning?: boolean;
  title?: string;
  agentName?: string | null;
  onClearView?: () => void;
}) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | "tool" | "error" | "action" | "info">("all");
  const [copied, setCopied] = useState(false);
  const [clearedBeforeIndex, setClearedBeforeIndex] = useState<number>(-1);

  const bodyRef = useRef<HTMLDivElement>(null);

  // Filter logs according to search, level filter, and cleared offset
  const visibleLogs = useMemo(() => {
    return logs.filter((log, index) => {
      if (index <= clearedBeforeIndex) return false;
      if (levelFilter === "tool" && log.level !== "tool") return false;
      if (levelFilter === "error" && log.level !== "error" && log.level !== "warn") return false;
      if (levelFilter === "action" && log.level !== "action") return false;
      if (levelFilter === "info" && log.level !== "info") return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const msg = (log.message || "").toLowerCase();
        const tool = (log.toolName || "").toLowerCase();
        return msg.includes(query) || tool.includes(query);
      }
      return true;
    });
  }, [logs, search, levelFilter, clearedBeforeIndex]);

  // Auto-scroll to bottom when new logs arrive if autoScroll is enabled
  useEffect(() => {
    if (!autoScroll || !bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [visibleLogs.length, autoScroll]);

  // Pause auto-scroll if user manually scrolls up
  const handleScroll = () => {
    if (!bodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 24;
    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    } else if (isAtBottom && !autoScroll) {
      setAutoScroll(true);
    }
  };

  const copyLogs = async () => {
    const text = visibleLogs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.level.toUpperCase()}] ${l.message}`
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback copy
    }
  };

  const downloadLogs = () => {
    const text = visibleLogs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`
      )
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-execution-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setClearedBeforeIndex(logs.length - 1);
    onClearView?.();
  };

  return (
    <div className="wfs-terminal">
      <div className="wfs-terminal-head">
        <div className="wfs-terminal-title">
          <Terminal size={14} color="#58a6ff" />
          <span>{title} {agentName ? `• ${agentName}` : ""}</span>
          <span
            className={`wfs-terminal-pulse ${isRunning ? "" : "paused"}`}
            title={isRunning ? "Live Streaming" : "Execution Idle / Paused"}
          />
        </div>

        <div className="wfs-terminal-actions">
          {/* Live Search */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={11} style={{ position: "absolute", left: 6, color: "#7d8590" }} />
            <input
              className="wfs-terminal-search"
              style={{ paddingLeft: 22 }}
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Level Filter */}
          <select
            className="wfs-terminal-btn"
            style={{ height: 24, padding: "0 4px" }}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            title="Filter by log level"
          >
            <option value="all">All Levels</option>
            <option value="tool">Tools only</option>
            <option value="error">Errors & Warnings</option>
            <option value="action">Actions</option>
            <option value="info">Info only</option>
          </select>

          {/* Auto Scroll Toggle */}
          <button
            className={`wfs-terminal-btn ${autoScroll ? "active" : ""}`}
            onClick={() => setAutoScroll((v) => !v)}
            title={autoScroll ? "Auto-scroll is active" : "Auto-scroll paused (click to resume)"}
          >
            <ArrowDown size={11} />
            {autoScroll ? "Auto-scroll ON" : "PAUSED"}
          </button>

          {/* Copy Button */}
          <button className="wfs-terminal-btn" onClick={copyLogs} title="Copy logs to clipboard">
            {copied ? <Check size={11} color="#3fb950" /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>

          {/* Download Logs */}
          <button className="wfs-terminal-btn" onClick={downloadLogs} title="Download .log file">
            <Download size={11} />
          </button>

          {/* Clear View */}
          <button className="wfs-terminal-btn" onClick={handleClear} title="Clear terminal view (client only)">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <div ref={bodyRef} className="wfs-terminal-body" onScroll={handleScroll}>
        {visibleLogs.length === 0 ? (
          <div className="wfs-terminal-empty">
            {search.trim()
              ? `No log lines matching "${search}"`
              : "Waiting for agent output and tool activity..."}
          </div>
        ) : (
          visibleLogs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            const tagClass = `wfs-tag-${log.level}`;
            const isTool = log.level === "tool";
            const isError = log.level === "error";

            return (
              <div key={log.id} className="wfs-terminal-line">
                <span className="wfs-terminal-time">{timeStr}</span>
                <span className={`wfs-terminal-tag ${tagClass}`}>
                  {log.level.toUpperCase()}
                </span>
                <div
                  className={`wfs-terminal-msg ${isError ? "stderr" : ""} ${
                    isTool ? "tool-result" : ""
                  }`}
                >
                  {isTool && <Wrench size={11} style={{ display: "inline", marginRight: 4 }} />}
                  {log.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
