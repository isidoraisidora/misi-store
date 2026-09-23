"use client";

import Link from "next/link";
import { useState } from "react";
import { catalogueCategories, pieces } from "@/lib/products";

const priceValue = (price: string) => Number(price.replace("$", ""));

type SortOption = "newest" | "low" | "high";

export default function CataloguePage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [addedProduct, setAddedProduct] = useState("");

  const filteredPieces = pieces
    .filter((piece) => category === "all" || piece.category === category)
    .filter((piece) => !availableOnly || piece.available)
    .filter((piece) => piece.name.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((first, second) => {
      if (sort === "low") return priceValue(first.price) - priceValue(second.price);
      if (sort === "high") return priceValue(second.price) - priceValue(first.price);
      return pieces.indexOf(first) - pieces.indexOf(second);
    });

  const toggleSaved = (name: string) => {
    setSaved((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  };

  const addToCart = (name: string) => {
    setCartCount((count) => count + 1);
    setAddedProduct(name);
    window.setTimeout(() => setAddedProduct(""), 2200);
  };

  const clearFilters = () => {
    setCategory("all");
    setSort("newest");
    setQuery("");
    setAvailableOnly(false);
  };

  return (
    <main className="catalogue-page">
      <nav className="nav-shell" aria-label="Main navigation">
        <Link className="wordmark" href="/">MISI STORE</Link>
        <div className="nav-links"><Link href="/catalogue">Каталог</Link><Link href="/story">Нашата приказна</Link></div>
        <Link className="bag-link" href="#catalogue-grid">Кошничка <span className="bag-count">{cartCount}</span></Link>
      </nav>

      <header className="catalogue-header">
        <div>
          <p className="eyebrow">The full edit</p>
          <h1>Каталог<br /><em>на пронајдени работи.</em></h1>
        </div>
        <p className="catalogue-intro">Парчиња со карактер, внимателно избрани и подготвени за нова приказна.</p>
      </header>

      <section className="catalogue-tools" aria-label="Catalogue filters">
        <label className="category-select"><span>Категорија:</span><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>{catalogueCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <div className="catalogue-controls">
          <label className="search-field"><span className="sr-only">Search catalogue</span><input type="search" placeholder="Пребарај" value={query} onChange={(event) => setQuery(event.target.value)} /><span>⌕</span></label>
          <label className="available-toggle"><input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} /><span>Само достапни</span></label>
          <label className="sort-field"><span>Подреди:</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="newest">Најнови</option><option value="low">Цена: ниска кон висока</option><option value="high">Цена: висока кон ниска</option></select></label>
        </div>
      </section>

      <section className="catalogue-results" id="catalogue-grid">
        <div className="results-heading"><p><strong>{filteredPieces.length}</strong> {filteredPieces.length === 1 ? "парче" : "парчиња"}</p>{(category !== "all" || sort !== "newest" || query || availableOnly) && <button className="clear-button" onClick={clearFilters}>Исчисти филтри ×</button>}</div>
        {filteredPieces.length > 0 ? <div className="catalogue-grid">{filteredPieces.map((piece) => <article className="catalogue-card" key={piece.name}><div className="product-image" style={{ backgroundImage: `url(${piece.image})` }}><span>{piece.tag}</span><button aria-label={saved.includes(piece.name) ? `Remove ${piece.name} from saved items` : `Save ${piece.name}`} className={saved.includes(piece.name) ? "save-button is-saved" : "save-button"} onClick={() => toggleSaved(piece.name)}>{saved.includes(piece.name) ? "♥" : "♡"}</button></div><div className="product-info"><div><h2>{piece.name}</h2><p>{piece.category} <span>·</span> {piece.size} <span>·</span> {piece.condition}</p></div><strong>{piece.price}</strong></div><button className="add-button" disabled={!piece.available || addedProduct === piece.name} onClick={() => addToCart(piece.name)}>{addedProduct === piece.name ? "Додадено ✓" : "Додај во кошничка"}</button></article>)}</div> : <div className="empty-catalogue"><p className="eyebrow">Nothing here yet</p><h2>Нема парчиња<br /><em>со овие филтри.</em></h2><button className="button button-dark" onClick={clearFilters}>Исчисти филтри <span>↗</span></button></div>}
      </section>

      <footer><div className="footer-brand"><Link className="wordmark" href="/">MISI STORE</Link><p>Second-hand, carefully chosen.</p></div><div className="footer-links"><a target="_blank" href="https://www.instagram.com/__misistore/">Instagram</a><Link href="/">Back to store ↑</Link></div></footer>
    </main>
  );
}
