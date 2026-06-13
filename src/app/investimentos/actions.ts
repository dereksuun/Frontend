"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createManualInvestmentMovement,
  getApiUserId,
  type ApiUser,
  type InvestmentImportPreview
} from "@/lib/api";

function reaisToCents(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "0").replace(/\./g, "").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

function optionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").replace(",", ".").trim();
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function getRequiredUser(): Promise<ApiUser> {
  const session = await auth();

  if (!session?.user || !getApiUserId(session.user)) {
    redirect("/login");
  }

  return session.user;
}

export async function createInvestmentMovement(formData: FormData) {
  const user = await getRequiredUser();
  const quantity = optionalNumber(formData.get("quantity"));
  const totalCents = reaisToCents(formData.get("total"));

  await createManualInvestmentMovement(user, {
    institution: String(formData.get("institution") ?? "OTHER") as InvestmentImportPreview["institution"],
    platformName: String(formData.get("platformName") ?? "Manual"),
    ticker: String(formData.get("ticker") ?? ""),
    assetName: String(formData.get("assetName") ?? ""),
    assetType: String(formData.get("assetType") ?? "acao"),
    movementType: String(formData.get("movementType") ?? "BUY") as Parameters<typeof createManualInvestmentMovement>[1]["movementType"],
    occurredAt: String(formData.get("occurredAt") ?? new Date().toISOString()),
    quantity,
    unitPriceCents: quantity && quantity > 0 ? Math.round(totalCents / quantity) : undefined,
    totalCents,
    feesCents: reaisToCents(formData.get("fees")),
    notes: String(formData.get("notes") ?? "")
  });

  revalidatePath("/investimentos");
  revalidatePath("/dashboard");
}
