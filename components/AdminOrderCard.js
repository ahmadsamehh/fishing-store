'use client';
import { useState } from 'react';
import { useStore, formatPrice } from '@/lib/store';
import { STATUSES, STATUS_LABELS, formatOrderDate, waNumber } from '@/lib/orders';

export default function OrderCard({ order, onUpdated }) {
  const { adminUpdateOrderStatus } = useStore();
  const [status, setStatus] = useState(order.status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const changed = status !== order.status;
  const isGuest = !order.user_id;
  const history = [...(order.history || [])].sort((x, y) => new Date(y.changed_at) - new Date(x.changed_at));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const updated = await adminUpdateOrderStatus(order.id, status);
      onUpdated(updated);
      setMsg(isGuest
        ? `Status updated to “${STATUS_LABELS[status]}”. This is a guest order, so let the customer know on WhatsApp.`
        : `Status updated to “${STATUS_LABELS[status]}”. The customer will see this in their account.`);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  // Ready-made WhatsApp message about the current status.
  const firstName = (order.full_name || '').split(' ')[0];
  const notifyText = `Hi ${firstName}, your order #${order.code} is now: ${STATUS_LABELS[order.status]}. Thank you for shopping with Marjan!`;
  const customerWa = waNumber(order.phone);

  return (
    <details className="order admin-order">
      <summary>
        <span className="order-code">#{order.code}</span>
        <span className="muted">{formatOrderDate(order.created_at, true)}</span>
        <span className="ao-name">{order.full_name}{isGuest && <span className="ao-guest">Guest</span>}</span>
        <span className={`pill pill-${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span>
        <strong className="order-total">{formatPrice(order.subtotal)}</strong>
      </summary>

      <div className="admin-order-body">
        <div className="admin-order-cols">
          <div className="ao-block">
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
          <div className="ao-block">
            <div className="ao-block-head">
              <h3>Customer</h3>
              {customerWa && (
                <a
                  className="ao-wa"
                  href={`https://wa.me/${customerWa}?text=${encodeURIComponent(notifyText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Opens WhatsApp with a message about the current status"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
                  Message on WhatsApp
                </a>
              )}
            </div>
            <dl className="kv">
              <dt>Name</dt><dd>{order.full_name || '—'}</dd>
              <dt>Phone</dt><dd><a href={`tel:${order.phone}`}>{order.phone}</a></dd>
              <dt>Governorate</dt><dd>{order.city || '—'}</dd>
              <dt>Address</dt><dd>{order.address || '—'}</dd>
              {order.location && (<><dt>Location</dt><dd><a href={order.location} target="_blank" rel="noopener noreferrer">Open in Google Maps</a></dd></>)}
              {order.notes && (<><dt>Notes</dt><dd>{order.notes}</dd></>)}
              <dt>Account</dt><dd>{isGuest ? 'Guest checkout (no account)' : 'Signed-in customer'}</dd>
            </dl>
          </div>
        </div>

        <div className="ao-status">
          <div className="ao-status-form">
            <label htmlFor={`st-${order.id}`}>Order status</label>
            <div className="ao-status-row">
              <select id={`st-${order.id}`} value={status} onChange={(e) => { setStatus(e.target.value); setMsg(''); }}>
                {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
              </select>
              <button className="btn btn-pink" onClick={save} disabled={!changed || busy}>
                {busy ? 'Saving…' : 'Update status'}
              </button>
            </div>
            {order.status_updated_by_name && (
              <p className="muted small">Last changed by <strong>{order.status_updated_by_name}</strong> on {formatOrderDate(order.status_updated_at, true)}</p>
            )}
            {msg && <p className="notice">{msg}</p>}
            {error && <p className="error">{error}</p>}
          </div>

          {history.length > 0 && (
            <div className="ao-history">
              <span className="ao-label">History</span>
              <ol>
                {history.map((h, i) => (
                  <li key={i} className={i === 0 ? 'latest' : ''}>
                    <span className="ao-dot" aria-hidden="true" />
                    <span>
                      <strong>{STATUS_LABELS[h.status] || h.status}</strong>
                      <small>{h.changed_by_name || 'Unknown'} · {formatOrderDate(h.changed_at, true)}</small>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

