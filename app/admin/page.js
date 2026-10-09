'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore, formatPrice } from '@/lib/store';
import AdminGate from '@/components/AdminGate';
import { CATEGORIES, subsOf } from '@/lib/catalog';
import ProductImage from '@/components/ProductImage';

const EMPTY = { name: '', brand: '', category: CATEGORIES[0], subcategory: '', price: '', salePrice: '', stock: '', featured: false, image: '', description: '' };

// Shrinks a photo before upload so pages stay fast.
function resizeImage(file, max = 1200) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => reject(new Error('That file is not an image. Pick a JPG or PNG.'));
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('The photo could not be prepared.'))), 'image/jpeg', 0.85);
    };
    img.src = url;
  });
}

function ProductForm({ initial, onSave, onCancel }) {
  const { uploadImage } = useStore();
  const [form, setForm] = useState({ ...EMPTY, ...initial, salePrice: initial?.salePrice ?? '' });
  const [newPhoto, setNewPhoto] = useState(null); // { blob, preview }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await resizeImage(file);
      setNewPhoto({ blob, preview: URL.createObjectURL(blob) });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Add a product name.');
    if (!(Number(form.price) > 0)) return setError('Add a price greater than 0.');
    if (form.salePrice !== '' && Number(form.salePrice) >= Number(form.price)) return setError('The sale price must be lower than the regular price.');
    setBusy(true);
    setError('');
    try {
      const image = newPhoto ? await uploadImage(newPhoto.blob) : form.image;
      await onSave({
        ...form,
        image,
        name: form.name.trim(),
        brand: form.brand.trim(),
        price: Number(form.price),
        salePrice: form.salePrice === '' ? null : Number(form.salePrice),
        stock: Number(form.stock) || 0,
      }, initial?.image && image !== initial.image ? initial.image : null);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const preview = { ...form, image: newPhoto ? newPhoto.preview : form.image };

  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-labelledby="form-title">
      <form className="modal" onSubmit={submit}>
        <h2 id="form-title">{initial?.id ? 'Edit product' : 'Add product'}</h2>
        <div className="form-grid">
          <label className="full">Product name<input value={form.name} onChange={set('name')} /></label>
          <label>Brand<input value={form.brand} onChange={set('brand')} /></label>
          <label>Category
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}>
              {!CATEGORIES.includes(form.category) && form.category && <option value={form.category}>{form.category} (old)</option>}
              {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
            </select>
          </label>
          <label>Subcategory
            <select value={form.subcategory || ''} onChange={set('subcategory')}>
              <option value="">None</option>
              {subsOf(form.category).map((s) => (<option key={s}>{s}</option>))}
            </select>
          </label>
          <label>Price (EGP)<input type="number" min="0" step="any" value={form.price} onChange={set('price')} /></label>
          <label>Sale price (optional)<input type="number" min="0" step="any" value={form.salePrice} onChange={set('salePrice')} /></label>
          <label>Stock quantity<input type="number" min="0" value={form.stock} onChange={set('stock')} /></label>
          <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} />Show in best sellers on the homepage</label>
          <label className="full">Description<textarea rows="4" value={form.description} onChange={set('description')} /></label>
          <div className="full image-field">
            <div className="image-preview"><ProductImage product={preview} /></div>
            <div>
              <label className="btn btn-outline">
                {preview.image ? 'Change photo' : 'Upload photo'}
                <input type="file" accept="image/*" onChange={pickImage} className="sr-only" />
              </label>
              {preview.image && (
                <button type="button" className="link-btn" onClick={() => { setNewPhoto(null); setForm({ ...form, image: '' }); }}>Remove photo</button>
              )}
            </div>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-dark" disabled={busy}>
            {busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Panel() {
  const { products, ready, loadError, addProduct, updateProduct, deleteProduct, removeImage } = useStore();
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const list = products.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q.toLowerCase()));
  const outOfStock = products.filter((p) => Number(p.stock) <= 0).length;

  const save = async (data, oldImage) => {
    if (editing?.id) {
      await updateProduct(editing.id, data);
      setMessage(`Saved changes to “${data.name}”.`);
    } else {
      await addProduct(data);
      setMessage(`Added “${data.name}”.`);
    }
    if (oldImage) await removeImage(oldImage);
    setError('');
    setEditing(null);
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    try {
      await deleteProduct(p);
      setMessage(`Deleted “${p.name}”.`);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="adm-page">
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
      {(error || loadError) && <p className="error">{error || loadError}</p>}
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
                <td>{p.category}{p.subcategory && <span className="muted t-sub">{p.subcategory}</span>}</td>
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
        {ready && !list.length && <div className="empty">No products found. Add one with the button above.</div>}
        {!ready && <div className="empty">Loading products…</div>}
      </div>

      {editing && <ProductForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGate>
      <Panel />
    </AdminGate>
  );
}
