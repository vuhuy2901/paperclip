from typing import TypedDict
from langgraph.graph import END, START, StateGraph

class WorkflowState(TypedDict, total=False):
    run_id: str
    change_text: str
    stage: str
    repair_count: int
    candidate_sha: str | None
    evidence_status: str
    decision: str | None

def _stage(name: str):
    def node(state: WorkflowState) -> WorkflowState:
        return {"stage": name}
    return node

def route_after_evidence(state: WorkflowState):
    if state.get("evidence_status") == "pass": return "deploy"
    if state.get("repair_count", 0) < 3: return "repair"
    return "blocked"

def route_after_decision(state: WorkflowState):
    return "accepted" if state.get("decision") == "approve" else "repair"

def build_graph():
    graph = StateGraph(WorkflowState)
    for name in ["analyze", "plan", "implement", "integrate", "verify", "deploy", "repair", "blocked", "accepted"]:
        graph.add_node(name, _stage(name))
    graph.add_edge(START, "analyze")
    graph.add_edge("analyze", "plan")
    graph.add_edge("plan", "implement")
    graph.add_edge("implement", "integrate")
    graph.add_edge("integrate", "verify")
    graph.add_conditional_edges("verify", route_after_evidence, {"deploy": "deploy", "repair": "repair", "blocked": "blocked"})
    graph.add_edge("repair", "implement")
    graph.add_edge("deploy", END)
    graph.add_edge("blocked", END)
    graph.add_conditional_edges("accepted", route_after_decision, {"accepted": END, "repair": "repair"})
    return graph.compile()

workflow_graph = build_graph()
