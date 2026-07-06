"use client";

import { useEffect, useRef, useCallback, useState } from "react";

type MouseParallaxProps = {
  children?: React.ReactNode;
  floatDepth?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function MouseParallax({ children, floatDepth = 1, className, style }: MouseParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [isNear, setIsNear] = useState(false);

  const animate = useCallback(() => {
    if (!ref.current) return;

    const lerp = isNear ? 0.1 : 0.04;
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp;

    const floaters = ref.current.querySelectorAll("[data-float]");
    floaters.forEach((el, i) => {
      const depth = ((i % 5) + 1) * 0.3 * floatDepth;
      const tx = currentRef.current.x * depth;
      const ty = currentRef.current.y * depth;
      (el as HTMLElement).style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });

    const statics = ref.current.querySelectorAll("[data-parallax]");
    statics.forEach((el, i) => {
      const depth = ((i % 3) + 1) * 0.15 * floatDepth;
      const tx = currentRef.current.x * depth;
      const ty = currentRef.current.y * depth;
      (el as HTMLElement).style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [floatDepth, isNear]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const threshold = 500;

      if (dist < threshold) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        targetRef.current.x = (e.clientX / vw - 0.5) * 2;
        targetRef.current.y = (e.clientY / vh - 0.5) * 2;
        setIsNear(true);
      } else {
        targetRef.current.x = 0;
        targetRef.current.y = 0;
        setIsNear(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div ref={ref} className={className} style={{ position: "relative", ...style }}>
      {children}
    </div>
  );
}
