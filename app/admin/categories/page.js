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

function CategoryCard({ cat, index, menuIndex, total, count, subCounts, act, open, onToggle, isNew, onRenamed }) {
  const [newSub, setNewSub] = useState('');
  const addSub = async (e) => {
    e.preventDefault();
    if (!newSub.trim()) return;
    if (await act(`Added “${newSub.trim()}” to ${cat.name}.`, 'adminAddSub', cat.name, newSub)) setNewSub('');
  };
  const subsText = `${cat.subs.length} ${cat.subs.length === 1 ? 'subcategory' : 'subcategories'}`;
  return (
    <article className={`cat-card${open ? ' open' : ''}${isNew ? ' is-new' : ''}`} id={`cat-${index}`}>
      <header className="cat-head">
        <button type="button" className="cat-toggle" aria-expanded={open} onClick={onToggle}>
          <span className="cat-toggle-text">
            <span className="cat-toggle-name">{cat.name}{isNew && <span className="cat-new">New</span>}</span>
            <span className="muted cat-toggle-meta">{count} {count === 1 ? 'product' : 'products'} · {subsText} · Menu #{menuIndex + 1}</span>
          </span>
          <svg className="cat-chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </header>

      {open && (
        <div className="cat-body">
          <div className="cat-body-top">
            <EditableName value={cat.name} label="category" className="lg" onSave={async (n) => {
              const ok = await act(`Renamed “${cat.name}” to “${n}”. Its products moved with it.`, 'adminRenameCategory', cat.name, n);
              if (ok) onRenamed(cat.name, n);
              return ok;
            }} />
            <span className="cat-body-acts">
              <Link href={categoryHref(cat.name)} target="_blank" className="cat-count">View in store</Link>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={count > 0}
                title={count > 0 ? 'Move or delete its products first' : 'Delete category'}
                onClick={() => window.confirm(`Delete the category “${cat.name}” and its subcategories?`) && act(`Deleted “${cat.name}”.`, 'adminDeleteCategory', cat.name)}
              >
                <Icon d={TRASH} /> Delete
              </button>
            </span>
          </div>
          <div className="cat-pos">
            <span>Position in the store menu: <strong>{menuIndex + 1}</strong> of {total}</span>
            <span className="cat-pos-acts">
              <button type="button" className="icon-act" disabled={menuIndex === 0} onClick={() => act('', 'adminMoveCategory', cat.name, -1)} aria-label={`Move ${cat.name} earlier in the menu`} title="Earlier in the menu"><Icon d={UP} /></button>
              <button type="button" className="icon-act" disabled={menuIndex === total - 1} onClick={() => act('', 'adminMoveCategory', cat.name, 1)} aria-label={`Move ${cat.name} later in the menu`} title="Later in the menu"><Icon d={DOWN} /></button>
            </span>
          </div>
          {count > 0 && <p className="muted small cat-del-note">To delete this category, move or delete its {count} {count === 1 ? 'product' : 'products'} first.</p>}

          <div className="cat-subs">
            <span className="cat-label">Subcategories</span>
            {cat.subs.length === 0 && <p className="muted small">No subcategories yet. Add one below.</p>}
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
              <label className="sr-only" htmlFor={`ns-${index}`}>New subcategory for {cat.name}</label>
              <input id={`ns-${index}`} placeholder="New subcategory" value={newSub} onChange={(e) => setNewSub(e.target.value)} autoFocus={isNew} />
              <button className="btn btn-outline btn-sm" type="submit" disabled={!newSub.trim()}>Add</button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}

function CategoriesPanel() {
  const store = useStore();
  const { catalog, products } = store;
  const [newCat, setNewCat] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [openNames, setOpenNames] = useState(() => new Set()); // all closed to start
  const [justAdded, setJustAdded] = useState('');
  const toggle = (name) => setOpenNames((cur) => {
    const next = new Set(cur);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });
  const renamed = (oldName, newName) => {
    setOpenNames((cur) => { const next = new Set(cur); if (next.delete(oldName)) next.add(newName); return next; });
    if (justAdded === oldName) setJustAdded(newName);
  };

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
    if (await act(`Added “${name}”. It shows here at the top, and last in the store menu (you can move it). Add its subcategories below.`, 'adminAddCategory', name)) {
      setNewCat('');
      setJustAdded(name);
      setOpenNames(new Set([name])); // open the new one, close the rest
      setTimeout(() => document.getElementById('cat-0')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    }
  };

  // This page lists the newest category first. The store menu keeps its own order (Menu #).
  const shown = [...catalog].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || (a.sort || 0) - (b.sort || 0));
  const countIn = (cat) => products.filter((p) => p.category === cat).length;
  const subCountsOf = (cat) => products.filter((p) => p.category === cat).reduce((m, p) => ({ ...m, [p.subcategory]: (m[p.subcategory] || 0) + 1 }), {});

  return (
    <div className="adm-page">
      <div className="section-head">
        <h1>Categories</h1>
      </div>
      <p className="muted cat-intro">Newest categories are listed first. "Menu #" is each category's position in the store menu; open a category to change it. Changes show on the store straight away.</p>

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
        {shown.map((c, i) => (
          <CategoryCard
            key={c.name}
            cat={c}
            index={i}
            menuIndex={catalog.findIndex((x) => x.name === c.name)}
            total={catalog.length}
            count={countIn(c.name)}
            subCounts={subCountsOf(c.name)}
            act={act}
            open={openNames.has(c.name)}
            onToggle={() => toggle(c.name)}
            isNew={c.name === justAdded}
            onRenamed={renamed}
          />
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
