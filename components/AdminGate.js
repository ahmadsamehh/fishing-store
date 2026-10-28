'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { supabaseConfigured } from '@/lib/supabase';
import { Logo } from './Icons';

function Brand() {
  return (
    <div className="adm-brand">
      <span className="adm-brand-mark"><Logo size={28} /></span>
      <span>Marjan <small>Admin</small></span>
    </div>
  );
}

// Full-screen card used for sign-in and access messages.
function Centered({ children }) {
  return (
    <div className="adm-center">
      <div className="adm-card">
        <Brand />
        {children}
      </div>
    </div>
  );
}

function SignIn() {
  const { adminSignIn } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(await adminSignIn(email.trim(), password));
    setBusy(false);
  };

  return (
    <Centered>
      <form className="adm-login" onSubmit={submit}>
        <h1>Sign in</h1>
        <p className="muted">Manage products and orders.</p>
        <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </Centered>
  );
}

const NAV = [
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: 'M6 3h12l2 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7l2-4zM4 7h16M9 11a3 3 0 0 0 6 0',
  },
  {
    href: '/admin',
    label: 'Products',
    icon: 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8',
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    icon: 'M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v6H4zM13 14h7v6h-7z',
  },
];

// Change-password window, opened from the account menu.
function ChangePassword({ onClose }) {
  const { adminChangePassword } = useStore();
  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return setError('Use at least 8 characters for the new password.');
    if (pw !== pw2) return setError('The two new passwords do not match.');
    if (pw === current) return setError('The new password must be different from the current one.');
    setBusy(true);
    setError('');
    const err = await adminChangePassword(current, pw);
    setBusy(false);
    err ? setError(err) : setDone(true);
  };

  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-labelledby="cp-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal cp-modal">
        {done ? (
          <>
            <h2 id="cp-title">Password changed</h2>
            <p className="muted">Use your new password next time you sign in.</p>
            <div className="modal-actions"><button className="btn btn-pink" onClick={onClose}>Done</button></div>
          </>
        ) : (
          <form onSubmit={submit} className="cp-form" noValidate>
            <h2 id="cp-title">Change password</h2>
            <label>Current password<input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoFocus /></label>
            <label>New password<input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required /></label>
            <label>New password again<input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} required /></label>
            <p className="muted small">At least 8 characters.</p>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
              <button type="submit" className="btn btn-pink" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// The signed-in staff member: tap to open Change password / Sign out.
function AccountMenu({ name, email, showEmail, initial }) {
  const { adminSignOut } = useStore();
  const [open, setOpen] = useState(false);
  const [changing, setChanging] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); window.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div className="adm-user" ref={ref}>
      <button type="button" className="adm-user-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="adm-avatar" aria-hidden="true">{initial}</span>
        <span className="adm-user-text">
          <strong>{name}</strong>
          {showEmail && <small>{email}</small>}
        </span>
        <svg className="adm-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        <span className="sr-only">Account menu</span>
      </button>
      {open && (
        <div className="adm-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); setChanging(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            Change password
          </button>
          <button type="button" role="menuitem" onClick={adminSignOut}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" /></svg>
            Sign out
          </button>
        </div>
      )}
      {changing && <ChangePassword onClose={() => setChanging(false)} />}
    </div>
  );
}

// Sidebar layout for every admin page.
function Shell({ children }) {
  const { adminSession, adminName, adminCountNewOrders } = useStore();
  const path = usePathname();
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const load = () => adminCountNewOrders().then(setNewCount).catch(() => {});
    load();
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, [path]);

  const email = adminSession.user.email;
  const name = adminName || email;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="adm">
      <aside className="adm-side">
        <Brand />
        <nav className="adm-nav" aria-label="Admin">
          {NAV.map((n) => {
            const on = n.href === '/admin' ? path === '/admin' : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.icon} /></svg>
                <span>{n.label}</span>
                {n.label === 'Orders' && newCount > 0 && <span className="adm-badge" aria-label={`${newCount} new`}>{newCount}</span>}
              </Link>
            );
          })}
        </nav>
        <AccountMenu name={name} email={email} showEmail={Boolean(adminName)} initial={initial} />
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}

// Shows the sign-in screen until an admin is signed in, then the page inside the admin layout.
export default function AdminGate({ children }) {
  const { adminSession, isAdmin, adminReady, adminSignOut } = useStore();

  if (!supabaseConfigured) {
    return (
      <Centered>
        <p className="error">The database keys are missing. Add them in the hosting settings, then redeploy.</p>
      </Centered>
    );
  }
  if (!adminReady) return <Centered><p className="muted">Loading…</p></Centered>;
  if (!adminSession) return <SignIn />;
  if (!isAdmin) {
    return (
      <Centered>
        <p>This account ({adminSession.user.email}) does not have admin access.</p>
        <button className="btn btn-outline" onClick={adminSignOut}>Sign out</button>
      </Centered>
    );
  }
  return <Shell>{children}</Shell>;
}
