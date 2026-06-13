import { redirect } from "next/navigation";
import { PiggyBank } from "lucide-react";
import { auth } from "@/auth";
import { EmptyState } from "@/components/feedback/empty-state";
import { AnimatedProgressBar } from "@/components/motion/animated-progress-bar";
import { Button } from "@/components/ui/button";
import { getGoals } from "@/lib/api";
import { addGoalContribution, createGoal, deleteGoal, updateGoal } from "./actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function progressPercent(currentCents: number, targetAmountCents: number) {
  return Math.min(100, Math.round((currentCents / targetAmountCents) * 100));
}

function dateInputValue(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function monthlyContributionSuggestion(goal: Awaited<ReturnType<typeof getGoals>>[number]) {
  if (!goal.deadline) return null;

  const missingCents = Math.max(0, goal.targetAmountCents - goal.currentCents);
  const today = new Date();
  const deadline = new Date(goal.deadline);
  const months = Math.max(
    1,
    (deadline.getUTCFullYear() - today.getUTCFullYear()) * 12 + deadline.getUTCMonth() - today.getUTCMonth() + 1
  );

  return Math.ceil(missingCents / months);
}

export default async function MetasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const goals = await getGoals(session.user);
  const totalTargetCents = goals.reduce((total, goal) => total + goal.targetAmountCents, 0);
  const totalCurrentCents = goals.reduce((total, goal) => total + goal.currentCents, 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Cofrinhos</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Metas financeiras</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Dê destino para a bufunfa antes que ela desapareça em compras aleatórias.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href="/gastos">Gastos</a>
          </Button>
          <Button asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Cofrinhos criados</p>
          <strong className="mt-3 block text-2xl font-semibold">{goals.length}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Ja guardado</p>
          <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(totalCurrentCents)}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Objetivo total</p>
          <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(totalTargetCents)}</strong>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          {goals.length === 0 ? (
            <EmptyState
              description="Crie uma meta para acompanhar progresso, aportes e quanto falta guardar."
              eyebrow="Nenhum cofrinho criado ainda."
              icon={PiggyBank}
              title="Bora dar um destino decente pra sua bufunfa?"
            />
          ) : (
            goals.map((goal) => {
              const percent = progressPercent(goal.currentCents, goal.targetAmountCents);
              const missingCents = Math.max(0, goal.targetAmountCents - goal.currentCents);
              const suggestedMonthlyCents = monthlyContributionSuggestion(goal);

              return (
                <article key={goal.id} className="rounded-lg border bg-card p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold tracking-normal">{goal.name}</h2>
                        <span className="rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">{percent}%</span>
                        {goal.deadline ? (
                          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                            {dateFormatter.format(new Date(goal.deadline))}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatCurrency(goal.currentCents)} guardados. Faltam {formatCurrency(missingCents)}.
                      </p>
                      {suggestedMonthlyCents ? (
                        <p className="mt-2 text-sm text-secondary">
                          Sugestao ate o prazo: {formatCurrency(suggestedMonthlyCents)} por mes.
                        </p>
                      ) : null}
                    </div>
                    <strong className="text-2xl font-semibold">{formatCurrency(goal.targetAmountCents)}</strong>
                  </div>

                  <AnimatedProgressBar value={percent} className="mt-5" />

                  <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <form action={addGoalContribution} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <input name="goalId" type="hidden" value={goal.id} />
                      <label className="grid gap-2 text-sm">
                        <span className="text-muted-foreground">Aporte</span>
                        <input
                          className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                          name="amount"
                          placeholder="100,00"
                          required
                          type="text"
                        />
                      </label>
                      <input name="contributedAt" type="hidden" value={todayInputValue()} />
                      <Button type="submit">Adicionar</Button>
                    </form>

                    <form action={deleteGoal}>
                      <input name="goalId" type="hidden" value={goal.id} />
                      <Button type="submit" variant="ghost">
                        Remover
                      </Button>
                    </form>
                  </div>

                  <form action={updateGoal} className="mt-5 grid gap-3 rounded-md bg-background p-3 md:grid-cols-4">
                    <input name="goalId" type="hidden" value={goal.id} />
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Objetivo</span>
                      <input
                        className="h-10 rounded-md border bg-card px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                        defaultValue={(goal.targetAmountCents / 100).toFixed(2).replace(".", ",")}
                        name="targetAmount"
                        type="text"
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Guardado</span>
                      <input
                        className="h-10 rounded-md border bg-card px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                        defaultValue={(goal.currentCents / 100).toFixed(2).replace(".", ",")}
                        name="currentAmount"
                        type="text"
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Prazo</span>
                      <input
                        className="h-10 rounded-md border bg-card px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                        defaultValue={dateInputValue(goal.deadline)}
                        name="deadline"
                        type="date"
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Prioridade</span>
                      <input
                        className="h-10 rounded-md border bg-card px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                        defaultValue={goal.priority}
                        max={5}
                        min={0}
                        name="priority"
                        type="number"
                      />
                    </label>
                    <div className="md:col-span-4">
                      <Button type="submit" variant="secondary">
                        Atualizar meta
                      </Button>
                    </div>
                  </form>
                </article>
              );
            })
          )}
        </div>

        <form action={createGoal} className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Nova meta</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Criar cofrinho</h2>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Nome</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              name="name"
              placeholder="Reserva de emergencia"
              required
              type="text"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Objetivo</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                name="targetAmount"
                placeholder="5000,00"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Ja guardado</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue="0,00"
                name="currentAmount"
                type="text"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Prazo</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                name="deadline"
                type="date"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Prioridade</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={1}
                max={5}
                min={0}
                name="priority"
                type="number"
              />
            </label>
          </div>

          <Button type="submit">Salvar meta</Button>
        </form>
      </section>
    </main>
  );
}
