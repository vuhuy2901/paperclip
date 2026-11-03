export type WorkflowSortBlocker = { id: string };

export type WorkflowSortIssue = {
  originId?: string | null;
  title?: string | null;
  issueNumber?: number | null;
  id: string;
  createdAt: Date | string;
  blockedBy?: WorkflowSortBlocker[] | null;
};

// Orders siblings so that blocker chains stay contiguous (predecessor emitted
// immediately before its successor) when the graph is linear enough to allow
// it. Branches, merges, and cross-parent blockers stop the chain walk and send
// control back to the ready queue, where creation order (then id) breaks ties.
//
// Blockers whose id is absent from the input are treated as absent for
// ordering — the row chip can still surface them visually later.
//
// If the input contains a cycle (API rejects this, so it shouldn't happen in
// practice), the util degrades to a pure tie-break sort instead of hanging.

export function getWorkflowStageRank(issue: {
  originId?: string | null;
  title?: string | null;
  identifier?: string | null;
  issueNumber?: number | null;
}): number {
  const origin = (issue.originId || '').toLowerCase();
  if (origin.includes('node:pm') || origin.includes('coordinator')) return 1;
  if (origin.includes('node:architect')) return 2;
  if (origin.includes('node:uiux')) return 3;
  if (origin.includes('node:backend')) return 4;
  if (origin.includes('node:frontend')) return 5;
  if (origin.includes('node:review')) return 6;
  if (origin.includes('node:test')) return 7;
  if (origin.includes('node:deploy')) return 8;
  if (origin.includes('node:approval')) return 9;

  const title = (issue.title || '').toLowerCase();
  if (title.includes('analyze') || title.includes('planning') || title.includes('plan') || title.includes('phân tích')) return 1;
  if (title.includes('interface') || title.includes('giao diện') || title.includes('ui') || title.includes('ux')) return 3;
  if (title.includes('architect') || title.includes('kiến trúc')) return 2;
  if (title.includes('api') || title.includes('backend') || title.includes('database')) return 4;
  if (title.includes('implement frontend') || title.includes('frontend')) return 5;
  if (title.includes('review code') || title.includes('code review') || title.includes('review')) return 6;
  if (title.includes('test application') || title.includes('regression') || title.includes('tester') || title.includes('qa') || title.includes('kiểm thử')) return 7;
  if (title.includes('deploy') || title.includes('triển khai') || title.includes('devops')) return 8;
  if (title.includes('final approval') || title.includes('approval') || title.includes('nghiệm thu')) return 9;

  return 99;
}

export function sortWorkflowIssues<T extends WorkflowSortIssue & {
  originId?: string | null;
  title?: string | null;
  issueNumber?: number | null;
}>(issues: T[]): T[] {
  if (issues.length <= 1) return [...issues];

  const sorted = [...issues];
  sorted.sort((a, b) => {
    const rankA = getWorkflowStageRank(a);
    const rankB = getWorkflowStageRank(b);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    const numA = typeof a.issueNumber === 'number' ? a.issueNumber : 0;
    const numB = typeof b.issueNumber === 'number' ? b.issueNumber : 0;
    if (numA !== 0 && numB !== 0 && numA !== numB) {
      return numA - numB;
    }
    const ta = toTimestamp(a.createdAt);
    const tb = toTimestamp(b.createdAt);
    if (ta !== tb) return ta - tb;
    return a.id.localeCompare(b.id);
  });
  return sorted;
}

export function workflowSort<T extends WorkflowSortIssue>(issues: T[]): T[] {
  if (issues.length <= 1) return [...issues];

  const tieBreakAsc = (a: T, b: T): number => {
    const ta = toTimestamp(a.createdAt);
    const tb = toTimestamp(b.createdAt);
    if (ta !== tb) return ta - tb;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  };

  const byId = new Map<string, T>();
  for (const issue of issues) byId.set(issue.id, issue);

  const successors = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  for (const issue of issues) {
    successors.set(issue.id, []);
    inDegree.set(issue.id, 0);
  }
  for (const issue of issues) {
    const seenBlockers = new Set<string>();
    for (const blocker of issue.blockedBy ?? []) {
      if (!blocker || !byId.has(blocker.id)) continue;
      if (blocker.id === issue.id) continue;
      if (seenBlockers.has(blocker.id)) continue;
      seenBlockers.add(blocker.id);
      successors.get(blocker.id)!.push(issue.id);
      inDegree.set(issue.id, (inDegree.get(issue.id) ?? 0) + 1);
    }
  }

  for (const ids of successors.values()) {
    ids.sort((a, b) => tieBreakAsc(byId.get(a)!, byId.get(b)!));
  }

  const ready: T[] = [];
  for (const issue of issues) {
    if (inDegree.get(issue.id) === 0) ready.push(issue);
  }
  ready.sort(tieBreakAsc);

  const emitted = new Set<string>();
  const output: T[] = [];

  const insertReady = (issue: T): void => {
    let lo = 0;
    let hi = ready.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (tieBreakAsc(ready[mid], issue) <= 0) lo = mid + 1;
      else hi = mid;
    }
    ready.splice(lo, 0, issue);
  };

  const releaseSuccessors = (id: string): void => {
    for (const succId of successors.get(id) ?? []) {
      if (emitted.has(succId)) continue;
      const remaining = (inDegree.get(succId) ?? 0) - 1;
      inDegree.set(succId, remaining);
      if (remaining === 0) {
        const succ = byId.get(succId);
        if (succ) insertReady(succ);
      }
    }
  };

  while (ready.length > 0) {
    let current = ready.shift()!;
    while (current && !emitted.has(current.id)) {
      output.push(current);
      emitted.add(current.id);
      releaseSuccessors(current.id);

      const succIds = successors.get(current.id) ?? [];
      if (succIds.length !== 1) break;
      const nextId = succIds[0];
      if (emitted.has(nextId)) break;
      if ((inDegree.get(nextId) ?? 0) !== 0) break;
      const nextIndex = ready.findIndex((issue) => issue.id === nextId);
      if (nextIndex < 0) break;
      [current] = ready.splice(nextIndex, 1);
    }
  }

  if (emitted.size < issues.length) {
    return [...issues].sort(tieBreakAsc);
  }

  return output;
}

function toTimestamp(value: Date | string | null | undefined): number {
  if (!value) return 0;
  const ts = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}
