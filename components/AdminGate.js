'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { supabaseConfigured } from '@/lib/supabase';

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
    <div className="wrap section">
      <form className="login" onSubmit={submit}>
        <h1>Store admin</h1>
        <p className="muted">Sign in to manage products and orders.</p>
        <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

// Top bar shared by all admin pages: switch between Products and Orders.
export function AdminBar() {
  const { adminSession, adminSignOut } = useStore();
  const path = usePathname();
  return (
    <div className="admin-top">
      <nav className="admin-tabs" aria-label="Admin sections">
        <Link href="/admin" className={path === '/admin' ? 'on' : ''}>Products</Link>
        <Link href="/admin/orders" className={path.startsWith('/admin/orders') ? 'on' : ''}>Orders</Link>
      </nav>
      <div className="admin-bar">
        <span className="muted">Signed in as {adminSession.user.email}</span>
        <button className="link-btn" onClick={adminSignOut}>Sign out</button>
      </div>
    </div>
  );
}

// Shows the sign-in form until an admin is signed in, then the page.
export default function AdminGate({ children }) {
  const { adminSession, isAdmin, adminReady, adminSignOut } = useStore();

  if (!supabaseConfigured) {
    return (
      <div className="wrap section">
        <h1>Store admin</h1>
        <p className="error">The database keys are missing. Add them in the hosting settings, then redeploy.</p>
      </div>
    );
  }
  if (!adminReady) return <div className="wrap section">Loading…</div>;
  if (!adminSession) return <SignIn />;
  if (!isAdmin) {
    return (
      <div className="wrap section">
        <h1>Store admin</h1>
        <p className="muted">This account ({adminSession.user.email}) does not have admin access.</p>
        <button className="btn btn-outline" onClick={adminSignOut}>Sign out</button>
      </div>
    );
  }
  return children;
}
