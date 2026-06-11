import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getMarketIndicators } from "@/lib/api";

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC"
});

function formatIndicatorValue(value: string | number) {
  return `${percentFormatter.format(Number(value))}%`;
}

export default async function IndicadoresPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const indicators = await getMarketIndicators(session.user);
  const latestUpdate = indicators
    .map((indicator) => new Date(indicator.updatedAt).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Indicadores</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Radar financeiro</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Dados macroeconomicos em cache para apoiar estudos e simulacoes sem depender de consultas excessivas.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href="/investimentos">Investimentos</a>
          </Button>
          <Button asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </header>

      <section className="mt-8 rounded-lg border border-secondary/40 bg-secondary/10 p-5 text-secondary">
        Indicadores sao dados educativos. Eles nao substituem estudo de produto, risco, prazo, liquidez e custos.
      </section>

      {indicators.length > 0 ? (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {indicators.map((indicator) => (
              <article key={indicator.code} className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">{indicator.name}</p>
                <strong className="mt-3 block text-3xl font-semibold">{formatIndicatorValue(indicator.value)}</strong>
                <p className="mt-3 text-sm text-muted-foreground">
                  Referencia {dateFormatter.format(new Date(indicator.referenceAt))}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{indicator.source}</p>
              </article>
            ))}
          </section>

          <section className="mt-8 rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Ultima atualizacao do cache</p>
            <strong className="mt-3 block text-2xl font-semibold">
              {latestUpdate ? dateFormatter.format(new Date(latestUpdate)) : "Sem registro"}
            </strong>
            <p className="mt-3 text-muted-foreground">
              A atualizacao diaria fica a cargo da rota protegida de cron no backend.
            </p>
          </section>
        </>
      ) : (
        <section className="mt-8 rounded-lg border border-dashed bg-card p-6">
          <p className="text-sm text-muted-foreground">Nenhum indicador em cache ainda.</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">O radar ainda esta sem sinal.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Rode o cron `/api/cron/update-market-data` no backend com `Authorization: Bearer CRON_SECRET` para preencher
            Selic, IPCA e CDI.
          </p>
        </section>
      )}
    </main>
  );
}
