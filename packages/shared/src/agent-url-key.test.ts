import { describe, expect, it } from "vitest";
import {
  deriveAgentUrlKey,
  legacyNormalizeAgentUrlKey,
  normalizeAgentUrlKey,
} from "./agent-url-key.js";

describe("agent URL keys", () => {
  it("transliterates Vietnamese names without splitting words", () => {
    expect(normalizeAgentUrlKey("Kiến Trúc Sư Trưởng")).toBe("kien-truc-su-truong");
    expect(normalizeAgentUrlKey("Điều Phối Đa Agent")).toBe("dieu-phoi-da-agent");
  });

  it("preserves existing ASCII normalization", () => {
    expect(normalizeAgentUrlKey("Chief Architect  2")).toBe("chief-architect-2");
    expect(deriveAgentUrlKey("", "Agent Fallback")).toBe("agent-fallback");
    expect(normalizeAgentUrlKey("   ")).toBeNull();
  });

  it("retains the pre-fix key for bookmark compatibility", () => {
    expect(legacyNormalizeAgentUrlKey("Kiến Trúc Sư Trưởng")).toBe("ki-n-tr-c-s-tr-ng");
  });
});
