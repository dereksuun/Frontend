"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate } from "animejs";

type AnimatedNumberProps = {
  value: number;
  kind?: "currency" | "percent" | "integer";
  className?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

function buildFormatter(kind: NonNullable<AnimatedNumberProps["kind"]>, minimum = 0, maximum = 0) {
  if (kind === "currency") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: minimum,
      maximumFractionDigits: maximum
    });
  }

  if (kind === "percent") {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: minimum,
      maximumFractionDigits: maximum
    });
  }

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0
  });
}

export function AnimatedNumber({
  value,
  kind = "integer",
  className,
  maximumFractionDigits = kind === "percent" ? 2 : 0,
  minimumFractionDigits = kind === "percent" ? 2 : 0
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const formatter = useMemo(
    () => buildFormatter(kind, minimumFractionDigits, maximumFractionDigits),
    [kind, maximumFractionDigits, minimumFractionDigits]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animated = { amount: 0 };
    const animation = animate(animated, {
      amount: value,
      duration: 800,
      ease: "outExpo",
      onUpdate: () => {
        element.textContent = kind === "percent" ? `${formatter.format(animated.amount)}%` : formatter.format(animated.amount);
      }
    });

    return () => {
      animation.revert();
    };
  }, [formatter, kind, value]);

  return (
    <span ref={ref} className={className}>
      {kind === "percent" ? `${formatter.format(value)}%` : formatter.format(value)}
    </span>
  );
}
