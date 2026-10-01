'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore, finalPrice } from '@/lib/store';
import { CATEGORIES } from '@/lib/seed';
import ProductCard from '@/components/ProductCard';

function Listing() {
  const params = useSearchParams();
  const router = useRouter();
  const { products, ready, loadError } = useStore();
  const q = (params.get('q') || '').toLowerCase();
  const category = params.get('category') || '';
  const sale = params.get('sale') === '1';
  const sort = params.get('sort') || 'featured';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params.toString());
    value ? next.set(key, value) : next.delete(key);
    router.push(`/products?${next.toString()}`);
  };

  let list = products.filter((p) => {
    if (category && p.category !== category) return false;
    if (sale && !(p.salePrice && p.salePrice < p.price)) return false;
    if (q && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
  if (sort === 'low') list = [...list].sort((a, b) => finalPrice(a) - finalPrice(b));
  if (sort === 'high') list = [...list].sort((a, b) => finalPrice(b) - finalPrice(a));
  if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  const title = sale ? 'Deals' : category || (q ? `Results for "${params.get('q')}"` : 'All products');

  return (
    <div className="wrap listing">
      <aside className="filters" aria-label="Filters">
        <h2>Category</h2>
        <button className={!category ? 'filter on' : 'filter'} onClick={() => setParam('category', '')}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={category === c ? 'filter on' : 'filter'} onClick={() => setParam('category', c)}>{c}</button>
        ))}
        <label className="check">
          <input type="checkbox" checked={sale} onChange={(e) => setParam('sale', e.target.checked ? '1' : '')} />
          On sale only
        </label>
      </aside>
      <section>
        <div className="section-head">
          <h1>{title}</h1>
          <label className="sort">
            Sort by
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
        <p className="muted">{list.length} products</p>
        {!ready ? (
          <div className="empty">Loading products…</div>
        ) : loadError ? (
          <div className="empty">{loadError}</div>
        ) : list.length ? (
          <div className="grid-products">{list.map((p) => (<ProductCard key={p.id} product={p} />))}</div>
        ) : (
          <div className="empty">No products match these filters. Try another category or clear the search.</div>
        )}
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="wrap section">Loading products…</div>}>
      <Listing />
    </Suspense>
  );
}
