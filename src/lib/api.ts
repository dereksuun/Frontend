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

export type DashboardSummary = {
  realFreeMoneyCents: number;
  expectedIncomeCents: number;
  receivedIncomeCents: number;
  pendingExpensesCount: number;
  pendingExpensesCents: number;
  currentInvoiceCents: number;
  monthlyTransactionsCents: number;
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
