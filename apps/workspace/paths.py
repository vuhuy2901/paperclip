from pathlib import Path

def safe_child(root: str | Path, relative: str) -> Path:
    base = Path(root).resolve()
    candidate = (base / relative).resolve()
    if candidate != base and base not in candidate.parents:
        raise ValueError("path escapes workspace root")
    return candidate
