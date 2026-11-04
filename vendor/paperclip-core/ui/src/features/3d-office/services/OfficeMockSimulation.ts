import type { OfficeSystemEvent, AgentOfficeState } from "../types/OfficeTypes";
import { officeEventBus } from "./OfficeEventBus";
import { useOfficeStore } from "../store/useOfficeStore";

export interface MockAgentProfile {
  id: string;
  name: string;
  role: string;
  room: string;
}

export const MOCK_OFFICE_AGENTS: MockAgentProfile[] = [
  { id: "agent_pm", name: "Marcus Chen", role: "Project Manager", room: "management" },
  { id: "agent_po", name: "Sarah Jenkins", role: "Product Owner", room: "product" },
  { id: "agent_architect", name: "David Kim", role: "Solution Architect", room: "design" },
  { id: "agent_backend", name: "Elena Rostova", role: "Backend Engineer", room: "engineering" },
  { id: "agent_frontend", name: "Kenji Sato", role: "Frontend Engineer", room: "engineering" },
  { id: "agent_reviewer", name: "Liam O'Connor", role: "Code Reviewer", room: "qa" },
  { id: "agent_tester", name: "Priya Patel", role: "QA Tester", room: "qa" },
  { id: "agent_devops", name: "Lucas Vance", role: "DevOps Engineer", room: "devops" },
];

interface SimulationScenario {
  type: OfficeSystemEvent["type"];
  agentId: string;
  taskTitle: string;
  summary: string;
  artifacts?: string[];
  toAgentId?: string;
}

const SCENARIOS: SimulationScenario[] = [
  {
    type: "task_started",
    agentId: "agent_frontend",
    taskTitle: "Implement Interactive 3D Office Simulation",
    summary: "Starting frontend sprint: Three.js agent interactions and pathfinding.",
    artifacts: ["ui/src/features/3d-office/components/OfficeCanvas.tsx"],
  },
  {
    type: "handoff",
    agentId: "agent_po",
    toAgentId: "agent_pm",
    taskTitle: "Q4 Roadmap & AI Company Features Spec",
    summary: "Product Owner walks to Management to hand off verified feature specifications to PM.",
    artifacts: ["docs/specs/q4-roadmap.md"],
  },
  {
    type: "handoff",
    agentId: "agent_pm",
    toAgentId: "agent_architect",
    taskTitle: "Design System Tokens & Prototype Handoff",
    summary: "PM hands product-design and technical requirements to the Solution Architect.",
    artifacts: ["tickets/TASK-720-design"],
  },
  {
    type: "task_started",
    agentId: "agent_architect",
    taskTitle: "Design High-Contrast 3D Billboard Nameplates",
    summary: "Crafting crisp UI badges, translucent backing pills, and color palette in Figma.",
    artifacts: ["figma.com/file/office-3d-tokens"],
  },
  {
    type: "handoff",
    agentId: "agent_architect",
    toAgentId: "agent_frontend",
    taskTitle: "Deliver SVG Icons & Component Tokens",
    summary: "Solution Architect hands implementation-ready UI specifications to Frontend.",
    artifacts: ["packages/ui/assets/nameplates.svg"],
  },
  {
    type: "task_blocked",
    agentId: "agent_tester",
    taskTitle: "Run E2E Regression Suite on Staging",
    summary: "Blocked: Staging DB timeout during multi-agent stress test.",
    artifacts: ["logs/qa-test-failure-timeout.log"],
  },
  {
    type: "comment",
    agentId: "agent_devops",
    taskTitle: "Postgres Connection Pool Tuning",
    summary: "Scaled staging PgBouncer pool limits to 120 connections. Timeout resolved.",
    artifacts: ["infra/postgres/pgbouncer.ini"],
  },
  {
    type: "task_completed",
    agentId: "agent_tester",
    taskTitle: "Run E2E Regression Suite on Staging",
    summary: "All 182 test suites passed successfully with zero failures.",
    artifacts: ["reports/qa-e2e-summary.html"],
  },
  {
    type: "handoff",
    agentId: "agent_backend",
    toAgentId: "agent_reviewer",
    taskTitle: "Review PR #314: Auth Security Upgrade",
    summary: "Backend Engineer walks to QA room to request security inspection from Code Reviewer.",
    artifacts: ["github.com/pull/314"],
  },
  {
    type: "task_completed",
    agentId: "agent_reviewer",
    taskTitle: "Review PR #314: Auth Security Upgrade",
    summary: "Approved PR #314 after security audit. No vulnerabilities detected.",
    artifacts: ["github.com/pull/314#approved"],
  },
  {
    type: "task_completed",
    agentId: "agent_frontend",
    taskTitle: "Implement Interactive 3D Office Simulation",
    summary: "Completed 3D agent pathfinding, live handoffs, and status synchronizations.",
    artifacts: ["ui/dist/assets/index.js"],
  },
];

class OfficeMockSimulation {
  private timer: NodeJS.Timeout | null = null;
  private scenarioIndex = 0;
  private officeAgents: AgentOfficeState[] = [];

  setOfficeAgents(agents: AgentOfficeState[]) {
    this.officeAgents = agents;
  }

  resolveAgentProfile(mockAgentId: string): { id: string; name: string; role: string } {
    if (this.officeAgents && this.officeAgents.length > 0) {
      const roleKey = mockAgentId.replace(/^agent_/, "").toLowerCase();

      for (const oa of this.officeAgents) {
        const a = oa.agent;
        const text = `${a.name} ${a.role} ${a.title} ${oa.assignedDesk?.roomId} ${oa.assignedDesk?.roleHint}`.toLowerCase();

        if (roleKey === "pm" && (a.role === "pm" || text.includes("project manager"))) {
          return { id: a.id, name: a.name, role: a.title ?? "Project Manager" };
        }
        if (roleKey === "po" && (a.role === "general" || text.includes("product") || text.includes("po"))) {
          return { id: a.id, name: a.name, role: a.title ?? "Product Owner" };
        }
        if (roleKey === "frontend" && (text.includes("frontend") || text.includes("front-end"))) {
          return { id: a.id, name: a.name, role: a.title ?? "Frontend Engineer" };
        }
        if (roleKey === "backend" && text.includes("backend")) {
          return { id: a.id, name: a.name, role: a.title ?? "Backend Engineer" };
        }
        if (roleKey === "reviewer" && (text.includes("review") || a.role === "security")) {
          return { id: a.id, name: a.name, role: a.title ?? "Code Reviewer" };
        }
        if (roleKey === "tester" && (a.role === "qa" || text.includes("tester"))) {
          return { id: a.id, name: a.name, role: a.title ?? "QA Tester" };
        }
        if (roleKey === "devops" && (a.role === "devops" || text.includes("devops") || text.includes("infra"))) {
          return { id: a.id, name: a.name, role: a.title ?? "DevOps Engineer" };
        }
        if (roleKey === "architect" && (a.role === "cto" || text.includes("architect"))) {
          return { id: a.id, name: a.name, role: a.title ?? "Solution Architect" };
        }
      }
    }

    const mock = MOCK_OFFICE_AGENTS.find((agent) => agent.id === mockAgentId) ?? MOCK_OFFICE_AGENTS[0]!;
    return { id: mock.id, name: mock.name, role: mock.role };
  }

  start(intervalMs = 5000) {
    if (this.timer) return;
    useOfficeStore.getState().setSimulationRunning(true);

    // Run first step immediately
    this.step();

    this.timer = setInterval(() => {
      this.step();
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    useOfficeStore.getState().setSimulationRunning(false);
  }

  toggle() {
    if (this.timer) {
      this.stop();
    } else {
      this.start();
    }
  }

  isRunning() {
    return this.timer !== null;
  }

  step() {
    const scenario = SCENARIOS[this.scenarioIndex % SCENARIOS.length]!;
    this.scenarioIndex++;

    const sourceAgent = this.resolveAgentProfile(scenario.agentId);
    let targetAgent: { id: string; name: string; role: string } | undefined;
    if (scenario.toAgentId) {
      targetAgent = this.resolveAgentProfile(scenario.toAgentId);
    }

    const event: OfficeSystemEvent = {
      id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: scenario.type,
      agentId: sourceAgent.id,
      agentName: sourceAgent.name,
      role: sourceAgent.role,
      taskId: `task_${Date.now().toString().slice(-4)}`,
      taskTitle: scenario.taskTitle,
      summary: scenario.summary,
      artifacts: scenario.artifacts ?? [],
      toAgentId: targetAgent?.id,
      toAgentName: targetAgent?.name,
    };

    officeEventBus.emit(event);
  }
}

export const officeMockSimulation = new OfficeMockSimulation();
