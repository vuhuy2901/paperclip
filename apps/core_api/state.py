TRANSITIONS = {
    "queued": {"analyzing", "cancelling"}, "analyzing": {"awaiting_scope_approval", "planning", "failed", "cancelling"},
    "awaiting_scope_approval": {"planning", "rejected", "cancelling"}, "planning": {"implementing", "failed", "cancelling"},
    "implementing": {"integrating", "repairing", "failed", "cancelling"}, "integrating": {"verifying", "failed", "cancelling"},
    "verifying": {"deploying", "repairing", "failed", "cancelling"}, "repairing": {"implementing", "blocked", "failed", "cancelling"},
    "deploying": {"awaiting_acceptance", "failed", "cancelling"}, "awaiting_acceptance": {"accepted", "repairing", "rejected"},
    "cancelling": {"cancelled"}, "blocked": set(), "failed": set(), "cancelled": set(), "accepted": set(), "rejected": set(),
}

def can_transition(old: str, new: str) -> bool:
    return new in TRANSITIONS.get(old, set())
