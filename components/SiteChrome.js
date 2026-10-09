'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

// The store header and footer show everywhere except the admin panel,
// which has its own layout.
export default function SiteChrome({ children }) {
  const path = usePathname() || '';
  if (path === '/admin' || path.startsWith('/admin/')) return children;
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
