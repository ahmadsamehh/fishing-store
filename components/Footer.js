import Link from 'next/link';

const cols = [
  { title: 'About', links: ['About us', 'Terms & conditions', 'Privacy policy'] },
  { title: 'Customer service', links: ['Contact us', 'Shipping & delivery', 'Returns & exchanges', 'Payment methods'] },
  { title: 'My account', links: ['Sign in', 'My orders', 'Wish list', 'Reward points'] },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-col">
          <span className="footer-brand">Marjan</span>
          <span>[PHONE]</span>
          <span>[EMAIL]</span>
          <span>[ADDRESS]</span>
        </div>
        {cols.map((col) => (
          <div className="footer-col" key={col.title}>
            <span className="footer-title">{col.title}</span>
            {col.links.map((l) => (<Link key={l} href="#">{l}</Link>))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">© 2026 Marjan. All rights reserved. <Link href="/admin">Store admin</Link></div>
    </footer>
  );
}
