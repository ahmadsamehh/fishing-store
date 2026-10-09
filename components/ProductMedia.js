'use client';
import { useEffect, useRef, useState } from 'react';
import ProductImage from './ProductImage';
import { youtubeId, youtubeThumb } from '@/lib/youtube';

// Swipeable gallery: photo first, then the product video (if it has one).
// The video starts playing (muted, as browsers require) when its slide is on screen,
// and stops when the customer swipes back.
export default function ProductMedia({ product }) {
  const videoId = youtubeId(product.youtubeUrl);
  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const [active, setActive] = useState(0);
  const [videoVisible, setVideoVisible] = useState(false);

  useEffect(() => {
    if (!videoId || !videoRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const on = entry.intersectionRatio > 0.6;
        setVideoVisible(on);
        setActive(on ? 1 : 0);
      },
      { root: trackRef.current, threshold: [0, 0.6, 1] }
    );
    obs.observe(videoRef.current);
    return () => obs.disconnect();
  }, [videoId]);

  const goTo = (i) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  if (!videoId) return <div className="pdp-img"><ProductImage product={product} /></div>;

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;

  return (
    <div className="media">
      <div className="media-track" ref={trackRef} aria-label="Product photo and video">
        <div className="media-slide">
          <ProductImage product={product} />
        </div>
        <div className="media-slide media-video" ref={videoRef}>
          {videoVisible ? (
            <iframe
              src={src}
              title={`${product.name} video`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button type="button" className="media-poster" onClick={() => goTo(1)} aria-label="Play video">
              <img src={youtubeThumb(videoId)} alt="" loading="lazy" />
              <span className="play" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="media-tabs" role="tablist" aria-label="Choose photo or video">
        <button role="tab" aria-selected={active === 0} className={active === 0 ? 'on' : ''} onClick={() => goTo(0)}>Photo</button>
        <button role="tab" aria-selected={active === 1} className={active === 1 ? 'on' : ''} onClick={() => goTo(1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          Video
        </button>
      </div>
      <p className="media-hint muted">Swipe to watch the video</p>
    </div>
  );
}
