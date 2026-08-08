'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Scroll3DSceneProps = {
  children: React.ReactNode;
  className?: string;
};

export function Scroll3DScene({ children, className }: Scroll3DSceneProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = Array.from(
      root.querySelectorAll<HTMLElement>('main > section, main article, [data-3d-reveal]')
    );

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => (target.dataset.scrollState = 'visible'));
      return;
    }

    let lastScrollY = window.scrollY;
    let direction: 'up' | 'down' = 'down';
    let ticking = false;

    const updateDirection = () => {
      const nextScrollY = window.scrollY;
      if (Math.abs(nextScrollY - lastScrollY) > 4) {
        direction = nextScrollY > lastScrollY ? 'down' : 'up';
        root.dataset.scrollDirection = direction;
        lastScrollY = nextScrollY;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateDirection);
        ticking = true;
      }
    };

    root.dataset.scrollDirection = direction;
    targets.forEach((target, index) => {
      target.dataset.scrollState = 'hidden';
      target.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 55}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.dataset.scrollState = 'visible';
            target.dataset.enterDirection = direction;
          } else {
            const rect = target.getBoundingClientRect();
            target.dataset.scrollState = 'hidden';
            target.dataset.exitPosition = rect.bottom < 0 ? 'above' : 'below';
          }
        });
      },
      { rootMargin: '-7% 0px -8% 0px', threshold: 0.12 }
    );

    targets.forEach((target) => observer.observe(target));
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn('three-d-scene', className)}>
      {children}
    </div>
  );
}
