import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = import.meta.env.VITE_CORE_API_URL ?? "http://localhost:8000";
const TOKEN = import.meta.env.VITE_SERVICE_TOKEN ?? "dev-service-token";
type Run = { run: { id: string; status: string; repair_count: number }; tasks: { id: string; role: string; status: string }[] };
type Approval = { id: string; artifact_version: string; status: string };

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
  const load = async () => { if (!runId) return; try { setError(""); setRun(await get<Run>(`/api/runs/${runId}`)); const approvals = await get<Approval[]>(`/api/runs/${runId}/approvals`); setApproval(approvals.at(-1) ?? null); } catch (e) { setError(String(e)); } };
  const decide = async (value: "approve" | "request_changes") => { if (!approval) return; try { const r = await fetch(`${API}/api/approvals/${approval.id}/decision`, { method: "POST", headers: { "content-type": "application/json", "x-service-token": TOKEN }, body: JSON.stringify({ decision: value, artifact_version: approval.artifact_version, reason: value === "approve" ? "PO accepted candidate" : "PO requested changes" }) }); if (!r.ok) throw new Error(await r.text()); setDecision(value); await load(); } catch (e) { setError(String(e)); } };
  useEffect(() => { if (runId) void load(); }, [runId]);
  return <main>
    <header><div className="eyebrow">AI SOFTWARE COMPANY</div><h1>Candidate review</h1><p>Inspect the exact run, evidence and preview before accepting a change.</p></header>
    <section className="control"><label>Run ID<input value={runId} onChange={e => setRunId(e.target.value)} placeholder="Paste a run ID" /></label><button onClick={() => void load()}>Load run</button></section>
    {error && <div className="error" role="alert">{error}</div>}
    {!run && !error && <div className="empty"><strong>No run selected</strong><span>Load a run from the Core API to see its actual state.</span></div>}
    {run && <div className="grid">
      <section className="panel hero"><span className="label">Workflow state</span><strong>{run.run.status}</strong><span>Repair rounds used: {run.run.repair_count} / 3</span></section>
      <section className="panel"><span className="label">Assigned work</span>{run.tasks.map(t => <div className="task" key={t.id}><span>{t.role}</span><b>{t.status}</b></div>)}</section>
      <section className="panel"><span className="label">Acceptance</span><p>Decisions are version-bound and recorded against this run. Preview and evidence appear here when the deployment manager publishes them.</p><p>Approval: {approval ? `${approval.status} · ${approval.artifact_version}` : "not created yet"}{decision && ` · submitted: ${decision}`}</p><div className="actions"><button className="primary" disabled={!approval} onClick={() => void decide("approve")}>Approve candidate</button><button className="secondary" disabled={!approval} onClick={() => void decide("request_changes")}>Request changes</button></div></section>
    </div>}
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
