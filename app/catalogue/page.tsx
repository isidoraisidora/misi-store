"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { catalogueCategories, Product } from "@/lib/products";

type SortOption = "newest" | "low" | "high";
type SizeOption = "сите" | "XS" | "S" | "M" | "L" | "XL";
type CartItem = { productId: string; quantity: 1; product: Product };

const price = (cents: number) => `${(cents / 100).toFixed(0)} ден.`;

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("сите");
  const [size, setSize] = useState<SizeOption>("сите");
  const [sort, setSort] = useState<SortOption>("newest");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [addedProduct, setAddedProduct] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/products").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load products");
      setProducts(data.products);
    }).catch(() => setError("Каталогот моментално не може да се вчита."));
    void Promise.resolve().then(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("misi-cart") ?? "[]") as CartItem[];
        setCartCount(stored.length);
      } catch { setCartCount(0); }
    });
  }, []);

  const filteredProducts = [...products]
    .filter((product) => category === "сите" || product.category_id === category)
    .filter((product) => size === "сите" || product.size?.toUpperCase() === size)
    .filter((product) => product.title.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((first, second) => {
      if (sort === "low") return first.price_cents - second.price_cents;
      if (sort === "high") return second.price_cents - first.price_cents;
      return (second.created_at ?? "").localeCompare(first.created_at ?? "");
    });
  const pageSize = 12;
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const addToCart = (product: Product) => {
    const stored = JSON.parse(localStorage.getItem("misi-cart") ?? "[]") as CartItem[];
    if (!stored.some((item) => item.productId === product.id)) {
      localStorage.setItem("misi-cart", JSON.stringify([...stored, { productId: product.id, quantity: 1, product }]));
      setCartCount(stored.length + 1);
    }
    setAddedProduct(product.id);
    window.setTimeout(() => setAddedProduct(""), 2200);
  };

  return <main className="catalogue-page">
    <nav className="nav-shell" aria-label="Main navigation"><Link className="wordmark" href="/">MISI STORE</Link><div className="nav-links"><Link href="/catalogue">Каталог</Link><Link href="/story">Нашата приказна</Link></div><Link className="bag-link" href="/cart">Кошничка <span className="bag-count">{cartCount}</span></Link></nav>
    <header className="catalogue-header"><div><p className="eyebrow">The full edit</p><h1>Каталог<br /><em>на пронајдени работи.</em></h1></div><p className="catalogue-intro">Парчиња со карактер, внимателно избрани и подготвени за нова приказна.</p></header>
    <section className="catalogue-tools" aria-label="Catalogue filters"><div className="catalogue-filter-selects"><label className="category-select"><span>Категорија:</span><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>{catalogueCategories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="category-select"><span>Големина:</span><select value={size} onChange={(event) => { setSize(event.target.value as SizeOption); setPage(1); }}><option value="сите">Сите</option>{["XS", "S", "M", "L", "XL"].map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div><div className="catalogue-controls"><label className="search-field"><span className="sr-only">Search catalogue</span><input type="search" placeholder="Пребарај" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /><span>⌕</span></label><label className="sort-field"><span>Подреди:</span><select value={sort} onChange={(event) => { setSort(event.target.value as SortOption); setPage(1); }}><option value="newest">Најнови</option><option value="low">Цена: ниска кон висока</option><option value="high">Цена: висока кон ниска</option></select></label></div></section>
    <section className="catalogue-results" id="catalogue-grid"><div className="results-heading"><p><strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "парче" : "парчиња"}</p>{totalPages > 1 && <span>Страна {page} од {totalPages}</span>}</div>{error ? <div className="empty-catalogue"><p className="admin-error">{error}</p></div> : filteredProducts.length === 0 ? <div className="empty-catalogue"><p className="eyebrow">Empty edit</p><h2>Нема достапни<br /><em>парчиња.</em></h2></div> : <><div className="catalogue-grid">{visibleProducts.map((product) => <article className="catalogue-card" key={product.id}><div className="product-image" style={{ backgroundImage: `url(${product.image_urls[0]})` }}><Link aria-label={`Погледни детали за ${product.title}`} className="product-image-link" href={`/product/${product.id}`} /><button aria-label={`Зачувај ${product.title}`} className={saved.includes(product.id) ? "save-button is-saved" : "save-button"} onClick={() => setSaved((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])}>{saved.includes(product.id) ? "♥" : "♡"}</button></div><div className="product-info"><div><h2>{product.title}</h2><p>{product.category_id} <span>·</span> {product.size ?? "OS"}</p></div><strong>{price(product.price_cents)}</strong></div><button className="add-button" disabled={addedProduct === product.id} onClick={() => addToCart(product)}>{addedProduct === product.id ? "Додадено ✓" : "Додај во кошничка"}</button></article>)}</div>{totalPages > 1 && <nav className="pagination" aria-label="Catalogue pages"><button aria-label="Претходна страница" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>←</button><span>{page} / {totalPages}</span><button aria-label="Следна страница" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>→</button></nav>}</>}</section>
    <footer><div className="footer-brand"><Link className="wordmark" href="/">MISI STORE</Link><p>Second-hand, carefully chosen.</p></div><div className="footer-links"><a target="_blank" href="https://www.instagram.com/__misistore/">Instagram</a><Link href="#top">Back to top ↑</Link></div></footer>
  </main>;
}
