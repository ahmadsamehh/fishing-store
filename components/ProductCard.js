'use client';
import Link from 'next/link';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import ProductImage from './ProductImage';

export default function ProductCard({ product }) {
  const { addToCart } = useStore();
  const onSale = product.salePrice && product.salePrice < product.price;
  const soldOut = Number(product.stock) <= 0;
  return (
    <article className="card reveal">
      <Link href={`/products/${product.id}`} className="card-img">
        <ProductImage product={product} />
        {onSale && <span className="badge">Sale</span>}
        {product.youtubeUrl && (
          <span className="badge-video" title="Has a video">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            Video
          </span>
        )}
      </Link>
      <div className="card-brand">{product.brand}</div>
      <h3 className="card-name">
        <Link href={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      <div className="card-price">
        <strong>{formatPrice(finalPrice(product))}</strong>
        {onSale && <s>{formatPrice(product.price)}</s>}
      </div>
      <button className="btn btn-dark card-btn" disabled={soldOut} onClick={() => addToCart(product.id)}>
        {soldOut ? 'Out of stock' : 'Add to cart'}
      </button>
    </article>
  );
}
