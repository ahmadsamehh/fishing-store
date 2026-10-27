'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { categoryHref } from '@/lib/catalog';
import AdminGate from '@/components/AdminGate';

const Icon = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const UP = 'M12 19V5M5 12l7-7 7 7';
const DOWN = 'M12 5v14M19 12l-7 7-7-7';
const EDIT = 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z';
const TRASH = 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14';

// A name that can be renamed in place: shows the text, or an input while editing.
function EditableName({ value, onSave, className, label }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    if (!text.trim() || text.trim() === value) { setEditing(false); setText(value); return; }
    setBusy(true);
    const ok = await onSave(text.trim());
    setBusy(false);
    if (ok) setEditing(false);
  };
  if (!editing) {
    return (
      <span className={`cat-name ${className || ''}`}>
        <span>{value}</span>
        <button type="button" className="icon-act" onClick={() => { setText(value); setEditing(true); }} aria-label={`Rename ${label} ${value}`} title="Rename"><Icon d={EDIT} /></button>
      </span>
    );
  }
  return (
    <form className="cat-rename" onSubmit={save}>
      <label className="sr-only" htmlFor={`rn-${value}`}>New name</label>
      <input id={`rn-${value}`} value={text} onChange={(e) => setText(e.target.value)} autoFocus disabled={busy} />
      <button className="btn btn-pink btn-sm" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      <button className="btn btn-outline btn-sm" type="button" onClick={() => { setEditing(false); setText(value); }} disabled={busy}>Cancel</button>
    </form>
  );
}

function CategoryCard({ cat, index, total, count, subCounts, act }) {
  const [newSub, setNewSub] = useState('');
  const addSub = async (e) => {
    e.preventDefault();
    if (!newSub.trim()) return;
    if (await act(`Added “${newSub.trim()}” to ${cat.name}.`, 'adminAddSub', cat.name, newSub)) setNewSub('');
  };
  return (
    <article className="cat-card">
      <header className="cat-head">
        <div className="cat-order">
          <button type="button" className="icon-act" disabled={index === 0} onClick={() => act('', 'adminMoveCategory', cat.name, -1)} aria-label={`Move ${cat.name} up`} title="Move up"><Icon d={UP} /></button>
          <button type="button" className="icon-act" disabled={index === total - 1} onClick={() => act('', 'adminMoveCategory', cat.name, 1)} aria-label={`Move ${cat.name} down`} title="Move down"><Icon d={DOWN} /></button>
        </div>
        <div className="cat-title">
          <EditableName value={cat.name} label="category" className="lg" onSave={(n) => act(`Renamed “${cat.name}” to “${n}”. Its products moved with it.`, 'adminRenameCategory', cat.name, n)} />
          <Link href={categoryHref(cat.name)} target="_blank" className="muted cat-count">{count} {count === 1 ? 'product' : 'products'}</Link>
        </div>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          disabled={count > 0}
          title={count > 0 ? 'Move or delete its products first' : 'Delete category'}
          onClick={() => window.confirm(`Delete the category “${cat.name}” and its subcategories?`) && act(`Deleted “${cat.name}”.`, 'adminDeleteCategory', cat.name)}
        >
          <Icon d={TRASH} /> Delete
        </button>
      </header>

      <div className="cat-subs">
        <span className="cat-label">Subcategories</span>
        {cat.subs.length === 0 && <p className="muted small">No subcategories yet.</p>}
        <ul>
          {cat.subs.map((s, i) => {
            const n = subCounts[s] || 0;
            return (
              <li key={s}>
                <EditableName value={s} label="subcategory" onSave={(name) => act(`Renamed “${s}” to “${name}”.`, 'adminRenameSub', cat.name, s, name)} />
                <span className="muted small">{n} {n === 1 ? 'product' : 'products'}</span>
                <span className="sub-acts">
                  <button type="button" className="icon-act" disabled={i === 0} onClick={() => act('', 'adminMoveSub', cat.name, s, -1)} aria-label={`Move ${s} up`} title="Move up"><Icon d={UP} /></button>
                  <button type="button" className="icon-act" disabled={i === cat.subs.length - 1} onClick={() => act('', 'adminMoveSub', cat.name, s, 1)} aria-label={`Move ${s} down`} title="Move down"><Icon d={DOWN} /></button>
                  <button
                    type="button"
                    className="icon-act danger"
                    disabled={n > 0}
                    title={n > 0 ? 'Move its products to another subcategory first' : 'Delete subcategory'}
                    aria-label={`Delete ${s}`}
                    onClick={() => window.confirm(`Delete the subcategory “${s}”?`) && act(`Deleted “${s}”.`, 'adminDeleteSub', cat.name, s)}
                  >
                    <Icon d={TRASH} />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
        <form className="cat-add-sub" onSubmit={addSub}>
          <label className="sr-only" htmlFor={`ns-${cat.name}`}>New subcategory for {cat.name}</label>
          <input id={`ns-${cat.name}`} placeholder="New subcategory" value={newSub} onChange={(e) => setNewSub(e.target.value)} />
          <button className="btn btn-outline btn-sm" type="submit" disabled={!newSub.trim()}>Add</button>
        </form>
      </div>
    </article>
  );
}

function CategoriesPanel() {
  const store = useStore();
  const { catalog, products } = store;
  const [newCat, setNewCat] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Runs one of the store's admin actions and shows the result.
  const act = async (okText, fn, ...args) => {
    setError('');
    setMessage('');
    const err = await store[fn](...args);
    if (err) { setError(err); return false; }
    if (okText) setMessage(okText);
    return true;
  };

  const addCategory = async (e) => {
    e.preventDefault();
    const name = newCat.trim();
    if (!name) return;
    if (catalog.some((c) => c.name.toLowerCase() === name.toLowerCase())) return setError('That category already exists.');
    if (await act(`Added “${name}”. It now shows in the menu. Add subcategories below if you need them.`, 'adminAddCategory', name)) setNewCat('');
  };

  const countIn = (cat) => products.filter((p) => p.category === cat).length;
  const subCountsOf = (cat) => products.filter((p) => p.category === cat).reduce((m, p) => ({ ...m, [p.subcategory]: (m[p.subcategory] || 0) + 1 }), {});

  return (
    <div className="adm-page">
      <div className="section-head">
        <h1>Categories</h1>
      </div>
      <p className="muted cat-intro">These are the store's menu categories. Changes show on the store straight away: in the menu, the filters, the footer and the Add product form.</p>

      <form className="cat-add" onSubmit={addCategory}>
        <label htmlFor="new-cat">Add a category</label>
        <div>
          <input id="new-cat" placeholder="For example: Lighting" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
          <button className="btn btn-pink" type="submit" disabled={!newCat.trim()}>Add category</button>
        </div>
      </form>

      {message && <p className="notice" role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <div className="cat-list">
        {catalog.map((c, i) => (
          <CategoryCard key={c.name} cat={c} index={i} total={catalog.length} count={countIn(c.name)} subCounts={subCountsOf(c.name)} act={act} />
        ))}
      </div>
      <p className="muted small">A category or subcategory can only be deleted when no products are in it. Renaming moves its products automatically.</p>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <AdminGate>
      <CategoriesPanel />
    </AdminGate>
  );
}
