"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  productId: string;
  quantity: 1;
  product: {
    title: string;
    price_cents: number;
    image_urls: string[];
    size: string | null;
  };
};

const price = (cents: number) => `${(cents / 100).toFixed(0)} ден.`;

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        setItems(JSON.parse(localStorage.getItem("misi-cart") ?? "[]") as CartItem[]);
      } catch {
        setItems([]);
      }
    });
  }, []);

  const removeItem = (productId: string) => {
    const nextItems = items.filter((item) => item.productId !== productId);
    setItems(nextItems);
    localStorage.setItem("misi-cart", JSON.stringify(nextItems));
  };

  const total = items.reduce((sum, item) => sum + item.product.price_cents, 0);

  return <main className="cart-page">
    <nav className="nav-shell" aria-label="Main navigation"><Link className="wordmark" href="/">MISI STORE</Link><div className="nav-links"><Link href="/catalogue">Каталог</Link><Link href="/story">Нашата приказна</Link></div><Link className="bag-link" href="/cart">Кошничка <span className="bag-count">{items.length}</span></Link></nav>
    <section className="cart-layout">
      <div>
        <p className="eyebrow">Your selection</p>
        <h1>Твојата<br /><em>кошничка.</em></h1>
        {items.length === 0 ? <div className="cart-empty"><p className="checkout-muted">Кошничката е празна.</p><Link className="button button-dark" href="/catalogue">Разгледај го каталогот <span>↗</span></Link></div> : <div className="cart-items">{items.map((item) => <article key={item.productId}><div className="checkout-image" style={{ backgroundImage: `url(${item.product.image_urls[0]})` }} /><div><h2>{item.product.title}</h2><p>{item.product.size ?? "OS"}</p></div><strong>{price(item.product.price_cents)}</strong><button className="remove-cart-button" aria-label={`Отстрани ${item.product.title}`} onClick={() => removeItem(item.productId)}>Отстрани</button></article>)}</div>}
      </div>
      {items.length > 0 && <aside className="cart-summary"><p className="eyebrow">Order summary</p><div className="checkout-total"><span>Вкупно</span><strong>{price(total)}</strong></div><Link className="button button-dark" href="/checkout">Продолжи со нарачка <span>↗</span></Link><p className="checkout-muted">Следно ќе ги внесете податоците за испорака.</p></aside>}
    </section>
    <footer><div className="footer-brand"><Link className="wordmark" href="/">MISI STORE</Link><p>Second-hand, carefully chosen.</p></div><div className="footer-links"><a target="_blank" href="https://www.instagram.com/__misistore/">Instagram</a><Link href="/catalogue">Назад кон каталогот ↑</Link></div></footer>
  </main>;
}
