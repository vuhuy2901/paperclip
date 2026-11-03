import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const manifest: PaperclipPluginManifestV1 = {
  id: "ai-company-workflow-studio",
  apiVersion: 1,
  version: "0.5.0",
  displayName: "AI Workflow Studio",
  description: "Design, validate, publish, and monitor Paperclip issue workflows as real dependency graphs.",
  author: "AI Company",
  categories: ["ui", "automation"],
  capabilities: [
    "projects.read",
    "issues.read",
    "issues.create",
    "issues.update",
    "issue.relations.read",
    "issue.relations.write",
    "issues.orchestration.read",
    "issues.wakeup",
    "issue.comments.read",
    "issue.comments.create",
    "agents.read",
    "agents.pause",
    "agents.resume",
    "agents.invoke",
    "agent.tools.register",
    "approvals.read",
    "approvals.respond",
    "database.namespace.read",
    "database.namespace.migrate",
    "plugin.state.read",
    "plugin.state.write",
    "activity.log.write",
    "ui.sidebar.register",
    "ui.page.register",
    "ui.detailTab.register"
  ],
  tools: [
    {
      name: "create-execution-tasks",
      displayName: "Create Workflow Execution Tasks",
      description: "Create concrete AI execution tasks for a workflow stage after the AI Project Manager analyzes the Product Owner requirement.",
      parametersSchema: {
        type: "object",
        properties: {
          workflowRunId: { type: "string" },
          workflowNodeId: { type: "string" },
          tasks: { type: "array", items: { type: "object" } }
        },
        required: ["workflowRunId", "workflowNodeId", "tasks"]
      }
    }
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui"
  },
  database: {
    namespaceSlug: "workflow_studio",
    migrationsDir: "migrations",
    coreReadTables: ["companies", "projects", "agents", "issues", "heartbeat_runs", "cost_events", "approvals"]
  },
  ui: {
    slots: [
      {
        type: "dashboardWidget",
        id: "company-intelligence-dashboard",
        displayName: "Company Intelligence",
        exportName: "CompanyIntelligenceDashboard"
      },
      {
        type: "page",
        id: "project-portfolio-page",
        displayName: "Portfolio",
        exportName: "ProjectPortfolioPage",
        routePath: "projects-portfolio"
      },
      {
        type: "sidebar",
        id: "project-portfolio-sidebar",
        displayName: "Portfolio",
        exportName: "ProjectPortfolioSidebar"
      },
      {
        type: "page",
        id: "workflow-studio-page",
        displayName: "Workflows",
        exportName: "WorkflowStudioPage",
        routePath: "workflows"
      },
      {
        type: "sidebar",
        id: "workflow-studio-sidebar",
        displayName: "Workflows",
        exportName: "WorkflowStudioSidebar"
      },
      {
        type: "detailTab",
        id: "project-workflow-tab",
        displayName: "Workflow",
        exportName: "ProjectWorkflowTab",
        entityTypes: ["project"],
        order: 20
      }
    ]
  }
};

export default manifest;
