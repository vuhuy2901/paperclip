from apps.orchestration.graph import route_after_evidence, workflow_graph

def test_langgraph_has_guarded_repair_limit():
    assert route_after_evidence({"evidence_status":"fail", "repair_count":0}) == "repair"
    assert route_after_evidence({"evidence_status":"fail", "repair_count":3}) == "blocked"
    assert route_after_evidence({"evidence_status":"pass", "repair_count":3}) == "deploy"

def test_langgraph_runs_happy_path():
    result = workflow_graph.invoke({"run_id":"r1", "change_text":"VIP", "evidence_status":"pass", "repair_count":0})
    assert result["stage"] == "deploy"
