"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { confirmInvestmentImport, previewInvestmentImport, type InvestmentImportPreview } from "@/lib/api";

export type ImportPreviewState = {
  preview: InvestmentImportPreview | null;
  error: string | null;
  success: string | null;
};

export async function previewImportAction(
  _state: ImportPreviewState,
  formData: FormData
): Promise<ImportPreviewState> {
  const session = await auth();

  if (!session?.user) {
    return {
      preview: null,
      error: "Sessao expirada. Entre novamente para importar extratos.",
      success: null
    };
  }

  const institution = String(formData.get("institution") ?? "XP") as InvestmentImportPreview["institution"];
  const fileType = String(formData.get("fileType") ?? "CSV") as InvestmentImportPreview["fileType"];
  const content = String(formData.get("content") ?? "");

  try {
    const preview = await previewInvestmentImport(session.user, {
      institution,
      fileType,
      content
    });

    return {
      preview,
      error: null,
      success: null
    };
  } catch {
    return {
      preview: null,
      error: "Nao foi possivel gerar a previa. Confira o conteudo e tente de novo.",
      success: null
    };
  }
}

export async function confirmImportAction(
  _state: ImportPreviewState,
  formData: FormData
): Promise<ImportPreviewState> {
  const session = await auth();

  if (!session?.user) {
    return {
      preview: null,
      error: "Sessao expirada. Entre novamente para confirmar a importacao.",
      success: null
    };
  }

  const institution = String(formData.get("institution") ?? "XP") as InvestmentImportPreview["institution"];
  const fileType = String(formData.get("fileType") ?? "CSV") as InvestmentImportPreview["fileType"];
  const content = String(formData.get("content") ?? "");

  try {
    const result = await confirmInvestmentImport(session.user, {
      institution,
      fileType,
      content,
      confirmReviewed: true
    });

    revalidatePath("/investimentos");
    revalidatePath("/investimentos/importar");

    return {
      preview: result.preview,
      error: result.confirmed ? null : result.message,
      success: result.confirmed ? `${result.message} Movimentos criados: ${result.movementsCreated ?? 0}.` : null
    };
  } catch {
    return {
      preview: null,
      error: "Nao foi possivel confirmar a importacao.",
      success: null
    };
  }
}
