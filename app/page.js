'use client';
import Link from 'next/link';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import { CATEGORIES, categoryHref } from '@/lib/catalog';
import { perkIcons } from '@/components/Icons';
import ProductImage from '@/components/ProductImage';
import { youtubeId, youtubeThumb } from '@/lib/youtube';
import { WHATSAPP_NUMBER } from '@/lib/config';

const perks = [
  { title: 'Weekly deals', sub: 'Fresh discounts every week', icon: perkIcons.deals },
  { title: 'Reward points', sub: 'Earn on every order', icon: perkIcons.points },
  { title: 'Easy returns', sub: 'Within [DAYS] days', icon: perkIcons.returns },
  { title: 'Reef experts', sub: 'Ask us before you buy', icon: perkIcons.experts },
];

// Big photo tiles. "wide" tiles take two columns on large screens.
const tiles = [
  { category: 'Aquariums & Stands', text: 'Nano, all-in-one and reef-ready tanks, plus stands built to carry them.', img: '/images/cat-aquariums.jpg', wide: true },
  { category: 'Lighting', text: 'LED fixtures and controllers for colourful, healthy corals.', img: '/images/cat-lighting.jpg' },
  { category: 'Live Fish & Coral', text: 'Healthy fish, corals and invertebrates for your reef.', img: '/images/cat-livestock.jpg' },
  { category: 'Salt & Additives', text: 'Salt mixes, calcium, alkalinity and trace elements.', img: '/images/cat-additives.jpg' },
  { category: 'Filtration', text: 'Skimmers, sumps, filter socks and reactors.', img: '/images/cat-filtration.jpg' },
  { deals: true, title: 'Deals', text: 'Discounts on selected products. Updated every week.', wide: true },
  { all: true, title: 'All products', text: 'Browse the full range, filter by category and sort by price.' },
];

const guides = [
  { tag: 'Beginners', title: 'How to start your first saltwater tank, step by step', text: 'Choosing a tank, cycling it, and adding your first fish without the common mistakes.' },
  { tag: 'Lighting', title: 'Choosing the right reef light for your tank', text: 'What PAR, spectrum and coverage mean, and how much light your corals really need.' },
  { tag: 'Water quality', title: 'Getting salinity and water tests right', text: 'Which parameters to test, how often, and what to do when a number is off.' },
];

const Arrow = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

function PopularCard({ product }) {
  const { addToCart } = useStore();
  const onSale = product.salePrice && product.salePrice < product.price;
  const soldOut = Number(product.stock) <= 0;
  return (
    <article className="pop-card reveal">
      <Link href={`/products/${product.id}`} className="pop-img">
        <ProductImage product={product} />
        {onSale && <span className="badge">Sale</span>}
      </Link>
      <div className="pop-body">
        <h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3>
        {product.description && <p>{product.description.split(/(?<=[.!?])\s+/)[0]}</p>}
        <div className="pop-price">
          <strong>{formatPrice(finalPrice(product))}</strong>
          {onSale && <s>{formatPrice(product.price)}</s>}
        </div>
        <div className="pop-actions">
          <button className="btn btn-pink btn-sm" disabled={soldOut} onClick={() => addToCart(product.id)}>
            {soldOut ? 'Out of stock' : 'Add to cart'}
          </button>
          <Link href={`/products/${product.id}`} className="pop-arrow" aria-label={`View ${product.name}`}><Arrow /></Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const { products, ready, loadError } = useStore();
  const featured = products.filter((p) => p.featured);
  const popular = (featured.length ? featured : products).slice(0, 4);

  // One tile per unique video, newest products first.
  const seen = new Set();
  const videos = products
    .map((p) => ({ p, id: youtubeId(p.youtubeUrl) }))
    .filter(({ id }) => id && !seen.has(id) && seen.add(id))
    .slice(0, 6);

  return (
    <>
      {/* 1. Full-width photo hero */}
      <section className="h-hero">
        <img className="h-hero-bg" src="/images/hero-reef-tank.jpg" alt="" />
        <div className="wrap h-hero-inner">
          <h1>Built for <strong>reefers</strong>.<br />Delivered across <strong>Egypt</strong>.</h1>
          <p>Lighting, pumps, filtration, salt and supplements, with advice from people who actually keep reefs.</p>
          <div className="h-hero-cta">
            <Link href="/products" className="btn btn-pink">Shop all products</Link>
            <a href="#categories" className="btn btn-ghost">Browse categories</a>
          </div>
        </div>
      </section>

      {/* 2. Perks card overlapping the hero */}
      <section className="wrap h-perks-wrap" aria-label="Why shop with us">
        <div className="h-perks reveal">
          {perks.map((p) => (
            <div className="h-perk" key={p.title}>
              <span className="h-perk-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={p.icon} /></svg>
              </span>
              <span><strong>{p.title}</strong><small>{p.sub}</small></span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Category photo tiles */}
      <section id="categories" className="wrap h-section">
        <div className="h-head reveal">
          <h2>Shop by <strong>category</strong></h2>
          <p>Everything for a healthy reef, from the tank to the last drop of additive.</p>
        </div>
        <div className="h-tiles">
          {tiles.map((t) => t.deals || t.all ? (
            <Link key={t.title} href={t.deals ? '/products?sale=1' : '/products'} className={`h-tile reveal ${t.deals ? 'h-tile-deals' : 'h-tile-all'}${t.wide ? ' wide' : ''}`}>
              <span className="h-tile-text">
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </span>
              <span className="h-tile-arrow"><Arrow /></span>
            </Link>
          ) : (
            <Link key={t.category} href={categoryHref(t.category)} className={`h-tile reveal${t.wide ? ' wide' : ''}`}>
              <img src={t.img} alt="" loading="lazy" />
              <span className="h-tile-text">
                <h3>{t.category}</h3>
                <p>{t.text}</p>
              </span>
              <span className="h-tile-arrow"><Arrow /></span>
            </Link>
          ))}
        </div>
        <div className="h-chips reveal" aria-label="All categories">
          {CATEGORIES.map((c) => (<Link key={c} href={categoryHref(c)} className="chip">{c}</Link>))}
        </div>
      </section>

      {/* 4. Most popular, dark band */}
      <section className="h-band">
        <div className="wrap h-section">
          <div className="h-head h-head-center reveal">
            <h2>Most <strong>popular</strong></h2>
            <p>What reefers in Egypt are ordering right now.</p>
          </div>
          {!ready ? (
            <div className="empty empty-dark">Loading products…</div>
          ) : loadError ? (
            <div className="empty empty-dark">{loadError}</div>
          ) : popular.length ? (
            <div className="pop-grid">{popular.map((p) => (<PopularCard key={p.id} product={p} />))}</div>
          ) : (
            <div className="empty empty-dark">New products are on the way.</div>
          )}
          <div className="h-center reveal"><Link href="/products" className="btn btn-ghost">See all products</Link></div>
        </div>
      </section>

      {/* 5. Videos from product pages */}
      {videos.length > 0 && (
        <section className="wrap h-section">
          <div className="h-head reveal">
            <h2>Watch <strong>&amp; learn</strong></h2>
            <p>See products in action before you buy. Tap a video to open the product.</p>
          </div>
          <div className="h-videos">
            {videos.map(({ p, id }) => (
              <Link key={id} href={`/products/${p.id}`} className="h-video reveal">
                <img src={youtubeThumb(id)} alt="" loading="lazy" />
                <span className="h-video-play" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>
                <span className="h-video-name">{p.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. Two feature panels */}
      <section className="wrap h-section h-features">
        <div className="h-feature h-feature-photo reveal">
          <img src="/images/feature-clownfish.jpg" alt="" loading="lazy" />
          <div className="h-feature-text">
            <h2>Not sure what <strong>you need</strong>?</h2>
            <p>Message our reef experts on WhatsApp. Tell us about your tank and we will recommend the right products.</p>
            <a className="btn btn-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need advice for my reef tank.')}`} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
          </div>
        </div>
        <div className="h-feature h-feature-solid reveal">
          <div className="h-feature-text">
            <h2>Track every <strong>order</strong></h2>
            <p>Create a free account to save your delivery details, follow your order status and order again in one tap.</p>
            <Link className="btn btn-pink" href="/account">Create an account</Link>
          </div>
        </div>
      </section>

      {/* 7. Guides */}
      <section className="h-light">
        <div className="wrap h-section">
          <div className="h-head reveal">
            <h2>Latest <strong>guides</strong></h2>
            <p>Practical reef-keeping advice, written for beginners and experienced aquarists.</p>
          </div>
          <div className="h-guides">
            {guides.map((g) => (
              <article className="h-guide reveal" key={g.title}>
                <span className="h-guide-tag">{g.tag}</span>
                <h3><Link href="#">{g.title}</Link></h3>
                <p>{g.text}</p>
                <Link href="#" className="h-guide-more">Read more <Arrow /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Newsletter */}
      <section className="h-news">
        <div className="wrap h-news-inner reveal">
          <div>
            <h2>Be the first to hear about <strong>deals</strong></h2>
            <p>Offers, new arrivals and reef-keeping tips. No spam.</p>
          </div>
          <form className="h-news-form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="news-email" className="sr-only">Email</label>
            <input id="news-email" type="email" placeholder="Your email address" />
            <button className="btn btn-pink" type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}
