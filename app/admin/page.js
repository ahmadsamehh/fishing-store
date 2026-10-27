'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore, formatPrice } from '@/lib/store';
import AdminGate from '@/components/AdminGate';
import { useCatalog } from '@/lib/useCatalog';
import { resizeToJpeg } from '@/lib/images';
import ProductImage from '@/components/ProductImage';
import { youtubeId } from '@/lib/youtube';

const EMPTY = { name: '', brand: '', category: '', subcategory: '', price: '', salePrice: '', stock: '', featured: false, image: '', description: '', youtubeUrl: '' };

// Shrinks a photo before upload so pages stay fast.
const resizeImage = (file) => resizeToJpeg(file, 1200);

function ProductForm({ initial, onSave, onCancel }) {
  const { uploadImage } = useStore();
  const { categories: CATEGORIES, subsOf } = useCatalog();
  const [form, setForm] = useState({ ...EMPTY, category: CATEGORIES.at(0) || '', ...initial, salePrice: initial?.salePrice ?? '' });
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
    if (form.youtubeUrl && form.youtubeUrl.trim() && !youtubeId(form.youtubeUrl)) return setError('That YouTube link was not recognized. Copy the link from the video page or the Share button.');
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
          <label className="full">YouTube video link (optional)
            <input type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={form.youtubeUrl || ''} onChange={set('youtubeUrl')} />
            <small className="muted">Shows as a swipeable video next to the product photo.</small>
          </label>
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
