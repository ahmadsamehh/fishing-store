'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { SearchIcon, UserIcon, CartIcon, Logo } from './Icons';
import MegaMenu from './MegaMenu';

export default function Header() {
  const { cartCount, session } = useStore();
  const router = useRouter();
  const [q, setQ] = useState('');
  const name = session?.user?.user_metadata?.full_name?.split(' ')[0];

  // Little bounce on the cart count when something is added.
  const [bump, setBump] = useState(false);
  const prev = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prev.current = cartCount;
      return () => clearTimeout(t);
    }
    prev.current = cartCount;
  }, [cartCount]);

  const submit = (e) => {
    e.preventDefault();
    router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="site-header">
      <div className="topbar">Free shipping on orders over EGP [AMOUNT] · Delivery across Egypt</div>
      <div className="wrap header-main">
        <Link href="/" className="brand">
          <span className="brand-mark"><Logo /></span>
          <span className="brand-name">Marjan</span>
        </Link>
        <Suspense fallback={<span className="mm-toggle">Menu</span>}>
          <MegaMenu />
        </Suspense>
        <form className="search" onSubmit={submit} role="search">
          <label htmlFor="q" className="sr-only">Search the store</label>
          <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands or categories" />
          <button type="submit" aria-label="Search"><SearchIcon /></button>
        </form>
        <nav className="header-actions" aria-label="Account">
          <Link href="/account" className="icon-link"><UserIcon /><span>{session ? (name ? `Hi, ${name}` : 'My account') : 'Sign in'}</span></Link>
          <Link href="/cart" className="cart-link" aria-label={`Cart, ${cartCount} items`}><CartIcon /><span>Cart</span><span className={`count${bump ? ' bump' : ''}`}>{cartCount}</span></Link>
        </nav>
      </div>
    </header>
  );
}
