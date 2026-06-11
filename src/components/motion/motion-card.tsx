"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

type MotionCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionCard({ children, className, delay = 0 }: MotionCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const animation = animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 520,
      delay,
      ease: "outExpo"
    });

    return () => {
      animation.revert();
    };
  }, [delay]);

  return (
    <article
      ref={cardRef}
      className={cn(
        "rounded-lg border bg-card/90 p-5 opacity-0 shadow-xl shadow-black/15 transition-colors hover:border-primary/40",
        className
      )}
    >
      {children}
    </article>
  );
}
