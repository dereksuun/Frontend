"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

type BufunfometroGaugeProps = {
  freeMoneyCents: number;
  expectedIncomeCents: number;
  risk: "SAFE" | "ATTENTION" | "DANGEROUS" | "CHAOTIC";
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0
});

const riskCopy: Record<BufunfometroGaugeProps["risk"], { label: string; tone: string; message: string }> = {
  SAFE: {
    label: "Respirando bem",
    tone: "text-primary",
    message: "A bufunfa ainda tem margem para escolhas conscientes."
  },
  ATTENTION: {
    label: "Olho vivo",
    tone: "text-secondary",
    message: "Ainda cabe, mas cada gasto novo precisa passar pelo crivo."
  },
  DANGEROUS: {
    label: "Apertado",
    tone: "text-amber-300",
    message: "A fatura esta puxando o mes para baixo."
  },
  CHAOTIC: {
    label: "Sobrevivencia",
    tone: "text-destructive",
    message: "Melhor segurar novas compras ate reorganizar o fluxo."
  }
};

export function BufunfometroGauge({ freeMoneyCents, expectedIncomeCents, risk }: BufunfometroGaugeProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const ratio = expectedIncomeCents > 0 ? Math.max(0, Math.min(1, freeMoneyCents / expectedIncomeCents)) : 0;
  const displayValue = useMemo(() => currencyFormatter.format(freeMoneyCents / 100), [freeMoneyCents]);
  const circumference = 2 * Math.PI * 72;
  const riskDetails = riskCopy[risk];

  useEffect(() => {
    const progress = progressRef.current;
    const value = valueRef.current;
    const animated = { amount: 0 };

    if (progress) {
      animate(progress, {
        strokeDashoffset: [circumference, circumference * (1 - ratio)],
        duration: 900,
        ease: "outExpo"
      });
    }

    if (value) {
      animate(animated, {
        amount: freeMoneyCents / 100,
        duration: 900,
        ease: "outExpo",
        onUpdate: () => {
          value.textContent = currencyFormatter.format(animated.amount);
        }
      });
    }
  }, [circumference, freeMoneyCents, ratio]);

  return (
    <section className="relative overflow-hidden rounded-lg border bg-card p-6 shadow-2xl shadow-black/25">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative mx-auto h-48 w-48 shrink-0">
          <svg className="-rotate-90" height="192" viewBox="0 0 192 192" width="192" aria-hidden="true">
            <circle cx="96" cy="96" fill="none" r="72" stroke="hsl(var(--muted))" strokeWidth="18" />
            <circle
              ref={progressRef}
              cx="96"
              cy="96"
              fill="none"
              r="72"
              stroke="url(#bufunfa-gauge)"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              strokeWidth="18"
            />
            <defs>
              <linearGradient id="bufunfa-gauge" x1="24" x2="168" y1="96" y2="96">
                <stop stopColor="hsl(var(--primary))" />
                <stop offset="0.55" stopColor="hsl(var(--secondary))" />
                <stop offset="1" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <span ref={valueRef} className="block text-3xl font-semibold tracking-normal">
                {displayValue}
              </span>
              <span className="mt-1 block text-xs uppercase text-muted-foreground">livres agora</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-secondary">Meu Bufunfometro</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-5xl">Quanto da grana ainda respira?</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{riskDetails.message}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className={cn("rounded-md bg-background px-3 py-2 text-sm font-medium", riskDetails.tone)}>
              {riskDetails.label}
            </span>
            <span className="rounded-md bg-background px-3 py-2 text-sm text-muted-foreground">
              {Math.round(ratio * 100)}% da renda prevista livre
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
