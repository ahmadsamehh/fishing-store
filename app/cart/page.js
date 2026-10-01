'use client';
import Link from 'next/link';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import ProductImage from '@/components/ProductImage';
import QtyInput from '@/components/QtyInput';

export default function CartPage() {
  const { cart, products, setCartQty } = useStore();
  const lines = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.id) })).filter((l) => l.product);
  const total = lines.reduce((sum, l) => sum + finalPrice(l.product) * l.qty, 0);

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
            <div className="row"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
            <p className="muted">Delivery cost is confirmed with you on WhatsApp.</p>
            <Link href="/checkout" className="btn btn-whatsapp btn-block">Checkout on WhatsApp</Link>
            <Link href="/products" className="btn btn-outline btn-block">Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
