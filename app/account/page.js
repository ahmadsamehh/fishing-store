'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore, formatPrice } from '@/lib/store';
import { WHATSAPP_NUMBER } from '@/lib/config';
import { STATUS_LABELS, PROGRESS, formatOrderDate } from '@/lib/orders';
import { supabaseConfigured } from '@/lib/supabase';
import { GOVERNORATES, isValidPhone } from '@/lib/egypt';

/* ---------- Small form helpers ---------- */

function Field({ label, error, hint, children, id }) {
  return (
    <div className={`fld${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <span className="fld-error" role="alert">{error}</span> : hint ? <span className="fld-hint">{hint}</span> : null}
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, invalid }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={onChange} aria-invalid={invalid || undefined} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (!pw) return { level: 0, label: '' };
  if (pw.length < 8) return { level: 1, label: 'Too short' };
  if (s <= 2) return { level: 2, label: 'Fair' };
  if (s <= 3) return { level: 3, label: 'Good' };
  return { level: 4, label: 'Strong' };
}

function Spinner() {
  return <span className="spin" aria-hidden="true" />;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Sign in ---------- */

function SignInForm({ onDone, onForgot }) {
  const { signIn } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Enter your password.';
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    const err = await signIn(email.trim(), password);
    setBusy(false);
    err ? setFormError(err) : onDone();
  };

  return (
    <form className="auth-form2" onSubmit={submit} noValidate>
      <Field id="si-email" label="Email" error={errors.email}>
        <input id="si-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email || undefined} />
      </Field>
      <Field id="si-pw" label="Password" error={errors.password}>
        <PasswordInput id="si-pw" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errors.password} />
      </Field>
      <button type="button" className="auth-link" onClick={() => onForgot(email)}>Forgot your password?</button>
      {formError && <p className="error" role="alert">{formError}</p>}
      <button className="btn btn-pink btn-block" type="submit" disabled={busy}>{busy ? <><Spinner /> Signing in…</> : 'Sign in'}</button>
    </form>
  );
}

/* ---------- Create account ---------- */

function SignUpForm({ onDone }) {
  const { signUp } = useStore();
  const [f, setF] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const st = strength(f.password);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.fullName.trim()) errs.fullName = 'Enter your full name.';
    if (!isValidPhone(f.phone)) errs.phone = 'Enter a valid mobile number, for example 01012345678.';
    if (!EMAIL_RE.test(f.email.trim())) errs.email = 'Enter a valid email address.';
    if (f.password.length < 8) errs.password = 'Use at least 8 characters.';
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = await signUp({ ...f, fullName: f.fullName.trim(), email: f.email.trim() });
    setBusy(false);
    if (res.error) return setFormError(res.error);
    res.needsConfirmation ? setCheckEmail(true) : onDone();
  };

  if (checkEmail) {
    return (
      <div className="auth-done">
        <span className="auth-done-icon" aria-hidden="true">✉</span>
        <h2>Check your email</h2>
        <p>We sent a confirmation link to <strong>{f.email}</strong>. Open it to activate your account, then sign in.</p>
      </div>
    );
  }

  return (
    <form className="auth-form2" onSubmit={submit} noValidate>
      <Field id="su-name" label="Full name" error={errors.fullName}>
        <input id="su-name" autoComplete="name" value={f.fullName} onChange={set('fullName')} aria-invalid={!!errors.fullName || undefined} />
      </Field>
      <Field id="su-phone" label="Mobile number" error={errors.phone} hint="We use it to confirm your orders on WhatsApp.">
        <input id="su-phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="01012345678" value={f.phone} onChange={set('phone')} aria-invalid={!!errors.phone || undefined} />
      </Field>
      <Field id="su-email" label="Email" error={errors.email}>
        <input id="su-email" type="email" autoComplete="email" value={f.email} onChange={set('email')} aria-invalid={!!errors.email || undefined} />
      </Field>
      <Field id="su-pw" label="Password" error={errors.password}>
        <PasswordInput id="su-pw" autoComplete="new-password" value={f.password} onChange={set('password')} invalid={!!errors.password} />
        {f.password && (
          <span className={`pw-meter lvl-${st.level}`} aria-live="polite">
            <span className="pw-bars" aria-hidden="true"><i /><i /><i /><i /></span>
            {st.label}
          </span>
        )}
      </Field>
      {formError && <p className="error" role="alert">{formError}</p>}
      <button className="btn btn-pink btn-block" type="submit" disabled={busy}>{busy ? <><Spinner /> Creating account…</> : 'Create account'}</button>
      <p className="auth-small">By creating an account you agree to our terms and privacy policy.</p>
    </form>
  );
}

/* ---------- Forgot / reset password ---------- */

function ForgotForm({ initialEmail, onBack }) {
  const { resetPassword } = useStore();
  const [email, setEmail] = useState(initialEmail || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.');
    setBusy(true);
    const err = await resetPassword(email.trim());
    setBusy(false);
    err ? setError(err) : setSent(true);
  };

  if (sent) {
    return (
      <div className="auth-done">
        <span className="auth-done-icon" aria-hidden="true">✉</span>
        <h2>Check your email</h2>
        <p>If an account exists for <strong>{email}</strong>, you will get a link to choose a new password.</p>
        <button type="button" className="auth-link" onClick={onBack}>Back to sign in</button>
      </div>
    );
  }

  return (
    <form className="auth-form2" onSubmit={submit} noValidate>
      <p className="muted">Enter the email you signed up with and we will send you a link to choose a new password.</p>
      <Field id="fg-email" label="Email" error={error}>
        <input id="fg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <button className="btn btn-pink btn-block" type="submit" disabled={busy}>{busy ? <><Spinner /> Sending…</> : 'Send reset link'}</button>
      <button type="button" className="auth-link" onClick={onBack}>Back to sign in</button>
    </form>
  );
}

function NewPasswordForm() {
  const { updatePassword, showToast } = useStore();
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const st = strength(pw);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return setError('Use at least 8 characters.');
    setBusy(true);
    const err = await updatePassword(pw);
    setBusy(false);
    if (err) return setError(err);
    showToast('Your password has been changed.');
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel-single">
        <h1>Choose a new password</h1>
        <form className="auth-form2" onSubmit={submit} noValidate>
          <Field id="np" label="New password" error={error}>
            <PasswordInput id="np" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} invalid={!!error} />
            {pw && (<span className={`pw-meter lvl-${st.level}`}><span className="pw-bars" aria-hidden="true"><i /><i /><i /><i /></span>{st.label}</span>)}
          </Field>
          <button className="btn btn-pink btn-block" type="submit" disabled={busy}>{busy ? <><Spinner /> Saving…</> : 'Save new password'}</button>
        </form>
      </div>
    </div>
  );
}

/* ---------- Signed-out screen ---------- */

const BENEFITS = ['Follow your order status', 'Faster checkout with saved details', 'Order again in one tap', 'Your cart on every device'];

function AuthScreen({ onDone }) {
  const [mode, setMode] = useState('signin'); // signin | signup | forgot
  const [forgotEmail, setForgotEmail] = useState('');

  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <img src="/images/feature-clownfish.jpg" alt="" />
        <div className="auth-side-text">
          <h2>Welcome to <strong>Marjan</strong></h2>
          <ul>
            {BENEFITS.map((b) => (
              <li key={b}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>{b}</li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="auth-panel">
        {mode === 'forgot' ? (
          <>
            <h1>Reset your password</h1>
            <ForgotForm initialEmail={forgotEmail} onBack={() => setMode('signin')} />
          </>
        ) : (
          <>
            <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
            <p className="muted auth-sub">{mode === 'signin' ? 'Sign in to see your orders and check out faster.' : 'It takes less than a minute.'}</p>
            <div className={`seg seg-${mode}`} role="tablist" aria-label="Sign in or create account">
              <span className="seg-pill" aria-hidden="true" />
              <button role="tab" aria-selected={mode === 'signin'} onClick={() => setMode('signin')}>Sign in</button>
              <button role="tab" aria-selected={mode === 'signup'} onClick={() => setMode('signup')}>Create account</button>
            </div>
            <div className="auth-swap" key={mode}>
              {mode === 'signin'
                ? <SignInForm onDone={onDone} onForgot={(email) => { setForgotEmail(email); setMode('forgot'); }} />
                : <SignUpForm onDone={onDone} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Orders ---------- */

function Tracker({ status, updatedAt }) {
  if (status === 'cancelled') {
    return <p className="error tracker-cancel">This order was cancelled. Contact us on WhatsApp if you have questions.</p>;
  }
  const current = PROGRESS.indexOf(status);
  return (
    <div className="tracker-wrap">
      <ol className="tracker" aria-label="Order progress">
        {PROGRESS.map((s, i) => (
          <li key={s} className={i < current ? 'done' : i === current ? 'current' : ''} aria-current={i === current ? 'step' : undefined}>
            <span className="dot" aria-hidden="true" />
            <span>{STATUS_LABELS[s]}</span>
          </li>
        ))}
      </ol>
      {updatedAt && <p className="muted small">Updated {formatOrderDate(updatedAt, true)}</p>}
    </div>
  );
}

function Orders() {
  const { session, loadOrders, products, addManyToCart } = useStore();
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const load = () => loadOrders().then((d) => { setOrders(d); setError(''); }).catch((err) => { setError(err.message); setOrders((cur) => cur || []); });
    load();
    // Pick up status changes from the store when the customer comes back to this tab.
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
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
    <section className="orders">
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
            <span className="muted">{formatOrderDate(o.created_at)}</span>
            <span className={`pill pill-${o.status}`}>{STATUS_LABELS[o.status] || o.status}</span>
            <strong className="order-total">{formatPrice(o.subtotal)}</strong>
          </summary>
          <Tracker status={o.status} updatedAt={o.status_updated_at} />
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


/* ---------- My information (view first, edit on request) ---------- */

function InfoTab() {
  const { session, loadProfile, saveProfile, showToast } = useStore();
  const [p, setP] = useState(null);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const editing = draft !== null;
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value });

  useEffect(() => { loadProfile().then(setP); }, [session?.user?.id]);

  const save = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!draft.fullName.trim()) errs.fullName = 'Enter your full name.';
    if (draft.phone && !isValidPhone(draft.phone)) errs.phone = 'Enter a valid mobile number, for example 01012345678.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const clean = { ...draft, fullName: draft.fullName.trim(), address: (draft.address || '').trim() };
    const err = await saveProfile(clean);
    setBusy(false);
    if (err) return setFormError(err);
    setP(clean);
    setDraft(null);
    setFormError('');
    showToast('Your information has been updated.');
  };

  if (!p) return <div className="info-card"><p className="muted">Loading…</p></div>;

  if (!editing) {
    const rows = [
      ['Full name', p.fullName],
      ['Mobile number', p.phone],
      ['Email', session.user.email],
      ['Governorate', p.city],
      ['Address', p.address],
    ];
    return (
      <div className="info-card">
        <div className="info-head">
          <div>
            <h2>Delivery details</h2>
            <p className="muted">We fill these in for you at checkout.</p>
          </div>
          <button className="btn btn-outline" onClick={() => { setDraft({ ...p }); setErrors({}); setFormError(''); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
            Edit information
          </button>
        </div>
        <dl className="info-list">
          {rows.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v || <span className="muted">Not added yet</span>}</dd></div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <form className="info-card info-edit" onSubmit={save} noValidate>
      <div className="info-head">
        <div>
          <h2>Edit delivery details</h2>
          <p className="muted">Your email cannot be changed here.</p>
        </div>
      </div>
      <div className="info-grid">
        <Field id="in-name" label="Full name" error={errors.fullName}>
          <input id="in-name" autoComplete="name" value={draft.fullName} onChange={set('fullName')} />
        </Field>
        <Field id="in-phone" label="Mobile number" error={errors.phone}>
          <input id="in-phone" type="tel" autoComplete="tel" inputMode="tel" value={draft.phone} onChange={set('phone')} />
        </Field>
        <Field id="in-email" label="Email">
          <input id="in-email" value={session.user.email} disabled />
        </Field>
        <Field id="in-city" label="Governorate">
          <select id="in-city" value={draft.city} onChange={set('city')}>
            <option value="">Choose…</option>
            {GOVERNORATES.map((g) => (<option key={g}>{g}</option>))}
          </select>
        </Field>
        <div className="info-wide">
          <Field id="in-addr" label="Address">
            <textarea id="in-addr" rows="3" autoComplete="street-address" placeholder="Area, street, building, floor, apartment" value={draft.address} onChange={set('address')} />
          </Field>
        </div>
      </div>
      {formError && <p className="error" role="alert">{formError}</p>}
      <div className="info-actions">
        <button type="button" className="btn btn-outline" onClick={() => setDraft(null)} disabled={busy}>Cancel</button>
        <button type="submit" className="btn btn-pink" disabled={busy}>{busy ? <><Spinner /> Saving…</> : 'Save changes'}</button>
      </div>
    </form>
  );
}

/* ---------- Signed-in screen with two tabs ---------- */

function Profile() {
  const { session, signOut } = useStore();
  const [tab, setTab] = useState('orders');
  const name = session.user.user_metadata?.full_name || '';
  const first = name.split(' ')[0];

  // Keep the tab in the address (#orders / #info) so links like /account#orders work.
  useEffect(() => {
    const fromHash = () => setTab(window.location.hash === '#info' ? 'info' : 'orders');
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);
  const choose = (t) => {
    setTab(t);
    history.replaceState(null, '', `#${t}`);
  };

  return (
    <div className="acct">
      <div className="acct-head">
        <span className="acct-avatar" aria-hidden="true">{(first || session.user.email).charAt(0).toUpperCase()}</span>
        <div className="acct-hello">
          <h1>{first ? `Hi, ${first}` : 'My account'}</h1>
          <p className="muted">{session.user.email}</p>
        </div>
        <button className="btn btn-outline acct-out" onClick={signOut}>Sign out</button>
      </div>
      <div className="tabs-line" role="tablist" aria-label="My account">
        <button role="tab" id="t-orders" aria-controls="p-orders" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'on' : ''} onClick={() => choose('orders')}>My orders</button>
        <button role="tab" id="t-info" aria-controls="p-info" aria-selected={tab === 'info'} className={tab === 'info' ? 'on' : ''} onClick={() => choose('info')}>My information</button>
      </div>
      <div className="tab-panel" key={tab} role="tabpanel" id={tab === 'orders' ? 'p-orders' : 'p-info'} aria-labelledby={tab === 'orders' ? 't-orders' : 't-info'}>
        {tab === 'orders' ? <Orders /> : <InfoTab />}
      </div>
    </div>
  );
}

function Account() {
  const { session, authReady, recovery } = useStore();
  const router = useRouter();
  const next = useSearchParams().get('next');
  const done = () => next && router.push(next);

  if (!supabaseConfigured) return <p className="error">Accounts are not available yet.</p>;
  if (!authReady) return <p className="muted">Loading…</p>;
  if (recovery) return <NewPasswordForm />;
  if (session) return <Profile />;
  return <AuthScreen onDone={done} />;
}

export default function AccountPage() {
  return (
    <div className="wrap section page-pad">
      <Suspense fallback={<p className="muted">Loading…</p>}><Account /></Suspense>
    </div>
  );
}
