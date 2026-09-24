"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { catalogueCategories } from "@/lib/products";

type AdminProduct = {
  id: string;
  title: string;
  category_id: string;
  price_cents: number;
  image_urls: string[];
  is_available: boolean;
};

const emptyForm = { name: "", price: "", category: "маица", size: "" };

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    const response = await fetch("/api/admin/products");
    if (response.status === 401) return null;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Could not load products");
    return (Array.isArray(data.products) ? data.products : []) as AdminProduct[];
  };

  useEffect(() => {
    void loadProducts().then((loadedProducts) => {
      if (loadedProducts) {
        setProducts(loadedProducts);
        setAuthenticated(true);
      }
    }).catch(() => setInventoryError("Не може да се поврзе со базата. Провери ги Supabase вредностите и schema.sql."));
  }, []);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    setLoading(false);
    if (!response.ok) {
      setError("Неточна е-пошта или лозинка.");
      return;
    }
    setPassword("");
    setAuthenticated(true);
    try {
      const loadedProducts = await loadProducts();
      if (loadedProducts) setProducts(loadedProducts);
    } catch {
      setInventoryError("Не може да се поврзе со базата. Провери ги Supabase вредностите и schema.sql.");
    }
  };

  const addProduct = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    if (images.length === 0) {
      setError("Избери барем една слика од лаптопот.");
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("priceCents", String(Math.round(Number(form.price) * 100)));
    formData.append("category", form.category);
    formData.append("size", form.size);
    images.forEach((image) => formData.append("images", image));
    const response = await fetch("/api/admin/products", { method: "POST", body: formData });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Производот не може да се додаде.");
      return;
    }
    setProducts((current) => [data.product, ...current]);
    setForm(emptyForm);
    setImages([]);
    const imageInput = document.getElementById("product-image") as HTMLInputElement | null;
    if (imageInput) imageInput.value = "";
    setMessage("Производот е додаден.");
  };

  const removeProduct = async (id: string) => {
    if (!window.confirm("Дали сигурно сакаш да го отстраниш овој производ?")) return;
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Производот не може да се отстрани.");
      return;
    }
    setProducts((current) => current.map((product) => product.id === id ? { ...product, is_available: false } : product));
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setProducts([]);
  };

  if (!authenticated) {
    return <main className="admin-page"><section className="admin-login"><Link className="wordmark" href="/">MISI STORE</Link><p className="eyebrow">Private space</p><h1>Admin<br /><em>sign in.</em></h1><form onSubmit={login}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="admin-error">{error}</p>}<button className="button button-dark" disabled={loading} type="submit">{loading ? "Се најавува..." : "Најави се ↗"}</button></form></section></main>;
  }

  return <main className="admin-page"><header className="admin-header"><Link className="wordmark" href="/">MISI STORE</Link><div><span>Admin dashboard</span><button onClick={logout}>Одјави се</button></div></header><section className="admin-content"><div className="admin-title"><div><p className="eyebrow">Inventory</p><h1>Производи</h1></div><p>Додавај и отстранувај парчиња од каталогот.</p></div>{inventoryError && <p className="admin-error">{inventoryError}</p>}<div className="admin-layout"><form className="product-form" onSubmit={addProduct}><p className="eyebrow">Add a piece</p><h2>Нов производ</h2><label>Име<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Цена во денари<input type="number" min="0" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label><label>Категорија<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{catalogueCategories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label><label>Големина<input value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></label><label>Слики од лаптопот<input id="product-image" type="file" accept="image/*" multiple onChange={(event) => setImages(Array.from(event.target.files ?? []))} required /><small className="admin-muted">Избери до 8 слики, максимум 8 MB по слика. Првата ќе биде главната.</small></label>{images.length > 0 && <p className="admin-muted">Избрани слики: {images.length}</p>}{error && <p className="admin-error">{error}</p>}{message && <p className="admin-success">{message}</p>}<button className="button button-dark" disabled={loading} type="submit">Додај производ <span>↗</span></button></form><div className="admin-products"><div className="admin-products-heading"><h2>Сите производи</h2><span>{products.filter((product) => product.is_available).length} активни</span></div>{products.length === 0 ? <p className="admin-muted">0 производи во базата.</p> : products.map((product) => <article className={product.is_available ? "admin-product" : "admin-product is-removed"} key={product.id}><div className="admin-product-image" style={{ backgroundImage: `url(${product.image_urls[0]})` }} /><div><h3>{product.title}</h3><p>{product.category_id} · {(product.price_cents / 100).toFixed(0)} ден.</p></div><button disabled={!product.is_available} onClick={() => removeProduct(product.id)}>{product.is_available ? "Отстрани" : "Отстранет"}</button></article>)}</div></div></section></main>;
}
