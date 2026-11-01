import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = import.meta.env.VITE_CORE_API_URL ?? "http://localhost:8000";
const TOKEN = import.meta.env.VITE_SERVICE_TOKEN ?? "dev-service-token";
type Run = { run: { id: string; status: string; repair_count: number }; tasks: { id: string; role: string; status: string }[] };
type Approval = { id: string; artifact_version: string; status: string };
type Preview = { baseline: { commit_sha?: string; accepted_commit?: string; url?: string | null; status?: string } | null; candidate: string | null; status: string; deployment?: { image_digest?: string; commit_sha?: string; health_evidence?: { status?: string }; smoke_evidence?: { status?: string } } };
type Artifact = { id: string; relative_path: string; type: string; producer: string; sha256: string };
type Evidence = { id: string; check_id: string; status: string; candidate_sha: string; image_digest?: string; report_ref?: string };
type AgentRun = { id: string; task_id: string; runner: string; model?: string; status: string; failure_category?: string };

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`, { headers: { "x-service-token": TOKEN } });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function App() {
  const [runId, setRunId] = useState("");
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState("");
  const [approval, setApproval] = useState<Approval | null>(null);
  const [decision, setDecision] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const load = async () => { if (!runId) return; try { setError(""); const [nextRun, approvals, nextPreview, nextArtifacts, nextEvidence, nextAgents] = await Promise.all([get<Run>(`/api/runs/${runId}`), get<Approval[]>(`/api/runs/${runId}/approvals`), get<Preview>(`/api/runs/${runId}/preview`), get<Artifact[]>(`/api/runs/${runId}/artifacts`), get<Evidence[]>(`/api/runs/${runId}/evidence`), get<AgentRun[]>(`/api/runs/${runId}/agent-runs`)]); setRun(nextRun); setApproval(approvals.at(-1) ?? null); setPreview(nextPreview); setArtifacts(nextArtifacts); setEvidence(nextEvidence); setAgentRuns(nextAgents); } catch (e) { setError(String(e)); } };
  const decide = async (value: "approve" | "request_changes") => { if (!approval) return; try { const r = await fetch(`${API}/api/approvals/${approval.id}/decision`, { method: "POST", headers: { "content-type": "application/json", "x-service-token": TOKEN }, body: JSON.stringify({ decision: value, artifact_version: approval.artifact_version, reason: value === "approve" ? "PO accepted candidate" : "PO requested changes" }) }); if (!r.ok) throw new Error(await r.text()); setDecision(value); await load(); } catch (e) { setError(String(e)); } };
  const sendFeedback = async () => { if (!feedbackText || !runId) return; try { const r = await fetch(`${API}/api/runs/${runId}/feedback`, { method: "POST", headers: { "content-type": "application/json", "x-service-token": TOKEN }, body: JSON.stringify({ text: feedbackText, version: preview?.deployment?.commit_sha ?? approval?.artifact_version ?? "unknown", route: window.location.pathname }) }); if (!r.ok) throw new Error(await r.text()); setFeedbackText(""); setDecision("feedback saved"); } catch (e) { setError(String(e)); } };
  useEffect(() => { if (runId) void load(); }, [runId]);
  return <main>
    <header><div className="eyebrow">AI SOFTWARE COMPANY</div><h1>Candidate review</h1><p>Inspect the exact run, evidence and preview before accepting a change.</p></header>
    <section className="control"><label>Run ID<input value={runId} onChange={e => setRunId(e.target.value)} placeholder="Paste a run ID" /></label><button onClick={() => void load()}>Load run</button></section>
    {error && <div className="error" role="alert">{error}</div>}
    {!run && !error && <div className="empty"><strong>No run selected</strong><span>Load a run from the Core API to see its actual state.</span></div>}
    {run && <div className="grid">
      <section className="panel hero"><span className="label">Workflow state</span><strong>{run.run.status}</strong><span>Repair rounds used: {run.run.repair_count} / 3</span></section>
      <section className="panel"><span className="label">Assigned work</span>{run.tasks.map(t => <div className="task" key={t.id}><span>{t.role}</span><b>{t.status}</b></div>)}</section>
      <section className="panel"><span className="label">Acceptance</span><p>Decisions are version-bound and recorded against this run.</p><p>Approval: {approval ? `${approval.status} · ${approval.artifact_version}` : "not created yet"}{decision && ` · submitted: ${decision}`}</p><div className="actions"><button className="primary" disabled={!approval} onClick={() => void decide("approve")}>Approve candidate</button><button className="secondary" disabled={!approval} onClick={() => void decide("request_changes")}>Request changes</button></div></section>
      <section className="panel"><span className="label">Baseline / candidate</span><div className="split"><div><b>Baseline</b>{preview?.baseline?.url ? <a href={preview.baseline.url} target="_blank" rel="noreferrer">{preview.baseline.url}</a> : <span>not deployed</span>}<code>{preview?.baseline?.commit_sha ?? "not accepted yet"}</code></div><div><b>Candidate</b><a href={preview?.candidate ?? undefined} target="_blank" rel="noreferrer">{preview?.candidate ?? "not deployed"}</a><code>{preview?.deployment?.image_digest ?? "digest pending"}</code></div></div><p>Candidate health: {preview?.deployment?.health_evidence?.status ?? preview?.status ?? "unknown"} · Smoke: {preview?.deployment?.smoke_evidence?.status ?? "not run"}</p></section>
      <section className="panel"><span className="label">Trusted evidence</span>{evidence.length ? evidence.map(item => <div className="task" key={item.id}><span>{item.check_id} · {item.candidate_sha.slice(0, 8)}</span><b>{item.status}</b></div>) : <p>No evidence recorded.</p>}<span className="label sublabel">Agent runs</span>{agentRuns.map(item => <div className="task" key={item.id}><span>{item.runner}</span><b>{item.status}</b></div>)}</section>
      <section className="panel"><span className="label">Artifact manifest</span><div className="artifact-list">{artifacts.map(item => <code key={item.id}>{item.relative_path} · {item.sha256.slice(0, 12)}</code>)}</div></section>
      <section className="panel"><span className="label">PO feedback</span><textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Describe the screen, route or AC that needs attention" /><button className="secondary" disabled={!feedbackText} onClick={() => void sendFeedback()}>Save feedback</button></section>
    </div>}
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
