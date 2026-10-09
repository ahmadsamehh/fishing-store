'use client';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/seed';
import ProductCard from '@/components/ProductCard';
import { perkIcons } from '@/components/Icons';

const perks = [
  { title: 'Weekly deals', sub: 'Fresh discounts every week', icon: perkIcons.deals },
  { title: 'Reward points', sub: 'Earn on every order', icon: perkIcons.points },
  { title: 'Easy returns', sub: 'Within [DAYS] days', icon: perkIcons.returns },
  { title: 'Reef experts', sub: 'Ask us before you buy', icon: perkIcons.experts },
];

const articles = [
  { tag: 'Beginners', title: 'How to start your first saltwater tank, step by step' },
  { tag: 'Lighting', title: 'Choosing the right reef light for your tank' },
  { tag: 'Water quality', title: 'Getting salinity and water tests right' },
];

export default function Home() {
  const { products, ready, loadError } = useStore();
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const shown = featured.length ? featured : products.slice(0, 8);

  return (
    <>
      <section className="wrap perks" aria-label="Why shop with us">
        {perks.map((p) => (
          <div className="perk" key={p.title}>
            <span className="perk-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={p.icon} /></svg>
            </span>
            <span>
              <strong>{p.title}</strong>
              <small>{p.sub}</small>
            </span>
          </div>
        ))}
      </section>

      <section className="wrap hero-row">
        <div className="hero">
          <svg className="hero-art" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <path d="M100 200V110M100 110c0-30-25-40-25-80M100 110c0-25 30-35 30-70M100 140c-20-5-45-20-50-50M100 140c22-5 45-18 55-45M75 60c-10-6-18-14-20-26M130 50c10-6 16-16 17-28" />
            <circle cx="55" cy="34" r="5" /><circle cx="147" cy="22" r="5" /><circle cx="50" cy="90" r="5" /><circle cx="155" cy="95" r="5" />
          </svg>
          <span className="tag">Seasonal offer</span>
          <h1>Everything your <strong>reef</strong> needs, in <strong>one place</strong></h1>
          <p>Lighting, pumps, filtration, salt and supplements, with advice from people who actually keep reefs.</p>
          <Link href="/products" className="btn btn-light">Shop now</Link>
        </div>
        <div className="hero-side">
          <Link href="/products?category=Lighting" className="promo promo-teal">
            <small>New arrivals</small>
            <strong>The latest reef lighting</strong>
            <span>See what is new</span>
          </Link>
          <Link href="/products?sale=1" className="promo promo-coral">
            <small>Clearance</small>
            <strong>Up to [PERCENT]% off selected items</strong>
            <span>Shop deals</span>
          </Link>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Best sellers</h2>
          <Link href="/products">All products</Link>
        </div>
        {!ready ? (
          <div className="empty">Loading products…</div>
        ) : loadError ? (
          <div className="empty">{loadError}</div>
        ) : shown.length ? (
          <div className="grid-products">
            {shown.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        ) : (
          <div className="empty">New products are on the way.</div>
        )}
      </section>

      <section className="wrap section">
        <h2>Shop by category</h2>
        <div className="grid-cats">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="cat">
              <span className="cat-circle" aria-hidden="true">{c.charAt(0)}</span>
              <span>{c}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="wrap section">
          <div className="section-head">
            <h2>Learn first, then buy right</h2>
            <Link href="#">All articles and videos</Link>
          </div>
          <div className="grid-articles">
            {articles.map((a) => (
              <Link href="#" className="article" key={a.title}>
                <span className="article-img">[ARTICLE IMAGE]</span>
                <span className="article-body">
                  <small>{a.tag}</small>
                  <strong>{a.title}</strong>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="newsletter">
          <div>
            <h2>Be the first to hear about deals</h2>
            <p>Sign up for offers, new products and reef-keeping tips.</p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="email" className="sr-only">Email</label>
            <input id="email" type="email" placeholder="Your email address" />
            <button className="btn btn-dark" type="submit">Sign up</button>
          </form>
        </div>
      </section>
    </>
  );
}
