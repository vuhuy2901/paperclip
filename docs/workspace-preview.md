# Workspace and preview boundaries

`WorkspaceManager` creates detached Git worktrees below a project/run/task root and refuses path traversal. `PreviewManager` is the only code boundary allowed to form Docker Compose control-plane commands; role runners receive no Docker socket. Preview execution is reported as `ready`, `failed` or `inconclusive`, never inferred from a URL alone.
