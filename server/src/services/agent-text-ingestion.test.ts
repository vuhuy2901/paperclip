import { describe, expect, it } from "vitest";
import { findUnicodeReplacementPath } from "./agent-text-ingestion.js";

describe("findUnicodeReplacementPath", () => {
  it("accepts valid Vietnamese and ordinary question marks", () => {
    expect(findUnicodeReplacementPath({
      body: "Phòng ngủ Japandi sáng — bạn xác nhận chứ?",
      options: ["Giữ nguyên", "Điều chỉnh"],
    })).toBeNull();
  });

  it("finds Unicode replacement characters in nested agent payloads", () => {
    expect(findUnicodeReplacementPath({
      kind: "ask_user_questions",
      payload: { questions: [{ prompt: "Phong c�ch nào?" }] },
    })).toBe("payload.payload.questions[0].prompt");
  });
});

