"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";
import { cn } from "@/lib/utils";

type AnimatedDataListProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedDataList({ children, className }: AnimatedDataListProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const rows = root.querySelectorAll("[data-list-row]");
    const animation = animate(rows, {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: stagger(55),
      duration: 420,
      ease: "outExpo"
    });

    return () => {
      animation.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("grid gap-4", className)}>
      {children}
    </div>
  );
}
