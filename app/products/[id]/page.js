'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import ProductMedia from '@/components/ProductMedia';
import { WHATSAPP_NUMBER } from '@/lib/config';
import QtyInput from '@/components/QtyInput';
import ProductCard from '@/components/ProductCard';
import { categoryHref } from '@/lib/catalog';

export default function ProductPage() {
  const { id } = useParams();
  const { products, ready, addToCart } = useStore();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc');
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

  const lead = (product.description || '').split(/(?<=[.!?])\s+/)[0];
  const similar = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, 4);

  return (
    <>
      <div className="wrap crumbs-bar">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href={categoryHref(product.category)}>{product.category}</Link> /{' '}
          {product.subcategory && (<><Link href={categoryHref(product.category, product.subcategory)}>{product.subcategory}</Link> /{' '}</>)}
          <span>{product.name}</span>
        </nav>
      </div>

      <section className="pdp-hero">
        <div className="wrap pdp-hero-inner">
          <div className="pdp-hero-media">
            <ProductMedia product={product} />
          </div>
          <div className="pdp-hero-info">
            {product.brand && <div className="pdp-brand">{product.brand}</div>}
            <h1>{product.name}</h1>
            {lead && <p className="pdp-lead">{lead}</p>}
            <hr />
            <div className="pdp-price">
              <strong>{formatPrice(finalPrice(product))}</strong>
              {onSale && <s>{formatPrice(product.price)}</s>}
              {onSale && <span className="pdp-save">Save {formatPrice(product.price - product.salePrice)}</span>}
            </div>
            <p className={stock > 0 ? 'stock in' : 'stock out'}>
              <span className="stock-dot" aria-hidden="true" />
              {stock > 0 ? (stock <= 5 ? `Only ${stock} left in stock` : 'In stock') : 'Out of stock'}
            </p>
            <hr />
            <div className="pdp-buy">
              <QtyInput id="qty" value={qty} onChange={setQty} max={Math.max(stock, 1)} />
              <button className="btn btn-pink" disabled={stock <= 0} onClick={() => addToCart(product.id, qty)}>
                Add to cart
              </button>
            </div>
            <button className="btn btn-whatsapp btn-on-dark" disabled={stock <= 0} onClick={orderOnWhatsApp}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>
              Order on WhatsApp
            </button>
          </div>
        </div>
      </section>

      <section className="wrap pdp-details reveal">
        <div className="tabs-line" role="tablist" aria-label="Product information">
          <button role="tab" id="tab-desc" aria-controls="panel-desc" aria-selected={tab === 'desc'} className={tab === 'desc' ? 'on' : ''} onClick={() => setTab('desc')}>Description</button>
          <button role="tab" id="tab-info" aria-controls="panel-info" aria-selected={tab === 'info'} className={tab === 'info' ? 'on' : ''} onClick={() => setTab('info')}>Additional information</button>
        </div>
        {tab === 'desc' ? (
          <div id="panel-desc" role="tabpanel" aria-labelledby="tab-desc" className="tab-panel" key="desc">
            <h2>{product.name}</h2>
            {(product.description || 'No description yet.').split(/\n+/).map((para, i) => (<p key={i}>{para}</p>))}
          </div>
        ) : (
          <div id="panel-info" role="tabpanel" aria-labelledby="tab-info" className="tab-panel" key="info">
            <dl className="spec">
              {product.brand && (<><dt>Brand</dt><dd>{product.brand}</dd></>)}
              <dt>Category</dt><dd>{product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}</dd>
              <dt>Availability</dt><dd>{stock > 0 ? 'In stock' : 'Out of stock'}</dd>
              <dt>Delivery</dt><dd>Across Egypt. Cost confirmed on WhatsApp.</dd>
              {product.youtubeUrl && (<><dt>Video</dt><dd><a href={product.youtubeUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></dd></>)}
            </dl>
          </div>
        )}
      </section>

      {similar.length > 0 && (
        <section className="wrap section similar reveal">
          <div className="section-head"><h2>Similar products</h2><Link href={categoryHref(product.category)}>See all {product.category}</Link></div>
          <div className="grid-products">
            {similar.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}
    </>
  );
}
