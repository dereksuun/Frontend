"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getApiUrl, getApiUserHeaders, getApiUserId, type ApiUser } from "@/lib/api";

function reaisToCents(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "0").replace(/\./g, "").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

async function getRequiredUser(): Promise<ApiUser> {
  const session = await auth();

  if (!session?.user || !getApiUserId(session.user)) {
    redirect("/login");
  }

  return session.user;
}

export async function createTransaction(formData: FormData) {
  const user = await getRequiredUser();

  const payload = {
    description: String(formData.get("description") ?? ""),
    amountCents: reaisToCents(formData.get("amount")),
    occurredAt: String(formData.get("occurredAt") ?? new Date().toISOString()),
    category: String(formData.get("category") ?? "Geral"),
    paymentType: String(formData.get("paymentType") ?? "PIX")
  };

  const response = await fetch(`${getApiUrl()}/api/transactions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel registrar o gasto.");
  }

  revalidatePath("/gastos");
  revalidatePath("/dashboard");
}

export async function deleteTransaction(formData: FormData) {
  const user = await getRequiredUser();
  const transactionId = String(formData.get("transactionId") ?? "");

  const response = await fetch(`${getApiUrl()}/api/transactions/${transactionId}`, {
    method: "DELETE",
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel remover o gasto.");
  }

  revalidatePath("/gastos");
  revalidatePath("/dashboard");
}
