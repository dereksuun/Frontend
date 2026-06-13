import { afterEach, describe, expect, it, vi } from "vitest";
import {
  analyzeInvestment,
  getApiUserHeaders,
  getApiUserId,
  previewInvestmentImport,
  simulateCanIBuy
} from "./api";

function mockFetch(data: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(data)
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("api helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds the temporary user headers from the authenticated user", () => {
    expect(getApiUserId({ email: "user@example.com", name: "User" })).toBe("user@example.com");
    expect(getApiUserHeaders({ email: "user@example.com", name: "User" })).toEqual({
      "x-user-id": "user@example.com",
      "x-user-email": "user@example.com",
      "x-user-name": "User"
    });
  });

  it("throws when the user cannot be identified", () => {
    expect(() => getApiUserHeaders({})).toThrow("Nao foi possivel identificar");
  });

  it("posts can-i-buy simulations with auth headers and json body", async () => {
    const fetchMock = mockFetch({
      ready: true,
      decision: "CAN_BUY",
      message: "Cabe sem drama."
    });

    await simulateCanIBuy(
      { email: "user@example.com" },
      {
        description: "Tenis",
        amountCents: 25000,
        installmentsCount: 1,
        paymentType: "DEBIT"
      }
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/api/simulator/can-i-buy",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "content-type": "application/json",
          "x-user-id": "user@example.com"
        }),
        body: JSON.stringify({
          description: "Tenis",
          amountCents: 25000,
          installmentsCount: 1,
          paymentType: "DEBIT"
        })
      })
    );
  });

  it("returns the investment import preview payload", async () => {
    mockFetch({
      preview: {
        institution: "XP",
        fileType: "CSV",
        status: "READY_FOR_CONFIRMATION",
        summary: {
          operations: 1,
          incomes: 0,
          positions: 0,
          assets: 1,
          reviewItems: 0
        },
        rows: [],
        issues: [],
        nextStep: "user_confirmation_required"
      }
    });

    const preview = await previewInvestmentImport(
      { email: "user@example.com" },
      {
        institution: "XP",
        fileType: "CSV",
        content: "data,..."
      }
    );

    expect(preview.status).toBe("READY_FOR_CONFIRMATION");
    expect(preview.summary.operations).toBe(1);
  });

  it("throws when investment analysis fails", async () => {
    mockFetch({ error: "boom" }, false);

    await expect(
      analyzeInvestment({ email: "user@example.com" }, { ticker: "PETR4" })
    ).rejects.toThrow("Nao foi possivel gerar a analise inteligente.");
  });
});
