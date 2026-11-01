# §18 completion audit

Audit date: 2026-11-01. Evidence is based on the current repository, Docker runtime and recorded run IDs; fixture output is never counted as model execution.

| Requirement | Evidence | Result |
|---|---|---|
| README/config run | `docker compose up -d --build`, all services healthy; `README.md`, `.env.example` | Pass |
| Paperclip + eight roles + links | Paperclip `http://localhost:3100`, adapter `ai_company_external`, eight persisted identities; adapter execution returns Core run/events/artifact/evidence/preview/diff links | Partial: native Paperclip task/report back-sync still needs board/agent API credential |
| Eight role assets/artifacts | `apps/roles/<role>/` contains prompt, skills, tool policy, output schema; 32 artifacts in acceptance run | Pass, with deterministic artifacts labelled fixture |
| Real-model end-to-end change | Run `10380f59-5832-40db-9450-cd93e6112bd1`, Codex Gateway Backend execution, candidate preview, approval and promotion | Pass for one real model role |
| Real failure routed/fixed | `scripts/demo_repair.py` real pytest fail in isolated worktree, `Finding` route to Backend, second real pytest pass; worker repair routing is implemented | Pass for labelled repair fixture; model-caused product failure not claimed |
| Wrong SHA/evidence gate | `tests/test_verification.py`, candidate SHA binding in worker and trusted runner | Pass |
| Merge conflict routing | Worker integration boundary records `Finding(source=integration)`, emits `merge_conflict.routed`, re-queues the owning task and consumes the bounded repair budget | Pass for bounded routing; automatic conflict resolution is not claimed |
| Repair/retry/restart/cancel | Repair demo, transient retry run `455894ab-31f0-4239-861a-ebcb60ed104b`, restart run `6ca8e179-312a-4f7b-8038-574a22548cfc`, active cancellation run `d28975e5-7215-4aae-b526-9a8008b217e3` | Pass |
| Independent baseline/candidate + PO decision | Run `10380...`: baseline `c66c44...`, candidate `0b31cd...`, separate preview/DB, approval and promotion; request-changes revision tested on run `d19cfc...`. Runtime proof after the two-preview change: run `4da698b6-0d7c-402a-90e3-2c306d7bfaf5` returned baseline `http://localhost:18121` and candidate `http://localhost:18725`, both healthy and backed by separate Compose projects/volumes. | Pass |
| VIP → shipping → cancellation regression | `tests/test_storefront.py`, trusted `product-regression`, eval report | Pass |
| Actual evaluation report/limits | `python evals/run_eval.py` → `data/evals/latest.json`, 5/5 fixed checks for A/B/C with raw output/duration | Pass; no fabricated token/cost comparison |
| License/provenance | `docs/reuse-manifest.md` and `docs/limitations.md` | Pass for sources used/rejected; unresolved shortlist licenses remain marked |
| No hidden fixture/placeholder claim | deterministic mode metadata, event mode labels, docs limitations and completion audit | Pass |

The system is operational and testable, but this audit intentionally does not mark the entire specification complete while native Paperclip back-sync and eight-role real-model execution remain unverified.
