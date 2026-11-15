'use client';
import Link from 'next/link';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import ProductImage from '@/components/ProductImage';
import QtyInput from '@/components/QtyInput';
import { deliveryFor, deliveryNote } from '@/lib/delivery';

export default function CartPage() {
  const { cart, products, setCartQty, delivery } = useStore();
  const lines = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.id) })).filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + finalPrice(l.product) * l.qty, 0);
  // The governorate is chosen at checkout, so here we show the usual fee
  // (or Free when the order already qualifies).
  const ship = deliveryFor(subtotal, '', delivery);
  const total = subtotal + ship.fee;
  const missing = delivery.freeOver > 0 ? delivery.freeOver - subtotal : 0;

  return (
    <div className="wrap section">
      <h1>Your cart</h1>
      {!lines.length ? (
        <div className="empty">Your cart is empty. <Link href="/products">Start shopping</Link></div>
      ) : (
        <div className="cart">
          <ul className="cart-lines">
            {lines.map((l) => (
              <li key={l.id} className="cart-line">
                <div className="cart-thumb"><ProductImage product={l.product} /></div>
                <div className="cart-info">
                  <Link href={`/products/${l.id}`}><strong>{l.product.name}</strong></Link>
                  <span className="muted">{formatPrice(finalPrice(l.product))} each</span>
                </div>
                <QtyInput id={`q-${l.id}`} value={l.qty} onChange={(n) => setCartQty(l.id, n)} max={Math.max(Number(l.product.stock), 1)} />
                <strong>{formatPrice(finalPrice(l.product) * l.qty)}</strong>
                <button className="link-btn" onClick={() => setCartQty(l.id, 0)}>Remove</button>
              </li>
            ))}
          </ul>
          <aside className="cart-summary">
            <div className="row row-sub"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="row row-sub">
              <span>Delivery</span>
              <span className={ship.free ? 'ship-free' : ''}>{ship.free ? 'Free' : formatPrice(ship.fee)}</span>
            </div>
            <div className="row"><span>Total</span><strong>{formatPrice(total)}</strong></div>
            <p className="muted">
              {ship.free
                ? `${ship.reason}.`
                : missing > 0
                  ? `Add ${formatPrice(missing)} more for free delivery.`
                  : deliveryNote(delivery) || 'Delivery is included in the total.'}
            </p>
            {!ship.free && <p className="muted small">Free to {delivery.freeCities?.join(', ') || 'selected areas'}. You choose your governorate at checkout.</p>}
            <Link href="/checkout" className="btn btn-whatsapp btn-block">Checkout on WhatsApp</Link>
            <Link href="/products" className="btn btn-outline btn-block">Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
