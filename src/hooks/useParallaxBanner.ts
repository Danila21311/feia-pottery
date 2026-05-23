'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

/** Сдвиг фонового изображения при скролле (медленнее контента) — лёгкий параллакс. */
export function useParallaxBanner<T extends HTMLElement = HTMLDivElement>(speed = 0.48, scale = 1.1) {
  const containerRef = useRef<T | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [allowMotion, setAllowMotion] = useState(true);

  useEffect(() => {
    setAllowMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (!allowMotion) return;

    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = -rect.top;
      const maxShift = rect.height + vh * 0.5;
      const clamped = Math.max(0, Math.min(raw, maxShift));
      setOffsetY(clamped * speed);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed, allowMotion]);

  const imageStyle: CSSProperties = allowMotion
    ? {
        transform: `translate3d(0, ${offsetY}px, 0) scale(${scale})`,
        willChange: 'transform',
      }
    : {};

  return { containerRef, imageStyle };
}
