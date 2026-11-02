import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const manifest: PaperclipPluginManifestV1 = {
  id: "ai-company-workflow-studio",
  apiVersion: 1,
  version: "0.4.1",
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
    "approvals.read",
    "approvals.respond",
    "plugin.state.read",
    "plugin.state.write",
    "activity.log.write",
    "ui.sidebar.register",
    "ui.page.register",
    "ui.detailTab.register"
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui"
  },
  ui: {
    slots: [
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
