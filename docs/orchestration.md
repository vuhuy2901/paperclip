# LangGraph orchestration

`apps/orchestration/graph.py` is the canonical workflow graph. It models analysis, planning, implementation, integration, verification, repair routing and deploy termination. Evidence status and the three-repair limit control routing; agents do not directly choose deployment.

The SQL event log remains the control-plane audit source. The next hardening step is replacing the development in-memory checkpointer with a PostgreSQL-backed LangGraph checkpointer when the database service is enabled.
