import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getIncomes } from "@/lib/api";
import { createIncome, deleteIncome } from "./actions";

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

function isCurrentMonth(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
}

export default async function RendasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const incomes = await getIncomes(session.user);
  const currentMonthIncomes = incomes.filter((income) => isCurrentMonth(income.receivedAt));
  const currentMonthTotalCents = currentMonthIncomes.reduce((total, income) => total + income.amountCents, 0);
  const totalCents = incomes.reduce((total, income) => total + income.amountCents, 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Entradas de bufunfa</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Rendas</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Registre freelas, Pix recebidos, reembolsos e qualquer entrada extra que muda a bufunfa livre do mes.
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
          <p className="text-sm text-muted-foreground">Entradas no mes</p>
          <strong className="mt-3 block text-2xl font-semibold">{currentMonthIncomes.length}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Extra no mes</p>
          <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(currentMonthTotalCents)}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Historico total</p>
          <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(totalCents)}</strong>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          {incomes.length === 0 ? (
            <article className="rounded-lg border border-dashed bg-card p-6">
              <p className="text-sm text-muted-foreground">Nenhuma renda extra registrada.</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">A bufunfa extra ainda nao apareceu.</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Quando entrar freela, reembolso ou Pix perdido no tempo, cadastre aqui para o dashboard recalcular.
              </p>
            </article>
          ) : (
            incomes.map((income) => (
              <article key={income.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold tracking-normal">{income.description}</h2>
                      <span className="rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">{income.type}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Recebido em {dateFormatter.format(new Date(income.receivedAt))}
                    </p>
                  </div>
                  <strong className="text-2xl font-semibold">{formatCurrency(income.amountCents)}</strong>
                </div>

                <form action={deleteIncome} className="mt-5 flex justify-end">
                  <input name="incomeId" type="hidden" value={income.id} />
                  <Button type="submit" variant="ghost">
                    Remover
                  </Button>
                </form>
              </article>
            ))
          )}
        </div>

        <form action={createIncome} className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Nova entrada</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Cadastrar renda</h2>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Descricao</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              name="description"
              placeholder="Freela"
              required
              type="text"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Valor</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                name="amount"
                placeholder="500,00"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Data</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={todayInputValue()}
                name="receivedAt"
                required
                type="date"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Tipo</span>
            <select
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              defaultValue="EXTRA"
              name="type"
            >
              <option value="FREELA">Freela</option>
              <option value="PIX">Pix recebido</option>
              <option value="REEMBOLSO">Reembolso</option>
              <option value="EXTRA">Renda extra</option>
              <option value="OUTRO">Outro</option>
            </select>
          </label>

          <Button type="submit">Salvar renda</Button>
        </form>
      </section>
    </main>
  );
}
