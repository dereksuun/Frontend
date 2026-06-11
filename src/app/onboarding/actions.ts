"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getApiUrl, getApiUserHeaders, getApiUserId } from "@/lib/api";

function reaisToCents(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "0").replace(/\./g, "").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

function numberValue(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function saveFinancialProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user || !getApiUserId(session.user)) {
    redirect("/login");
  }

  const payload = {
    monthlyIncomeCents: reaisToCents(formData.get("monthlyIncome")),
    mainPaymentDay: numberValue(formData.get("mainPaymentDay"), 5),
    advancePaymentDay: numberValue(formData.get("advancePaymentDay"), 20),
    mainPaymentPercent: numberValue(formData.get("mainPaymentPercent"), 60),
    advancePaymentPercent: numberValue(formData.get("advancePaymentPercent"), 40),
    includeMealVoucher: formData.get("includeMealVoucher") === "on",
    includeTransportVoucher: formData.get("includeTransportVoucher") === "on",
    monthlySavingGoalCents: reaisToCents(formData.get("monthlySavingGoal")),
    safetyMarginCents: reaisToCents(formData.get("safetyMargin")),
    cycleStartDay: numberValue(formData.get("cycleStartDay"), 1)
  };

  const response = await fetch(`${getApiUrl()}/api/financial-profile`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(session.user)
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel salvar o perfil financeiro.");
  }

  redirect("/dashboard");
}
