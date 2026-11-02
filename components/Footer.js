'use client';
import Link from 'next/link';
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
  whatsapp: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>,
  facebook: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z" /></svg>,
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>,
  whatsapp: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>,
  youtube: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3L10 15z" /></svg>,
};

export default function Footer() {
  const { categories: CATEGORIES } = useCatalog();
  // WhatsApp is stored as a number; the others as links.
  const socials = Object.entries(SOCIAL)
    .filter(([, v]) => v)
    .map(([name, v]) => [name, name === 'whatsapp' ? `https://wa.me/${v}` : v]);
  return (
    <footer className="site-footer f-big">
      <div className="wrap f-grid">
        <div className="f-brand">
          <Link href="/" className="f-logo"><img src="/brand/logo-white.svg" alt="Marjan" width="157" height="40" /></Link>
          <p>Reef aquarium supplies, delivered across Egypt. Chosen by people who keep reefs themselves.</p>
          {(CONTACT.email || CONTACT.address) && <ul className="f-contact">
            {CONTACT.email && <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>}
            {CONTACT.address && <li>{CONTACT.address}</li>}
          </ul>}
          {socials.length > 0 && (
            <div className="f-social" aria-label="Social media">
              {socials.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className={`f-soc-${name}`} aria-label={name === 'whatsapp' ? 'WhatsApp' : name[0].toUpperCase() + name.slice(1)}>{socialIcons[name]}</a>
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
