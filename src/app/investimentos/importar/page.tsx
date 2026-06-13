import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { ImportPreviewForm } from "./import-preview-form";

export default async function ImportarInvestimentosPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Investimentos</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Importar extratos</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Traga operacoes, posicoes e proventos para uma previa estruturada antes de atualizar a carteira.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href="/investimentos">Simulador</a>
          </Button>
          <Button asChild variant="secondary">
            <a href={`${getApiUrl()}/api/investments/imports/template.csv`}>Baixar CSV modelo</a>
          </Button>
          <Button asChild>
            <a href="/indicadores">Indicadores</a>
          </Button>
        </div>
      </header>

      <section className="mt-8 rounded-lg border border-secondary/40 bg-secondary/10 p-5 text-secondary">
        IA interpreta e organiza. Backend valida. Voce confirma. Nenhum dado de investimento deve ser gravado sem
        revisao.
      </section>

      <ImportPreviewForm />
    </main>
  );
}
