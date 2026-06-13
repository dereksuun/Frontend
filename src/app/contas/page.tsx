import { redirect } from "next/navigation";
import { ReceiptText } from "lucide-react";
import { auth } from "@/auth";
import { EmptyState } from "@/components/feedback/empty-state";
import { AnimatedDataList } from "@/components/motion/animated-data-list";
import { Button } from "@/components/ui/button";
import { getRecurringExpenses } from "@/lib/api";
import { createRecurringExpense, deleteRecurringExpense, payRecurringExpense } from "./actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export default async function ContasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const expenses = await getRecurringExpenses(session.user);
  const pendingExpenses = expenses.filter((expense) => expense.monthlyExpenses[0]?.status !== "PAID");
  const paidExpenses = expenses.filter((expense) => expense.monthlyExpenses[0]?.status === "PAID");
  const pendingTotalCents = pendingExpenses.reduce((total, expense) => total + expense.expectedAmountCents, 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Boletos inevitaveis</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Contas fixas</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Cadastre aluguel, internet, academia e qualquer compromisso que precisa entrar na conta antes da bufunfa
            parecer livre demais.
          </p>
        </div>
        <Button asChild variant="secondary">
          <a href="/dashboard">Voltar ao dashboard</a>
        </Button>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Contas cadastradas</p>
          <strong className="mt-3 block text-2xl font-semibold">{expenses.length}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pendentes no mes</p>
          <strong className="mt-3 block text-2xl font-semibold">{pendingExpenses.length}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Bufunfa comprometida</p>
          <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(pendingTotalCents)}</strong>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <AnimatedDataList>
          {expenses.length === 0 ? (
            <EmptyState
              description="Comece pelas contas que sempre aparecem: moradia, internet, celular, assinaturas e mensalidades."
              eyebrow="Nenhum boleto inevitavel cadastrado."
              icon={ReceiptText}
              title="Ou voce esta livre, ou esqueceu de alguma coisa."
            />
          ) : (
            expenses.map((expense) => {
              const monthlyExpense = expense.monthlyExpenses[0];
              const isPaid = monthlyExpense?.status === "PAID";

              return (
                <article key={expense.id} className="rounded-lg border bg-card p-5 opacity-0" data-list-row>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold tracking-normal">{expense.name}</h2>
                        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {expense.category}
                        </span>
                        {isPaid ? (
                          <span className="rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">Pago</span>
                        ) : (
                          <span className="rounded-md bg-destructive/15 px-2 py-1 text-xs text-destructive">
                            Pendente
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Vence no dia {expense.dueDay}. {expense.isVariable ? "Valor variavel." : "Valor fixo."}{" "}
                        {expense.isEssential ? "Essencial." : "Nao essencial."}
                      </p>
                    </div>
                    <strong className="text-2xl font-semibold">{formatCurrency(expense.expectedAmountCents)}</strong>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <form action={payRecurringExpense} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <input name="expenseId" type="hidden" value={expense.id} />
                      <label className="grid gap-2 text-sm">
                        <span className="text-muted-foreground">Valor pago</span>
                        <input
                          className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                          name="actualAmount"
                          placeholder={formatCurrency(expense.expectedAmountCents)}
                          type="text"
                        />
                      </label>
                      <Button disabled={isPaid} type="submit">
                        Marcar como paga
                      </Button>
                    </form>

                    <form action={deleteRecurringExpense}>
                      <input name="expenseId" type="hidden" value={expense.id} />
                      <Button type="submit" variant="ghost">
                        Remover
                      </Button>
                    </form>
                  </div>
                </article>
              );
            })
          )}

          {paidExpenses.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {paidExpenses.length} conta{paidExpenses.length > 1 ? "s" : ""} ja marcada
              {paidExpenses.length > 1 ? "s" : ""} como paga{paidExpenses.length > 1 ? "s" : ""} neste mes.
            </p>
          ) : null}
        </AnimatedDataList>

        <form action={createRecurringExpense} className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Nova conta</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Cadastrar boleto</h2>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Nome</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              name="name"
              placeholder="Internet"
              required
              type="text"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Valor previsto</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                name="expectedAmount"
                placeholder="120,00"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Vencimento</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                max={31}
                min={1}
                name="dueDay"
                required
                type="number"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Categoria</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue="Casa"
                name="category"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Tipo</span>
              <select
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue="FIXA"
                name="type"
              >
                <option value="FIXA">Fixa</option>
                <option value="VARIAVEL">Variavel</option>
                <option value="ASSINATURA">Assinatura</option>
                <option value="TEMPORARIA">Temporaria</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-md border bg-background p-3 text-sm">
            <input defaultChecked name="isEssential" type="checkbox" />
            Conta essencial
          </label>
          <label className="flex items-center gap-3 rounded-md border bg-background p-3 text-sm">
            <input name="isVariable" type="checkbox" />
            Valor pode variar
          </label>

          <Button type="submit">Salvar conta</Button>
        </form>
      </section>
    </main>
  );
}
