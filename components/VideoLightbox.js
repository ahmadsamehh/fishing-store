'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

// Plays a YouTube video in a window over the page. Closes with ×, Esc, or a tap outside.
// It is attached to the page body, so the page's own animations can't push it off-screen.
export default function VideoLightbox({ video, onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className="vl" role="dialog" aria-modal="true" aria-label={video.title || 'Video'} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vl-box">
        <button type="button" className="vl-close" onClick={onClose} aria-label="Close video">×</button>
        <div className="vl-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
            title={video.title || 'Video'}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
        {(video.title || video.product) && (
          <div className="vl-foot">
            <strong>{video.title}</strong>
            {video.product && <Link href={`/products/${video.product.id}`} className="btn btn-pink btn-sm">View product</Link>}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
