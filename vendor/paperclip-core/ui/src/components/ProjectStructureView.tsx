import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, FileCode2, FileText, PackageOpen, Search } from "lucide-react";
import { Link } from "@/lib/router";
import { Input } from "@/components/ui/input";
import { artifactsApi } from "../api/artifacts";
import { issuesApi } from "../api/issues";
import { queryKeys } from "../lib/queryKeys";

function relativeTime(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ProjectStructureView({ projectId, companyId }: {
  projectId: string;
  companyId: string;
  projectRef: string;
  initialFilePath?: string | null;
  onNavigateTab?: (tab: string) => void;
}) {
  const [search, setSearch] = useState("");
  const artifactsQuery = useQuery({
    queryKey: ["project-artifacts", companyId, projectId],
    queryFn: () => artifactsApi.list(companyId, { projectId, limit: 200 }),
    refetchInterval: 5000,
  });
  const issuesQuery = useQuery({
    queryKey: queryKeys.issues.listByProject(companyId, projectId),
    queryFn: () => issuesApi.listAll(companyId, { projectId }),
    refetchInterval: 5000,
  });
  const artifacts = artifactsQuery.data?.artifacts ?? [];
  const completedTasks = useMemo(() => (issuesQuery.data ?? []).filter((issue) => issue.status === "done"), [issuesQuery.data]);
  const query = search.trim().toLowerCase();
  const visibleArtifacts = artifacts.filter((artifact) => `${artifact.title} ${artifact.previewText ?? ""} ${artifact.issue.title}`.toLowerCase().includes(query));
  const visibleEvidence = completedTasks.filter((issue) => `${issue.title} ${issue.description ?? ""} ${issue.identifier ?? ""}`.toLowerCase().includes(query));

  return <div className="space-y-5 p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-lg font-semibold"><PackageOpen className="h-5 w-5 text-emerald-600" /> Project outputs</div>
        <p className="mt-1 text-sm text-muted-foreground">Native artifacts and completed-task delivery evidence. Paperclip tasks remain the source of truth.</p>
      </div>
      <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search outputs..." className="pl-9" /></div>
    </div>
    {artifactsQuery.isError ? <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-700">Could not load native artifacts. Retry after checking the Paperclip API.</div> : null}
    {visibleArtifacts.length > 0 ? <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Published artifacts ({visibleArtifacts.length})</h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visibleArtifacts.map((artifact) => <a key={artifact.id} href={artifact.href} className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40">
        <div className="flex items-start justify-between gap-3">{artifact.mediaKind === "text" || artifact.mediaKind === "document" ? <FileText className="h-5 w-5 text-blue-500" /> : <FileCode2 className="h-5 w-5 text-violet-500" />}<ExternalLink className="h-4 w-4 text-muted-foreground" /></div>
        <div className="mt-3 font-medium">{artifact.title}</div><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{artifact.previewText || artifact.issue.title}</p>
        <div className="mt-3 text-xs text-muted-foreground">{artifact.createdByAgent?.name ?? "Paperclip"} · {artifact.issue.identifier} · {relativeTime(artifact.updatedAt)}</div>
      </a>)}</div>
    </section> : null}
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completed-task evidence ({visibleEvidence.length})</h3>
      {visibleEvidence.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center"><PackageOpen className="mx-auto h-8 w-8 text-muted-foreground" /><div className="mt-3 font-medium">No deliverables published yet</div><p className="mt-1 text-sm text-muted-foreground">Agents must complete a native task and attach or publish its output here.</p></div> : <div className="divide-y rounded-xl border bg-card">{visibleEvidence.map((issue) => <Link key={issue.id} to={`/issues/${issue.id}`} className="flex items-start gap-3 p-4 hover:bg-muted/40">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{issue.title}</span><span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700">Done</span></div><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{issue.description || "Completion recorded in the native task."}</p><div className="mt-2 text-xs text-muted-foreground">{issue.identifier ?? issue.id.slice(0, 8)} · updated {relativeTime(String(issue.updatedAt))}</div></div><ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>)}</div>}
    </section>
  </div>;
}
