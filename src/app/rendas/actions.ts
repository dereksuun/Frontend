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

export async function createIncome(formData: FormData) {
  const user = await getRequiredUser();

  const response = await fetch(`${getApiUrl()}/api/incomes`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify({
      description: String(formData.get("description") ?? ""),
      amountCents: reaisToCents(formData.get("amount")),
      receivedAt: String(formData.get("receivedAt") ?? new Date().toISOString()),
      type: String(formData.get("type") ?? "EXTRA")
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel registrar a renda.");
  }

  revalidatePath("/rendas");
  revalidatePath("/dashboard");
}

export async function deleteIncome(formData: FormData) {
  const user = await getRequiredUser();
  const incomeId = String(formData.get("incomeId") ?? "");

  const response = await fetch(`${getApiUrl()}/api/incomes/${incomeId}`, {
    method: "DELETE",
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel remover a renda.");
  }

  revalidatePath("/rendas");
  revalidatePath("/dashboard");
}
