"""Strategy cards and persona definitions for PM Arena candidates."""

from __future__ import annotations
from dataclasses import dataclass


@dataclass(frozen=True)
class PMStrategy:
    id: str
    name: str
    persona: str
    core_focus: str
    decision_bias: str
    risk_appetite: str


STRATEGIES: dict[str, PMStrategy] = {
    "minimalist": PMStrategy(
        id="minimalist",
        name="Minimalist & Regression-Safe",
        persona="Pragmatic Senior Engineer & Defensive PM",
        core_focus="Phạm vi thay đổi tối thiểu, bảo vệ mã nguồn cũ tối đa, tránh refactor không cần thiết.",
        decision_bias="Ưu tiên dùng lại các hàm, schema và component có sẵn. Giới hạn số file sửa đổi ở mức nhỏ nhất có thể.",
        risk_appetite="Cực kỳ thấp (Zero Regression Risk). Thà từ chối over-engineering hơn là thêm tính năng phụ gây vỡ code cũ.",
    ),
    "edge_case": PMStrategy(
        id="edge_case",
        name="Edge-Case Sentinel",
        persona="QA-Minded Lead PM & Security/Resilience Specialist",
        core_focus="Săn tìm các ca biên (boundary values), trạng thái lỗi, dữ liệu bẩn và xung đột nghiệp vụ tiềm ẩn.",
        decision_bias="Mỗi tính năng đều phải có validation chặt chẽ, handling đầy đủ các mã lỗi HTTP/DB, idempotency và concurrency checks.",
        risk_appetite="Thấp đối với lỗi dữ liệu/bảo mật. Chấp nhận viết thêm test và code kiểm tra điều kiện.",
    ),
    "architectural": PMStrategy(
        id="architectural",
        name="Scalable & Clean Architecture",
        persona="Systems Architect & Long-term Product Strategist",
        core_focus="Thiết kế module hóa sạch sẽ, tách biệt tầng trách nhiệm, schema chuẩn hóa và dễ mở rộng về sau.",
        decision_bias="Không hardcode magic numbers/strings. Chuẩn hóa API contracts và schema database rõ ràng.",
        risk_appetite="Trung bình. Sẵn sàng cấu trúc lại một module nhỏ nếu điều đó giúp hệ thống sạch và ngăn nợ kỹ thuật.",
    ),
    "user_centric": PMStrategy(
        id="user_centric",
        name="User-Centric & PO-Aligned",
        persona="Product Experience Lead & UX Advocate",
        core_focus="Tối ưu trải nghiệm của PO và người dùng cuối: luồng thao tác trực quan, thông báo lỗi rõ ràng, phản hồi tức thì.",
        decision_bias="Tập trung vào tính dễ hiểu của giao diện, feedback tương tác, tài liệu hướng dẫn và tính rõ ràng của bản nghiệm thu.",
        risk_appetite="Trung bình. Ưu tiên cao nhất là người dùng sử dụng thuận tiện và PO dễ dàng kiểm chứng kết quả.",
    ),
}

ORDERED_STRATEGY_KEYS = ["minimalist", "edge_case", "architectural", "user_centric"]


def get_strategies_for_count(count: int) -> list[PMStrategy]:
    """Return N distinct strategies according to the requested candidate count."""
    count = max(1, min(count, len(ORDERED_STRATEGY_KEYS)))
    return [STRATEGIES[key] for key in ORDERED_STRATEGY_KEYS[:count]]

