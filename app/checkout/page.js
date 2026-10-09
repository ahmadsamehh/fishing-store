'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, formatPrice, finalPrice } from '@/lib/store';
import { WHATSAPP_NUMBER } from '@/lib/config';
import { GOVERNORATES, isValidPhone } from '@/lib/egypt';

export default function CheckoutPage() {
  const { cart, products, ready, session, loadProfile, saveProfile, clearCart, placeOrder } = useStore();
  const [f, setF] = useState({ fullName: '', phone: '', city: '', address: '', notes: '' });
  const [location, setLocation] = useState('');
  const [locStatus, setLocStatus] = useState('');
  const [save, setSave] = useState(true);
  const [error, setError] = useState('');
  const [sentUrl, setSentUrl] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [saveError, setSaveError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // Fill in saved details for signed-in customers.
  useEffect(() => {
    if (session) loadProfile().then((p) => p && setF((cur) => ({ ...cur, ...p })));
  }, [session?.user?.id]);

  const lines = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.id) })).filter((l) => l.product);
  const total = lines.reduce((sum, l) => sum + finalPrice(l.product) * l.qty, 0);

  const shareLocation = () => {
    if (!navigator.geolocation) return setLocStatus('Your browser cannot share location. Type your address instead.');
    setLocStatus('Getting your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`);
        setLocStatus('Location added.');
      },
      () => setLocStatus('Location was not shared. Allow location access in your browser, or type your address.'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const submit = (e) => {
    e.preventDefault();
    if (!f.fullName.trim()) return setError('Add your name.');
    if (!isValidPhone(f.phone)) return setError('Add a valid mobile number, for example 01012345678.');
    if (!f.city) return setError('Choose your governorate.');
    if (!f.address.trim() && !location) return setError('Add your address or share your location.');
    setError('');

    const origin = window.location.origin;
    // Short reference the store owner can use when replying, e.g. M7K3Q9X2
    const code = 'M' + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 4).toUpperCase();
    const items = lines.map((l, i) => {
      const price = finalPrice(l.product);
      return `${i + 1}) ${l.product.name}\n   ${l.qty} × ${formatPrice(price)} = ${formatPrice(price * l.qty)}\n   ${origin}/products/${l.id}`;
    });
    const msg = [
      'Hi, I want to buy these items:',
      `Order #${code}`,
      '',
      ...items,
      '',
      `Subtotal: ${formatPrice(total)}`,
      '',
      `Name: ${f.fullName.trim()}`,
      `Phone: ${f.phone.trim()}`,
      `Governorate: ${f.city}`,
      f.address.trim() ? `Address: ${f.address.trim()}` : null,
      location ? `Location: ${location}` : null,
      f.notes.trim() ? `Notes: ${f.notes.trim()}` : null,
    ].filter((l) => l !== null).join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    // Open WhatsApp right away (phones block pop-ups that open after a delay).
    // Note: passing 'noopener' makes window.open return null, which made the old code
    // think the pop-up was blocked and send this tab to WhatsApp instead.
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    setSentUrl(url);
    setSentCode(code);

    // Save the order to the customer's history, then empty the cart.
    if (session) {
      placeOrder({
        code,
        items: lines.map((l) => ({
          id: l.id,
          name: l.product.name,
          qty: l.qty,
          price: finalPrice(l.product),
          image: l.product.image || '',
        })),
        subtotal: total,
        fullName: f.fullName.trim(),
        phone: f.phone.trim(),
        city: f.city,
        address: f.address.trim(),
        location,
        notes: f.notes.trim(),
        message: msg,
      }).then(setSaveError);
      if (save) saveProfile(f);
    }
    clearCart();
  };

  if (sentUrl) {
    return (
      <div className="wrap section page-pad">
        <div className="auth-box">
          <h1>Your order is ready in WhatsApp</h1>
          <p>Order <strong>#{sentCode}</strong>. Press send in WhatsApp to place it. We will reply to confirm the total and delivery time.</p>
          <p className="muted">If WhatsApp did not open, or you closed it before sending, use the button below.</p>
          {saveError && <p className="error">{saveError}</p>}
          <div className="row-gap">
            <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">Open WhatsApp again</a>
            {session ? (
              <Link href="/account#orders" className="btn btn-outline">View my orders</Link>
            ) : (
              <Link href="/" className="btn btn-outline">Continue shopping</Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (ready && !lines.length) {
    return (
      <div className="wrap section page-pad">
        <h1>Checkout</h1>
        <div className="empty">Your cart is empty. <Link href="/products">Start shopping</Link></div>
      </div>
    );
  }

  return (
    <div className="wrap section page-pad">
      <h1>Checkout</h1>
      <div className="checkout">
        <form className="auth-form wide" onSubmit={submit}>
          {!session && (
            <p className="notice">
              Have an account? <Link href="/account?next=/checkout">Sign in</Link> to fill this in automatically. You can also order without one.
            </p>
          )}
          <h2>Delivery details</h2>
          <label>Full name<input autoComplete="name" value={f.fullName} onChange={set('fullName')} required /></label>
          <label>Mobile number<input type="tel" autoComplete="tel" inputMode="tel" placeholder="01012345678" value={f.phone} onChange={set('phone')} required /></label>
          <label>Governorate
            <select value={f.city} onChange={set('city')} required>
              <option value="">Choose…</option>
              {GOVERNORATES.map((g) => (<option key={g}>{g}</option>))}
            </select>
          </label>
          <label>Address<textarea rows="3" autoComplete="street-address" placeholder="Area, street, building, floor, apartment" value={f.address} onChange={set('address')} /></label>
          <div className="loc">
            <button type="button" className="btn btn-outline" onClick={shareLocation}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              {location ? 'Update my location' : 'Share my location'}
            </button>
            {locStatus && <span className="muted" role="status">{locStatus}</span>}
          </div>
          <label>Notes (optional)<textarea rows="2" placeholder="Best time to call, landmark, anything else" value={f.notes} onChange={set('notes')} /></label>
          {session && (
            <label className="check"><input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} />Save these details to my account</label>
          )}
          {error && <p className="error">{error}</p>}
          <button className="btn btn-whatsapp btn-block" type="submit">Send order on WhatsApp</button>
        </form>

        <aside className="cart-summary">
          <h2>Your order</h2>
          <ul className="summary-lines">
            {lines.map((l) => (
              <li key={l.id}><span>{l.qty} × {l.product.name}</span><strong>{formatPrice(finalPrice(l.product) * l.qty)}</strong></li>
            ))}
          </ul>
          <div className="row"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
          <p className="muted">Delivery cost is confirmed with you on WhatsApp.</p>
          <Link href="/cart" className="link-btn">Edit cart</Link>
        </aside>
      </div>
    </div>
  );
}
