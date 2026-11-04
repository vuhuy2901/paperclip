"""Heuristic and manual router to select the optimal number of PM candidates (1 to 4)."""

from __future__ import annotations
import re

# High complexity / high risk keywords: +2 points each
HIGH_RISK_KEYWORDS = [
    "payment", "checkout", "auth", "login", "password", "security",
    "migration", "schema", "database", "breaking", "delete", "drop",
    "concurrency", "deadlock", "transaction", "shipping", "discount",
    "pricing", "vip", "promotion", "voucher", "order", "cancel", "refund",
    "refactor", "overhaul", "multi-tenant", "permission", "rbac"
]

# Moderate complexity keywords: +1 point each
MODERATE_KEYWORDS = [
    "api", "endpoint", "route", "service", "model", "validation", "validate",
    "field", "table", "filter", "query", "state", "status", "event",
    "feature", "calculate", "total", "subtotal", "tax", "fee"
]

# Low complexity / cosmetic keywords: -1 point each
LOW_COMPLEXITY_KEYWORDS = [
    "text", "typo", "css", "color", "style", "font", "label", "button",
    "copy", "spelling", "doc", "docs", "readme", "comment", "rename",
    "placeholder", "header", "footer", "icon"
]

# Regex patterns to detect manual user overrides in prompt
MANUAL_PATTERNS = [
    re.compile(r"(?:chạy|dùng|sử dụng|use|run|spawn)\s*([1-4])\s*(?:pm|pms|project\s*manager|người|ứng viên)", re.IGNORECASE),
    re.compile(r"\b([1-4])\s*(?:pm|pms)\b", re.IGNORECASE),
    re.compile(r"(?:pm|pms)\s*[:=]\s*([1-4])\b", re.IGNORECASE),
]


def detect_manual_count(prompt: str) -> int | None:
    """Extract explicit PM count from the user's prompt text if present."""
    for pattern in MANUAL_PATTERNS:
        match = pattern.search(prompt)
        if match:
            try:
                count = int(match.group(1))
                if 1 <= count <= 4:
                    return count
            except (ValueError, IndexError):
                continue
    return None


def calculate_heuristic_score(prompt: str) -> tuple[int, list[str]]:
    """Calculate an algorithmic complexity score using zero-token code heuristics."""
    text = prompt.lower()
    score = 0
    matched_reasons = []

    for kw in HIGH_RISK_KEYWORDS:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            score += 2
            matched_reasons.append(f"+2:{kw}")

    for kw in MODERATE_KEYWORDS:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            score += 1
            matched_reasons.append(f"+1:{kw}")

    for kw in LOW_COMPLEXITY_KEYWORDS:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            score -= 1
            matched_reasons.append(f"-1:{kw}")

    # Prompt length factor
    words = len(text.split())
    if words > 100:
        score += 2
        matched_reasons.append("+2:long_prompt")
    elif words > 40:
        score += 1
        matched_reasons.append("+1:medium_prompt")
    elif words < 10:
        score -= 1
        matched_reasons.append("-1:short_prompt")

    return score, matched_reasons


def resolve_pm_count(prompt: str, default_mode: str = "auto") -> tuple[int, str]:
    """Resolve the number of PM candidates (1..4) and return the explanatory reason.
    
    If prompt contains an explicit count instruction, respect it immediately (MANUAL mode).
    Otherwise, run zero-token heuristic analysis (AUTO mode).
    """
    manual_count = detect_manual_count(prompt)
    if manual_count is not None:
        return manual_count, f"manual: prompt requested exactly {manual_count} PMs"

    if default_mode != "auto":
        return 1, "config: non-auto mode requested single PM"

    score, reasons = calculate_heuristic_score(prompt)

    # Threshold mapping
    if score <= 0:
        count = 1
        level = "trivial/cosmetic change"
    elif score in (1, 2):
        count = 2
        level = "moderate feature change"
    elif score in (3, 4, 5):
        count = 3
        level = "high-risk business logic change"
    else:
        count = 4
        level = "critical core/schema overhaul"

    return count, f"auto: score={score} ({level}) via heuristics [{', '.join(reasons[:5])}]"

