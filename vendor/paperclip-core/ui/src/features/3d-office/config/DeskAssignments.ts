import type { Agent } from "@paperclipai/shared";
import type { DeskDefinition } from "../types/OfficeTypes";
import { ROOM_DEFINITIONS } from "./RoomDefinitions";

/** A terminated lifecycle is authoritative even when the legacy status field is stale. */
export function isActiveOfficeAgent(agent: Agent): boolean {
  const lifecycleState = (agent as Agent & { lifecycleState?: string | null }).lifecycleState;
  return agent.status !== "terminated" && lifecycleState !== "terminated" && lifecycleState !== "rejected";
}

/**
 * Normalizes an agent's role or name into a key for desk matching
 */
function normalizeRole(role: string, name: string): string {
  const combined = `${role} ${name}`.toLowerCase();
  if (combined.includes("project manager") || combined.includes("pm") || combined.includes("lead")) return "project_manager";
  if (combined.includes("product owner") || combined.includes("po") || combined.includes("product")) return "product_owner";
  if (combined.includes("architect") || combined.includes("solution")) return "solution_architect";
  if (combined.includes("backend") || combined.includes("api")) return "backend_engineer";
  if (combined.includes("frontend") || combined.includes("web") || combined.includes("ui dev")) return "frontend_engineer";
  if (combined.includes("review") || combined.includes("auditor")) return "code_reviewer";
  if (combined.includes("qa") || combined.includes("test")) return "qa_tester";
  if (combined.includes("devops") || combined.includes("infra") || combined.includes("sre") || combined.includes("platform")) return "devops_engineer";
  return role.toLowerCase();
}

/**
 * Maps real Paperclip agents to physical desks in the office.
 * If multiple agents match or no specific role matches, assigns to next free workstation.
 */
export function assignAgentsToDesks(agents: Agent[]): Map<string, DeskDefinition> {
  const assignmentMap = new Map<string, DeskDefinition>();
  const allDesks: DeskDefinition[] = [];

  for (const room of ROOM_DEFINITIONS) {
    for (const desk of room.desks) {
      allDesks.push(desk);
    }
  }

  const occupiedDeskIds = new Set<string>();

  // Pass 1: Exact / Best role match
  for (const agent of agents) {
    if (!isActiveOfficeAgent(agent)) continue;
    const normalized = normalizeRole(agent.role ?? "", agent.name ?? "");
    const matchingDesk = allDesks.find(
      (d) => !occupiedDeskIds.has(d.id) && d.roleHint === normalized,
    );

    if (matchingDesk) {
      assignmentMap.set(agent.id, matchingDesk);
      occupiedDeskIds.add(matchingDesk.id);
    }
  }

  // Pass 2: Remaining unassigned agents get placed at any available desk
  const remainingDesks = allDesks.filter((d) => !occupiedDeskIds.has(d.id));
  let deskIdx = 0;

  for (const agent of agents) {
    if (!isActiveOfficeAgent(agent)) continue;
    if (!assignmentMap.has(agent.id)) {
      if (deskIdx < remainingDesks.length) {
        const desk = remainingDesks[deskIdx]!;
        assignmentMap.set(agent.id, desk);
        occupiedDeskIds.add(desk.id);
        deskIdx++;
      } else {
        // Fallback: Share executive desk zone if company has more than standard desks
        const fallbackDesk = allDesks[deskIdx % allDesks.length]!;
        assignmentMap.set(agent.id, {
          ...fallbackDesk,
          id: `${fallbackDesk.id}_alt_${agent.id.slice(0, 4)}`,
          chairPosition: [fallbackDesk.chairPosition[0] + 0.5, fallbackDesk.chairPosition[1], fallbackDesk.chairPosition[2] + 0.5],
        });
        deskIdx++;
      }
    }
  }

  return assignmentMap;
}
