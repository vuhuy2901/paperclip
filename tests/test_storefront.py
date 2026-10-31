from fastapi.testclient import TestClient
from templates.storefront.backend.main import app

client = TestClient(app)

def test_vip_price_does_not_stack_with_promo():
    regular = client.post("/api/quote", json={"items":[{"sku":"MUG-001","quantity":1}],"promo_code":"SAVE10"}).json()
    vip_order = client.post("/api/orders", json={"user_id":"vip-demo","items":[{"sku":"MUG-001","quantity":1}],"promo_code":"SAVE10"}).json()
    assert regular["subtotal"] == 18
    assert vip_order["price_snapshot"][0]["unit_price"] == 17
    assert vip_order["subtotal"] == 17

def test_shipping_keeps_vip_and_order_snapshot():
    result = client.post("/api/orders", json={"user_id":"vip-demo","items":[{"sku":"BAG-001","quantity":1}],"zone":"national"}).json()
    assert result["subtotal"] == 68
    assert result["shipping_fee"] == 10
    assert result["total"] == 78
    fetched = client.get(f"/api/orders/{result['id']}").json()
    assert fetched["total"] == 78

def test_cancel_does_not_reprice_existing_order():
    result = client.post("/api/orders", json={"user_id":"regular-demo","items":[{"sku":"MUG-001","quantity":1}]}).json()
    cancelled = client.post(f"/api/orders/{result['id']}/cancel").json()
    assert cancelled["status"] == "cancelled"
    assert cancelled["total"] == result["total"]
