from __future__ import annotations

import re


def route_failure(stdout: str, stderr: str) -> dict:
    """Map trusted verification output to the narrowest role we can justify."""
    text = f"{stdout}\n{stderr}"
    file_match = re.search(r"([A-Za-z0-9_./\\-]+\.(?:py|tsx|ts|css|jsx|html)):(\d+)", text)
    file_name = file_match.group(1).replace("\\", "/") if file_match else None
    line = int(file_match.group(2)) if file_match else None
    if file_name and ("frontend" in file_name or file_name.endswith((".tsx", ".ts", ".css"))):
        owner = "frontend-developer"
    elif file_name and ("tests/" in file_name or file_name.startswith("tests")):
        owner = "backend-developer" if "storefront" in text or "api" in text.lower() else "tester"
    elif file_name and ("templates/" in file_name or "backend" in file_name):
        owner = "backend-developer"
    else:
        owner = "tester"
    return {"owner": owner, "file": file_name, "line": line, "reason": "trusted verification failure routed from executable evidence"}
