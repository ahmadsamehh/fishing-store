'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { brandHref } from '@/lib/brands';
import { thumbOf } from '@/lib/images';

// "Shop by brand".
// On computers: the strip slides slowly by itself and pauses while the mouse is over it.
// On phones and tablets: the customer swipes it left and right; it does not move on its own.
export default function BrandStrip({ brands }) {
  const [touch, setTouch] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const check = () => setTouch(window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches);
    check();
    const mq = window.matchMedia('(hover: none)');
    mq.addEventListener?.('change', check);
    return () => mq.removeEventListener?.('change', check);
  }, []);

  if (brands.length < 2) return null;

  // Swiping: one copy of the list. Sliding by itself: two copies, so the loop has no gap.
  const loop = touch ? brands : [...brands, ...brands, ...(brands.length < 6 ? [...brands, ...brands] : [])];
  const half = loop.length / 2;

  return (
    <div
      className={`bs${touch ? ' bs-swipe' : ''}`}
      ref={ref}
      style={{ '--bs-duration': `${Math.max(20, brands.length * 7)}s` }}
    >
      <div className="bs-track">
        {loop.map((b, i) => (
          <Link
            key={`${b.key}-${i}`}
            href={brandHref(b.name)}
            className="bs-card"
            aria-hidden={!touch && i >= half ? 'true' : undefined}
            tabIndex={!touch && i >= half ? -1 : undefined}
          >
            <span className={`bs-img${b.logo ? ' is-logo' : ''}`}>
              {b.logo ? (
                <img src={b.logo} alt="" loading="lazy" decoding="async" />
              ) : b.product?.image ? (
                <img src={thumbOf(b.product.image)} alt="" loading="lazy" decoding="async" />
              ) : (
                <span>{b.name.charAt(0)}</span>
              )}
            </span>
            <span className="bs-text">
              <strong>{b.name}</strong>
              <small>{b.count} {b.count === 1 ? 'product' : 'products'}</small>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
