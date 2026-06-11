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

export async function createCreditCard(formData: FormData) {
  const user = await getRequiredUser();

  const payload = {
    name: String(formData.get("name") ?? ""),
    institution: String(formData.get("institution") ?? ""),
    limitCents: reaisToCents(formData.get("limit")),
    closingDay: numberValue(formData.get("closingDay"), 25),
    dueDay: numberValue(formData.get("dueDay"), 5),
    color: String(formData.get("color") ?? "#24ffa1"),
    active: true
  };

  const response = await fetch(`${getApiUrl()}/api/credit-cards`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel cadastrar o cartao.");
  }

  revalidatePath("/cartoes");
  revalidatePath("/dashboard");
}

export async function deleteCreditCard(formData: FormData) {
  const user = await getRequiredUser();
  const cardId = String(formData.get("cardId") ?? "");

  const response = await fetch(`${getApiUrl()}/api/credit-cards/${cardId}`, {
    method: "DELETE",
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel remover o cartao.");
  }

  revalidatePath("/cartoes");
  revalidatePath("/dashboard");
}
