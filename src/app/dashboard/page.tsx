import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getDashboardSummary, type DashboardSummary } from "@/lib/api";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

const riskLabels: Record<DashboardSummary["creditCardRisk"], string> = {
  SAFE: "Seguro",
  ATTENTION: "Atencao",
  DANGEROUS: "Perigoso",
  CHAOTIC: "Sobrevivencia"
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { profile, summary } = await getDashboardSummary(session.user);
  const cards = summary
    ? [
        { label: "Bufunfa livre real", value: formatCurrency(summary.realFreeMoneyCents) },
        { label: "Renda prevista", value: formatCurrency(summary.expectedIncomeCents) },
        { label: "Contas pendentes", value: `${summary.pendingExpensesCount} boletos` },
        { label: "Fatura atual", value: formatCurrency(summary.currentInvoiceCents) }
      ]
    : [
        { label: "Bufunfa livre real", value: "Aguardando onboarding" },
        { label: "Renda prevista", value: "Configure seu perfil" },
        { label: "Contas pendentes", value: "Sem dados ainda" },
        { label: "Fatura atual", value: "Sem dados ainda" }
      ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-8 py-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-secondary">Meu Derycash</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Resumo financeiro</h1>
          <p className="mt-3 text-muted-foreground">
            Ola, {session.user.name ?? session.user.email ?? "usuario"}.{" "}
            {profile ? "Seu perfil financeiro inicial ja esta carregado." : "Vamos montar seu perfil financeiro."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href="/contas">Contas fixas</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/cartoes">Cartoes</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/gastos">Gastos</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/metas">Metas</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/posso-gastar">Posso gastar?</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/investimentos">Investimentos</a>
          </Button>
          <Button asChild>
            <a href="/onboarding">{profile ? "Editar perfil" : "Configurar onboarding"}</a>
          </Button>
        </div>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <strong className="mt-3 block text-2xl font-semibold">{card.value}</strong>
          </article>
        ))}
      </section>

      {summary ? (
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Meta protegida</p>
            <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(summary.protectedGoalCents)}</strong>
          </article>
          <article className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Proximo pagamento</p>
            <strong className="mt-3 block text-2xl font-semibold">
              Dia {summary.nextPayment.day} ({summary.nextPayment.percent}%)
            </strong>
          </article>
          <article className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Gastos avulsos</p>
            <strong className="mt-3 block text-2xl font-semibold">
              {formatCurrency(summary.monthlyTransactionsCents)}
            </strong>
          </article>
          <article className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Risco do mes</p>
            <strong className="mt-3 block text-2xl font-semibold">{riskLabels[summary.creditCardRisk]}</strong>
          </article>
        </section>
      ) : (
        <section className="mt-8 rounded-lg border border-dashed bg-card p-6">
          <p className="text-sm text-muted-foreground">Nenhum perfil financeiro salvo ainda.</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">Comece pelo onboarding</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Depois de salvar renda, meta mensal e dias de pagamento, este painel passa a mostrar seu resumo real.
          </p>
        </section>
      )}
    </main>
  );
}
