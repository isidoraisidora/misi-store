import Link from "next/link";
import { getAvailableProducts } from "@/lib/products-server";

const price = (cents: number) => `${(cents / 100).toFixed(0)} ден.`;

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getAvailableProducts();
  const productCards = products.map((product) => <article className="product-card" key={product.id}><div className="product-image" style={{ backgroundImage: `url(${product.image_urls[0]})` }} /><div className="product-info"><h3>{product.title}</h3><p>{product.size ?? "OS"} <span>·</span> {product.category_id}</p><strong>{price(product.price_cents)}</strong></div></article>);

  return (
    <main>
      <nav className="nav-shell" aria-label="Main navigation">
        <Link className="wordmark" href="#top">MISI STORE</Link>
        <div className="nav-links"><Link href="/catalogue">Каталог</Link><Link href="/story">Нашата приказна</Link></div>
        <Link className="bag-link" href="/cart">Кошничка <span className="bag-count">0</span></Link>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Good things, twice loved</p>
          <h1>Пронајди го парчето<br /><em>за тебе.</em></h1>
          <p className="hero-text">Second hand облека, аксесоари и многу други работи, специјално одберени.</p>
          <Link className="button button-dark" href="/catalogue">Разгледај парчиња</Link>
        </div>
        <div className="hero-image" role="img" aria-label="A curated rack of vintage clothing" />
        <div className="hero-note"><br /><strong>Small things,<br />well found.</strong></div>
      </section>

      <section className="intro-strip" id="story"><p>Твојот нов омилен <em>outfit</em> веќе има <br /><em>своја приказна.</em></p></section>

      <section className="section-shell" id="shop">
        <div className="section-heading"><div><p className="eyebrow">The edit</p><h2>Нови парчиња</h2></div><Link className="text-link" href="/catalogue">Види го целиот каталог <span>↗</span></Link></div>
        {products.length > 0 ? <div className="product-carousel" aria-label="Сите достапни парчиња"><div className="product-carousel-track">{productCards}<div aria-hidden="true" className="product-carousel-copy">{productCards}</div></div></div> : <p className="home-empty-products">Нема достапни парчиња во моментот.</p>}
      </section>

      {/* <section className="category-section"><div className="section-heading"><div><p className="eyebrow">Browse by feeling</p><h2>Make it yours</h2></div></div><div className="category-grid">{categories.map((category) => <a className="category-card" href="#shop" key={category.name}><div className="category-image" style={{ backgroundImage: `url(${category.image})` }} /><div><h3>{category.name}</h3><p>{category.count} <span>↗</span></p></div></a>)}</div></section> */}

      <footer><div className="footer-brand"><Link className="wordmark" href="#top">MISI STORE</Link><p>Second-hand, carefully chosen.</p></div>
      <div className="footer-links"><a target="_blank" href="https://www.instagram.com/__misistore/">Instagram</a><a href="#top">Back to top ↑</a></div></footer>
    </main>
  );
}
