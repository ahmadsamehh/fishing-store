'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';

// Small message that slides up from the bottom, e.g. after adding to cart.
export default function Toast() {
  const { toast, hideToast } = useStore();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 3500);
    return () => clearTimeout(t);
  }, [toast?.id]);

  if (!toast) return null;
  return (
    <div className="toast" role="status" key={toast.id}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
      <span>{toast.text}</span>
      {toast.cart && <Link href="/cart" onClick={hideToast}>View cart</Link>}
      <button type="button" aria-label="Close" onClick={hideToast}>×</button>
    </div>
  );
}
