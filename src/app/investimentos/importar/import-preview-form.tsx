"use client";

import { useActionState } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { confirmImportAction, type ImportPreviewState, previewImportAction } from "./actions";

const initialCsv = `data,instituicao,tipo_movimentacao,tipo_ativo,ticker,nome_ativo,quantidade,preco_unitario,valor_total,taxas,observacao
2026-06-11,XP,compra,acao,PETR4,Petrobras PN,10,38.50,385.00,1.20,Compra manual/importada`;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(cents?: number | null) {
  if (typeof cents !== "number") return "-";
  return currencyFormatter.format(cents / 100);
}

function statusLabel(status: ImportPreviewState["preview"] extends infer Preview
  ? Preview extends { status: infer Status }
    ? Status
    : never
  : never) {
  if (status === "READY_FOR_CONFIRMATION") return "Pronto para revisar";
  if (status === "NEEDS_MANUAL_MAPPING") return "Mapeamento manual";
  return "Precisa de revisao";
}

export function ImportPreviewForm() {
  const [content, setContent] = useState(initialCsv);
  const [previewedContent, setPreviewedContent] = useState(initialCsv);
  const [state, formAction, pending] = useActionState(previewImportAction, {
    preview: null,
    error: null,
    success: null
  });
  const [confirmationState, confirmAction, confirming] = useActionState(confirmImportAction, {
    preview: null,
    error: null,
    success: null
  });
  const activePreview = confirmationState.preview ?? state.preview;
  const activeError = confirmationState.error ?? state.error;
  const activeSuccess = confirmationState.success ?? state.success;

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <form
        action={formAction}
        className="grid h-fit gap-4 rounded-lg border bg-card p-5"
        onSubmit={() => setPreviewedContent(content)}
      >
        <div>
          <p className="text-sm text-secondary">Importacao inteligente</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">Previa do extrato</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nada e gravado automaticamente. Primeiro o Derycash interpreta, depois voce revisa.
          </p>
        </div>

        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Instituicao</span>
          <select className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" name="institution">
            <option value="XP">XP</option>
            <option value="B3">B3</option>
            <option value="INTER">Inter</option>
            <option value="NUBANK">Nubank/NuInvest</option>
            <option value="ITAU">Itau</option>
            <option value="OTHER">Outra</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Tipo de arquivo</span>
          <select className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" name="fileType">
            <option value="CSV">CSV padrao Derycash</option>
            <option value="XLSX">XLSX</option>
            <option value="PDF">PDF</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Conteudo do arquivo</span>
          <textarea
            className="min-h-56 rounded-md border bg-background p-3 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            value={content}
            name="content"
            onChange={(event) => setContent(event.target.value)}
          />
        </label>

        <Button type="submit" disabled={pending}>
          {pending ? "Lendo extrato..." : "Gerar previa"}
        </Button>

        {activeError ? <p className="text-sm text-destructive">{activeError}</p> : null}
        {activeSuccess ? <p className="text-sm text-primary">{activeSuccess}</p> : null}
      </form>

      {activePreview ? (
        <section className="grid gap-4">
          <article className="rounded-lg border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {activePreview.institution} / {activePreview.fileType}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal">{statusLabel(activePreview.status)}</h2>
              </div>
              <span className="rounded-md border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs uppercase text-secondary">
                {activePreview.nextStep === "user_confirmation_required" ? "Revisao obrigatoria" : "Mapear colunas"}
              </span>
            </div>
            <form action={confirmAction} className="mt-5 flex flex-wrap items-center gap-3">
              <input type="hidden" name="institution" value={activePreview.institution} />
              <input type="hidden" name="fileType" value={activePreview.fileType} />
              <textarea className="hidden" name="content" value={previewedContent} readOnly />
              <Button type="submit" disabled={confirming || activePreview.status !== "READY_FOR_CONFIRMATION"}>
                {confirming ? "Confirmando..." : "Confirmar importacao"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {activePreview.status === "READY_FOR_CONFIRMATION"
                  ? "Vai gravar movimentos e atualizar a carteira."
                  : "Resolva as pendencias antes de gravar."}
              </span>
            </form>
          </article>

          <div className="grid gap-4 md:grid-cols-5">
            <article className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Operacoes</p>
              <strong className="mt-2 block text-2xl">{activePreview.summary.operations}</strong>
            </article>
            <article className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Proventos</p>
              <strong className="mt-2 block text-2xl">{activePreview.summary.incomes}</strong>
            </article>
            <article className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Posicoes</p>
              <strong className="mt-2 block text-2xl">{activePreview.summary.positions}</strong>
            </article>
            <article className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Ativos</p>
              <strong className="mt-2 block text-2xl">{activePreview.summary.assets}</strong>
            </article>
            <article className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Revisoes</p>
              <strong className="mt-2 block text-2xl">{activePreview.summary.reviewItems}</strong>
            </article>
          </div>

          {activePreview.issues.length > 0 ? (
            <article className="rounded-lg border border-warning/40 bg-warning/10 p-5">
              <p className="text-sm font-medium text-warning">Itens que precisam de atencao</p>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {activePreview.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {activePreview.rows.length > 0 ? (
            <article className="overflow-hidden rounded-lg border bg-card">
              <div className="grid grid-cols-[4rem_1fr_1fr_1fr] gap-3 border-b p-3 text-xs text-muted-foreground md:grid-cols-[4rem_1fr_1fr_1fr_1fr_1fr]">
                <span>Linha</span>
                <span>Ativo</span>
                <span>Tipo</span>
                <span>Qtd</span>
                <span className="hidden md:block">Valor</span>
                <span className="hidden md:block">Status</span>
              </div>
              {activePreview.rows.map((row) => (
                <div
                  key={row.rowNumber}
                  className="grid grid-cols-[4rem_1fr_1fr_1fr] gap-3 border-b p-3 text-sm last:border-b-0 md:grid-cols-[4rem_1fr_1fr_1fr_1fr_1fr]"
                >
                  <span className="text-muted-foreground">{row.rowNumber}</span>
                  <strong>{row.ticker || "-"}</strong>
                  <span>{row.movementType || "-"}</span>
                  <span>{row.quantity ?? "-"}</span>
                  <span className="hidden md:block">{formatCurrency(row.totalCents)}</span>
                  <span className="hidden md:block">{row.issues.length ? "Revisar" : "OK"}</span>
                </div>
              ))}
            </article>
          ) : null}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed bg-card p-6">
          <p className="text-sm text-muted-foreground">Nenhum arquivo lido ainda.</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">Comece pelo CSV padrao.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            B3, XP, Inter, Nubank e Itau entram como instituicoes prioritarias. XLSX e PDF ja aparecem no fluxo, mas
            precisam de mapeamento/parsers especificos antes da confirmacao.
          </p>
        </section>
      )}
    </section>
  );
}
