const UNICODE_REPLACEMENT_CHARACTER = "\uFFFD";

export function findUnicodeReplacementPath(
  value: unknown,
  path = "payload",
): string | null {
  if (typeof value === "string") {
    return value.includes(UNICODE_REPLACEMENT_CHARACTER) ? path : null;
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const match = findUnicodeReplacementPath(value[index], `${path}[${index}]`);
      if (match) return match;
    }
    return null;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const match = findUnicodeReplacementPath(nested, `${path}.${key}`);
      if (match) return match;
    }
  }
  return null;
}

