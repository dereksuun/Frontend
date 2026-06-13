import { LogIn } from "lucide-react";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-12 px-8 py-10 lg:grid-cols-[1fr_420px]">
      <section>
        <p className="text-sm font-medium text-secondary">Entrada segura</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal md:text-6xl">
          Entre para ver o quão lascado você tá de grana
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          No MVP, o acesso usa provedores externos para evitar senha propria e manter a base mais segura.
        </p>
      </section>

      <section className="rounded-lg border bg-card p-6 shadow-2xl shadow-black/20">
        <h2 className="text-xl font-semibold">Acessar conta</h2>
        <p className="mt-2 text-sm text-muted-foreground">Escolha um provedor para continuar.</p>

        <div className="mt-6 grid gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <Button className="w-full" type="submit">
              <LogIn className="h-4 w-4" />
              Entrar com GitHub
            </Button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button className="w-full" type="submit" variant="secondary">
              Entrar com Google
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
