'use client';
import { useEffect, useState } from 'react';
import { useStore, formatPrice } from '@/lib/store';
import { GOVERNORATES } from '@/lib/egypt';
import { deliveryFor } from '@/lib/delivery';
import AdminGate from '@/components/AdminGate';

function DeliveryPanel() {
  const { delivery, adminSaveDelivery } = useStore();
  const [f, setF] = useState(delivery);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [extra, setExtra] = useState({ city: '', fee: '' });

  useEffect(() => { setF(delivery); }, [delivery]);

  const save = async (next) => {
    setBusy(true);
    setError(''); setMessage('');
    const err = await adminSaveDelivery(next);
    setBusy(false);
    err ? setError(err) : setMessage('Delivery settings saved. They apply to new orders straight away.');
    return err;
  };

  const toggleFreeCity = (c) => {
    const has = f.freeCities.some((x) => x.toLowerCase() === c.toLowerCase());
    setF({ ...f, freeCities: has ? f.freeCities.filter((x) => x.toLowerCase() !== c.toLowerCase()) : [...f.freeCities, c] });
    setMessage('');
  };

  const addExtra = (e) => {
    e.preventDefault();
    if (!extra.city || extra.fee === '') return;
    setF({ ...f, perCity: { ...f.perCity, [extra.city]: Math.max(0, Number(extra.fee) || 0) } });
    setExtra({ city: '', fee: '' });
    setMessage('');
  };
  const removeExtra = (c) => {
    const rest = { ...f.perCity };
    delete rest[c];
    setF({ ...f, perCity: rest });
    setMessage('');
  };

  // Live example so the owner can see the effect of a change before saving
  const examples = [2000, Number(f.freeOver) || 10000].map((amount) => ({ amount, ...deliveryFor(amount, city || 'Giza', f) }));

  return (
    <div className="adm-page">
      <div className="section-head"><h1>Delivery</h1></div>
      <p className="muted cat-intro">
        How the delivery fee is worked out at checkout. Customers see the fee and the total before they send their order,
        and you can still change the fee on any single order from the Orders page.
      </p>

      <form className="dlv-form" onSubmit={(e) => { e.preventDefault(); save(f); }}>
        <div className="dlv-grid">
          <label>
            Delivery fee (EGP)
            <input type="number" min="0" step="1" value={f.fee} onChange={(e) => { setF({ ...f, fee: e.target.value }); setMessage(''); }} />
            <small className="muted">Charged when the order is not free.</small>
          </label>
          <label>
            Free delivery over (EGP)
            <input type="number" min="0" step="1" value={f.freeOver} onChange={(e) => { setF({ ...f, freeOver: e.target.value }); setMessage(''); }} />
            <small className="muted">Orders of this amount or more are delivered free. 0 turns this off.</small>
          </label>
        </div>

        <div className="dlv-block">
          <span className="cat-label">Governorates always delivered free</span>
          <div className="dlv-chips">
            {GOVERNORATES.map((c) => {
              const on = f.freeCities.some((x) => x.toLowerCase() === c.toLowerCase());
              return (
                <button type="button" key={c} className={`chip dlv-chip${on ? ' on' : ''}`} onClick={() => toggleFreeCity(c)} aria-pressed={on}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="dlv-block">
          <span className="cat-label">A different fee for a governorate (optional)</span>
          {Object.keys(f.perCity || {}).length > 0 && (
            <ul className="dlv-list">
              {Object.entries(f.perCity).map(([c, fee]) => (
                <li key={c}>
                  <span>{c}</span>
                  <strong>{formatPrice(fee)}</strong>
                  <button type="button" className="link-btn" onClick={() => removeExtra(c)}>Remove</button>
                </li>
              ))}
            </ul>
          )}
          <div className="dlv-add">
            <select value={extra.city} onChange={(e) => setExtra({ ...extra, city: e.target.value })} aria-label="Governorate">
              <option value="">Choose a governorate…</option>
              {GOVERNORATES.filter((c) => !(c in (f.perCity || {}))).map((c) => (<option key={c}>{c}</option>))}
            </select>
            <input type="number" min="0" step="1" placeholder="Fee" value={extra.fee} onChange={(e) => setExtra({ ...extra, fee: e.target.value })} aria-label="Fee" />
            <button type="button" className="btn btn-outline btn-sm" onClick={addExtra} disabled={!extra.city || extra.fee === ''}>Add</button>
          </div>
        </div>

        <div className="dlv-try">
          <span className="cat-label">Try it</span>
          <div className="dlv-try-row">
            <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Governorate to try">
              {GOVERNORATES.map((c) => (<option key={c}>{c}</option>))}
            </select>
            <ul>
              {examples.map((x) => (
                <li key={x.amount}>
                  An order of <strong>{formatPrice(x.amount)}</strong> to {city || 'Giza'}: {x.free ? <strong className="ship-free">Free</strong> : <strong>{formatPrice(x.fee)}</strong>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {message && <p className="notice" role="status">{message}</p>}
        {error && <p className="error" role="alert">{error}</p>}

        <div className="dlv-acts">
          <button type="button" className="btn btn-outline" onClick={() => { setF(delivery); setMessage(''); setError(''); }} disabled={busy}>Undo changes</button>
          <button type="submit" className="btn btn-pink" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminDeliveryPage() {
  return (
    <AdminGate>
      <DeliveryPanel />
    </AdminGate>
  );
}
