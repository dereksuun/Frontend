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
