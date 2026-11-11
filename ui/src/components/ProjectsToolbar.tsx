import { ArrowUpDown, Check, LayoutGrid, List, Plus, Sparkles } from "lucide-react";
import { ToolbarSearch } from "./ToolbarSearch";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export type ProjectSortField = "name" | "updated" | "created" | "targetDate";
export type ProjectSortDir = "asc" | "desc";

const PROJECT_SORT_OPTIONS: Array<{ field: ProjectSortField; label: string }> = [
  { field: "name", label: "Name" },
  { field: "updated", label: "Updated" },
  { field: "created", label: "Created" },
  { field: "targetDate", label: "Target date" },
];

/** Canonical project search, sorting and creation controls. State stays with the page. */
export function ProjectsToolbar({ query, onQueryChange, sortField, sortDir, onSortChange, onNewProject: openNewProject,
  onStartWithAi, statusFilter = "active", onStatusFilterChange, viewMode = "list", onViewModeChange }: {
  query: string;
  onQueryChange: (value: string) => void;
  sortField: ProjectSortField;
  sortDir: ProjectSortDir;
  onSortChange: (field: ProjectSortField, direction: ProjectSortDir) => void;
  onNewProject: () => void;
  onStartWithAi?: () => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  viewMode?: "list" | "cards";
  onViewModeChange?: (value: "list" | "cards") => void;
}) {
  const sortLabel = PROJECT_SORT_OPTIONS.find(option => option.field === sortField)?.label ?? "Name";
  return <div data-canonical-toolbar="projects" role="toolbar" aria-label="Projects controls" className="flex flex-wrap items-center gap-4">
    <ToolbarSearch query={query} onQueryChange={onQueryChange} label="Search projects" placeholder="Search projects…" />
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" title="Sort">
          <ArrowUpDown className="h-3.5 w-3.5 sm:h-3 sm:w-3 sm:mr-1" />
          <span>Sort: {sortLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44 p-0">
        <div className="p-2 space-y-0.5">
          {PROJECT_SORT_OPTIONS.map((option) => (
            <button
              key={option.field}
              type="button"
              className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm ${
                sortField === option.field
                  ? "bg-accent/50 text-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
              onClick={() => {
                onSortChange(option.field, sortField === option.field
                  ? (sortDir === "asc" ? "desc" : "asc")
                  : (option.field === "name" || option.field === "targetDate" ? "asc" : "desc"));
              }}
            >
              <span>{option.label}</span>
              {sortField === option.field ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Check className="h-3 w-3" />
                  {sortDir === "asc" ? "Asc" : "Desc"}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
    {onStatusFilterChange ? <select aria-label="Filter projects by status" className="h-8 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
      <option value="active">Active</option>
      <option value="backlog">Draft / Intake</option>
      <option value="planned">Planned</option>
      <option value="in_progress">In progress</option>
      <option value="completed">Completed</option>
      <option value="archived">Archived</option>
      <option value="all">All projects</option>
    </select> : null}
    {onViewModeChange ? <div className="flex items-center rounded-md border border-input p-0.5" aria-label="Project view">
      <Button type="button" variant={viewMode === "list" ? "secondary" : "ghost"} size="icon-sm" aria-label="List view" onClick={() => onViewModeChange("list")}><List aria-hidden /></Button>
      <Button type="button" variant={viewMode === "cards" ? "secondary" : "ghost"} size="icon-sm" aria-label="Card view" onClick={() => onViewModeChange("cards")}><LayoutGrid aria-hidden /></Button>
    </div> : null}
    <div className="design-toolbar-actions">
      {onStartWithAi ? <Button size="sm" data-toolbar-primary onClick={onStartWithAi}><Sparkles className="h-4 w-4 mr-1" />Bắt đầu với AI</Button> : null}
      <Button size="sm" variant="outline" onClick={openNewProject}>
          <Plus className="h-4 w-4 mr-1" />
          Create project
      </Button>
    </div>
  </div>;
}
