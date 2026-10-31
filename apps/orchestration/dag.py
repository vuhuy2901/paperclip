def order_tasks(tasks: list) -> list:
    pending = list(tasks); done: set[str] = set(); ordered = []
    while pending:
        ready = next((task for task in pending if all(dep in done for dep in (task.depends_on or []))), None)
        if ready is None:
            raise ValueError(f"task dependency cycle or missing dependency: {[task.role for task in pending]}")
        pending.remove(ready); ordered.append(ready); done.add(ready.role)
    return ordered
