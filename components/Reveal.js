'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Fades elements with the "reveal" class in as they scroll into view.
// Content is only hidden once this script is running, so nothing disappears if it fails.
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root.classList.add('js-reveal');

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    const watch = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    watch();
    // Products load after the page, so keep watching for new cards.
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path]);
  return null;
}
