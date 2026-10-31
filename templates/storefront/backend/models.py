from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

def uid(): return str(uuid4())
def now(): return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "storefront_users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    email: Mapped[str] = mapped_column(String(200), unique=True)
    tier: Mapped[str] = mapped_column(String(20), default="regular")

class Product(Base):
    __tablename__ = "storefront_products"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    sku: Mapped[str] = mapped_column(String(50), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    price: Mapped[float] = mapped_column(Float)
    vip_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)

class Order(Base):
    __tablename__ = "storefront_orders"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey("storefront_users.id"))
    status: Mapped[str] = mapped_column(String(30), default="pending")
    subtotal: Mapped[float] = mapped_column(Float)
    shipping_fee: Mapped[float] = mapped_column(Float)
    total: Mapped[float] = mapped_column(Float)
    price_snapshot: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
