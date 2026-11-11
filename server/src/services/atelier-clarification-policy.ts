export const ATELIER_CLARIFICATION_POLICY_VERSION = 1;

export type AtelierDecisionState = "confirmed" | "proposal_requested" | "unknown";

export type AtelierDecisionKey =
  | "space"
  | "functional_needs"
  | "style"
  | "palette"
  | "budget";

export type AtelierDecisionAssessment = {
  key: AtelierDecisionKey;
  label: string;
  state: AtelierDecisionState;
  evidence: string | null;
};

export type AtelierClarificationQuestion = {
  decision: AtelierDecisionKey;
  text: string;
  options: string[];
};

const DECISIONS: ReadonlyArray<{
  key: AtelierDecisionKey;
  label: string;
  signal: RegExp;
  proposalSignal?: RegExp;
  question: AtelierClarificationQuestion;
}> = [
  {
    key: "space",
    label: "Loại không gian/phòng",
    signal: /(căn hộ|nhà phố|biệt thự|studio|văn phòng|cửa hàng|shop|phòng khách|phòng ngủ|phòng bếp|bếp|phòng tắm|toilet)/iu,
    question: {
      decision: "space",
      text: "Bạn muốn thiết kế loại không gian hoặc phòng nào?",
      options: ["Căn hộ/nhà ở trọn bộ", "Phòng khách", "Phòng ngủ", "Bếp hoặc không gian khác"],
    },
  },
  {
    key: "functional_needs",
    label: "Công năng và nội thất cần có",
    signal: /(công năng|nhu cầu|số người|sinh hoạt|tiếp khách|làm việc|học tập|nấu ăn|ăn uống|sofa|giường|bàn|ghế|tủ|kệ|tivi|tv|đảo bếp|bàn ăn)/iu,
    question: {
      decision: "functional_needs",
      text: "Không gian cần phục vụ ai và bắt buộc có những món nội thất/công năng nào?",
      options: ["Ưu tiên sinh hoạt hằng ngày", "Ưu tiên tiếp khách", "Có góc làm việc/học tập", "Tôi sẽ liệt kê cụ thể"],
    },
  },
  {
    key: "style",
    label: "Phong cách",
    signal: /(phong cách|style|japandi|wabi[ -]?sabi|indochine|scandinavian|tối giản|hiện đại|modern|luxury|sang trọng|tân cổ điển|industrial|đông dương)/iu,
    proposalSignal: /(?:chưa biết|chưa chọn|không chắc|tư vấn|đề xuất|gợi ý).{0,50}(?:phong cách|style)|(?:phong cách|style).{0,50}(?:chưa biết|chưa chọn|không chắc|tư vấn|đề xuất|gợi ý)/iu,
    question: {
      decision: "style",
      text: "Bạn muốn chốt hướng phong cách nào? Nếu chưa chắc, tôi sẽ đưa 3 phương án để bạn chọn, không tự chọn thay.",
      options: ["Hiện đại ấm", "Japandi", "Tối giản", "Đề xuất cho tôi 3 phương án"],
    },
  },
  {
    key: "palette",
    label: "Màu sơn/bảng màu",
    signal: /(màu|bảng màu|phối màu|tông|tone|sơn|trắng|kem|be|xám|ghi|xanh|nâu|đen|pastel|ấm|lạnh|sáng|tối)/iu,
    proposalSignal: /(?:chưa biết|chưa chọn|không chắc|tư vấn|đề xuất|gợi ý).{0,50}(?:màu|tông|tone|sơn)|(?:màu|tông|tone|sơn).{0,50}(?:chưa biết|chưa chọn|không chắc|tư vấn|đề xuất|gợi ý)/iu,
    question: {
      decision: "palette",
      text: "Bạn thích hướng màu sơn/bảng màu nào? Tôi chỉ trình phương án, chưa áp màu cho tới khi bạn chọn.",
      options: ["Sáng ấm: trắng kem + gỗ", "Trung tính: be + xám", "Có màu nhấn rõ", "Đề xuất cho tôi 3 bảng màu"],
    },
  },
  {
    key: "budget",
    label: "Ngân sách",
    signal: /(ngân sách|chi phí|dự toán|triệu|tỷ|vnđ|vnd|₫|budget)/iu,
    question: {
      decision: "budget",
      text: "Ngân sách mục tiêu hoặc khoảng ngân sách bạn chấp nhận là bao nhiêu?",
      options: ["Dưới 100 triệu", "100–300 triệu", "300–700 triệu", "Tôi sẽ nhập khoảng khác"],
    },
  },
] as const;

const PRIORITY: readonly AtelierDecisionKey[] = ["budget", "functional_needs", "style", "palette", "space"];

function evidenceFor(text: string, signal: RegExp): string | null {
  const match = text.match(signal);
  if (!match || match.index === undefined) return null;
  return text.slice(Math.max(0, match.index - 30), Math.min(text.length, match.index + match[0].length + 50)).trim();
}

export function assessAtelierBrief(brief: string) {
  const text = brief.trim().replace(/\s+/g, " ");
  const decisions: AtelierDecisionAssessment[] = DECISIONS.map((decision) => {
    const proposalRequested = decision.proposalSignal?.test(text) === true;
    const evidence = evidenceFor(text, decision.signal);
    return {
      key: decision.key,
      label: decision.label,
      state: proposalRequested ? "proposal_requested" : evidence ? "confirmed" : "unknown",
      evidence,
    };
  });
  const byKey = new Map(decisions.map((decision) => [decision.key, decision]));
  const openDecisions = PRIORITY
    .map((key) => byKey.get(key))
    .filter((decision): decision is AtelierDecisionAssessment => Boolean(decision && decision.state !== "confirmed"));
  const questions = openDecisions.slice(0, 3).map((assessment) => {
    const definition = DECISIONS.find((decision) => decision.key === assessment.key)!;
    return definition.question;
  });
  return {
    status: openDecisions.length === 0 ? "ready" as const : "needs_input" as const,
    policyVersion: ATELIER_CLARIFICATION_POLICY_VERSION,
    decisions,
    openDecisions: openDecisions.map((decision) => decision.key),
    questions,
  };
}

const ROLE_RULES: Record<string, string> = {
  agent_concierge: "Bạn là đầu mối duy nhất hỏi người dùng. Mỗi lượt hỏi tối đa 3 câu có ưu tiên và lựa chọn A/B/C; cập nhật decision ledger rồi mới giao việc.",
  agent_floorplan: "Thiếu tỷ lệ, kích thước chuẩn hoặc chiều cao trần: gửi needs_input về Chief và dừng; tuyệt đối không tự suy từ ảnh.",
  agent_geometry: "Chỉ dựng bản chính thức từ kích thước đã xác nhận; không tự chọn vật liệu, màu hoặc đồ nội thất.",
  agent_furniture: "Thiếu công năng, số người, món bắt buộc, đồ giữ lại hoặc mức đầu tư: gửi needs_input; chỉ đề xuất tối đa A/B và chờ chọn.",
  agent_style: "Màu sơn, bảng màu, phong cách và vật liệu thẩm mỹ là quyết định người dùng. Đưa 2–3 phương án; không áp/chốt phương án nếu chưa có lựa chọn rõ ràng.",
  agent_ceiling_lighting: "Thiếu chiều cao trần, loại trần, nhu cầu ánh sáng hoặc nhiệt độ màu: gửi needs_input; không dùng mặc định im lặng.",
  agent_research: "Không tự chọn SKU cuối. Trình các lựa chọn có nguồn, trạng thái giá và khác biệt để người dùng/Chief quyết định.",
  agent_qa: "Không có bằng chứng người dùng xác nhận các quyết định sở thích/chi tiêu thì đánh fail hoặc needs_input; không cho pass bằng giả định.",
  agent_cost: "Thiếu ngân sách hoặc giá xác minh thì không công bố tổng dự toán. Chỉ nêu phần đã có giá, độ phủ x/y và danh sách cần hỏi/bổ sung.",
};

export function buildAtelierAgentInstructions(input: {
  agentKey: string;
  agentName: string;
  roleSummary: string;
}) {
  const roleRule = ROLE_RULES[input.agentKey] ?? "Thiếu quyết định thuộc quyền người dùng: gửi needs_input về Chief và dừng.";
  return `# ${input.agentName} — Atelier decision-safe instructions

## Vai trò

${input.roleSummary}

${roleRule}

## Quy tắc bắt buộc: không tự chốt thay người dùng

1. Trước khi làm, lập decision ledger cho: loại không gian, công năng/nội thất bắt buộc, phong cách, màu sơn/bảng màu, vật liệu, ngân sách, đồ giữ lại và ràng buộc đặc biệt.
2. Mỗi mục chỉ có một trong ba trạng thái: \`confirmed\` (người dùng đã nói rõ), \`proposal_requested\` (người dùng muốn xem phương án) hoặc \`unknown\`.
3. Không bao giờ biến \`unknown\` hay \`proposal_requested\` thành fact đã chốt. Không dùng dữ liệu demo, thói quen thị trường hoặc sở thích của agent làm câu trả lời của người dùng.
4. Với \`proposal_requested\`, đưa 2–3 phương án A/B/C, nêu ưu/nhược và tác động ngân sách nếu có dữ liệu xác minh; sau đó dừng để chờ người dùng chọn.
5. Với \`unknown\` ảnh hưởng tới kết quả, trả \`status: needs_input\`, tạo câu hỏi cụ thể kèm lựa chọn, ghi vào conversation/task và dừng. Không đánh dấu task done, không handoff như thể đã có quyết định.
6. Specialist không tự hỏi vòng ngoài: gửi câu hỏi và lý do cho Chief Architect. Chief hỏi người dùng tối đa 3 câu ưu tiên trong một lượt.
7. Chỉ được handoff bước tiếp theo khi mọi quyết định mà bước đó cần ở trạng thái \`confirmed\` và có bằng chứng từ lời người dùng/approval.
8. Giá chưa xác minh phải ghi \`chưa có giá\`. Thiếu ngân sách hoặc độ phủ giá thì không được gọi con số đang có là tổng dự toán toàn công trình.

## Đầu ra tối thiểu cho mỗi lượt

\`decision_ledger\`, \`status: done | needs_input | blocked | needs_review\`, \`questions\`, \`assumptions\`, \`handoff\`.

Nếu \`assumptions\` chứa một quyết định thuộc sở thích hoặc chi tiêu của người dùng, trạng thái bắt buộc là \`needs_input\`; assumption đó không được ghi vào SceneGraph, BOM, Cost hoặc task downstream.
`;
}

export const ATELIER_CLARIFICATION_CAPABILITY =
  "Bắt buộc dùng decision ledger: thiếu ngân sách, công năng, phong cách, màu sơn/bảng màu, vật liệu hoặc nội thất thì trả needs_input và hỏi; chỉ đề xuất A/B/C, không tự chốt thay người dùng.";
