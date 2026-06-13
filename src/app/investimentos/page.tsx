import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { analyzeInvestment, getInvestmentPortfolio, simulateInvestment } from "@/lib/api";
import { createInvestmentMovement } from "./actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function reaisToCents(value: string | undefined) {
  const normalized = String(value ?? "0").replace(/\./g, "").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function optionalNumberParam(value: string | string[] | undefined) {
  const raw = firstParam(value);
  if (!raw) return undefined;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InvestimentosPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const initialAmount = firstParam(params.initialAmount) ?? "1000,00";
  const monthlyContribution = firstParam(params.monthlyContribution) ?? "300,00";
  const months = Number(firstParam(params.months) ?? 24);
  const annualRatePercent = Number(firstParam(params.annualRatePercent) ?? 10);
  const ticker = String(firstParam(params.ticker) ?? "").trim().toUpperCase();
  const dailyChangePercent = optionalNumberParam(params.dailyChangePercent);
  const change7dPercent = optionalNumberParam(params.change7dPercent);
  const change30dPercent = optionalNumberParam(params.change30dPercent);
  const dividendYield = optionalNumberParam(params.dividendYield);
  const pl = optionalNumberParam(params.pl);
  const roe = optionalNumberParam(params.roe);
  const shouldSimulate = Boolean(params.initialAmount || params.monthlyContribution || params.months || params.annualRatePercent);
  const shouldAnalyze = ticker.length >= 3;
  const simulation = shouldSimulate
    ? await simulateInvestment(session.user, {
        initialAmountCents: reaisToCents(initialAmount),
        monthlyContributionCents: reaisToCents(monthlyContribution),
        months: Number.isFinite(months) ? months : 24,
        annualRatePercent: Number.isFinite(annualRatePercent) ? annualRatePercent : 10
      })
    : null;
  const intelligence = shouldAnalyze
    ? await analyzeInvestment(session.user, {
        ticker,
        marketData: {
          dailyChangePercent,
          change7dPercent,
          change30dPercent
        },
        fundamentals: {
          dividendYield,
          pl,
          roe
        },
        news: [
          {
            title: `Noticias recentes podem afetar a leitura de ${ticker}`,
            source: "Entrada manual"
          }
        ]
      })
    : null;
  const portfolio = await getInvestmentPortfolio(session.user).catch(() => null);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 md:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-secondary">Bufunfa plantada</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Simulador de investimentos</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Estime cenarios de crescimento com aportes mensais, prazo e taxa anual. Use como estudo, nao como ordem.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href="/investimentos/importar">Importar extrato</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/indicadores">Indicadores</a>
          </Button>
          <Button asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </header>

      <section className="mt-8 rounded-lg border border-secondary/40 bg-secondary/10 p-5 text-secondary">
        O Bufunfometro nao fornece recomendacao financeira profissional. As informacoes exibidas sao educativas e servem
        para organizacao pessoal e simulacoes. Antes de investir, estude os produtos e considere seu perfil, seus
        objetivos e os riscos envolvidos.
      </section>

      {portfolio ? (
        <section className="mt-8 grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-secondary">Carteira</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">Posicoes importadas</h2>
            </div>
            <Button asChild variant="secondary">
              <a href="/investimentos/importar">Atualizar carteira</a>
            </Button>
          </div>

          {portfolio.positions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {portfolio.positions.slice(0, 6).map((position) => (
                <article key={position.id} className="rounded-lg border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{position.platform.name}</p>
                      <strong className="mt-2 block text-2xl">{position.asset.ticker}</strong>
                    </div>
                    <span className="rounded-md bg-background px-2 py-1 text-xs text-muted-foreground">
                      {position.asset.assetType}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Qtd</p>
                      <strong>{Number(position.quantity).toLocaleString("pt-BR")}</strong>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Medio</p>
                      <strong>{formatCurrency(position.averagePriceCents)}</strong>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Aplicado</p>
                      <strong>{formatCurrency(position.investedCents)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <article className="rounded-lg border border-dashed bg-card p-6">
              <p className="text-sm text-muted-foreground">Nenhuma posicao importada ainda.</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-normal">A carteira ainda esta no modo manual.</h3>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Importe o CSV padrao para criar movimentos e posicoes sem digitar tudo linha por linha.
              </p>
            </article>
          )}

          {portfolio.imports.length > 0 ? (
            <article className="rounded-lg border bg-card p-5">
              <p className="text-sm text-muted-foreground">Importacoes recentes</p>
              <div className="mt-4 grid gap-3">
                {portfolio.imports.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-background p-3">
                    <span>
                      {item.institution} / {item.fileType}
                    </span>
                    <span className="text-sm text-muted-foreground">{item.status}</span>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <form action={createInvestmentMovement} className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Fallback manual</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Registrar movimento</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use quando o extrato ainda precisar de parser ou quando quiser corrigir uma linha pontual.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Instituicao</span>
              <select className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" name="institution">
                <option value="XP">XP</option>
                <option value="B3">B3</option>
                <option value="INTER">Inter</option>
                <option value="NUBANK">Nubank</option>
                <option value="ITAU">Itau</option>
                <option value="OTHER">Outra</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Plataforma</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue="Manual"
                name="platformName"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Ticker</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                name="ticker"
                placeholder="PETR4"
                required
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Tipo de ativo</span>
              <select className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" name="assetType">
                <option value="acao">Acao</option>
                <option value="fii">FII</option>
                <option value="etf">ETF</option>
                <option value="renda_fixa">Renda fixa</option>
                <option value="fundo">Fundo</option>
                <option value="cripto">Cripto</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Movimento</span>
              <select className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" name="movementType">
                <option value="BUY">Compra</option>
                <option value="SELL">Venda</option>
                <option value="POSITION">Posicao inicial</option>
                <option value="DIVIDEND">Dividendo</option>
                <option value="JCP">JCP</option>
                <option value="INCOME">Rendimento</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Data</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={new Date().toISOString().slice(0, 10)}
                name="occurredAt"
                type="date"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Quantidade</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                min="0"
                name="quantity"
                step="0.000001"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Valor total</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                name="total"
                placeholder="385,00"
                required
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Taxas</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue="0,00"
                name="fees"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Observacao</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              name="notes"
              placeholder="Registro manual"
            />
          </label>

          <Button type="submit">Salvar movimento</Button>
        </form>

        <section className="rounded-lg border border-dashed bg-card p-6">
          <p className="text-sm text-muted-foreground">Importacao continua sendo o caminho principal.</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">Manual entra como rede de seguranca.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            O Derycash atualiza a posicao com regras deterministicas para compra, venda e posicao inicial. Proventos
            entram como movimento financeiro sem alterar quantidade.
          </p>
        </section>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <form className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Investment Intelligence</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Analisar ativo</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A IA organiza a explicacao. Os indices e calculos continuam sendo responsabilidade do backend.
            </p>
          </div>
          <input type="hidden" name="initialAmount" value={initialAmount} />
          <input type="hidden" name="monthlyContribution" value={monthlyContribution} />
          <input type="hidden" name="months" value={months} />
          <input type="hidden" name="annualRatePercent" value={annualRatePercent} />
          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Ticker</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              defaultValue={ticker}
              name="ticker"
              placeholder="PETR4"
              type="text"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Hoje %</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={dailyChangePercent ?? ""}
                name="dailyChangePercent"
                step="0.1"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">7 dias %</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={change7dPercent ?? ""}
                name="change7dPercent"
                step="0.1"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">30 dias %</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={change30dPercent ?? ""}
                name="change30dPercent"
                step="0.1"
                type="number"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Dividend yield %</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={dividendYield ?? ""}
                name="dividendYield"
                step="0.1"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">P/L</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={pl ?? ""}
                name="pl"
                step="0.1"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">ROE %</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={roe ?? ""}
                name="roe"
                step="0.1"
                type="number"
              />
            </label>
          </div>
          <Button type="submit">Gerar leitura</Button>
        </form>

        {intelligence ? (
          <section className="grid gap-4">
            <article className="rounded-lg border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{ticker}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-normal">Resumo inteligente</h2>
                </div>
                <span className="rounded-md border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs uppercase text-secondary">
                  {intelligence.source === "nvidia" ? "NVIDIA" : "Fallback"}
                </span>
              </div>
              <p className="mt-4 text-muted-foreground">{intelligence.analysis.summary}</p>
            </article>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Tendencia</p>
                <strong className="mt-3 block text-2xl">{intelligence.internalIndexes.trendScore}/100</strong>
                <p className="mt-3 text-sm">{intelligence.analysis.trendExplanation}</p>
              </article>
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Risco</p>
                <strong className="mt-3 block text-2xl">{intelligence.internalIndexes.riskScore}/100</strong>
                <p className="mt-3 text-sm">{intelligence.analysis.riskExplanation}</p>
              </article>
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Atratividade para estudo</p>
                <strong className="mt-3 block text-2xl font-semibold">
                  {intelligence.analysis.opportunityLevel === "high"
                    ? "Alta"
                    : intelligence.analysis.opportunityLevel === "moderate"
                      ? "Moderada"
                      : "Baixa"}
                </strong>
                <p className="mt-3 text-sm text-muted-foreground">
                  Score {intelligence.internalIndexes.attractivenessScore}/100
                </p>
              </article>
            </div>

            <article className="rounded-lg border bg-card p-5">
              <p className="text-sm text-muted-foreground">Fatores calculados pelo backend</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <strong className="text-sm">Tendencia</strong>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    {intelligence.internalIndexes.factors.trend.map((factor) => (
                      <li key={factor}>{factor}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-sm">Risco</strong>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    {intelligence.internalIndexes.factors.risk.map((factor) => (
                      <li key={factor}>{factor}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-sm">Atratividade</strong>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    {intelligence.internalIndexes.factors.attractiveness.map((factor) => (
                      <li key={factor}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Pontos positivos</p>
                <ul className="mt-3 grid gap-2 text-sm">
                  {intelligence.analysis.positivePoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Pontos de atencao</p>
                <ul className="mt-3 grid gap-2 text-sm">
                  {intelligence.analysis.attentionPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-dashed bg-card p-6">
            <p className="text-sm text-muted-foreground">Nenhum ativo analisado ainda.</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Digite um ticker para gerar leitura.</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Quando a NVIDIA estiver configurada, a resposta vem da IA validada por schema. Sem chave, o backend usa
              fallback educativo e seguro.
            </p>
          </section>
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <form className="grid h-fit gap-4 rounded-lg border bg-card p-5">
          <div>
            <p className="text-sm text-secondary">Nova simulacao</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Projetar rendimento</h2>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Valor inicial</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              defaultValue={initialAmount}
              name="initialAmount"
              type="text"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Aporte mensal</span>
            <input
              className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              defaultValue={monthlyContribution}
              name="monthlyContribution"
              type="text"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Meses</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={months}
                max={600}
                min={1}
                name="months"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Taxa anual %</span>
              <input
                className="h-10 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                defaultValue={annualRatePercent}
                max={100}
                min={0}
                name="annualRatePercent"
                step="0.1"
                type="number"
              />
            </label>
          </div>

          <Button type="submit">Simular</Button>
        </form>

        {simulation ? (
          <section className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Valor final</p>
                <strong className="mt-3 block text-2xl font-semibold">
                  {formatCurrency(simulation.finalAmountCents)}
                </strong>
              </article>
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Total aportado</p>
                <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(simulation.investedCents)}</strong>
              </article>
              <article className="rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">Rendimento estimado</p>
                <strong className="mt-3 block text-2xl font-semibold">{formatCurrency(simulation.earningsCents)}</strong>
              </article>
            </div>

            <article className="rounded-lg border bg-card p-5">
              <p className="text-sm text-muted-foreground">Marcos da simulacao</p>
              <div className="mt-4 grid gap-3">
                {simulation.timeline.map((point) => (
                  <div key={point.month} className="flex items-center justify-between rounded-md bg-background p-3">
                    <span className="text-sm text-muted-foreground">Mes {point.month}</span>
                    <strong>{formatCurrency(point.balanceCents)}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : (
          <section className="rounded-lg border border-dashed bg-card p-6">
            <p className="text-sm text-muted-foreground">Nenhuma simulacao feita ainda.</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Plante a bufunfa no papel primeiro.</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Rode cenarios com taxas estimadas e compare prazo, liquidez, risco e custos antes de estudar produtos reais.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
