'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore, formatPrice } from '@/lib/store';
import { WHATSAPP_NUMBER } from '@/lib/config';
import { supabaseConfigured } from '@/lib/supabase';
import { GOVERNORATES, isValidPhone } from '@/lib/egypt';

function SignInForm({ onDone }) {
  const { signIn } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const err = await signIn(email.trim(), password);
    setBusy(false);
    err ? setError(err) : onDone();
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

function SignUpForm({ onDone }) {
  const { signUp } = useStore();
  const [f, setF] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.fullName.trim()) return setError('Add your name.');
    if (!isValidPhone(f.phone)) return setError('Add a valid mobile number, for example 01012345678.');
    if (f.password.length < 8) return setError('Use a password with at least 8 characters.');
    setBusy(true);
    setError('');
    const res = await signUp({ ...f, fullName: f.fullName.trim(), email: f.email.trim() });
    setBusy(false);
    if (res.error) return setError(res.error);
    res.needsConfirmation ? setCheckEmail(true) : onDone();
  };

  if (checkEmail) {
    return (
      <div className="notice">
        Almost done. We sent a confirmation link to <strong>{f.email}</strong>. Open it to activate your account, then sign in.
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>Full name<input autoComplete="name" value={f.fullName} onChange={set('fullName')} required /></label>
      <label>Mobile number<input type="tel" autoComplete="tel" inputMode="tel" placeholder="01012345678" value={f.phone} onChange={set('phone')} required /></label>
      <label>Email<input type="email" autoComplete="email" value={f.email} onChange={set('email')} required /></label>
      <label>Password<input type="password" autoComplete="new-password" value={f.password} onChange={set('password')} required /><small className="muted">At least 8 characters</small></label>
      {error && <p className="error">{error}</p>}
      <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
    </form>
  );
}

const STATUS_LABELS = {
  sent: 'Sent on WhatsApp',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function Orders() {
  const { session, loadOrders, products, addManyToCart } = useStore();
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    loadOrders().then(setOrders).catch((err) => { setError(err.message); setOrders([]); });
  }, [session?.user?.id]);

  const orderAgain = (order) => {
    const available = order.items.filter((it) => {
      const p = products.find((x) => x.id === it.id);
      return p && Number(p.stock) > 0;
    });
    if (!available.length) return setNote('None of the items in this order are available right now.');
    addManyToCart(available);
    const missing = order.items.length - available.length;
    if (missing) setNote(`${missing} item(s) from this order are no longer available, so they were not added.`);
    router.push('/cart');
  };

  const resend = (order) => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(order.message)}`, '_blank', 'noopener');
  };

  return (
    <section id="orders" className="orders">
      <h2>My orders</h2>
      {error && <p className="error">{error}</p>}
      {note && <p className="notice">{note}</p>}
      {orders === null && <p className="muted">Loading your orders…</p>}
      {orders && !orders.length && !error && (
        <div className="empty">You have not placed any orders yet. <Link href="/products">Start shopping</Link></div>
      )}
      {orders && orders.map((o) => (
        <details key={o.id} className="order">
          <summary>
            <span className="order-code">#{o.code}</span>
            <span className="muted">{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className={`pill pill-${o.status}`}>{STATUS_LABELS[o.status] || o.status}</span>
            <strong className="order-total">{formatPrice(o.subtotal)}</strong>
          </summary>
          <ul className="order-items">
            {o.items.map((it) => (
              <li key={it.id}>
                <span>{it.qty} × {products.some((p) => p.id === it.id) ? <Link href={`/products/${it.id}`}>{it.name}</Link> : it.name}</span>
                <span>{formatPrice(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="muted order-addr">Delivery to {[o.city, o.address].filter(Boolean).join(', ')}</p>
          <div className="row-gap">
            <button className="btn btn-dark btn-sm" onClick={() => orderAgain(o)}>Order again</button>
            <button className="btn btn-outline btn-sm" onClick={() => resend(o)}>Send again on WhatsApp</button>
          </div>
        </details>
      ))}
    </section>
  );
}

function Profile() {
  const { session, loadProfile, saveProfile, signOut, isAdmin } = useStore();
  const [p, setP] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });

  useEffect(() => { loadProfile().then(setP); }, [session?.user?.id]);

  const submit = async (e) => {
    e.preventDefault();
    if (p.phone && !isValidPhone(p.phone)) return setError('Add a valid mobile number, for example 01012345678.');
    setBusy(true);
    const err = await saveProfile(p);
    setBusy(false);
    setError(err);
    setMsg(err ? '' : 'Your details are saved.');
  };

  if (!p) return <p>Loading…</p>;

  return (
    <>
      <div className="section-head">
        <div>
          <h1>My account</h1>
          <p className="muted">{session.user.email}</p>
        </div>
        <div className="row-gap">
          {isAdmin && <Link href="/admin" className="btn btn-outline">Store admin</Link>}
          <button className="btn btn-outline" onClick={signOut}>Sign out</button>
        </div>
      </div>
      <form className="auth-form wide" onSubmit={submit}>
        <h2>Delivery details</h2>
        <p className="muted">We fill these in for you at checkout.</p>
        <label>Full name<input autoComplete="name" value={p.fullName} onChange={set('fullName')} /></label>
        <label>Mobile number<input type="tel" autoComplete="tel" inputMode="tel" value={p.phone} onChange={set('phone')} /></label>
        <label>Governorate
          <select value={p.city} onChange={set('city')}>
            <option value="">Choose…</option>
            {GOVERNORATES.map((g) => (<option key={g}>{g}</option>))}
          </select>
        </label>
        <label>Address<textarea rows="3" autoComplete="street-address" placeholder="Area, street, building, floor, apartment" value={p.address} onChange={set('address')} /></label>
        {error && <p className="error">{error}</p>}
        {msg && <p className="notice">{msg}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save details'}</button>
      </form>
      <Orders />
    </>
  );
}

function Account() {
  const { session, authReady } = useStore();
  const [tab, setTab] = useState('signin');
  const router = useRouter();
  const next = useSearchParams().get('next');

  const done = () => next && router.push(next);

  if (!supabaseConfigured) return <p className="error">Accounts are not available yet.</p>;
  if (!authReady) return <p>Loading…</p>;
  if (session) return <Profile />;

  return (
    <div className="auth-box">
      <h1>{tab === 'signin' ? 'Sign in' : 'Create an account'}</h1>
      <p className="muted">Save your delivery details and check out faster.</p>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'signin'} className={tab === 'signin' ? 'tab on' : 'tab'} onClick={() => setTab('signin')}>Sign in</button>
        <button role="tab" aria-selected={tab === 'signup'} className={tab === 'signup' ? 'tab on' : 'tab'} onClick={() => setTab('signup')}>Create account</button>
      </div>
      {tab === 'signin' ? <SignInForm onDone={done} /> : <SignUpForm onDone={done} />}
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="wrap section page-pad">
      <Suspense fallback={<p>Loading…</p>}><Account /></Suspense>
    </div>
  );
}
