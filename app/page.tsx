const pieces = [
  { name: "Linen utility jacket", price: "$68", size: "M", tag: "Just in", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85" },
  { name: "Soft leather loafers", price: "$54", size: "8", tag: "One only", image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=900&q=85" },
  { name: "Wool check trousers", price: "$42", size: "S", tag: "Vintage", image: "https://images.unsplash.com/photo-1506629905607-d9dfd8d1bcd2?auto=format&fit=crop&w=900&q=85" },
  { name: "Canvas carryall", price: "$36", size: "OS", tag: "Everyday", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85" },
];

const categories = [
  { name: "New arrivals", count: "18 pieces", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85" },
  { name: "Wardrobe staples", count: "42 pieces", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=85" },
  { name: "Objects & home", count: "27 pieces", image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=900&q=85" },
];

export default function Home() {
  return (
    <main>
      <nav className="nav-shell" aria-label="Main navigation">
        <a className="wordmark" href="#top">MISI STORE</a>
        <div className="nav-links"><a href="#shop">Каталог</a><a href="#story">Нашата приказна</a></div>
        <a className="bag-link" href="#shop">Кошничка <span className="bag-count">0</span></a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Good things, twice loved</p>
          <h1>Пронајди го парчето<br /><em>за тебе.</em></h1>
          <p className="hero-text">Second hand облека, аксесоари и многу други работи, специјално одберени.</p>
          <a className="button button-dark" href="#shop">Каталог <span>↗</span></a>
        </div>
        <div className="hero-image" role="img" aria-label="A curated rack of vintage clothing" />
        <div className="hero-note"><br /><strong>Small things,<br />well found.</strong></div>
      </section>

      <section className="intro-strip" id="story"><p>Твојот нов омилен аутфит веќе има <br /><em>своја приказна.</em></p></section>

      <section className="section-shell" id="shop">
        <div className="section-heading"><div><p className="eyebrow">The edit</p><h2>Freshly found</h2></div><a className="text-link" href="#shop">View all pieces <span>↗</span></a></div>
        <div className="product-grid">{pieces.map((piece) => <article className="product-card" key={piece.name}><div className="product-image" style={{ backgroundImage: `url(${piece.image})` }}><span>{piece.tag}</span><button aria-label={`Save ${piece.name}`} className="save-button">♡</button></div><div className="product-info"><h3>{piece.name}</h3><p>{piece.size} <span>·</span> Excellent condition</p><strong>{piece.price}</strong></div></article>)}</div>
      </section>

      <section className="category-section"><div className="section-heading"><div><p className="eyebrow">Browse by feeling</p><h2>Make it yours</h2></div></div><div className="category-grid">{categories.map((category) => <a className="category-card" href="#shop" key={category.name}><div className="category-image" style={{ backgroundImage: `url(${category.image})` }} /><div><h3>{category.name}</h3><p>{category.count} <span>↗</span></p></div></a>)}</div></section>

      <footer><div className="footer-brand"><a className="wordmark" href="#top">MISÍ <span>/</span> STORE</a><p>Second-hand, carefully chosen.</p></div><div className="newsletter"><p className="eyebrow">The Friday note</p><h3>New finds, once a week.</h3><form><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" placeholder="Your email address" /><button type="submit" aria-label="Subscribe">↗</button></form></div><div className="footer-links"><a href="#shop">Instagram</a><a href="mailto:hello@misistore.com">Contact</a><a href="#top">Back to top ↑</a></div></footer>
    </main>
  );
}
