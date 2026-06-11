import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getFinancialProfile } from "@/lib/api";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const profile = await getFinancialProfile(session.user);
  const availableCents = profile
    ? profile.monthlyIncomeCents - profile.monthlySavingGoalCents - profile.safetyMarginCents
    : 0;
  const cards = profile
    ? [
        { label: "Bufunfa base livre", value: formatCurrency(availableCents) },
        { label: "Renda mensal", value: formatCurrency(profile.monthlyIncomeCents) },
        { label: "Salario", value: `Dia ${profile.mainPaymentDay} (${profile.mainPaymentPercent}%)` },
        { label: "Adiantamento", value: `Dia ${profile.advancePaymentDay} (${profile.advancePaymentPercent}%)` }
      ]
    : [
        { label: "Bufunfa base livre", value: "Aguardando onboarding" },
        { label: "Renda mensal", value: "Configure seu perfil" },
        { label: "Salario", value: "Dia 5" },
        { label: "Adiantamento", value: "Dia 20" }
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
        <Button asChild>
          <a href="/onboarding">{profile ? "Editar perfil" : "Configurar onboarding"}</a>
        </Button>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <strong className="mt-3 block text-2xl font-semibold">{card.value}</strong>
          </article>
        ))}
      </section>

      {profile ? (
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Meta mensal</p>
            <strong className="mt-3 block text-2xl font-semibold">
              {formatCurrency(profile.monthlySavingGoalCents)}
            </strong>
          </article>
          <article className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Margem de seguranca</p>
            <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(profile.safetyMarginCents)}</strong>
          </article>
          <article className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Ciclo financeiro</p>
            <strong className="mt-3 block text-2xl font-semibold">Dia {profile.cycleStartDay}</strong>
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
