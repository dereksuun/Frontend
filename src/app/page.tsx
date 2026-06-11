import Link from "next/link";
import { ArrowRight, BadgeCheck, Gauge, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

const previewCards = [
  { label: "Bufunfa livre", value: "R$ 420", detail: "ate o proximo pagamento", icon: Gauge },
  { label: "Fatura atual", value: "38%", detail: "do limite ja comprometido", icon: WalletCards },
  { label: "Meta protegida", value: "R$ 600", detail: "guardados este mes", icon: Landmark }
];

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Decisao antes do gasto",
    text: "Simule uma compra e veja se ela cabe no mes antes de passar o cartao."
  },
  {
    icon: BadgeCheck,
    title: "Compromissos no calculo",
    text: "Renda, contas, fatura, parcelas e metas entram na mesma conta."
  },
  {
    icon: Gauge,
    title: "Resumo que fala claro",
    text: "O painel mostra a bufunfa livre real sem depender de planilha."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col px-5 py-6 md:px-8 md:py-8">
        <nav className="flex items-center justify-between">
          <Link className="text-lg font-semibold tracking-normal" href="/">
            Derycash
          </Link>
          <Button asChild variant="ghost">
            <a href="/login">Entrar</a>
          </Button>
        </nav>

        <div className="relative flex flex-1 items-center py-12">
          <div className="absolute bottom-8 right-0 -z-10 hidden w-[34rem] rotate-[-2deg] rounded-lg border bg-background/85 p-4 shadow-2xl shadow-black/40 lg:block">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Meu Derycash</span>
              <span className="rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">Respirando bem</span>
            </div>
            <div className="grid gap-3">
              {previewCards.map((card) => (
                <article key={card.label} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{card.label}</span>
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <strong className="mt-3 block text-3xl font-semibold tracking-normal">{card.value}</strong>
                  <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-medium text-secondary">Controle financeiro sem cara de planilha</p>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
              Derycash mostra quanto dinheiro voce realmente pode usar.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              Organize renda, contas, cartao, metas e investimentos para descobrir se a bufunfa ainda respira antes
              de assumir mais um compromisso.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="/dashboard">
                  Abrir dashboard
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="secondary">
                <a href="/login">Entrar com minha conta</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-5 pb-12 md:grid-cols-3 md:px-8">
        {featureCards.map((feature) => (
          <article key={feature.title} className="rounded-lg border bg-card/90 p-5 shadow-xl shadow-black/15">
            <feature.icon className="h-5 w-5 text-secondary" />
            <h2 className="mt-4 text-xl font-semibold tracking-normal">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
