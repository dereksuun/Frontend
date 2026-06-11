import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { saveFinancialProfile } from "./actions";

const fields = [
  {
    name: "monthlyIncome",
    label: "Renda mensal liquida",
    type: "text",
    defaultValue: "4000,00"
  },
  {
    name: "monthlySavingGoal",
    label: "Meta mensal para guardar",
    type: "text",
    defaultValue: "1000,00"
  },
  {
    name: "safetyMargin",
    label: "Margem de seguranca",
    type: "text",
    defaultValue: "300,00"
  }
];

const numericFields = [
  { name: "mainPaymentDay", label: "Dia do salario", defaultValue: 5 },
  { name: "advancePaymentDay", label: "Dia do adiantamento", defaultValue: 20 },
  { name: "mainPaymentPercent", label: "Percentual do salario", defaultValue: 60 },
  { name: "advancePaymentPercent", label: "Percentual do adiantamento", defaultValue: 40 },
  { name: "cycleStartDay", label: "Inicio do ciclo", defaultValue: 1 }
];

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-8 py-8">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-secondary">Onboarding financeiro</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">Configure a realidade da sua bufunfa.</h1>
        <p className="mt-4 text-muted-foreground">
          Comecamos com os padroes do plano: salario no dia 5, adiantamento no dia 20 e divisao 60/40.
        </p>
      </header>

      <form action={saveFinancialProfile} className="mt-10 grid gap-8 rounded-lg border bg-card p-6">
        <section className="grid gap-4 md:grid-cols-3">
          {fields.map((field) => (
            <label key={field.name} className="grid gap-2 text-sm">
              <span className="text-muted-foreground">{field.label}</span>
              <input
                className="h-11 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={field.defaultValue}
                name={field.name}
                type={field.type}
              />
            </label>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          {numericFields.map((field) => (
            <label key={field.name} className="grid gap-2 text-sm">
              <span className="text-muted-foreground">{field.label}</span>
              <input
                className="h-11 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={field.defaultValue}
                max={field.name.includes("Percent") ? 100 : 31}
                min={field.name.includes("Percent") ? 0 : 1}
                name={field.name}
                type="number"
              />
            </label>
          ))}
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-md border bg-background p-3 text-sm">
            <input name="includeMealVoucher" type="checkbox" />
            Incluir vale-alimentacao no calculo
          </label>
          <label className="flex items-center gap-3 rounded-md border bg-background p-3 text-sm">
            <input name="includeTransportVoucher" type="checkbox" />
            Incluir vale-transporte no calculo
          </label>
        </section>

        <div className="flex justify-end">
          <Button type="submit">Salvar perfil financeiro</Button>
        </div>
      </form>
    </main>
  );
}
