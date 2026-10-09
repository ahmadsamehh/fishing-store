'use client';
import { useCallback, useEffect, useState } from 'react';
import { useStore, formatPrice } from '@/lib/store';
import { STATUSES, STATUS_LABELS, formatOrderDate, waNumber } from '@/lib/orders';
import AdminGate from '@/components/AdminGate';

function OrderCard({ order, onUpdated }) {
  const { adminUpdateOrderStatus } = useStore();
  const [status, setStatus] = useState(order.status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const changed = status !== order.status;

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const updated = await adminUpdateOrderStatus(order.id, status);
      onUpdated(updated);
      setMsg(`Status updated to “${STATUS_LABELS[status]}”. The customer will see this in their account.`);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  // Ready-made WhatsApp message to tell the customer about the new status.
  const firstName = (order.full_name || '').split(' ')[0];
  const notifyText = `Hi ${firstName}, your order #${order.code} is now: ${STATUS_LABELS[order.status]}. Thank you for shopping with Marjan!`;
  const customerWa = waNumber(order.phone);

  return (
    <details className="order admin-order">
      <summary>
        <span className="order-code">#{order.code}</span>
        <span className="muted">{formatOrderDate(order.created_at, true)}</span>
        <span>{order.full_name}</span>
        <span className={`pill pill-${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span>
        <strong className="order-total">{formatPrice(order.subtotal)}</strong>
      </summary>

      <div className="admin-order-body">
        <div className="admin-order-cols">
          <div>
            <h3>Items</h3>
            <ul className="order-items">
              {order.items.map((it) => (
                <li key={it.id}>
                  <span>{it.qty} × {it.name}</span>
                  <span>{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
              <li className="order-sum"><span>Subtotal</span><strong>{formatPrice(order.subtotal)}</strong></li>
            </ul>
          </div>
          <div>
            <h3>Customer</h3>
            <dl className="kv">
              <dt>Name</dt><dd>{order.full_name || '—'}</dd>
              <dt>Phone</dt><dd><a href={`tel:${order.phone}`}>{order.phone}</a></dd>
              <dt>Governorate</dt><dd>{order.city || '—'}</dd>
              <dt>Address</dt><dd>{order.address || '—'}</dd>
              {order.location && (<><dt>Location</dt><dd><a href={order.location} target="_blank" rel="noopener noreferrer">Open in Google Maps</a></dd></>)}
              {order.notes && (<><dt>Notes</dt><dd>{order.notes}</dd></>)}
            </dl>
          </div>
        </div>

        <div className="status-row">
          <label>
            Order status
            <select value={status} onChange={(e) => { setStatus(e.target.value); setMsg(''); }}>
              {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </label>
          <button className="btn btn-dark" onClick={save} disabled={!changed || busy}>
            {busy ? 'Saving…' : 'Update status'}
          </button>
          {customerWa && (
            <a
              className="btn btn-whatsapp"
              href={`https://wa.me/${customerWa}?text=${encodeURIComponent(notifyText)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message customer
            </a>
          )}
        </div>
        {order.status_updated_at && (
          <p className="muted small">Last status change: {formatOrderDate(order.status_updated_at, true)}</p>
        )}
        {msg && <p className="notice">{msg}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </details>
  );
}

function OrdersPanel() {
  const { adminLoadOrders } = useStore();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    adminLoadOrders()
      .then((d) => { setOrders(d); setError(''); })
      .catch((err) => { setError(err.message); setOrders((cur) => cur || []); });
  }, [adminLoadOrders]);

  useEffect(() => {
    load();
    // Check for new orders when the admin comes back to this tab.
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const onUpdated = (updated) => setOrders((cur) => cur.map((o) => (o.id === updated.id ? updated : o)));

  const counts = Object.fromEntries(STATUSES.map((s) => [s.value, (orders || []).filter((o) => o.status === s.value).length]));
  const term = q.trim().toLowerCase();
  const list = (orders || []).filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (term && !`${o.code} ${o.full_name} ${o.phone}`.toLowerCase().includes(term)) return false;
    return true;
  });

  return (
    <div className="adm-page">
      <div className="section-head">
        <h1>Orders</h1>
        <button className="btn btn-outline" onClick={load}>Refresh</button>
      </div>

      <div className="stats">
        <div><strong>{counts.sent ?? 0}</strong><span>New (not confirmed yet)</span></div>
        <div><strong>{(counts.confirmed ?? 0) + (counts.out_for_delivery ?? 0)}</strong><span>In progress</span></div>
        <div><strong>{counts.delivered ?? 0}</strong><span>Delivered</span></div>
      </div>

      <div className="filter-tabs" role="tablist" aria-label="Filter by status">
        <button role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>
          All <span>{(orders || []).length}</span>
        </button>
        {STATUSES.map((s) => (
          <button key={s.value} role="tab" aria-selected={filter === s.value} className={filter === s.value ? 'on' : ''} onClick={() => setFilter(s.value)}>
            {s.label} <span>{counts[s.value]}</span>
          </button>
        ))}
      </div>

      <label className="sr-only" htmlFor="order-q">Search orders</label>
      <input id="order-q" className="admin-search" type="search" placeholder="Search by order number, name or phone" value={q} onChange={(e) => setQ(e.target.value)} />

      {error && <p className="error">{error}</p>}
      {orders === null && <div className="empty">Loading orders…</div>}
      {orders && !list.length && (
        <div className="empty">{orders.length ? 'No orders match this filter.' : 'No orders yet. They will show up here when customers check out.'}</div>
      )}
      <div className="admin-orders">
        {list.map((o) => (<OrderCard key={o.id} order={o} onUpdated={onUpdated} />))}
      </div>
      <p className="muted small">Only orders from signed-in customers are saved here. Guest orders arrive on WhatsApp only.</p>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminGate>
      <OrdersPanel />
    </AdminGate>
  );
}
