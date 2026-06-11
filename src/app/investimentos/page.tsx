import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { simulateInvestment } from "@/lib/api";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function reaisToCents(value: string | undefined) {
  const normalized = String(value ?? "0").replace(/\./g, "").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InvestimentosPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const initialAmount = firstParam(params.initialAmount) ?? "1000,00";
  const monthlyContribution = firstParam(params.monthlyContribution) ?? "300,00";
  const months = Number(firstParam(params.months) ?? 24);
  const annualRatePercent = Number(firstParam(params.annualRatePercent) ?? 10);
  const shouldSimulate = Boolean(params.initialAmount || params.monthlyContribution || params.months || params.annualRatePercent);
  const simulation = shouldSimulate
    ? await simulateInvestment(session.user, {
        initialAmountCents: reaisToCents(initialAmount),
        monthlyContributionCents: reaisToCents(monthlyContribution),
        months: Number.isFinite(months) ? months : 24,
        annualRatePercent: Number.isFinite(annualRatePercent) ? annualRatePercent : 10
      })
    : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Bufunfa plantada</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Simulador de investimentos</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Estime cenarios de crescimento com aportes mensais, prazo e taxa anual. Use como estudo, nao como ordem.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href="/indicadores">Indicadores</a>
          </Button>
          <Button asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </header>

      <section className="mt-8 rounded-lg border border-secondary/40 bg-secondary/10 p-5 text-secondary">
        O Bufunfometro nao fornece recomendacao financeira profissional. As informacoes exibidas sao educativas e servem
        para organizacao pessoal e simulacoes. Antes de investir, estude os produtos e considere seu perfil, seus
        objetivos e os riscos envolvidos.
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <form className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Nova simulacao</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Projetar rendimento</h2>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Valor inicial</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              defaultValue={initialAmount}
              name="initialAmount"
              type="text"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Aporte mensal</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              defaultValue={monthlyContribution}
              name="monthlyContribution"
              type="text"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Meses</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={months}
                max={600}
                min={1}
                name="months"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Taxa anual %</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={annualRatePercent}
                max={100}
                min={0}
                name="annualRatePercent"
                step="0.1"
                type="number"
              />
            </label>
          </div>

          <Button type="submit">Simular</Button>
        </form>

        {simulation ? (
          <section className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Valor final</p>
                <strong className="mt-3 block text-2xl font-semibold">
                  {formatCurrency(simulation.finalAmountCents)}
                </strong>
              </article>
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Total aportado</p>
                <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(simulation.investedCents)}</strong>
              </article>
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Rendimento estimado</p>
                <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(simulation.earningsCents)}</strong>
              </article>
            </div>

            <article className="rounded-lg border bg-card p-5">
              <p className="text-sm text-muted-foreground">Marcos da simulacao</p>
              <div className="mt-4 grid gap-3">
                {simulation.timeline.map((point) => (
                  <div key={point.month} className="flex items-center justify-between rounded-md bg-background p-3">
                    <span className="text-sm text-muted-foreground">Mes {point.month}</span>
                    <strong>{formatCurrency(point.balanceCents)}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : (
          <section className="rounded-lg border border-dashed bg-card p-6">
            <p className="text-sm text-muted-foreground">Nenhuma simulacao feita ainda.</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Plante a bufunfa no papel primeiro.</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Rode cenarios com taxas estimadas e compare prazo, liquidez, risco e custos antes de estudar produtos reais.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
