import { redirect } from "next/navigation";
import { BadgeDollarSign } from "lucide-react";
import { auth } from "@/auth";
import { EmptyState } from "@/components/feedback/empty-state";
import { AnimatedDataList } from "@/components/motion/animated-data-list";
import { Button } from "@/components/ui/button";
import { getTransactions } from "@/lib/api";
import { createTransaction, deleteTransaction } from "./actions";

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

export default async function GastosPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const transactions = await getTransactions(session.user);
  const totalCents = transactions.reduce((total, transaction) => total + transaction.amountCents, 0);
  const categories = new Set(transactions.map((transaction) => transaction.category));

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Gastos avulsos</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Registro rapido</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Anote Pix, debito, dinheiro e pequenas compras do dia a dia para a bufunfa livre nao virar ficcao.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href="/cartoes">Cartoes</a>
          </Button>
          <Button asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Gastos registrados</p>
          <strong className="mt-3 block text-2xl font-semibold">{transactions.length}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total no historico</p>
          <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(totalCents)}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Categorias usadas</p>
          <strong className="mt-3 block text-2xl font-semibold">{categories.size}</strong>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <AnimatedDataList>
          {transactions.length === 0 ? (
            <EmptyState
              description="Registre os pequenos gastos para o dashboard mostrar a sobra real do mes."
              eyebrow="Nenhum gasto avulso registrado."
              icon={BadgeDollarSign}
              title="A bufunfa ainda parece intacta."
            />
          ) : (
            transactions.map((transaction) => (
              <article key={transaction.id} className="rounded-lg border bg-card p-5 opacity-0" data-list-row>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold tracking-normal">{transaction.description}</h2>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {transaction.category}
                      </span>
                      <span className="rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">
                        {transaction.paymentType}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(transaction.occurredAt))}
                    </p>
                  </div>
                  <strong className="text-2xl font-semibold">{formatCurrency(transaction.amountCents)}</strong>
                </div>

                <form action={deleteTransaction} className="mt-5 flex justify-end">
                  <input name="transactionId" type="hidden" value={transaction.id} />
                  <Button type="submit" variant="ghost">
                    Remover
                  </Button>
                </form>
              </article>
            ))
          )}
        </AnimatedDataList>

        <form action={createTransaction} className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Novo gasto</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Cadastrar gasto</h2>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Descricao</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              name="description"
              placeholder="Almoco"
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
                placeholder="35,00"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Data</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={todayInputValue()}
                name="occurredAt"
                required
                type="date"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Categoria</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue="Geral"
                name="category"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Pagamento</span>
              <select
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue="PIX"
                name="paymentType"
              >
                <option value="PIX">Pix</option>
                <option value="DEBITO">Debito</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="OUTRO">Outro</option>
              </select>
            </label>
          </div>

          <Button type="submit">Salvar gasto</Button>
        </form>
      </section>
    </main>
  );
}
