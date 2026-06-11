import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

const cards = [
  { label: "Bufunfa livre real", value: "Aguardando onboarding" },
  { label: "Renda prevista", value: "Configure seu perfil" },
  { label: "Proximo pagamento", value: "Dia 5 ou dia 20" },
  { label: "Risco do mes", value: "Sem dados ainda" }
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-8 py-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-secondary">Meu Derycash</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Resumo financeiro</h1>
          <p className="mt-3 text-muted-foreground">
            Ola, {session.user.name ?? session.user.email ?? "usuario"}. Vamos montar seu perfil financeiro.
          </p>
        </div>
        <Button asChild>
          <a href="/onboarding">Configurar onboarding</a>
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
    </main>
  );
}
