"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getApiUrl, getApiUserHeaders, getApiUserId, type ApiUser } from "@/lib/api";

function numberValue(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function centsValue(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function getRequiredUser(): Promise<ApiUser> {
  const session = await auth();

  if (!session?.user || !getApiUserId(session.user)) {
    redirect("/login");
  }

  return session.user;
}

export async function saveSimulatedPurchase(formData: FormData) {
  const user = await getRequiredUser();
  const paymentType = String(formData.get("paymentType") ?? "CASH");
  const description = String(formData.get("description") ?? "Compra simulada");
  const amountCents = centsValue(formData.get("amountCents"));
  const category = String(formData.get("category") ?? "Geral");
  const purchasedAt = String(formData.get("purchasedAt") ?? new Date().toISOString());

  if (paymentType === "CREDIT") {
    const response = await fetch(`${getApiUrl()}/api/credit-card-purchases`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...getApiUserHeaders(user)
      },
      body: JSON.stringify({
        creditCardId: String(formData.get("creditCardId") ?? ""),
        description,
        totalAmountCents: amountCents,
        purchasedAt,
        category,
        installmentsCount: numberValue(formData.get("installmentsCount"), 1),
        notes: "Criada a partir do simulador Posso Gastar?"
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Nao foi possivel salvar a compra no cartao.");
    }

    revalidatePath("/cartoes");
  } else {
    const response = await fetch(`${getApiUrl()}/api/transactions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...getApiUserHeaders(user)
      },
      body: JSON.stringify({
        description,
        amountCents,
        occurredAt: purchasedAt,
        category,
        paymentType: paymentType === "DEBIT" ? "DEBITO" : "A_VISTA"
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Nao foi possivel salvar o gasto.");
    }

    revalidatePath("/gastos");
  }

  revalidatePath("/dashboard");
  revalidatePath("/posso-gastar");
  redirect(paymentType === "CREDIT" ? "/cartoes" : "/gastos");
}
