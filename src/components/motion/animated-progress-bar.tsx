"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

type AnimatedProgressBarProps = {
  value: number;
  className?: string;
  barClassName?: string;
};

export function AnimatedProgressBar({ value, className, barClassName }: AnimatedProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const normalizedValue = Math.max(0, Math.min(100, value));

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const animation = animate(bar, {
      width: [`0%`, `${normalizedValue}%`],
      duration: 800,
      ease: "outExpo"
    });

    return () => {
      animation.revert();
    };
  }, [normalizedValue]);

  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-background", className)}>
      <div ref={barRef} className={cn("h-full rounded-full bg-primary", barClassName)} style={{ width: `${normalizedValue}%` }} />
    </div>
  );
}
