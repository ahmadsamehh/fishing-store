'use client';
import { useCallback, useEffect, useState } from 'react';
import { useStore, formatPrice } from '@/lib/store';
import { STATUSES } from '@/lib/orders';
import AdminGate from '@/components/AdminGate';
import OrderCard from '@/components/AdminOrderCard';

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
        <div><strong>{counts.sent ?? 0}</strong><span>New, not confirmed yet</span></div>
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
