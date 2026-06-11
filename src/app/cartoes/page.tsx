import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getCreditCardInvoices, getCreditCardPurchases, getCreditCards } from "@/lib/api";
import {
  createCreditCard,
  createCreditCardPurchase,
  deleteCreditCard,
  deleteCreditCardPurchase,
  payCreditCardInstallment,
  payCreditCardInvoice
} from "./actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC"
});

function formatInvoiceMonth(value: string) {
  return monthFormatter.format(new Date(value));
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CartoesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [cards, purchases, invoices] = await Promise.all([
    getCreditCards(session.user),
    getCreditCardPurchases(session.user),
    getCreditCardInvoices(session.user)
  ]);
  const activeCards = cards.filter((card) => card.active);
  const totalLimitCents = activeCards.reduce((total, card) => total + card.limitCents, 0);
  const openInvoiceCents = invoices.reduce((total, invoice) => total + invoice.pendingCents, 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Monstro da fatura</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Cartoes de credito</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Cadastre seus cartoes para o Bufunfometro enxergar limite, vencimento e fechamento antes das compras
            parceladas entrarem na jogada.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href="/contas">Contas fixas</a>
          </Button>
          <Button asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Cartoes ativos</p>
          <strong className="mt-3 block text-2xl font-semibold">{activeCards.length}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Limite total</p>
          <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(totalLimitCents)}</strong>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Primeiras parcelas</p>
          <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(openInvoiceCents)}</strong>
        </article>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm text-secondary">Faturas</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">Fechamentos e parcelas</h2>
        </div>

        {invoices.length === 0 ? (
          <article className="rounded-lg border border-dashed bg-card p-6">
            <p className="text-sm text-muted-foreground">Nenhuma fatura montada ainda.</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-normal">Cadastre uma compra para gerar parcelas.</h3>
          </article>
        ) : (
          <div className="grid gap-4">
            {invoices.slice(0, 6).map((invoice) => (
              <article key={invoice.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold tracking-normal">{invoice.creditCardName}</h3>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {formatInvoiceMonth(invoice.invoiceMonth)}
                      </span>
                      <span className={invoice.status === "PAID" ? "rounded-md bg-primary/15 px-2 py-1 text-xs text-primary" : "rounded-md bg-destructive/15 px-2 py-1 text-xs text-destructive"}>
                        {invoice.status === "PAID" ? "Paga" : "Pendente"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Vence no dia {invoice.dueDay}.</p>
                  </div>
                  <div className="text-right">
                    <strong className="block text-2xl font-semibold">{formatCurrency(invoice.totalCents)}</strong>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(invoice.pendingCents)} pendentes
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  {invoice.installments.map((installment) => (
                    <div key={installment.id} className="flex flex-col gap-3 rounded-md bg-background p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium">{installment.purchaseDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          {installment.purchaseCategory} - parcela {installment.number}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong>{formatCurrency(installment.amountCents)}</strong>
                        {installment.paidAt ? (
                          <span className="rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">Paga</span>
                        ) : (
                          <form action={payCreditCardInstallment}>
                            <input name="installmentId" type="hidden" value={installment.id} />
                            <Button type="submit" variant="secondary">
                              Pagar parcela
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {invoice.status !== "PAID" ? (
                  <form action={payCreditCardInvoice} className="mt-5 flex justify-end">
                    <input name="creditCardId" type="hidden" value={invoice.creditCardId} />
                    <input name="invoiceMonth" type="hidden" value={invoice.invoiceMonth} />
                    <Button type="submit">Marcar fatura como paga</Button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          {cards.length === 0 ? (
            <article className="rounded-lg border border-dashed bg-card p-6">
              <p className="text-sm text-muted-foreground">Nenhum cartao cadastrado.</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">O monstro da fatura ainda esta dormindo.</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Cadastre pelo menos um cartao para depois registrar compras, parcelas e faturas futuras.
              </p>
            </article>
          ) : (
            cards.map((card) => (
              <article key={card.id} className="overflow-hidden rounded-lg border bg-card">
                <div className="h-2" style={{ backgroundColor: card.color ?? "#24ffa1" }} />
                <div className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold tracking-normal">{card.name}</h2>
                        {card.institution ? (
                          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                            {card.institution}
                          </span>
                        ) : null}
                        <span className="rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">
                          {card.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Fecha no dia {card.closingDay}. Vence no dia {card.dueDay}.
                      </p>
                    </div>
                    <strong className="text-2xl font-semibold">{formatCurrency(card.limitCents)}</strong>
                  </div>

                  <form action={deleteCreditCard} className="mt-5 flex justify-end">
                    <input name="cardId" type="hidden" value={card.id} />
                    <Button type="submit" variant="ghost">
                      Remover
                    </Button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>

        <form action={createCreditCard} className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Novo cartao</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Cadastrar cartao</h2>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Nome</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              name="name"
              placeholder="Nubank roxinho"
              required
              type="text"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Instituicao</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              name="institution"
              placeholder="Nubank"
              type="text"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Limite</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              name="limit"
              placeholder="3000,00"
              required
              type="text"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Fechamento</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                max={31}
                min={1}
                name="closingDay"
                required
                type="number"
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

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Cor</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              defaultValue="#24ffa1"
              name="color"
              type="color"
            />
          </label>

          <Button type="submit">Salvar cartao</Button>
        </form>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-secondary">Compras parceladas</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">Faturas futuras</h2>
          </div>

          {purchases.length === 0 ? (
            <article className="rounded-lg border border-dashed bg-card p-6">
              <p className="text-sm text-muted-foreground">Nenhuma compra cadastrada.</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-normal">A fatura ainda nao mordeu.</h3>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Registre compras para distribuir parcelas nas faturas e enxergar o impacto antes do susto.
              </p>
            </article>
          ) : (
            purchases.map((purchase) => {
              const firstInstallment = purchase.installments[0];
              const lastInstallment = purchase.installments[purchase.installments.length - 1];

              return (
                <article key={purchase.id} className="rounded-lg border bg-card p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold tracking-normal">{purchase.description}</h3>
                        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {purchase.creditCard.name}
                        </span>
                        <span className="rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">
                          {purchase.installmentsCount}x
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {purchase.category}. Primeira fatura em{" "}
                        {firstInstallment ? formatInvoiceMonth(firstInstallment.invoiceMonth) : "-"}; ultima em{" "}
                        {lastInstallment ? formatInvoiceMonth(lastInstallment.invoiceMonth) : "-"}.
                      </p>
                    </div>
                    <strong className="text-2xl font-semibold">{formatCurrency(purchase.totalAmountCents)}</strong>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {purchase.installments.slice(0, 6).map((installment) => (
                      <span key={installment.id} className="rounded-md bg-background px-3 py-2 text-xs text-muted-foreground">
                        {installment.number}/{purchase.installmentsCount} - {formatCurrency(installment.amountCents)}
                      </span>
                    ))}
                  </div>

                  <form action={deleteCreditCardPurchase} className="mt-5 flex justify-end">
                    <input name="purchaseId" type="hidden" value={purchase.id} />
                    <Button type="submit" variant="ghost">
                      Remover compra
                    </Button>
                  </form>
                </article>
              );
            })
          )}
        </div>

        <form action={createCreditCardPurchase} className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Nova compra</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Cadastrar parcela</h2>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Cartao</span>
            <select
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              disabled={cards.length === 0}
              name="creditCardId"
              required
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Descricao</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              disabled={cards.length === 0}
              name="description"
              placeholder="Mercado"
              required
              type="text"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Valor total</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                disabled={cards.length === 0}
                name="totalAmount"
                placeholder="600,00"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Parcelas</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={1}
                disabled={cards.length === 0}
                max={48}
                min={1}
                name="installmentsCount"
                required
                type="number"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Data</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={todayInputValue()}
                disabled={cards.length === 0}
                name="purchasedAt"
                required
                type="date"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Categoria</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue="Geral"
                disabled={cards.length === 0}
                name="category"
                required
                type="text"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Observacao</span>
            <textarea
              className="min-h-20 rounded-md border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
              disabled={cards.length === 0}
              name="notes"
              placeholder="Opcional"
            />
          </label>

          <Button disabled={cards.length === 0} type="submit">
            Salvar compra
          </Button>
        </form>
      </section>
    </main>
  );
}
