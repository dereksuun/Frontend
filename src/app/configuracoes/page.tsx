import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

const modules = [
  { href: "/onboarding", label: "Perfil financeiro" },
  { href: "/contas", label: "Contas fixas" },
  { href: "/cartoes", label: "Cartoes" },
  { href: "/gastos", label: "Gastos" },
  { href: "/metas", label: "Metas" },
  { href: "/posso-gastar", label: "Posso Gastar?" },
  { href: "/investimentos", label: "Investimentos" }
];

export default async function ConfiguracoesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Configuracoes</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Central do Derycash</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Ajustes rapidos, atalhos e informacoes da sessao atual.
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard">Dashboard</a>
        </Button>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Usuario conectado</p>
          <strong className="mt-3 block text-2xl font-semibold">
            {session.user.name ?? session.user.email ?? "Usuario"}
          </strong>
          <p className="mt-2 text-sm text-muted-foreground">{session.user.email ?? "Sem e-mail na sessao"}</p>
        </article>

        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">API configurada</p>
          <strong className="mt-3 block text-2xl font-semibold">
            {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}
          </strong>
          <p className="mt-2 text-sm text-muted-foreground">Definida por NEXT_PUBLIC_API_URL.</p>
        </article>
      </section>

      <section className="mt-8 rounded-lg border bg-card p-5">
        <p className="text-sm text-secondary">Modulos</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal">Atalhos internos</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Button key={module.href} asChild variant="secondary">
              <a href={module.href}>{module.label}</a>
            </Button>
          ))}
        </div>
      </section>
    </main>
  );
}
