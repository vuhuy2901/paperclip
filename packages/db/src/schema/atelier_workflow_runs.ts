import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { agents } from "./agents.js";
import { companies } from "./companies.js";
import { issues } from "./issues.js";
import { projects } from "./projects.js";
import { workflows } from "./workflows.js";

export const ATELIER_WORKFLOW_RUN_STATUSES = [
  "pending", "running", "done", "needs_input", "blocked", "needs_review", "failed",
] as const;
export type AtelierWorkflowRunStatus = (typeof ATELIER_WORKFLOW_RUN_STATUSES)[number];

export const ATELIER_WORKFLOW_STAGE_STATUSES = [
  "pending", "ready", "running", "done", "needs_input", "blocked", "needs_review", "failed",
] as const;
export type AtelierWorkflowStageStatus = (typeof ATELIER_WORKFLOW_STAGE_STATUSES)[number];

export const atelierWorkflowRuns = pgTable("atelier_workflow_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  workflowDefinitionId: uuid("workflow_definition_id").notNull().references(() => workflows.id, { onDelete: "restrict" }),
  workflowVersion: integer("workflow_version").notNull(),
  rootIssueId: uuid("root_issue_id").references(() => issues.id, { onDelete: "set null" }),
  status: text("status").$type<AtelierWorkflowRunStatus>().notNull().default("pending"),
  decisionLedger: jsonb("decision_ledger").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, table => ({
  companyProjectIdx: index("atelier_workflow_runs_company_project_idx").on(table.companyId, table.projectId),
  workflowVersionUq: uniqueIndex("atelier_workflow_runs_project_workflow_version_uq")
    .on(table.companyId, table.projectId, table.workflowDefinitionId, table.workflowVersion),
}));

export const atelierWorkflowStageExecutions = pgTable("atelier_workflow_stage_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  workflowRunId: uuid("workflow_run_id").notNull().references(() => atelierWorkflowRuns.id, { onDelete: "cascade" }),
  stageKey: text("stage_key").notNull(),
  issueId: uuid("issue_id").references(() => issues.id, { onDelete: "set null" }),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "restrict" }),
  status: text("status").$type<AtelierWorkflowStageStatus>().notNull().default("pending"),
  blockerReason: text("blocker_reason"),
  approvalState: text("approval_state").notNull().default("pending"),
  decisionLedger: jsonb("decision_ledger").$type<Record<string, unknown>>().notNull().default({}),
  outputReferences: jsonb("output_references").$type<Array<Record<string, unknown>>>().notNull().default([]),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, table => ({
  runStageUq: uniqueIndex("atelier_workflow_stage_executions_run_stage_uq").on(table.workflowRunId, table.stageKey),
  companyProjectIdx: index("atelier_workflow_stage_executions_company_project_idx").on(table.companyId, table.projectId),
}));

export const atelierWorkflowEvents = pgTable("atelier_workflow_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  workflowRunId: uuid("workflow_run_id").notNull().references(() => atelierWorkflowRuns.id, { onDelete: "cascade" }),
  stageExecutionId: uuid("stage_execution_id").references(() => atelierWorkflowStageExecutions.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  sourceAgentId: uuid("source_agent_id").references(() => agents.id, { onDelete: "set null" }),
  targetAgentId: uuid("target_agent_id").references(() => agents.id, { onDelete: "set null" }),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => ({
  idempotencyUq: uniqueIndex("atelier_workflow_events_idempotency_uq").on(table.companyId, table.idempotencyKey),
  runIdx: index("atelier_workflow_events_run_idx").on(table.workflowRunId, table.createdAt),
}));
