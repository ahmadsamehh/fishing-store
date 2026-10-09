'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import ProductMedia from '@/components/ProductMedia';
import QtyInput from '@/components/QtyInput';
import ProductCard from '@/components/ProductCard';
import { categoryHref } from '@/lib/catalog';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
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

  // Adds to cart and goes straight to checkout, so every order is saved
  // with delivery details and shows up in the admin panel.
  const buyNow = () => {
    addToCart(product.id, qty, { silent: true });
    router.push('/checkout');
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
            <button className="btn btn-ghost btn-on-dark" disabled={stock <= 0} onClick={buyNow}>
              Buy now
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
