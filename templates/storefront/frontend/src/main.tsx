import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = import.meta.env.VITE_STOREFRONT_API_URL ?? "http://localhost:8200";
type Product = { sku: string; name: string; price: number; vip_price?: number; stock: number };
type Cart = Record<string, number>;

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [tier, setTier] = useState<"regular" | "vip">("regular");
  const [error, setError] = useState("");
  useEffect(() => { fetch(`${API}/api/products`).then(r => r.json()).then(setProducts).catch(() => setError("Could not load products")); }, []);
  const add = (sku: string) => setCart(c => ({ ...c, [sku]: (c[sku] ?? 0) + 1 }));
  const total = products.reduce((sum, p) => sum + (cart[p.sku] ?? 0) * (tier === "vip" && p.vip_price ? p.vip_price : p.price), 0);
  return <main><header><span className="eyebrow">FIELD GOODS</span><h1>Useful things, priced clearly.</h1><p>Compare a regular and VIP account without hidden stacked discounts.</p><div className="switch"><button className={tier === "regular" ? "selected" : ""} onClick={() => setTier("regular")}>Regular account</button><button className={tier === "vip" ? "selected" : ""} onClick={() => setTier("vip")}>VIP account</button></div></header>
    {error && <div className="error">{error}</div>}<section className="products">{products.map(p => <article key={p.sku}><div className="visual">{p.sku.slice(0, 3)}</div><div><h2>{p.name}</h2><p>{p.sku} · {p.stock} available</p><strong>${(tier === "vip" && p.vip_price ? p.vip_price : p.price).toFixed(2)}</strong><button className="add" onClick={() => add(p.sku)}>Add to cart</button></div></article>)}</section>
    <aside><span className="eyebrow">CHECKOUT PREVIEW</span><strong>${total.toFixed(2)}</strong><span>{Object.values(cart).reduce((a, b) => a + b, 0)} items · {tier} pricing</span></aside>
  </main>;
}
createRoot(document.getElementById("root")!).render(<App />);
