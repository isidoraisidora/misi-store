import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Нашата приказна | Misi Store",
  description: "Приказната зад MISI STORE и идејата за работи со втора приказна.",
};

const milestones = [
  {
    year: "01",
    title: "Почетокот (2024)",
    text: "Сè започна во 2024 година кога две братучетки решивме да го ослободиме вишокот облека од нашите плакари. Имавме јасна мисија: да ја подигнеме еко-свеста и да покажеме дека пазарењето во second hand продавници не е табу тема, туку паметен и стилски избор во Македонија.",
  },
  {
    year: "02",
    title: "Растот и промената",
    text: "Денес сме пресреќни кога гледаме колку напредувавме и колку брзо се менуваат навиките. Second hand модата и одржливиот стил растат секој ден, а сè повеќе луѓе ја препознаваат вредноста на уникатните и квалитетни парчиња со приказна.",
  },
  {
    year: "03",
    title: "Иднината",
    text: "Misi Store продолжува понатаму! Остануваме посветени на рециклирањето, повторната употреба на облека и создавањето заедница која ја чува планетата и изгледа одлично во секое ново парче. Кога едно парче го наоѓа својот нов дом, неговата приказна не завршува. Само добива ново поглавје.",
  },
];

export default function StoryPage() {
  return (
    <main className="story-page">
      <nav className="nav-shell" aria-label="Main navigation">
        <Link className="wordmark" href="/">MISI STORE</Link>
        <div className="nav-links"><Link href="/#shop">Каталог</Link><Link href="/story">Нашата приказна</Link></div>
        <Link className="bag-link" href="/cart">Кошничка <span className="bag-count">0</span></Link>
      </nav>

      <section className="story-hero">
        <div className="story-hero-copy">
          <p className="eyebrow">Behind the pieces</p>
          <h1>Сè што е убаво,<br /><em>вреди да се зачува.</em></h1>
          <p className="story-lead">MISI STORE е место за внимателно избрани парчиња, предмети со карактер и работи кои заслужуваат уште една приказна.</p>
        </div>
        <div className="story-mark" aria-hidden="true"><span>est.</span><strong>M</strong><span>good things<br />twice loved</span></div>
      </section>

      <section className="story-intro">
        <p className="eyebrow">Нашата идеја</p>
        <div>
          <h2>Помалку, но<br /><em>подобро избрано.</em></h2>
          <p>Веруваме дека стилот не мора секогаш да биде нов. Понекогаш најдоброто парче е она кое веќе има трага од живот, добра ткаенина и доволно простор за да стане твое.</p>
        </div>
      </section>

      <section className="story-timeline">
        <div className="section-heading"><div><p className="eyebrow">A little history</p><h2>Од каде дојдовме</h2></div></div>
        <div className="timeline-list">{milestones.map((milestone) => <article className="timeline-item" key={milestone.year}><span>{milestone.year}</span><div><h3>{milestone.title}</h3><p>{milestone.text}</p></div></article>)}</div>
      </section>

      <section className="story-note">
        <p className="eyebrow">MISI, во една реченица</p>
        <blockquote>„Не бараме совршени работи. Бараме работи кои ќе значат нешто.“</blockquote>
        <Link className="button button-dark" href="/#shop">Разгледај го каталогот <span>↗</span></Link>
      </section>

      <section className="faq-section">
        <div className="section-heading"><div><p className="eyebrow">Need to know</p><h2>Прашања и одговори</h2></div><p className="faq-intro">Место за информации кои најчесто ги барате.</p></div>
        <div className="faq-list">
          <details><summary>Како да нарачам?</summary><p>Ставете ги парчињата кои ги сакате во кошничка, минимална цена на нарачка е
            200ден. а цената на каргото е 180ден. Ќе треба да пополнете информации за вашето име, презиме,
            адреса на живеење, град, телефонски број и емаил адреса. На емаил адресата ќе ви стигне порака
            на која ќе треба да ја потврдете нарачката. После ова, очекувајте го пакетчето да ви пристигне дома за некој ден.</p></details>
          <details><summary>Каде да ве контактирам, имам прашање за некое парче?</summary><p>Можете слободно да ни се обратете во приватна порака на нашиот инстаграм профил @__misistore достапни сме 24/7.
            Таму можеме да ви ги одговориме сите прашања или да ви пуштиме повеќе слики од некое парче.</p></details>
          <details><summary>Може ли да го заменам парчето?</summary><p>Засега, се уште немаме таква опција.</p></details>
        </div>
      </section>

    <footer><div className="footer-brand"><a className="wordmark" href="#top">MISI STORE</a><p>Second-hand, carefully chosen.</p></div>
      <div className="footer-links"><a target="_blank" href="https://www.instagram.com/__misistore/">Instagram</a><a href="#top">Back to top ↑</a></div></footer>    </main>
  );
}
