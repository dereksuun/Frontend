import type { TimelineEvent } from "@/lib/api";

type MonthlyTimelineProps = {
  events: TimelineEvent[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC"
});

const kindLabels: Record<TimelineEvent["kind"], string> = {
  PAYMENT: "Pagamento",
  INCOME: "Renda",
  BILL: "Conta",
  CARD: "Cartao",
  SPENDING: "Gasto"
};

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function MonthlyTimeline({ events }: MonthlyTimelineProps) {
  if (events.length === 0) {
    return (
      <article className="rounded-lg border border-dashed bg-card p-6">
        <p className="text-sm text-muted-foreground">Nenhum evento financeiro para este mes.</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal">O calendario ainda esta quieto.</h2>
        <p className="mt-3 text-muted-foreground">
          Salve renda, contas, gastos ou compras no cartao para montar a linha do tempo.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border bg-card p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-secondary">Linha do mes</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">Proximos movimentos</h2>
        </div>
        <span className="text-sm text-muted-foreground">{events.length} eventos</span>
      </div>

      <div className="mt-6 grid gap-3">
        {events.slice(0, 10).map((event) => (
          <div key={event.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md bg-background p-3">
            <div className="text-sm font-medium text-muted-foreground">{dayFormatter.format(new Date(event.date))}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="truncate text-sm font-semibold">{event.title}</strong>
                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {kindLabels[event.kind]}
                </span>
                {event.status ? (
                  <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{event.status}</span>
                ) : null}
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{event.description}</p>
            </div>
            <strong className={event.direction === "IN" ? "text-primary" : "text-destructive"}>
              {event.direction === "IN" ? "+" : "-"}
              {formatCurrency(event.amountCents)}
            </strong>
          </div>
        ))}
      </div>
    </article>
  );
}
