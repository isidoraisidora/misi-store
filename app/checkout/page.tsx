"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type CartItem = { productId: string; quantity: 1; product: { id: string; title: string; price_cents: number; image_urls: string[]; size: string | null } };

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", addressLine: "", city: "", postalCode: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      try { setItems(JSON.parse(localStorage.getItem("misi-cart") ?? "[]") as CartItem[]); } catch { setItems([]); }
    });
  }, []);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer: form, items: items.map((item) => ({ productId: item.productId, quantity: 1 })) }) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setError(data.error ?? "Нарачката не може да се креира."); return; }
    setSubmitted(data.order.orderNumber);
    localStorage.removeItem("misi-cart");
    setItems([]);
  };

  if (submitted) return <main className="checkout-page"><nav className="nav-shell"><Link className="wordmark" href="/">MISI STORE</Link></nav><section className="checkout-success"><p className="eyebrow">Almost there</p><h1>Провери го<br /><em>твојот email.</em></h1><p>Ти испративме линк за потврда за нарачката <strong>{submitted}</strong>. Нарачката ќе се обработи откако ќе ја потврдиш.</p><Link className="button button-dark" href="/catalogue">Назад кон каталогот <span>↗</span></Link></section></main>;

  if (items.length === 0) return <main className="checkout-page"><nav className="nav-shell"><Link className="wordmark" href="/">MISI STORE</Link></nav><section className="checkout-success"><p className="eyebrow">Your selection</p><h1>Кошничката е<br /><em>празна.</em></h1><p>Додајте барем едно парче пред да продолжите со нарачката.</p><Link className="button button-dark" href="/catalogue">Назад кон каталогот <span>↗</span></Link></section></main>;

  return <main className="checkout-page"><nav className="nav-shell"><Link className="wordmark" href="/">MISI STORE</Link><Link className="bag-link" href="/cart">Назад кон кошничката</Link></nav><section className="checkout-form-page"><div><p className="eyebrow">Delivery details</p><h1>Податоци за<br /><em>нарачката.</em></h1><p className="checkout-muted">Внесете ги податоците за испорака, а потоа потврдете ја нарачката преку email.</p></div><form className="checkout-form" onSubmit={submit}><label>Име<input required value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></label><label>Презиме<input required value={form.lastName} onChange={(event) => update("lastName", event.target.value)} /></label><label>Email адреса<input type="email" required value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label>Телефон<input type="tel" required value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label><label>Адреса<input required value={form.addressLine} onChange={(event) => update("addressLine", event.target.value)} /></label><label>Град<input required value={form.city} onChange={(event) => update("city", event.target.value)} /></label><label>Поштенски број<input required value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} /></label>{error && <p className="admin-error">{error}</p>}<button className="button button-dark" disabled={loading}>{loading ? "Се испраќа..." : "Испрати нарачка"}<span>↗</span></button></form></section></main>;
}
