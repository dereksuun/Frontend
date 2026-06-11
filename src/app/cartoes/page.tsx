import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getCreditCards } from "@/lib/api";
import { createCreditCard, deleteCreditCard } from "./actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export default async function CartoesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const cards = await getCreditCards(session.user);
  const activeCards = cards.filter((card) => card.active);
  const totalLimitCents = activeCards.reduce((total, card) => total + card.limitCents, 0);

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
          <p className="text-sm text-muted-foreground">Proxima etapa</p>
          <strong className="mt-3 block text-2xl font-semibold">Compras</strong>
        </article>
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
    </main>
  );
}
