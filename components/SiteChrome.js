'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Toast from './Toast';
import BackToTop from './BackToTop';
import Reveal from './Reveal';

// The store header and footer show everywhere except the admin panel,
// which has its own layout.
export default function SiteChrome({ children }) {
  const path = usePathname() || '';
  if (path === '/admin' || path.startsWith('/admin/')) return children;
  return (
    <>
      <Header />
      {/* key makes each new page fade in */}
      <main key={path} className="page-in">{children}</main>
      <Footer />
      <Toast />
      <BackToTop />
      <Reveal />
    </>
  );
}
