'use client';
import Link from 'next/link';
import { Logo } from './Icons';
import { categoryHref } from '@/lib/catalog';
import { useCatalog } from '@/lib/useCatalog';
import { WHATSAPP_NUMBER, CONTACT, SOCIAL } from '@/lib/config';

const WA = `https://wa.me/${WHATSAPP_NUMBER}`;

const help = [
  ['How ordering works', '/how-to-order'],
  ['Chat with us on WhatsApp', WA],
  ['Deals', '/products?sale=1'],
];
const account = [
  ['Sign in or create account', '/account'],
  ['My orders', '/account#orders'],
  ['Cart', '/cart'],
];

function Col({ title, links }) {
  return (
    <div className="f-col">
      <span className="f-title">{title}</span>
      {links.map(([label, href]) =>
        href.startsWith('http') ? (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        ) : (
          <Link key={label} href={href}>{label}</Link>
        )
      )}
    </div>
  );
}

const socialIcons = {
  facebook: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z" /></svg>,
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>,
  youtube: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3L10 15z" /></svg>,
};

export default function Footer() {
  const { categories: CATEGORIES } = useCatalog();
  const socials = Object.entries(SOCIAL).filter(([, url]) => url);
  return (
    <footer className="site-footer f-big">
      <div className="wrap f-grid">
        <div className="f-brand">
          <Link href="/" className="f-logo"><Logo size={32} /><span>Marjan</span></Link>
          <p>Reef aquarium supplies, delivered across Egypt. Chosen by people who keep reefs themselves.</p>
          <ul className="f-contact">
            <li>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="f-wa">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
                {CONTACT.phoneDisplay}
              </a>
            </li>
            {CONTACT.email && <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>}
            {CONTACT.address && <li>{CONTACT.address}</li>}
          </ul>
          {socials.length > 0 && (
            <div className="f-social" aria-label="Social media">
              {socials.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name[0].toUpperCase() + name.slice(1)}>{socialIcons[name]}</a>
              ))}
            </div>
          )}
        </div>
        <Col title="Shop" links={CATEGORIES.map((c) => [c, categoryHref(c)])} />
        <Col title="Help" links={help} />
        <Col title="My account" links={account} />
      </div>
      <div className="wrap f-bottom">
        <span>© {new Date().getFullYear()} Marjan. All rights reserved.</span>
        <span>Prices in Egyptian pounds (EGP)</span>
      </div>
    </footer>
  );
}
