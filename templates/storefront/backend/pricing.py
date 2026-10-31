from dataclasses import dataclass

@dataclass(frozen=True)
class Line:
    sku: str
    name: str
    quantity: int
    unit_price: float
    original_price: float

def unit_price(product, tier: str, promo_code: str | None) -> float:
    """VIP pricing is a price tier, not an extra discount. Promo never stacks with VIP."""
    if tier == "vip" and product.vip_price is not None:
        return round(product.vip_price, 2)
    base = product.price
    if promo_code == "SAVE10": return round(base * 0.90, 2)
    return round(base, 2)

def shipping_fee(subtotal: float, zone: str) -> float:
    if subtotal >= 100: return 0.0
    return {"local": 5.0, "national": 10.0}.get(zone, 15.0)

def quote(products_by_sku: dict, tier: str, items: list, zone: str, promo_code: str | None):
    lines = []
    for item in items:
        product = products_by_sku[item.sku]
        price = unit_price(product, tier, promo_code)
        lines.append(Line(product.sku, product.name, item.quantity, price, product.price))
    subtotal = round(sum(line.unit_price * line.quantity for line in lines), 2)
    shipping = shipping_fee(subtotal, zone)
    return {"lines": [line.__dict__ for line in lines], "subtotal": subtotal, "shipping_fee": shipping, "total": round(subtotal + shipping, 2)}
