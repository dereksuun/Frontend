"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type SpendingCategory = {
  category: string;
  amountCents: number;
};

type SpendingCategoryChartProps = {
  data: SpendingCategory[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function SpendingCategoryChart({ data }: SpendingCategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
        Registre gastos avulsos para visualizar a distribuicao por categoria.
      </div>
    );
  }

  return (
    <div className="h-72 rounded-lg border bg-card p-4">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" tickLine={false} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(value) => formatCurrency(Number(value))}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              color: "hsl(var(--foreground))"
            }}
            formatter={(value) => [formatCurrency(Number(value)), "Gasto"]}
          />
          <Bar dataKey="amountCents" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
