// manifest.js
var manifest = {
  id: "ai-company-native-workflow",
  apiVersion: 1,
  version: "1.1.1",
  displayName: "Native Workflow Designer",
  description: "Visual workflow templates that materialize as native Paperclip issues and blocker dependencies.",
  author: "AI Company",
  categories: ["ui", "automation"],
  capabilities: [
    "projects.read",
    "issues.read",
    "issues.create",
    "issue.relations.read",
    "issue.relations.write",
    "agents.read",
    "plugin.state.read",
    "plugin.state.write",
    "activity.log.write",
    "ui.page.register",
    "ui.detailTab.register"
  ],
  entrypoints: { worker: "./dist/worker.js", ui: "./dist/ui" },
  ui: {
    slots: [
      {
        type: "page",
        id: "native-workflow-designer",
        displayName: "Workflow Designer",
        exportName: "WorkflowDesignerPage",
        routePath: "workflow-designer"
      },
      {
        type: "page",
        id: "workflows-page",
        displayName: "Workflows",
        exportName: "WorkflowDesignerPage",
        routePath: "workflows"
      },
      {
        type: "detailTab",
        id: "project-workflow-tab",
        displayName: "Workflows",
        exportName: "ProjectWorkflowTab",
        entityTypes: ["project"],
        order: 25
      }
    ]
  }
};
var manifest_default = manifest;
export {
  manifest_default as default
};
//# sourceMappingURL=manifest.js.map
