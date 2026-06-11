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

export async function createGoal(formData: FormData) {
  const user = await getRequiredUser();

  const payload = {
    name: String(formData.get("name") ?? ""),
    targetAmountCents: reaisToCents(formData.get("targetAmount")),
    currentCents: reaisToCents(formData.get("currentAmount")),
    deadline: String(formData.get("deadline") ?? ""),
    priority: numberValue(formData.get("priority"), 0)
  };

  const response = await fetch(`${getApiUrl()}/api/goals`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel criar a meta.");
  }

  revalidatePath("/metas");
  revalidatePath("/dashboard");
}

export async function addGoalContribution(formData: FormData) {
  const user = await getRequiredUser();
  const goalId = String(formData.get("goalId") ?? "");

  const response = await fetch(`${getApiUrl()}/api/goals/${goalId}/contributions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify({
      amountCents: reaisToCents(formData.get("amount")),
      contributedAt: String(formData.get("contributedAt") ?? new Date().toISOString())
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel adicionar o aporte.");
  }

  revalidatePath("/metas");
  revalidatePath("/dashboard");
}

export async function deleteGoal(formData: FormData) {
  const user = await getRequiredUser();
  const goalId = String(formData.get("goalId") ?? "");

  const response = await fetch(`${getApiUrl()}/api/goals/${goalId}`, {
    method: "DELETE",
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel remover a meta.");
  }

  revalidatePath("/metas");
  revalidatePath("/dashboard");
}
