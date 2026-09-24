import Link from "next/link";
import { notFound } from "next/navigation";
import { getAvailableProducts } from "@/lib/products-server";
import ProductActions from "./product-actions";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = (await getAvailableProducts()).find((item) => item.id === id);

  if (!product) notFound();

  return <main className="product-page">
    <nav className="nav-shell" aria-label="Main navigation"><Link className="wordmark" href="/">MISI STORE</Link><div className="nav-links"><Link href="/catalogue">Каталог</Link><Link href="/story">Нашата приказна</Link></div><Link className="bag-link" href="/cart">Кошничка</Link></nav>
    <div className="product-detail">
      <div className="product-gallery" aria-label={`Слики од ${product.title}`}>
        {product.image_urls.map((image, index) => <div className="product-detail-image" key={image} style={{ backgroundImage: `url(${image})` }} role="img" aria-label={`${product.title}, слика ${index + 1}`} />)}
      </div>
      <section className="product-detail-info">
        <Link className="product-back-link" href="/catalogue">← Назад кон каталогот</Link>
        <h1>{product.title}</h1>
        <dl className="product-facts"><div><dt>Големина</dt><dd>{product.size ?? "OS"}</dd></div><div><dt>Категорија</dt><dd>{product.category_id}</dd></div></dl>
        <ProductActions product={product} />
      </section>
    </div>
    <footer><div className="footer-brand"><Link className="wordmark" href="/">MISI STORE</Link><p>Second-hand, carefully chosen.</p></div><div className="footer-links"><a target="_blank" href="https://www.instagram.com/__misistore/">Instagram</a><Link href="/catalogue">Назад кон каталогот ↑</Link></div></footer>
  </main>;
}
