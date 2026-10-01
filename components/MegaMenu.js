'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CATALOG, categoryHref } from '@/lib/catalog';
import { useStore } from '@/lib/store';
import { WHATSAPP_NUMBER } from '@/lib/config';
import ProductImage from './ProductImage';

const quickLinks = [
  { label: 'Deals', href: '/products?sale=1', strong: true },
  { label: 'New arrivals', href: '/products?sort=new', strong: true },
  { label: 'All products', href: '/products' },
  { label: 'My account', href: '/account' },
  { label: 'Ask us on WhatsApp', href: `https://wa.me/${WHATSAPP_NUMBER}`, external: true },
];

const Chevron = ({ dir = 'right' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={{ transform: dir === 'down' ? 'rotate(90deg)' : dir === 'up' ? 'rotate(-90deg)' : 'none' }}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

function QuickLink({ link }) {
  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className="ql">{link.label}</a>
  ) : (
    <Link href={link.href} className={link.strong ? 'ql ql-strong' : 'ql'}>{link.label}</Link>
  );
}

export default function MegaMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0); // desktop: hovered category
  const [expanded, setExpanded] = useState(null); // mobile: opened category
  const pathname = usePathname();
  const params = useSearchParams();
  const ref = useRef(null);
  const { products } = useStore();

  // Close whenever the page changes.
  useEffect(() => setOpen(false), [pathname, params]);

  // Close on Escape or a click outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    document.body.classList.add('menu-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      document.body.classList.remove('menu-open');
    };
  }, [open]);

  const cat = CATALOG[active];
  const pick = products.find((p) => p.category === cat.name && p.image) || products.find((p) => p.category === cat.name);

  return (
    <div className="mm" ref={ref}>
      <button type="button" className="mm-toggle" aria-expanded={open} aria-controls="mega-menu" onClick={() => setOpen(!open)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        Menu
      </button>

      {open && (
        <div id="mega-menu" className="mm-panel">
          {/* Mobile header inside the full-screen menu */}
          <div className="mm-mobile-head">
            <strong>Menu</strong>
            <button type="button" className="mm-close" aria-label="Close menu" onClick={() => setOpen(false)}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <nav className="mm-quick" aria-label="Quick links">
            <span className="mm-quick-title">Quick links</span>
            {quickLinks.map((l) => (<QuickLink key={l.label} link={l} />))}
          </nav>

          {/* Desktop: category list + flyout */}
          <ul className="mm-cats">
            {CATALOG.map((c, i) => (
              <li key={c.name}>
                <Link
                  href={categoryHref(c.name)}
                  className={i === active ? 'mm-cat on' : 'mm-cat'}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <span>{c.name}</span>
                  <span className="mm-chev"><Chevron /></span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mm-fly">
            <div className="mm-subs">
              <Link href={categoryHref(cat.name)} className="mm-subs-title">{cat.name}</Link>
              {cat.subs.map((s) => (<Link key={s} href={categoryHref(cat.name, s)}>{s}</Link>))}
              <Link href={categoryHref(cat.name)} className="mm-all">Shop all {cat.name}</Link>
            </div>
            <div className="mm-feature">
              {pick ? (
                <Link href={`/products/${pick.id}`} className="mm-feature-card">
                  <ProductImage product={pick} />
                  <small>Popular in {cat.name}</small>
                  <strong>{pick.name}</strong>
                </Link>
              ) : (
                <div className="mm-feature-card mm-feature-empty">
                  <small>{cat.name}</small>
                  <strong>New products coming soon</strong>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: accordion */}
          <ul className="mm-acc">
            {CATALOG.map((c) => {
              const isOpen = expanded === c.name;
              return (
                <li key={c.name}>
                  <div className="mm-acc-row">
                    <Link href={categoryHref(c.name)}>{c.name}</Link>
                    <button
                      type="button"
                      aria-label={`${isOpen ? 'Hide' : 'Show'} ${c.name} subcategories`}
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : c.name)}
                    >
                      <Chevron dir={isOpen ? 'up' : 'down'} />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="mm-acc-subs">
                      {c.subs.map((s) => (<Link key={s} href={categoryHref(c.name, s)}>{s}</Link>))}
                      <Link href={categoryHref(c.name)} className="mm-all">Shop all {c.name}</Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
