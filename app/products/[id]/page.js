'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import ProductImage from '@/components/ProductImage';

export default function ProductPage() {
  const { id } = useParams();
  const { products, ready, addToCart } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="wrap section">
        {ready ? (<><h1>Product not found</h1><p>This product may have been removed. <Link href="/products">Browse all products</Link></p></>) : 'Loading…'}
      </div>
    );
  }

  const onSale = product.salePrice && product.salePrice < product.price;
  const stock = Number(product.stock);

  return (
    <div className="wrap section">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / <span>{product.name}</span>
      </nav>
      <div className="pdp">
        <div className="pdp-img"><ProductImage product={product} /></div>
        <div className="pdp-info">
          <div className="card-brand">{product.brand}</div>
          <h1>{product.name}</h1>
          <div className="pdp-price">
            <strong>{formatPrice(finalPrice(product))}</strong>
            {onSale && <s>{formatPrice(product.price)}</s>}
          </div>
          <p className={stock > 0 ? 'stock in' : 'stock out'}>
            {stock > 0 ? (stock <= 5 ? `Only ${stock} left in stock` : 'In stock') : 'Out of stock'}
          </p>
          <div className="pdp-buy">
            <label className="sr-only" htmlFor="qty">Quantity</label>
            <input id="qty" type="number" min="1" max={Math.max(stock, 1)} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
            <button className="btn btn-dark" disabled={stock <= 0} onClick={() => { addToCart(product.id, qty); setAdded(true); }}>
              Add to cart
            </button>
          </div>
          {added && <p className="notice">Added to your cart. <Link href="/cart">View cart</Link></p>}
          <h2>Description</h2>
          <p className="pdp-desc">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
