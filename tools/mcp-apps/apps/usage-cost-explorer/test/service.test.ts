import { describe, expect, it } from "vitest";

import {
  createBillingService,
  DEFAULT_MAX_PAGE_SIZE,
  DEFAULT_AUTO_RECHARGE_POLICY
} from "../src/service.js";
import type { BillingServiceClient, UsageQueryInput } from "../src/types.js";

function fakeClient(overrides: Partial<BillingServiceClient> = {}): BillingServiceClient {
  return {
    async getBalance() {
      return { data: { record_type: "balance", pending: "0.00", balance: "25.00", credit_limit: "100.00", available_credit: "75.00", currency: "USD" } };
    },
    async getAutoRechargePreferences() {
      return { data: { id: "arp_1", record_type: "auto_recharge_pref", threshold_amount: "10.00", recharge_amount: "25.00", enabled: true, invoice_enabled: false, preference: "credit_paypal" } };
    },
    async updateAutoRechargePreferences(payload) {
      return { data: { id: "arp_1", record_type: "auto_recharge_pref", threshold_amount: payload.threshold_amount ?? "10.00", recharge_amount: payload.recharge_amount ?? "25.00", enabled: payload.enabled ?? true, invoice_enabled: payload.invoice_enabled ?? false, preference: payload.preference ?? "credit_paypal" } };
    },
    async createStoredPaymentTransaction(payload) {
      return { data: { id: "txn_1", record_type: "transaction", amount_cents: Math.round(Number(payload.amount) * 100), processor_status: "submitted_for_settlement", amount_currency: "USD", auto_recharge: false, transaction_processing_type: "stored_payment" } };
    },
    async listBillingGroups() {
      return { data: [{ id: "bg_1", record_type: "billing_group", name: "Default" }] };
    },
    async createBillingGroup(payload) {
      return { data: { id: "bg_new", record_type: "billing_group", name: payload.name } };
    },
    async getBillingGroup(id) {
      return { data: { id, record_type: "billing_group", name: "Default" } };
    },
    async updateBillingGroup(id, payload) {
      return { data: { id, record_type: "billing_group", name: payload.name ?? "Default" } };
    },
    async getUsageReportOptions() {
      return { data: { products: ["messaging"], dimensions: ["country"], metrics: ["cost"] } };
    },
    async queryUsageReport(input) {
      return { data: [{ product: input.product, cost: "1.23" }], meta: { page_number: input.pageNumber, page_size: input.pageSize } };
    },
    ...overrides
  };
}

describe("BillingService read tools", () => {
  it("returns pass-through balance and billing group data with structured metadata", async () => {
    const service = createBillingService(fakeClient());

    await expect(service.getBalance()).resolves.toMatchObject({ data: { currency: "USD", balance: "25.00" } });
    await expect(service.listBillingGroups({ pageNumber: 1, pageSize: 10 })).resolves.toMatchObject({ data: [{ id: "bg_1" }] });
  });
});

describe("BillingService usage report validation", () => {
  it("normalizes defaults and caps page size before querying the beta Usage Reports endpoint", async () => {
    const calls: UsageQueryInput[] = [];
    const service = createBillingService(
      fakeClient({
        async queryUsageReport(input) {
          calls.push(input);
          return { data: [] };
        }
      })
    );

    await service.queryUsage({ product: "messaging", dimensions: ["country"], metrics: ["cost"], date_range: "last_7_days", page_size: 5000 });

    expect(calls).toEqual([
      {
        product: "messaging",
        dimensions: ["country"],
        metrics: ["cost"],
        dateRange: "last_7_days",
        filters: undefined,
        sort: undefined,
        format: "json",
        managedAccounts: false,
        pageNumber: 1,
        pageSize: DEFAULT_MAX_PAGE_SIZE
      }
    ]);
  });

  it("requires product, dimensions, and metrics", async () => {
    const service = createBillingService(fakeClient());

    await expect(service.queryUsage({ product: "", dimensions: ["country"], metrics: ["cost"] })).rejects.toThrow("product is required");
    await expect(service.queryUsage({ product: "messaging", dimensions: [], metrics: ["cost"] })).rejects.toThrow("at least one dimension");
    await expect(service.queryUsage({ product: "messaging", dimensions: ["country"], metrics: [] })).rejects.toThrow("at least one metric");
  });

  it("enforces a max 31-day explicit start/end date range", async () => {
    const service = createBillingService(fakeClient());

    await expect(
      service.queryUsage({
        product: "messaging",
        dimensions: ["country"],
        metrics: ["cost"],
        start_date: "2026-05-01",
        end_date: "2026-06-02"
      })
    ).rejects.toThrow("31 days");
  });

  it("rejects invalid calendar dates instead of letting Date.parse normalize them", async () => {
    const service = createBillingService(fakeClient());

    await expect(
      service.queryUsage({
        product: "messaging",
        dimensions: ["country"],
        metrics: ["cost"],
        start_date: "2026-02-31",
        end_date: "2026-03-01"
      })
    ).rejects.toThrow("start_date must be a valid ISO date string");
  });

  it("rejects a query that mixes date_range with explicit dates", async () => {
    const service = createBillingService(fakeClient());

    await expect(
      service.queryUsage({ product: "messaging", dimensions: ["country"], metrics: ["cost"], date_range: "last_7_days", start_date: "2026-05-01" })
    ).rejects.toThrow("Use either date_range or start_date/end_date");
  });
});
