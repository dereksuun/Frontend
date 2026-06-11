import { ArrowRight, Gauge, Landmark, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

const previewCards = [
  { label: "Bufunfa livre", value: "R$ 420", icon: Gauge },
  { label: "Fatura atual", value: "38%", icon: WalletCards },
  { label: "Meta protegida", value: "R$ 600", icon: Landmark }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-8 py-8">
      <nav className="flex items-center justify-between">
        <span className="text-lg font-semibold tracking-normal">Derycash</span>
        <Button variant="ghost">Entrar</Button>
      </nav>

      <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1fr_460px]">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium text-secondary">Controle financeiro sem cara de planilha</p>
          <h1 className="text-5xl font-semibold tracking-normal text-foreground md:text-7xl">
            Veja quanto dinheiro voce realmente pode usar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Organize renda, contas, cartao, metas e investimentos para descobrir quanto dinheiro
            realmente esta livre.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild>
              <a href="/dashboard">
                Abrir dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href="/login">Entrar</a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {previewCards.map((card) => (
            <div key={card.label} className="rounded-lg border bg-card p-5 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <strong className="mt-4 block text-4xl font-semibold">{card.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
