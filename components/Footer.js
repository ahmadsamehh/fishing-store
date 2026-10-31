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
  whatsapp: <svg width="18" height="18" viewBox="0 0 48 48" fill="none" aria-hidden="true"><g transform="translate(-700,-360)" fill="#67C15E" fillRule="evenodd"><path d="M723.993033,360 C710.762252,360 700,370.765287 700,383.999801 C700,389.248451 701.692661,394.116025 704.570026,398.066947 L701.579605,406.983798 L710.804449,404.035539 C714.598605,406.546975 719.126434,408 724.006967,408 C737.237748,408 748,397.234315 748,384.000199 C748,370.765685 737.237748,360.000398 724.006967,360.000398 L723.993033,360.000398 L723.993033,360 Z M717.29285,372.190836 C716.827488,371.07628 716.474784,371.034071 715.769774,371.005401 C715.529728,370.991464 715.262214,370.977527 714.96564,370.977527 C714.04845,370.977527 713.089462,371.245514 712.511043,371.838033 C711.806033,372.557577 710.056843,374.23638 710.056843,377.679202 C710.056843,381.122023 712.567571,384.451756 712.905944,384.917648 C713.258648,385.382743 717.800808,392.55031 724.853297,395.471492 C730.368379,397.757149 732.00491,397.545307 733.260074,397.27732 C735.093658,396.882308 737.393002,395.527239 737.971421,393.891043 C738.54984,392.25405 738.54984,390.857171 738.380255,390.560912 C738.211068,390.264652 737.745308,390.095816 737.040298,389.742615 C736.335288,389.389811 732.90737,387.696673 732.25849,387.470894 C731.623543,387.231179 731.017259,387.315995 730.537963,387.99333 C729.860819,388.938653 729.198006,389.89831 728.661785,390.476494 C728.238619,390.928051 727.547144,390.984595 726.969123,390.744481 C726.193254,390.420348 724.021298,389.657798 721.340985,387.273388 C719.267356,385.42535 717.856938,383.125756 717.448104,382.434484 C717.038871,381.729275 717.405907,381.319529 717.729948,380.938852 C718.082653,380.501232 718.421026,380.191036 718.77373,379.781688 C719.126434,379.372738 719.323884,379.160897 719.549599,378.681068 C719.789645,378.215575 719.62006,377.735746 719.450874,377.382942 C719.281687,377.030139 717.871269,373.587317 717.29285,372.190836 Z"/></g></svg>,
  facebook: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z" /></svg>,
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>,
  youtube: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3L10 15z" /></svg>,
};

export default function Footer() {
  const { categories: CATEGORIES } = useCatalog();
  const socials = [['whatsapp', WA], ...Object.entries(SOCIAL).filter(([, url]) => url)];
  return (
    <footer className="site-footer f-big">
      <div className="wrap f-grid">
        <div className="f-brand">
          <Link href="/" className="f-logo"><Logo size={32} /><span>Marjan</span></Link>
          <p>Reef aquarium supplies, delivered across Egypt. Chosen by people who keep reefs themselves.</p>
          <ul className="f-contact">
            <li>{CONTACT.phoneDisplay}</li>
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
