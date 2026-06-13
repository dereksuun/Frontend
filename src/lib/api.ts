const fallbackApiUrl = "http://localhost:3333";

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
}

export type ApiUser = {
  email?: string | null;
  name?: string | null;
};

export type FinancialProfile = {
  id: string;
  userId: string;
  monthlyIncomeCents: number;
  mainPaymentDay: number;
  advancePaymentDay: number;
  mainPaymentPercent: number;
  advancePaymentPercent: number;
  includeMealVoucher: boolean;
  includeTransportVoucher: boolean;
  monthlySavingGoalCents: number;
  safetyMarginCents: number;
  cycleStartDay: number;
  onboardingCompletedAt: string | null;
};

type FinancialProfileResponse = {
  profile: FinancialProfile | null;
};

export type MonthlyExpense = {
  id: string;
  recurringExpenseId: string;
  userId: string;
  referenceMonth: string;
  expectedAmountCents: number;
  actualAmountCents: number | null;
  paidAt: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "IGNORED" | "CANCELED";
};

export type RecurringExpense = {
  id: string;
  userId: string;
  name: string;
  expectedAmountCents: number;
  dueDay: number;
  category: string;
  type: string;
  isEssential: boolean;
  isVariable: boolean;
  status: "PENDING" | "PAID" | "OVERDUE" | "IGNORED" | "CANCELED";
  startsAt: string | null;
  endsAt: string | null;
  monthlyExpenses: MonthlyExpense[];
};

type RecurringExpensesResponse = {
  expenses: RecurringExpense[];
};

export type CreditCard = {
  id: string;
  userId: string;
  name: string;
  institution: string | null;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  color: string | null;
  active: boolean;
};

type CreditCardsResponse = {
  cards: CreditCard[];
};

export type CreditCardInstallment = {
  id: string;
  purchaseId: string;
  userId: string;
  number: number;
  amountCents: number;
  invoiceMonth: string;
  paidAt: string | null;
};

export type CreditCardPurchase = {
  id: string;
  userId: string;
  creditCardId: string;
  description: string;
  totalAmountCents: number;
  purchasedAt: string;
  category: string;
  installmentsCount: number;
  notes: string | null;
  creditCard: CreditCard;
  installments: CreditCardInstallment[];
};

type CreditCardPurchasesResponse = {
  purchases: CreditCardPurchase[];
};

export type CreditCardInvoice = {
  id: string;
  creditCardId: string;
  creditCardName: string;
  invoiceMonth: string;
  dueDay: number;
  totalCents: number;
  paidCents: number;
  pendingCents: number;
  status: "PAID" | "PENDING";
  installments: Array<{
    id: string;
    number: number;
    amountCents: number;
    paidAt: string | null;
    purchaseDescription: string;
    purchaseCategory: string;
  }>;
};

type CreditCardInvoicesResponse = {
  invoices: CreditCardInvoice[];
};

export type DashboardSummary = {
  realFreeMoneyCents: number;
  expectedIncomeCents: number;
  receivedIncomeCents: number;
  pendingExpensesCount: number;
  pendingExpensesCents: number;
  currentInvoiceCents: number;
  monthlyTransactionsCents: number;
  extraIncomeCents: number;
  futureInstallmentsCount: number;
  protectedGoalCents: number;
  nextPayment: {
    day: number;
    label: string;
    percent: number;
  };
  creditCardRisk: "SAFE" | "ATTENTION" | "DANGEROUS" | "CHAOTIC";
};

type DashboardSummaryResponse = {
  profile: FinancialProfile | null;
  summary: DashboardSummary | null;
};

export type DashboardInsight = {
  summary: string;
  mood: "stable" | "warning" | "critical";
  alerts: string[];
  positivePoints: string[];
  attentionPoints: string[];
  generatedBy: "deterministic";
  disclaimer: string;
};

type DashboardInsightResponse = {
  profile: FinancialProfile | null;
  insight: DashboardInsight | null;
};

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  amountCents: number;
  direction: "IN" | "OUT";
  kind: "PAYMENT" | "INCOME" | "BILL" | "CARD" | "SPENDING";
  status?: string;
};

type DashboardTimelineResponse = {
  profile: FinancialProfile | null;
  events: TimelineEvent[];
};

export type Transaction = {
  id: string;
  userId: string;
  description: string;
  amountCents: number;
  occurredAt: string;
  category: string;
  paymentType: string;
};

type TransactionsResponse = {
  transactions: Transaction[];
};

export type Income = {
  id: string;
  userId: string;
  description: string;
  amountCents: number;
  receivedAt: string;
  type: string;
};

type IncomesResponse = {
  incomes: Income[];
};

export type GoalContribution = {
  id: string;
  goalId: string;
  userId: string;
  amountCents: number;
  contributedAt: string;
};

export type Goal = {
  id: string;
  userId: string;
  name: string;
  targetAmountCents: number;
  currentCents: number;
  deadline: string | null;
  priority: number;
  contributions: GoalContribution[];
};

type GoalsResponse = {
  goals: Goal[];
};

export type CanIBuySimulation = {
  ready: boolean;
  decision?: "CAN_BUY" | "TIGHT" | "DO_NOT_BUY";
  message: string;
  currentFreeMoneyCents?: number;
  immediateImpactCents?: number;
  projectedFreeMoneyCents?: number;
  projectedInvoiceCents?: number;
  projectedCreditCardRisk?: "SAFE" | "ATTENTION" | "DANGEROUS" | "CHAOTIC";
  installments?: number[];
};

export type InvestmentSimulation = {
  finalAmountCents: number;
  investedCents: number;
  earningsCents: number;
  monthlyRatePercent: number;
  timeline: Array<{
    month: number;
    balanceCents: number;
  }>;
  disclaimer: string;
};

export type InvestmentAnalysis = {
  summary: string;
  trendExplanation: string;
  riskExplanation: string;
  opportunityLevel: "low" | "moderate" | "high";
  positivePoints: string[];
  attentionPoints: string[];
  newsAnalysis: Array<{
    title: string;
    impact: "positive" | "negative" | "neutral" | "risk" | "opportunity";
    horizon: "short_term" | "long_term" | "unclear";
    reason: string;
  }>;
  disclaimer: string;
};

export type InvestmentIndexes = {
  riskScore: number;
  trendScore: number;
  attractivenessScore: number;
  labels: {
    risk: "low" | "medium" | "high";
    trend: "up" | "down" | "sideways" | "unclear";
    attractiveness: "low" | "moderate" | "high";
  };
  factors: {
    risk: string[];
    trend: string[];
    attractiveness: string[];
  };
};

export type InvestmentImportPreview = {
  institution: "B3" | "XP" | "INTER" | "NUBANK" | "ITAU" | "OTHER";
  fileType: "CSV" | "XLSX" | "PDF";
  status: "READY_FOR_CONFIRMATION" | "NEEDS_REVIEW" | "NEEDS_MANUAL_MAPPING";
  summary: {
    operations: number;
    incomes: number;
    positions: number;
    assets: number;
    reviewItems: number;
  };
  rows: Array<{
    rowNumber: number;
    ticker?: string;
    institution: string;
    movementType?: string;
    assetType?: string;
    date?: string;
    quantity?: number;
    unitPriceCents?: number | null;
    totalCents?: number | null;
    feesCents?: number | null;
    notes?: string;
    issues: string[];
  }>;
  issues: string[];
  nextStep: "review_required" | "user_confirmation_required";
};

export type InvestmentPortfolio = {
  platforms: Array<{
    id: string;
    institution: InvestmentImportPreview["institution"];
    name: string;
    active: boolean;
  }>;
  positions: Array<{
    id: string;
    quantity: string | number;
    averagePriceCents: number;
    investedCents: number;
    asset: {
      ticker: string;
      name: string | null;
      assetType: string;
    };
    platform: {
      name: string;
      institution: InvestmentImportPreview["institution"];
    };
  }>;
  movements: Array<{
    id: string;
    movementType: string;
    occurredAt: string;
    quantity: string | number | null;
    totalCents: number;
    feesCents: number;
    asset: {
      ticker: string;
      name: string | null;
    } | null;
    platform: {
      name: string;
    } | null;
  }>;
  imports: Array<{
    id: string;
    institution: InvestmentImportPreview["institution"];
    fileType: string;
    status: string;
    summary: unknown;
    confirmedAt: string | null;
    createdAt: string;
  }>;
};

export type MarketIndicator = {
  id: string;
  code: string;
  name: string;
  value: string | number;
  referenceAt: string;
  source: string;
  updatedAt: string;
};

type MarketIndicatorsResponse = {
  indicators: MarketIndicator[];
};

export function getApiUserId(user: ApiUser) {
  return user.email ?? user.name ?? null;
}

export function getApiUserHeaders(user: ApiUser) {
  const userId = getApiUserId(user);

  if (!userId) {
    throw new Error("Nao foi possivel identificar o usuario da sessao.");
  }

  return {
    "x-user-id": userId,
    "x-user-email": user.email ?? "",
    "x-user-name": user.name ?? ""
  };
}

export async function getFinancialProfile(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/financial-profile`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o perfil financeiro.");
  }

  const data = (await response.json()) as FinancialProfileResponse;
  return data.profile;
}

export async function getRecurringExpenses(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/recurring-expenses`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as contas fixas.");
  }

  const data = (await response.json()) as RecurringExpensesResponse;
  return data.expenses;
}

export async function getCreditCards(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/credit-cards`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os cartoes.");
  }

  const data = (await response.json()) as CreditCardsResponse;
  return data.cards;
}

export async function getCreditCardPurchases(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/credit-card-purchases`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as compras do cartao.");
  }

  const data = (await response.json()) as CreditCardPurchasesResponse;
  return data.purchases;
}

export async function getCreditCardInvoices(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/credit-card-invoices`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as faturas.");
  }

  const data = (await response.json()) as CreditCardInvoicesResponse;
  return data.invoices;
}

export async function getDashboardSummary(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/dashboard/summary`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o resumo financeiro.");
  }

  return (await response.json()) as DashboardSummaryResponse;
}

export async function getDashboardInsight(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/dashboard/summary/insight`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o insight financeiro.");
  }

  return (await response.json()) as DashboardInsightResponse;
}

export async function getDashboardTimeline(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/dashboard/timeline`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a timeline financeira.");
  }

  return (await response.json()) as DashboardTimelineResponse;
}

export async function getTransactions(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/transactions`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os gastos.");
  }

  const data = (await response.json()) as TransactionsResponse;
  return data.transactions;
}

export async function getIncomes(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/incomes`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as rendas.");
  }

  const data = (await response.json()) as IncomesResponse;
  return data.incomes;
}

export async function getGoals(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/goals`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as metas.");
  }

  const data = (await response.json()) as GoalsResponse;
  return data.goals;
}

export async function simulateCanIBuy(
  user: ApiUser,
  input: {
    description: string;
    amountCents: number;
    installmentsCount: number;
    paymentType: "CASH" | "DEBIT" | "CREDIT";
  }
) {
  const response = await fetch(`${getApiUrl()}/api/simulator/can-i-buy`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel simular a compra.");
  }

  return (await response.json()) as CanIBuySimulation;
}

export async function simulateInvestment(
  user: ApiUser,
  input: {
    initialAmountCents: number;
    monthlyContributionCents: number;
    months: number;
    annualRatePercent: number;
  }
) {
  const response = await fetch(`${getApiUrl()}/api/investments/simulate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel simular o investimento.");
  }

  const data = (await response.json()) as { simulation: InvestmentSimulation };
  return data.simulation;
}

export async function analyzeInvestment(
  user: ApiUser,
  input: {
    ticker: string;
    marketData?: {
      price?: number;
      dailyChangePercent?: number;
      change7dPercent?: number;
      change30dPercent?: number;
    };
    fundamentals?: {
      dividendYield?: number;
      pl?: number;
      roe?: number;
    };
    internalIndexes?: {
      riskScore: number;
      trendScore: number;
      attractivenessScore: number;
    };
    news?: Array<{
      title: string;
      source?: string;
      publishedAt?: string;
    }>;
  }
) {
  const response = await fetch(`${getApiUrl()}/api/investments/analyze-asset`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel gerar a analise inteligente.");
  }

  return (await response.json()) as {
    source: "nvidia" | "fallback";
    internalIndexes: InvestmentIndexes;
    analysis: InvestmentAnalysis;
  };
}

export async function previewInvestmentImport(
  user: ApiUser,
  input: {
    institution: "B3" | "XP" | "INTER" | "NUBANK" | "ITAU" | "OTHER";
    fileType: "CSV" | "XLSX" | "PDF";
    content: string;
    saveOriginalFile?: boolean;
  }
) {
  const response = await fetch(`${getApiUrl()}/api/investments/imports/preview`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel gerar a previa da importacao.");
  }

  const data = (await response.json()) as { preview: InvestmentImportPreview };
  return data.preview;
}

export async function confirmInvestmentImport(
  user: ApiUser,
  input: {
    institution: InvestmentImportPreview["institution"];
    fileType: InvestmentImportPreview["fileType"];
    content: string;
    confirmReviewed: true;
    saveOriginalFile?: boolean;
  }
) {
  const response = await fetch(`${getApiUrl()}/api/investments/imports/confirm`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...getApiUserHeaders(user)
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  const data = (await response.json()) as {
    confirmed: boolean;
    message: string;
    movementsCreated?: number;
    preview: InvestmentImportPreview;
  };

  if (!response.ok && !data.message) {
    throw new Error("Nao foi possivel confirmar a importacao.");
  }

  return data;
}

export async function getInvestmentPortfolio(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/investments/portfolio`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a carteira de investimentos.");
  }

  return (await response.json()) as InvestmentPortfolio;
}

export async function getMarketIndicators(user: ApiUser) {
  const response = await fetch(`${getApiUrl()}/api/market-data`, {
    headers: getApiUserHeaders(user),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os indicadores.");
  }

  const data = (await response.json()) as MarketIndicatorsResponse;
  return data.indicators;
}
