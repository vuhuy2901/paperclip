import type { Agent, AgentRole, Issue, HeartbeatRun, LiveRunForIssue, Project } from "@paperclipai/shared";

export type RoomId =
  | "management"
  | "product"
  | "engineering"
  | "design"
  | "qa"
  | "devops"
  | "conference"
  | "reception"
  | "hallway";

export type AgentVisualStatus = "idle" | "running" | "waiting" | "paused" | "error" | "completed" | "reviewing" | "blocked";

export type CharacterAction =
  | "sitting"
  | "typing"
  | "standing"
  | "walking"
  | "handoff_give"
  | "handoff_receive"
  | "reviewing"
  | "testing"
  | "error"
  | "blocked";

export type OfficeSystemEventType =
  | "task_started"
  | "task_completed"
  | "task_blocked"
  | "handoff"
  | "comment";

export interface OfficeSystemEvent {
  id: string;
  timestamp: string; // ISO8601
  type: OfficeSystemEventType;
  agentId: string;
  agentName: string;
  role: string;
  taskId?: string;
  taskTitle?: string;
  summary: string;
  artifacts?: string[];
  toAgentId?: string;
  toAgentName?: string;
}

export interface DeskDefinition {
  id: string;
  roomId: RoomId;
  deskNumber: number;
  label: string;
  roleHint: AgentRole | string;
  position: [number, number, number];
  rotation: number; // yaw angle in radians
  chairPosition: [number, number, number];
  interactPosition: [number, number, number]; // where a visitor stands during handoff
}

export interface RoomDefinition {
  id: RoomId;
  name: string;
  shortName: string;
  departmentKey: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  center: [number, number, number];
  wallColor: string;
  floorColor: string;
  accentColor: string;
  cameraPreset: {
    position: [number, number, number];
    target: [number, number, number];
  };
  doorways: Array<{
    id: string;
    position: [number, number, number];
    connectsTo: RoomId;
  }>;
  desks: DeskDefinition[];
}

export interface AgentOfficeState {
  agentId: string;
  agent: Agent;
  assignedDesk: DeskDefinition;
  visualStatus: AgentVisualStatus;
  currentAction: CharacterAction;
  activeTask: Issue | null;
  activeLiveRun: LiveRunForIssue | null;
  currentPosition: [number, number, number];
  currentRotation: number;
  isMoving: boolean;
  handoffTargetAgentId: string | null;
  lastActiveTimestamp: Date;
  activeChatBubble?: string | null;
  isBlocked?: boolean;
}

export interface HandoffVisualEvent {
  id: string;
  sourceAgentId: string;
  sourceAgentName: string;
  targetAgentId: string;
  targetAgentName: string;
  taskId: string;
  taskTitle: string;
  timestamp: Date;
  phase: "enroute" | "handing_over" | "returning" | "completed";
}

export interface OfficeActivityEvent {
  id: string;
  timestamp: Date;
  type:
    | "task_assigned"
    | "agent_started"
    | "task_in_progress"
    | "task_completed"
    | "task_blocked"
    | "execution_failed"
    | "agent_paused"
    | "heartbeat_tick";
  actorAgentId: string;
  actorAgentName: string;
  targetAgentId?: string;
  targetAgentName?: string;
  taskId?: string;
  taskIdentifier?: string;
  taskTitle?: string;
  status: AgentVisualStatus;
  message: string;
}

export interface CameraPreset {
  name: string;
  key: "overview" | "management" | "engineering" | "product" | "design" | "qa" | "devops" | "conference";
  position: [number, number, number];
  target: [number, number, number];
}

export interface ProjectWorkspaceFile {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: string;
  authorAgentId?: string;
  authorAgentName?: string;
  relatedTaskId?: string;
  children?: ProjectWorkspaceFile[];
}

export interface AgentContributionRecord {
  agentId: string;
  name: string;
  role: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksFailed: number;
  activeTasks: number;
  filesAuthored: number;
  filesModified: number;
  reviewsCompleted: number;
  testsExecuted: number;
  totalDurationSeconds: number;
  lastActivity: Date | null;
}

export interface OfficeToastItem {
  id: string;
  type: OfficeSystemEventType;
  title: string;
  message: string;
  agentName: string;
  role: string;
  timestamp: Date;
  artifacts?: string[];
}

export interface AgentChatBubble {
  agentId: string;
  message: string;
  type: OfficeSystemEventType;
  createdAt: number;
  expiresAt: number;
}
