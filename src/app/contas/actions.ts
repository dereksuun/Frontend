"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getApiUrl, getApiUserHeaders, getApiUserId, type ApiUser } from "@/lib/api";

function reaisToCents(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "0").replace(/\./g, "").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

function numberValue(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getRequiredUser(): Promise<ApiUser> {
  const session = await auth();

  if (!session?.user || !getApiUserId(session.user)) {
    redirect("/login");
  }

  return session.user;
}

export async function createRecurringExpense(formData: FormData) {
  const user = await getRequiredUser();

  const payload = {
    name: String(formData.get("name") ?? ""),
    expectedAmountCents: reaisToCents(formData.get("expectedAmount")),
    dueDay: numberValue(formData.get("dueDay"), 5),
    category: String(formData.get("category") ?? "Casa"),
    type: String(formData.get("type") ?? "FIXA"),
    isEssential: formData.get("isEssential") === "on",
    isVariable: formData.get("isVariable") === "on"
  };

  const response = await fetch(`${getApiUrl()}/api/recurring-expenses`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel cadastrar a conta.");
  }

  revalidatePath("/contas");
  revalidatePath("/dashboard");
}

export async function payRecurringExpense(formData: FormData) {
  const user = await getRequiredUser();
  const expenseId = String(formData.get("expenseId") ?? "");
  const actualAmount = formData.get("actualAmount");
  const payload = {
    actualAmountCents: actualAmount ? reaisToCents(actualAmount) : undefined
  };

  const response = await fetch(`${getApiUrl()}/api/recurring-expenses/${expenseId}/pay`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel marcar a conta como paga.");
  }

  revalidatePath("/contas");
  revalidatePath("/dashboard");
}

export async function deleteRecurringExpense(formData: FormData) {
  const user = await getRequiredUser();
  const expenseId = String(formData.get("expenseId") ?? "");

  const response = await fetch(`${getApiUrl()}/api/recurring-expenses/${expenseId}`, {
    method: "DELETE",
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel remover a conta.");
  }

  revalidatePath("/contas");
  revalidatePath("/dashboard");
}
