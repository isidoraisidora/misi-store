import { pieces } from "@/lib/products";

export default function Home() {
  return (
    <main>
      <nav className="nav-shell" aria-label="Main navigation">
        <a className="wordmark" href="#top">MISI STORE</a>
        <div className="nav-links"><a href="/catalogue">Каталог</a><a href="/story">Нашата приказна</a></div>
        <a className="bag-link" href="#shop">Кошничка <span className="bag-count">0</span></a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Good things, twice loved</p>
          <h1>Пронајди го парчето<br /><em>за тебе.</em></h1>
          <p className="hero-text">Second hand облека, аксесоари и многу други работи, специјално одберени.</p>
          <a className="button button-dark" href="/catalogue">Разгледај парчиња</a>
        </div>
        <div className="hero-image" role="img" aria-label="A curated rack of vintage clothing" />
        <div className="hero-note"><br /><strong>Small things,<br />well found.</strong></div>
      </section>

      <section className="intro-strip" id="story"><p>Твојот нов омилен <em>outfit</em> веќе има <br /><em>своја приказна.</em></p></section>

      <section className="section-shell" id="shop">
        <div className="section-heading"><div><p className="eyebrow">The edit</p><h2>Нови парчиња</h2></div><a className="text-link" href="/catalogue">Види го целиот каталог <span>↗</span></a></div>
        <div className="product-grid">{pieces.map((piece) => <article className="product-card" key={piece.name}><div className="product-image" style={{ backgroundImage: `url(${piece.image})` }}><span>{piece.tag}</span><button aria-label={`Save ${piece.name}`} className="save-button">♡</button></div><div className="product-info"><h3>{piece.name}</h3><p>{piece.size} <span>·</span> Excellent condition</p><strong>{piece.price}</strong></div></article>)}</div>
      </section>

      {/* <section className="category-section"><div className="section-heading"><div><p className="eyebrow">Browse by feeling</p><h2>Make it yours</h2></div></div><div className="category-grid">{categories.map((category) => <a className="category-card" href="#shop" key={category.name}><div className="category-image" style={{ backgroundImage: `url(${category.image})` }} /><div><h3>{category.name}</h3><p>{category.count} <span>↗</span></p></div></a>)}</div></section> */}

      <footer><div className="footer-brand"><a className="wordmark" href="#top">MISI STORE</a><p>Second-hand, carefully chosen.</p></div>
      <div className="footer-links"><a target="_blank" href="https://www.instagram.com/__misistore/">Instagram</a><a href="#top">Back to top ↑</a></div></footer>
    </main>
  );
}
