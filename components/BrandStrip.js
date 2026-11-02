'use client';
import Link from 'next/link';
import { brandHref } from '@/lib/brands';
import { thumbOf } from '@/lib/images';

// "Shop by brand": a strip of brands that slides slowly by itself.
// It stops while the customer points at it or touches it, and stays still for people
// who turned on "reduce motion". New brands appear automatically from the products.
export default function BrandStrip({ brands }) {
  if (brands.length < 2) return null;
  // Repeat the list so the strip can loop without a gap.
  const loop = [...brands, ...brands, ...(brands.length < 6 ? brands : []), ...(brands.length < 6 ? brands : [])];
  const half = loop.length / 2;
  return (
    <div className="bs" style={{ '--bs-duration': `${Math.max(50, brands.length * 7)}s` }}>
      <div className="bs-track">
        {loop.map((b, i) => (
          <Link key={`${b.key}-${i}`} href={brandHref(b.name)} className="bs-card" aria-hidden={i >= half ? 'true' : undefined} tabIndex={i >= half ? -1 : undefined}>
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
