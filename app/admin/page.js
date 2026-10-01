'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore, formatPrice } from '@/lib/store';
import { CATEGORIES } from '@/lib/seed';
import ProductImage from '@/components/ProductImage';

const EMPTY = { name: '', brand: '', category: CATEGORIES[0], price: '', salePrice: '', stock: '', featured: false, image: '', description: '' };

// Shrinks a picked photo so it fits in browser storage for the demo.
function resizeImage(file, max = 700) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setForm({ ...form, image: await resizeImage(file) });
    } catch {
      setError('That file could not be read as an image. Pick a JPG or PNG.');
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Add a product name.');
    if (!(Number(form.price) > 0)) return setError('Add a price greater than 0.');
    if (form.salePrice && Number(form.salePrice) >= Number(form.price)) return setError('The sale price must be lower than the regular price.');
    onSave({
      ...form,
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock) || 0,
    });
  };

  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-labelledby="form-title">
      <form className="modal" onSubmit={submit}>
        <h2 id="form-title">{initial?.id ? 'Edit product' : 'Add product'}</h2>
        <div className="form-grid">
          <label className="full">Product name<input value={form.name} onChange={set('name')} /></label>
          <label>Brand<input value={form.brand} onChange={set('brand')} /></label>
          <label>Category
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
            </select>
          </label>
          <label>Price (EGP)<input type="number" min="0" value={form.price} onChange={set('price')} /></label>
          <label>Sale price (optional)<input type="number" min="0" value={form.salePrice ?? ''} onChange={set('salePrice')} /></label>
          <label>Stock quantity<input type="number" min="0" value={form.stock} onChange={set('stock')} /></label>
          <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} />Show in best sellers on the homepage</label>
          <label className="full">Description<textarea rows="4" value={form.description} onChange={set('description')} /></label>
          <div className="full image-field">
            <div className="image-preview"><ProductImage product={form} /></div>
            <div>
              <label className="btn btn-outline">
                {form.image ? 'Change photo' : 'Upload photo'}
                <input type="file" accept="image/*" onChange={pickImage} className="sr-only" />
              </label>
              {form.image && <button type="button" className="link-btn" onClick={() => setForm({ ...form, image: '' })}>Remove photo</button>}
            </div>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-dark">{initial?.id ? 'Save changes' : 'Add product'}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct, resetDemo, saveError } = useStore();
  const [editing, setEditing] = useState(null); // null | {} (new) | product
  const [q, setQ] = useState('');
  const [message, setMessage] = useState('');

  const list = products.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q.toLowerCase()));
  const outOfStock = products.filter((p) => Number(p.stock) <= 0).length;

  const save = (data) => {
    if (editing?.id) {
      updateProduct(editing.id, data);
      setMessage(`Saved changes to “${data.name}”.`);
    } else {
      addProduct(data);
      setMessage(`Added “${data.name}”.`);
    }
    setEditing(null);
  };

  const remove = (p) => {
    if (window.confirm(`Delete “${p.name}”? This cannot be undone.`)) {
      deleteProduct(p.id);
      setMessage(`Deleted “${p.name}”.`);
    }
  };

  return (
    <div className="wrap section admin">
      <div className="demo-note">
        Demo mode: changes are saved in this browser only. Once we connect the database, the same screen will save for everyone.
      </div>
      <div className="section-head">
        <h1>Products</h1>
        <button className="btn btn-dark" onClick={() => setEditing({})}>Add product</button>
      </div>
      <div className="stats">
        <div><strong>{products.length}</strong><span>Products</span></div>
        <div><strong>{outOfStock}</strong><span>Out of stock</span></div>
        <div><strong>{products.filter((p) => p.salePrice).length}</strong><span>On sale</span></div>
      </div>
      {message && <p className="notice">{message}</p>}
      {saveError && <p className="error">{saveError}</p>}
      <label className="sr-only" htmlFor="admin-q">Search products</label>
      <input id="admin-q" className="admin-search" type="search" placeholder="Search by name, brand or category" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="t-product">
                    <div className="t-thumb"><ProductImage product={p} /></div>
                    <div><Link href={`/products/${p.id}`}><strong>{p.name}</strong></Link><span className="muted">{p.brand}</span></div>
                  </div>
                </td>
                <td>{p.category}</td>
                <td>{p.salePrice ? (<><strong>{formatPrice(p.salePrice)}</strong> <s className="muted">{formatPrice(p.price)}</s></>) : formatPrice(p.price)}</td>
                <td><span className={Number(p.stock) > 0 ? 'pill pill-ok' : 'pill pill-out'}>{Number(p.stock) > 0 ? p.stock : 'Out'}</span></td>
                <td className="t-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <div className="empty">No products found. Add one with the button above.</div>}
      </div>

      <button className="link-btn reset" onClick={() => window.confirm('Reset all products to the sample list?') && resetDemo()}>
        Reset to sample products
      </button>

      {editing && <ProductForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  );
}
