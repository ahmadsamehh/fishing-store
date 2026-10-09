'use client';
import { useEffect, useState } from 'react';
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
];

// Sidebar layout for every admin page.
function Shell({ children }) {
  const { adminSession, adminName, adminSignOut, adminCountNewOrders } = useStore();
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
        <div className="adm-user">
          <span className="adm-avatar" aria-hidden="true">{initial}</span>
          <span className="adm-user-text">
            <strong>{name}</strong>
            {adminName && <small>{email}</small>}
          </span>
          <button className="adm-signout" onClick={adminSignOut}>Sign out</button>
        </div>
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
