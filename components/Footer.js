import Link from 'next/link';
import { Logo } from './Icons';
import { CATEGORIES, categoryHref } from '@/lib/catalog';

const service = [
  ['Contact us', '#'],
  ['Shipping & delivery', '#'],
  ['Returns & exchanges', '#'],
  ['Payment methods', '#'],
];
const account = [
  ['Sign in or create account', '/account'],
  ['My orders', '/account#orders'],
  ['Cart', '/cart'],
];
const about = [
  ['About us', '#'],
  ['Terms & conditions', '#'],
  ['Privacy policy', '#'],
];

function Col({ title, links }) {
  return (
    <div className="f-col">
      <span className="f-title">{title}</span>
      {links.map(([label, href]) => (<Link key={label} href={href}>{label}</Link>))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer f-big">
      <div className="wrap f-grid">
        <div className="f-brand">
          <Link href="/" className="f-logo"><Logo size={32} /><span>Marjan</span></Link>
          <p>Reef aquarium supplies, delivered across Egypt. Chosen and tested by people who keep reefs themselves.</p>
          <ul className="f-contact">
            <li>[PHONE]</li>
            <li>[EMAIL]</li>
            <li>[ADDRESS]</li>
          </ul>
          <div className="f-social" aria-label="Social media">
            <a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z" /></svg></a>
            <a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg></a>
            <a href="#" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3L10 15z" /></svg></a>
          </div>
        </div>
        <Col title="Shop" links={CATEGORIES.slice(0, 6).map((c) => [c, categoryHref(c)])} />
        <Col title="Customer service" links={service} />
        <Col title="My account" links={account} />
        <Col title="About" links={about} />
      </div>
      <div className="wrap f-bottom">
        <span>© 2026 Marjan. All rights reserved.</span>
        <span>Prices in Egyptian pounds (EGP)</span>
      </div>
    </footer>
  );
}
