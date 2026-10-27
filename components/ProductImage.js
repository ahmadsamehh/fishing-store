'use client';
import { thumbOf } from '@/lib/images';

// size="sm" (default) loads the light card version; size="lg" the full photo (product page).
export default function ProductImage({ product, ratio = '1 / 1', size = 'sm', eager = false }) {
  if (product.image) {
    const src = size === 'lg' ? product.image : thumbOf(product.image);
    return (
      <img
        className="pimg"
        src={src}
        alt={product.name}
        style={{ aspectRatio: ratio }}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        // Older uploads have no small version: fall back to the full photo.
        onError={(e) => { if (e.currentTarget.src !== new URL(product.image, window.location.href).href) e.currentTarget.src = product.image; }}
      />
    );
  }
  return (
    <div className="pimg pimg-empty" style={{ aspectRatio: ratio }}>
      No image yet
    </div>
  );
}
