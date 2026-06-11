import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { simulateCanIBuy } from "@/lib/api";

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

const decisionTone = {
  CAN_BUY: "border-primary/50 bg-primary/10 text-primary",
  TIGHT: "border-secondary/50 bg-secondary/10 text-secondary",
  DO_NOT_BUY: "border-destructive/50 bg-destructive/10 text-destructive"
};

export default async function PossoGastarPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const amount = firstParam(params.amount);
  const description = firstParam(params.description) ?? "Compra simulada";
  const installmentsCount = Number(firstParam(params.installmentsCount) ?? 1);
  const paymentType = (firstParam(params.paymentType) ?? "CASH") as "CASH" | "DEBIT" | "CREDIT";
  const shouldSimulate = Boolean(amount);
  const simulation = shouldSimulate
    ? await simulateCanIBuy(session.user, {
        description,
        amountCents: reaisToCents(amount),
        installmentsCount: Number.isFinite(installmentsCount) ? installmentsCount : 1,
        paymentType
      })
    : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Posso Gastar?</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Simule antes da bufunfa sumir</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Informe uma compra e veja o impacto imediato na bufunfa livre real.
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard">Dashboard</a>
        </Button>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <form className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Nova simulacao</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Analisar compra</h2>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Descricao</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              defaultValue={description}
              name="description"
              type="text"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Valor</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              defaultValue={amount}
              name="amount"
              placeholder="250,00"
              required
              type="text"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Parcelas</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={installmentsCount}
                max={48}
                min={1}
                name="installmentsCount"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Pagamento</span>
              <select
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={paymentType}
                name="paymentType"
              >
                <option value="CASH">A vista</option>
                <option value="DEBIT">Debito</option>
                <option value="CREDIT">Credito</option>
              </select>
            </label>
          </div>

          <Button type="submit">Simular</Button>
        </form>

        {simulation ? (
          <section className="grid gap-4">
            <article
              className={`rounded-lg border p-6 ${simulation.decision ? decisionTone[simulation.decision] : "bg-card"}`}
            >
              <p className="text-sm opacity-80">Resultado</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">{simulation.message}</h2>
            </article>

            {simulation.ready ? (
              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-lg border bg-card p-5">
                  <p className="text-sm text-muted-foreground">Bufunfa livre atual</p>
                  <strong className="mt-3 block text-2xl font-semibold">
                    {formatCurrency(simulation.currentFreeMoneyCents ?? 0)}
                  </strong>
                </article>
                <article className="rounded-lg border bg-card p-5">
                  <p className="text-sm text-muted-foreground">Impacto imediato</p>
                  <strong className="mt-3 block text-2xl font-semibold">
                    {formatCurrency(simulation.immediateImpactCents ?? 0)}
                  </strong>
                </article>
                <article className="rounded-lg border bg-card p-5">
                  <p className="text-sm text-muted-foreground">Sobra projetada</p>
                  <strong className="mt-3 block text-2xl font-semibold">
                    {formatCurrency(simulation.projectedFreeMoneyCents ?? 0)}
                  </strong>
                </article>
                <article className="rounded-lg border bg-card p-5">
                  <p className="text-sm text-muted-foreground">Fatura projetada</p>
                  <strong className="mt-3 block text-2xl font-semibold">
                    {formatCurrency(simulation.projectedInvoiceCents ?? 0)}
                  </strong>
                </article>
              </div>
            ) : null}
          </section>
        ) : (
          <section className="rounded-lg border border-dashed bg-card p-6">
            <p className="text-sm text-muted-foreground">Nenhuma compra simulada ainda.</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Pergunte antes de gastar.</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              O simulador compara a compra com sua bufunfa livre, contas, fatura, meta e margem.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
