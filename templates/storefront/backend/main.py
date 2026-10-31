from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy import select
from sqlalchemy.orm import Session
from .db import Base, engine, get_db, SessionLocal
from .models import User, Product, Order
from .schemas import QuoteRequest, OrderCreate, UserCreate
from .pricing import quote

Base.metadata.create_all(engine)
app = FastAPI(title="Storefront Demo", version="baseline-1")

def seed():
    db = SessionLocal()
    if db.scalar(select(Product).limit(1)):
        db.close(); return
    db.add_all([User(id="regular-demo", email="regular@example.test", tier="regular"), User(id="vip-demo", email="vip@example.test", tier="vip")])
    db.add_all([Product(sku="MUG-001", name="Field mug", price=20, vip_price=17, stock=100), Product(sku="BAG-001", name="Canvas bag", price=80, vip_price=68, stock=50)])
    db.commit(); db.close()
seed()

@app.get("/health")
def health(): return {"status":"ok", "version":"baseline-1"}

@app.get("/api/products")
def products(db: Session = Depends(get_db)): return list(db.scalars(select(Product)))

@app.post("/api/users")
def create_user(body: UserCreate, db: Session = Depends(get_db)):
    if body.tier not in {"regular", "vip"}: raise HTTPException(422, "unsupported tier")
    user = User(**body.model_dump()); db.add(user); db.commit(); db.refresh(user); return user

@app.post("/api/quote")
def get_quote(body: QuoteRequest, db: Session = Depends(get_db)):
    products_by_sku = {p.sku: p for p in db.scalars(select(Product).where(Product.sku.in_([i.sku for i in body.items])))}
    if len(products_by_sku) != len({i.sku for i in body.items}): raise HTTPException(404, "product not found")
    return quote(products_by_sku, "regular", body.items, body.zone, body.promo_code)

@app.post("/api/orders")
def create_order(body: OrderCreate, db: Session = Depends(get_db)):
    user = db.get(User, body.user_id)
    if not user: raise HTTPException(404, "user not found")
    products_by_sku = {p.sku: p for p in db.scalars(select(Product).where(Product.sku.in_([i.sku for i in body.items])))}
    if len(products_by_sku) != len({i.sku for i in body.items}): raise HTTPException(404, "product not found")
    priced = quote(products_by_sku, user.tier, body.items, body.zone, body.promo_code)
    for item in body.items:
        if products_by_sku[item.sku].stock < item.quantity: raise HTTPException(409, "insufficient stock")
    for item in body.items: products_by_sku[item.sku].stock -= item.quantity
    order = Order(user_id=user.id, subtotal=priced["subtotal"], shipping_fee=priced["shipping_fee"], total=priced["total"], price_snapshot=priced["lines"])
    db.add(order); db.commit(); db.refresh(order); return order

@app.get("/api/orders/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order: raise HTTPException(404, "order not found")
    return order

@app.post("/api/orders/{order_id}/cancel")
def cancel_order(order_id: str, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order: raise HTTPException(404, "order not found")
    if order.status not in {"pending", "confirmed"}: raise HTTPException(409, "order cannot be cancelled")
    order.status = "cancelled"; db.commit(); db.refresh(order); return order
