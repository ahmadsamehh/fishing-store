'use client';
import { useEffect, useRef, useState } from 'react';

// Home page background video.
// - The poster image shows instantly; the video loads after the page and starts by itself.
// - Phones get a lighter version than computers.
// - No video for people who turned on "reduce motion" or data saver: they see the still image.
// - The video pauses when it scrolls out of view or the tab is hidden, to save battery.
const POSTER = '/videos/hero-poster.jpg';

export default function HeroVideo({ className }) {
  const ref = useRef(null);
  const [src, setSrc] = useState(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData;
    if (reduce || saveData) return;
    const small = window.matchMedia('(max-width: 768px)').matches;
    setSrc(small ? '/videos/hero-mobile.mp4' : '/videos/hero-desktop.mp4');
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    const play = () => v.play().catch(() => {});
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? play() : v.pause()), { threshold: 0.1 });
    io.observe(v);
    const onVis = () => (document.hidden ? v.pause() : play());
    document.addEventListener('visibilitychange', onVis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, [src]);

  if (!src) return <img className={className} src={POSTER} alt="" fetchPriority="high" />;
  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={POSTER}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      disablePictureInPicture
    />
  );
}