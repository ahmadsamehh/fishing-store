'use client';
import Link from 'next/link';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import { categoryHref } from '@/lib/catalog';
import { useCatalog } from '@/lib/useCatalog';
import { perkIcons } from '@/components/Icons';
import ProductImage from '@/components/ProductImage';
import { youtubeId } from '@/lib/youtube';
import { thumbOf } from '@/lib/images';
import { WHATSAPP_NUMBER, PLACEHOLDER_IMAGES } from '@/lib/config';

const perks = [
  { title: 'Delivery across Egypt', sub: 'To every governorate', icon: perkIcons.delivery },
  { title: 'Trusted brands', sub: 'TECO, Sicce and Aquaforest', icon: perkIcons.genuine },
  { title: 'Easy ordering', sub: 'Check out and confirm on WhatsApp', icon: perkIcons.whatsapp },
  { title: 'Reef experts', sub: 'Ask us before you buy', icon: perkIcons.experts },
];

// Category tiles: each shows real products from that category.
// art = product cut-outs in /public/tiles, size lg | md | sm.
const T = (name, size = 'lg') => ({ src: `/tiles/${name}.webp`, size });
const tiles = [
  { category: 'Heating & Cooling', text: 'TECO chillers that keep your reef at a steady temperature, even through an Egyptian summer.', wide: true,
    art: [T('chiller-tk150', 'sm'), T('chiller-tk500', 'md'), T('chiller-tk1000', 'lg')] },
  { category: 'Pumps & Powerheads', text: 'Sicce Multi return pumps, made in Italy.', art: [T('pump-800')] },
  { category: 'Salt & Additives', text: 'Aquaforest Reef Salt and Hybrid Pro Salt in 22 kg buckets.', art: [T('salt-hybrid', 'md'), T('salt-reef', 'lg')] },
  { category: 'Filtration', text: 'Solid filters in every size for clear, clean water.', art: [T('filters')] },
  { category: 'Used', text: 'Pre-owned equipment at lower prices. New items added regularly.', badge: 'Pre-owned', art: [T('chiller-tk150', 'md')] },
  { deals: true, title: 'Deals', text: 'Discounts on selected products. Updated every week.', wide: true, badge: '%',
    art: [T('pump-800', 'sm'), T('salt-reef', 'md'), T('chiller-tk500', 'lg')] },
  { all: true, title: 'All products', text: 'Browse the full range, filter by category and sort by price.',
    art: [T('salt-hybrid', 'sm'), T('chiller-tk1000', 'lg'), T('pump-800', 'sm')] },
];

function TileArt({ art, badge }) {
  return (
    <span className={`h-tile-art n-${art.length}`} aria-hidden="true">
      {art.map((a, i) => (<img key={i} src={a.src} alt="" loading="lazy" className={`s-${a.size}`} />))}
      {badge && <span className={`h-tile-badge${badge === '%' ? ' pct' : ''}`}>{badge}</span>}
    </span>
  );
}

// How ordering works (same steps as the /how-to-order page)
const steps = [
  { n: '1', title: 'Add to cart', text: 'Pick your products and quantities. Your cart is saved, even if you leave.' },
  { n: '2', title: 'Check out', text: 'Enter your delivery details once. With an account they are filled in for you next time.' },
  { n: '3', title: 'Send on WhatsApp', text: 'Your full order opens in WhatsApp with an order number. Just press send.' },
  { n: '4', title: 'We confirm and deliver', text: 'We agree the delivery fee and time with you, then track the order to your door.' },
];

// True when a product has a real photo (not empty, not a "photo coming soon" placeholder).
const hasRealPhoto = (p) => p.image && !PLACEHOLDER_IMAGES.some((f) => p.image.endsWith(`/${f}`));
const inStock = (p) => Number(p.stock) > 0;

// Most popular: one product per category first, so the section shows the range of the store.
// Products that are in stock, have a real photo and are ticked as best sellers come first.
function pickPopular(products, count = 4) {
  const score = (p) => (inStock(p) ? 4 : 0) + (hasRealPhoto(p) ? 2 : 0) + (p.featured ? 1 : 0);
  const eligible = products.filter((p) => inStock(p) && hasRealPhoto(p));
  const ranked = [...eligible].sort((a, b) => score(b) - score(a));
  const picked = [];
  const usedCats = new Set();
  for (const p of ranked) {
    if (picked.length >= count) break;
    if (!usedCats.has(p.category)) { picked.push(p); usedCats.add(p.category); }
  }
  for (const p of ranked) {
    if (picked.length >= count) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked;
}

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
  const { categories: CATEGORIES } = useCatalog();
  // Hand-designed tiles show only while their category exists; new categories appear as chips.
  const catTiles = tiles.filter((t) => t.category && CATEGORIES.includes(t.category));
  // On wide screens the grid has 3 columns. Deals and All products resize so the last row is always full.
  let pos = catTiles.reduce((n, t) => n + (t.wide ? 2 : 1), 0) % 3;
  const dealsSpan = 3 - pos >= 2 ? 2 : 1;
  pos = (pos + dealsSpan) % 3;
  const allSpan = pos === 0 ? 3 : 3 - pos;
  const shownTiles = [
    ...catTiles,
    { ...tiles.find((t) => t.deals), wide: dealsSpan > 1, span: dealsSpan },
    { ...tiles.find((t) => t.all), wide: allSpan > 1, span: allSpan },
  ];
  const popular = pickPopular(products);

  // One tile per unique video, newest products first.
  const seen = new Set();
  const videos = products
    .map((p) => ({ p, id: youtubeId(p.youtubeUrl) }))
    .filter(({ p, id }) => id && hasRealPhoto(p) && !seen.has(id) && seen.add(id))
    .slice(0, 6);

  return (
    <>
      {/* 1. Full-width photo hero */}
      <section className="h-hero">
        <img className="h-hero-bg" src="/images/hero-reef-tank.jpg" alt="" />
        <div className="wrap h-hero-inner">
          <h1>Built for <strong>reefers</strong>.<br />Delivered across <strong>Egypt</strong>.</h1>
          <p>Chillers, pumps, filtration and salt from trusted brands, with advice from people who actually keep reefs.</p>
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

      {/* 3. Category tiles with product images */}
      <section id="categories" className="wrap h-section">
        <div className="h-head reveal">
          <h2>Shop by <strong>category</strong></h2>
          <p>Everything for a healthy reef, from the tank to the last drop of additive.</p>
        </div>
        <div className="h-tiles">
          {shownTiles.map((t) => t.deals || t.all ? (
            <Link key={t.title} href={t.deals ? '/products?sale=1' : '/products'} className={`h-tile h-tile-prod reveal ${t.deals ? 'h-tile-deals' : 'h-tile-all'}${t.wide ? ' wide' : ''} span-${t.span}`}>
              <TileArt art={t.art} badge={t.badge} />
              <span className="h-tile-text">
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </span>
              <span className="h-tile-arrow"><Arrow /></span>
            </Link>
          ) : (
            <Link key={t.category} href={categoryHref(t.category)} className={`h-tile h-tile-prod reveal${t.wide ? ' wide' : ''}`}>
              <TileArt art={t.art} badge={t.badge} />
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
            <p>See products in action before you buy. Tap one to open the product and watch.</p>
          </div>
          <div className="h-videos">
            {videos.map(({ p, id }) => (
              <Link key={id} href={`/products/${p.id}`} className="h-video reveal">
                <span className="h-video-bg" aria-hidden="true">
                  <img src={thumbOf(p.image)} alt="" loading="lazy" decoding="async" />
                </span>
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

      {/* 7. How ordering works */}
      <section className="h-light">
        <div className="wrap h-section">
          <div className="h-head reveal">
            <h2>How ordering <strong>works</strong></h2>
            <p>No card needed. You order on the site and confirm on WhatsApp.</p>
          </div>
          <ol className="h-steps">
            {steps.map((st) => (
              <li className="h-step reveal" key={st.n}>
                <span className="h-step-n">{st.n}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </li>
            ))}
          </ol>
          <div className="h-center reveal"><Link href="/how-to-order" className="btn btn-outline">Read the full guide</Link></div>
        </div>
      </section>
    </>
  );
}
