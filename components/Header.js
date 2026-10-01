'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/seed';
import { SearchIcon, UserIcon, HeartIcon, CartIcon, Logo } from './Icons';

export default function Header() {
  const { cartCount } = useStore();
  const router = useRouter();
  const [q, setQ] = useState('');

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
        <form className="search" onSubmit={submit} role="search">
          <label htmlFor="q" className="sr-only">Search the store</label>
          <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands or categories" />
          <button type="submit" aria-label="Search"><SearchIcon /></button>
        </form>
        <nav className="header-actions" aria-label="Account">
          <Link href="#" className="icon-link"><UserIcon /><span>Sign in</span></Link>
          <Link href="#" className="icon-btn" aria-label="Wish list"><HeartIcon /></Link>
          <Link href="/cart" className="cart-link"><CartIcon /><span>Cart</span><span className="count">{cartCount}</span></Link>
        </nav>
      </div>
      <nav className="catbar" aria-label="Categories">
        <div className="wrap catbar-inner">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/products?category=${encodeURIComponent(c)}`}>{c}</Link>
          ))}
          <Link href="/products?sale=1" className="deals">Deals</Link>
        </div>
      </nav>
    </header>
  );
}
