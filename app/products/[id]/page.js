'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import ProductImage from '@/components/ProductImage';
import { WHATSAPP_NUMBER } from '@/lib/config';
import QtyInput from '@/components/QtyInput';
import { categoryHref } from '@/lib/catalog';

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

  const orderOnWhatsApp = () => {
    const lines = [
      'Hi, I want to buy this:',
      '',
      `Product: ${product.name}`,
      product.brand ? `Brand: ${product.brand}` : null,
      `Price: ${formatPrice(finalPrice(product))}`,
      `Quantity: ${qty}`,
      `Link: ${window.location.href}`,
    ].filter((l) => l !== null);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="wrap section">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href={categoryHref(product.category)}>{product.category}</Link> /{' '}
        {product.subcategory && (<><Link href={categoryHref(product.category, product.subcategory)}>{product.subcategory}</Link> /{' '}</>)}
        <span>{product.name}</span>
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
            <QtyInput id="qty" value={qty} onChange={setQty} max={Math.max(stock, 1)} />
            <button className="btn btn-dark" disabled={stock <= 0} onClick={() => { addToCart(product.id, qty); setAdded(true); }}>
              Add to cart
            </button>
          </div>
          <button className="btn btn-whatsapp" disabled={stock <= 0} onClick={orderOnWhatsApp}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>
            Order on WhatsApp
          </button>
          {added && <p className="notice">Added to your cart. <Link href="/cart">View cart</Link></p>}
          <h2>Description</h2>
          <p className="pdp-desc">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
