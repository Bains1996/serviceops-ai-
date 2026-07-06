"use client";

import { useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "none";
  className?: string;
  style?: React.CSSProperties;
};

export function ScrollReveal({ children, delay = 0, direction = "up", className, style }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getInitialTransform = () => {
    switch (direction) {
      case "up": return "translateY(50px)";
      case "down": return "translateY(-50px)";
      case "left": return "translateX(50px)";
      case "right": return "translateX(-50px)";
      case "scale": return "scale(0.92)";
      case "none": return "none";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : getInitialTransform(),
        transition: `opacity 0.7s var(--ease-out-expo, cubic-bezier(0.19,1,0.22,1)) ${delay}s, transform 0.7s var(--ease-out-expo, cubic-bezier(0.19,1,0.22,1)) ${delay}s`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
