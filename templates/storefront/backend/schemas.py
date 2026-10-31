from pydantic import BaseModel, Field

class QuoteItem(BaseModel): sku: str; quantity: int = Field(gt=0, le=20)
class QuoteRequest(BaseModel): items: list[QuoteItem]; zone: str = "local"; promo_code: str | None = None
class OrderCreate(QuoteRequest): user_id: str
class UserCreate(BaseModel): email: str; tier: str = "regular"
