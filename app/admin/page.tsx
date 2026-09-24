"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { catalogueCategories } from "@/lib/products";

type AdminProduct = {
  id: string;
  title: string;
  category_id: string;
  price_cents: number;
  size: string | null;
  image_urls: string[];
  is_available: boolean;
};

type ProductForm = { name: string; price: string; category: string; size: string };

const emptyForm: ProductForm = { name: "", price: "", category: "маица", size: "" };

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    const response = await fetch("/api/admin/products");
    if (response.status === 401) return null;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Could not load products");
    return ((Array.isArray(data.products) ? data.products : []) as unknown[]).filter((product): product is AdminProduct => typeof (product as AdminProduct).price_cents === "number");
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

  const resetForm = () => {
    setForm(emptyForm);
    setImages([]);
    const imageInput = document.getElementById("product-image") as HTMLInputElement | null;
    if (imageInput) imageInput.value = "";
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
    formData.append("priceCents", String(Math.round(Number(form.price))));
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
    resetForm();
    setMessage("Производот е додаден.");
  };

  const startEditing = (product: AdminProduct) => {
    setEditingProduct(product);
    setForm({ name: product.title, price: String(product.price_cents), category: product.category_id, size: product.size ?? "" });
    setImages([]);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    resetForm();
    setError("");
  };

  const updateProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingProduct) return;
    setLoading(true);
    setError("");
    setMessage("");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("priceCents", String(Math.round(Number(form.price))));
    formData.append("category", form.category);
    formData.append("size", form.size);
    images.forEach((image) => formData.append("images", image));
    const response = await fetch(`/api/admin/products/${editingProduct.id}`, { method: "PATCH", body: formData });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Производот не може да се измени.");
      return;
    }
    setProducts((current) => current.map((product) => product.id === editingProduct.id ? data.product : product));
    setEditingProduct(null);
    resetForm();
    setMessage("Производот е изменет.");
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

  const isEditing = editingProduct !== null;
  const formSubmit = isEditing ? updateProduct : addProduct;

  return <main className="admin-page"><header className="admin-header"><Link className="wordmark" href="/">MISI STORE</Link><div><span>Admin dashboard</span><button onClick={logout}>Одјави се</button></div></header><section className="admin-content"><div className="admin-title"><div><p className="eyebrow">Inventory</p><h1>Производи</h1></div><p>Додавај, менувај и отстранувај парчиња од каталогот.</p></div>{inventoryError && <p className="admin-error">{inventoryError}</p>}<div className="admin-layout"><form className="product-form" onSubmit={formSubmit}><p className="eyebrow">{isEditing ? "Edit a piece" : "Add a piece"}</p><h2>{isEditing ? "Измени производ" : "Нов производ"}</h2><label>Име<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Цена во денари<input type="number" min="0" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label><label>Категорија<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{catalogueCategories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label><label>Големина<input value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></label><label>Слики од лаптопот<input id="product-image" type="file" accept="image/*" multiple required={!isEditing} onChange={(event) => setImages(Array.from(event.target.files ?? []))} /><small className="admin-muted">{isEditing ? "Остави празно за да ги задржиш постоечките слики. " : "Избери до 8 слики. "}Максимум 8 MB по слика. Првата ќе биде главната.</small></label>{images.length > 0 && <p className="admin-muted">Избрани слики: {images.length}</p>}{error && <p className="admin-error">{error}</p>}{message && <p className="admin-success">{message}</p>}<div className="product-form-actions"><button className="button button-dark" disabled={loading} type="submit">{loading ? "Се зачувува..." : isEditing ? "Зачувај промени" : "Додај производ"} <span>↗</span></button>{isEditing && <button className="form-cancel-button" type="button" onClick={cancelEditing}>Откажи</button>}</div></form><div className="admin-products"><div className="admin-products-heading"><h2>Сите производи</h2><span>{products.filter((product) => product.is_available).length} активни</span></div>{products.length === 0 ? <p className="admin-muted">0 производи во базата.</p> : products.map((product) => <article className={product.is_available ? "admin-product" : "admin-product is-removed"} key={product.id}><div className="admin-product-image" style={{ backgroundImage: `url(${product.image_urls[0]})` }} /><div><h3>{product.title}</h3><p>{product.category_id} · {product.price_cents.toFixed(0)} ден.</p></div><div className="admin-product-actions"><button onClick={() => startEditing(product)}>Измени</button><button disabled={!product.is_available} onClick={() => removeProduct(product.id)}>{product.is_available ? "Отстрани" : "Отстранет"}</button></div></article>)}</div></div></section></main>;
}