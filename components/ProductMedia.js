'use client';
import { useEffect, useRef, useState } from 'react';
import ProductImage from './ProductImage';
import { youtubeId } from '@/lib/youtube';
import { thumbOf } from '@/lib/images';

// Product page gallery: all product photos, then the video (if any).
// Customers swipe on phones, or tap the small pictures underneath.
// Only the first photo loads straight away; the others load when they are about to be seen.
// The video starts (muted) when its slide is on screen, and stops when they swipe away.
export default function ProductMedia({ product }) {
  const photos = product.images?.length ? product.images : product.image ? [product.image] : [];
  const videoId = youtubeId(product.youtubeUrl);
  const slides = [...photos.map((url) => ({ type: 'photo', url })), ...(videoId ? [{ type: 'video' }] : [])];
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  // Keep the selected thumbnail in step with swiping.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setActive(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [slides.length]);

  const goTo = (i) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  // One photo and no video: a plain picture, as before.
  if (slides.length <= 1 && !videoId) {
    return <div className="pdp-img"><ProductImage product={product} size="lg" eager /></div>;
  }
  if (!slides.length) slides.push({ type: 'photo', url: '' });

  const videoIndex = videoId ? slides.length - 1 : -1;
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;

  return (
    <div className="media">
      <div className="media-track" ref={trackRef} aria-label="Product photos and video">
        {slides.map((s, i) =>
          s.type === 'photo' ? (
            <div className="media-slide" key={`p${i}`}>
              {s.url ? (
                <img className="pimg" src={s.url} alt={`${product.name}, photo ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
              ) : (
                <ProductImage product={product} size="lg" eager />
              )}
            </div>
          ) : (
            <div className="media-slide media-video" key="video">
              {active === videoIndex ? (
                <iframe src={src} title={`${product.name} video`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
              ) : (
                <button type="button" className="media-poster" onClick={() => goTo(videoIndex)} aria-label="Play video">
                  {product.image ? <img src={product.image} alt="" loading="lazy" decoding="async" /> : null}
                  <span className="media-poster-label">Watch the video</span>
                  <span className="play" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </button>
              )}
            </div>
          )
        )}
      </div>

      <div className="media-thumbs" role="tablist" aria-label="Choose a photo or the video">
        {slides.map((s, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`media-thumb${active === i ? ' on' : ''}${s.type === 'video' ? ' is-video' : ''}`}
            onClick={() => goTo(i)}
            aria-label={s.type === 'video' ? 'Video' : `Photo ${i + 1}`}
          >
            {s.type === 'photo' && s.url ? (
              <img src={thumbOf(s.url)} alt="" loading="lazy" decoding="async" onError={(e) => { if (e.currentTarget.src !== s.url) e.currentTarget.src = s.url; }} />
            ) : s.type === 'video' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            ) : null}
          </button>
        ))}
      </div>
      <p className="media-hint muted">{photos.length > 1 ? 'Swipe for more photos' : 'Swipe to watch the video'}{photos.length > 1 && videoId ? ' and the video' : ''}</p>
    </div>
  );
}