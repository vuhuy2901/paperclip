// Recovered from 953d6d5d4b921c5cca4bfa9db23a84436c5bfe90; the same list exists in 8666133.
import React, { useEffect, useState } from 'react';
import { Plus, Search, X, LayoutGrid, List, Workflow, MoreHorizontal, Braces, Copy, Trash2, Clock3, ChevronRight } from 'lucide-react';
export type WorkflowIndexEntry = { id: string; name: string; description: string; status: string; version: number; updatedAt: string };
function formatRelativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60000));
  return minutes < 1 ? 'just now' : minutes < 60 ? minutes + 'm ago' : minutes < 1440 ? Math.floor(minutes / 60) + 'h ago' : Math.floor(minutes / 1440) + 'd ago';
}
export function WorkflowListPage({
  workflows,
  busy,
  createWorkflow,
  openWorkflow,
  duplicateWorkflow,
  renameWorkflow,
  deleteWorkflow
}: {
  workflows: WorkflowIndexEntry[];
  busy: boolean;
  createWorkflow: (name?: string) => Promise<void> | void;
  openWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => void;
  renameWorkflow: (workflow: WorkflowIndexEntry, name: string) => void;
  deleteWorkflow: (workflow: WorkflowIndexEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("New Workflow");
  const [renameTarget, setRenameTarget] = useState<WorkflowIndexEntry | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setArchiveTarget] = useState<WorkflowIndexEntry | null>(null);

  useEffect(() => {
    if (!actionMenuId) return;
    const closeMenu = () => setActionMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [actionMenuId]);

  const publishedCount = workflows.filter((w) => w.status === "published").length;
  const draftCount = workflows.filter((w) => w.status !== "published").length;

  const visible = workflows
    .filter((workflow) => {
      if (status === "published" && workflow.status !== "published") return false;
      if (status === "draft" && workflow.status === "published") return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const combined = `${workflow.name} ${workflow.description || ""}`.toLowerCase();
        if (!combined.includes(q)) return false;
      }
      return true;
    })
    .sort((left, right) => (right.updatedAt || "").localeCompare(left.updatedAt || ""));

  const beginRename = (workflow: WorkflowIndexEntry) => {
    setRenameTarget(workflow);
    setRenameValue(workflow.name);
  };

  return (
    <div className="wfs-list-page">
      <header className="wfs-list-header">
        <div>
          <div className="wfs-list-eyebrow">Workflows</div>
          <h1>Workflows</h1>
          <p>Design and manage automated workflows.</p>
        </div>
        <div className="wfs-list-header-actions">
          <button
            className="wfs-button wfs-button-primary"
            disabled={busy}
            onClick={() => {
              setNewWorkflowName("New Workflow");
              setCreateModalOpen(true);
            }}
          >
            <Plus size={14} /> Create Workflow
          </button>
        </div>
      </header>

      <div className="wfs-list-controls">
        <div className="wfs-pill-group" role="tablist" aria-label="Filter workflows by status">
          <button
            className="wfs-pill-btn"
            aria-selected={status === "all"}
            onClick={() => setStatus("all")}
          >
            All Workflows <span className="wfs-pill-count">{workflows.length}</span>
          </button>
          <button
            className="wfs-pill-btn"
            aria-selected={status === "published"}
            onClick={() => setStatus("published")}
          >
            Published <span className="wfs-pill-count">{publishedCount}</span>
          </button>
          <button
            className="wfs-pill-btn"
            aria-selected={status === "draft"}
            onClick={() => setStatus("draft")}
          >
            Drafts <span className="wfs-pill-count">{draftCount}</span>
          </button>
        </div>

        <div className="wfs-controls-right">
          <div className="wfs-search-box">
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search workflows..."
              aria-label="Search workflows"
            />
            {query && (
              <button
                className="wfs-search-clear"
                onClick={() => setQuery("")}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="wfs-view-toggle" role="group" aria-label="View layout toggle">
            <button
              className="wfs-view-btn"
              aria-selected={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className="wfs-view-btn"
              aria-selected={viewMode === "list"}
              onClick={() => setViewMode("list")}
              title="Compact list view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="wfs-empty-state">
          <div className="wfs-empty-state-icon">
            <Workflow size={24} />
          </div>
          <h3>{workflows.length > 0 ? "No workflows match your search" : "No workflows yet"}</h3>
          <p>
            {workflows.length > 0
              ? "Try adjusting your search query or status filter to find what you're looking for."
              : "Create your first workflow to orchestrate AI agents and delivery steps."}
          </p>
          {workflows.length > 0 ? (
            <button
              className="wfs-button"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          ) : (
            <button
              className="wfs-button wfs-button-primary"
              onClick={() => {
                setNewWorkflowName("New Workflow");
                setCreateModalOpen(true);
              }}
            >
              <Plus size={14} /> Create Workflow
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="wfs-cards-grid">
          {visible.map((workflow) => (
            <div key={workflow.id} className="wfs-card">
              <div className="wfs-card-head">
                <div className="wfs-card-top-row">
                  <div className="wfs-card-icon">
                    <Workflow size={18} />
                  </div>
                  <div className="wfs-card-badges">
                    <span className={`wfs-badge ${workflow.status === "published" ? "wfs-badge-published" : "wfs-badge-draft"}`}>
                      {workflow.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className="wfs-badge-version">v{workflow.version}</span>
                  </div>
                  <div className="wfs-card-menu-anchor" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="wfs-icon-btn"
                      onClick={() => setActionMenuId(actionMenuId === workflow.id ? null : workflow.id)}
                      title={`Actions for ${workflow.name}`}
                      aria-label={`Actions for ${workflow.name}`}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    {actionMenuId === workflow.id && (
                      <div className="wfs-popover wfs-card-popover">
                        <button onClick={() => { setActionMenuId(null); beginRename(workflow); }}>
                          <Braces size={13} /> Rename
                        </button>
                        <button onClick={() => { setActionMenuId(null); duplicateWorkflow(workflow.id); }}>
                          <Copy size={13} /> Duplicate
                        </button>
                        <div className="wfs-menu-separator" />
                        <button className="danger" onClick={() => { setActionMenuId(null); setArchiveTarget(workflow); }}>
                          <Trash2 size={13} /> Archive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3
                  className="wfs-card-title"
                  onClick={() => openWorkflow(workflow.id)}
                  title={`Open ${workflow.name} in designer`}
                >
                  {workflow.name}
                </h3>
                <p className="wfs-card-desc">
                  {workflow.description || "No description provided."}
                </p>
              </div>

              <div className="wfs-card-foot">
                <div className="wfs-card-updated" title={new Date(workflow.updatedAt).toLocaleString()}>
                  <Clock3 size={12} />
                  <span>Updated {formatRelativeTime(workflow.updatedAt)}</span>
                </div>
                <button
                  className="wfs-button wfs-open-btn"
                  onClick={() => openWorkflow(workflow.id)}
                >
                  <span>Open Designer</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="wfs-compact-table" role="table" aria-label="Workflows">
          <div className="wfs-compact-head" role="row">
            <span>Workflow</span>
            <span>Status</span>
            <span>Version</span>
            <span>Last Updated</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {visible.map((workflow) => (
            <div key={workflow.id} className="wfs-compact-row" role="row">
              <button
                className="wfs-compact-main"
                onClick={() => openWorkflow(workflow.id)}
                title={`Open ${workflow.name} in designer`}
              >
                <span className="wfs-compact-mark">
                  <Workflow size={15} />
                </span>
                <div className="wfs-compact-text">
                  <strong>{workflow.name}</strong>
                  <small>{workflow.description || "No description provided."}</small>
                </div>
              </button>
              <div>
                <span className={`wfs-badge ${workflow.status === "published" ? "wfs-badge-published" : "wfs-badge-draft"}`}>
                  {workflow.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <div>
                <span className="wfs-badge-version">v{workflow.version}</span>
              </div>
              <div>
                <time dateTime={workflow.updatedAt} className="wfs-compact-time">
                  {new Date(workflow.updatedAt).toLocaleString()}
                </time>
              </div>
              <div className="wfs-compact-actions">
                <button className="wfs-button" onClick={() => openWorkflow(workflow.id)}>
                  Open Designer
                </button>
                <div className="wfs-card-menu-anchor" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="wfs-icon-btn"
                    onClick={() => setActionMenuId(actionMenuId === workflow.id ? null : workflow.id)}
                    title={`Actions for ${workflow.name}`}
                    aria-label={`Actions for ${workflow.name}`}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {actionMenuId === workflow.id && (
                    <div className="wfs-popover wfs-card-popover">
                      <button onClick={() => { setActionMenuId(null); beginRename(workflow); }}>
                        <Braces size={13} /> Rename
                      </button>
                      <button onClick={() => { setActionMenuId(null); duplicateWorkflow(workflow.id); }}>
                        <Copy size={13} /> Duplicate
                      </button>
                      <div className="wfs-menu-separator" />
                      <button className="danger" onClick={() => { setActionMenuId(null); setArchiveTarget(workflow); }}>
                        <Trash2 size={13} /> Archive
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {createModalOpen && (
        <div className="wfs-modal-backdrop" role="presentation">
          <div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="create-workflow-title">
            <div className="wfs-modal-head">
              <h3 id="create-workflow-title">Create Workflow</h3>
              <p>Set up a new workflow template to design and automate delivery pipelines.</p>
            </div>
            <div className="wfs-modal-body">
              <label className="wfs-field">
                <span>Workflow Name</span>
                <input
                  autoFocus
                  maxLength={120}
                  value={newWorkflowName}
                  onChange={(event) => setNewWorkflowName(event.target.value)}
                  placeholder="e.g., Code Review & QA Pipeline"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && newWorkflowName.trim()) {
                      const name = newWorkflowName.trim();
                      setCreateModalOpen(false);
                      void createWorkflow(name);
                    }
                  }}
                />
              </label>
            </div>
            <div className="wfs-modal-actions">
              <button className="wfs-button" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </button>
              <button
                className="wfs-button wfs-button-primary"
                disabled={busy || !newWorkflowName.trim()}
                onClick={() => {
                  const name = newWorkflowName.trim();
                  setCreateModalOpen(false);
                  void createWorkflow(name);
                }}
              >
                <Plus size={14} /> Create & Open Designer
              </button>
            </div>
          </div>
        </div>
      )}

      {renameTarget && (
        <div className="wfs-modal-backdrop" role="presentation">
          <div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="rename-workflow-title">
            <div className="wfs-modal-head">
              <h3 id="rename-workflow-title">Rename workflow</h3>
              <p>Nodes, edges, project bindings, and Paperclip dependencies stay unchanged.</p>
            </div>
            <div className="wfs-modal-body">
              <label className="wfs-field">
                <span>Name</span>
                <input
                  autoFocus
                  maxLength={120}
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && renameValue.trim()) {
                      renameWorkflow(renameTarget, renameValue.trim());
                      setRenameTarget(null);
                    }
                  }}
                />
              </label>
            </div>
            <div className="wfs-modal-actions">
              <button className="wfs-button" onClick={() => setRenameTarget(null)}>
                Cancel
              </button>
              <button
                className="wfs-button wfs-button-primary"
                disabled={busy || !renameValue.trim()}
                onClick={() => {
                  renameWorkflow(renameTarget, renameValue.trim());
                  setRenameTarget(null);
                }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="wfs-modal-backdrop" role="presentation">
          <div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-workflow-title">
            <div className="wfs-modal-head">
              <h3 id="delete-workflow-title">Archive this workflow?</h3>
              <p>“{deleteTarget.name}” will be hidden from the active list. The workflow and its history will be retained.</p>
            </div>
            <div className="wfs-modal-actions">
              <button className="wfs-button" onClick={() => setArchiveTarget(null)}>
                Cancel
              </button>
              <button
                className="wfs-button wfs-button-danger"
                disabled={busy}
                onClick={() => {
                  deleteWorkflow(deleteTarget);
                  setArchiveTarget(null);
                }}
              >
                <Trash2 size={14} /> Archive workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

