'use client';
import Link from 'next/link';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import ProductImage from '@/components/ProductImage';

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
                <label className="sr-only" htmlFor={`q-${l.id}`}>Quantity</label>
                <input id={`q-${l.id}`} type="number" min="0" value={l.qty} onChange={(e) => setCartQty(l.id, Number(e.target.value) || 0)} />
                <strong>{formatPrice(finalPrice(l.product) * l.qty)}</strong>
                <button className="link-btn" onClick={() => setCartQty(l.id, 0)}>Remove</button>
              </li>
            ))}
          </ul>
          <aside className="cart-summary">
            <div className="row"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
            <p className="muted">Shipping and payment come in the next phase.</p>
            <button className="btn btn-dark" disabled>Checkout (coming soon)</button>
          </aside>
        </div>
      )}
    </div>
  );
}
