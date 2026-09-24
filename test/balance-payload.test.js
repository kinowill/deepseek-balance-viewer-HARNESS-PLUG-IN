import assert from "node:assert/strict";
import test from "node:test";

import { snapshotFromBalancePayload } from "../lib/balance-payload.js";

const details = {
  currency: "CNY",
  total_balance: "12.34",
  granted_balance: "2.34",
  topped_up_balance: "10.00",
};

test("keeps balance details when API credit is available", () => {
  assert.deepEqual(snapshotFromBalancePayload({ is_available: true, balance_infos: [details] }, 123), {
    state: "ok",
    balance: { currency: "CNY", total: "12.34", granted: "2.34", toppedUp: "10.00" },
    updatedAt: 123,
  });
});

test("keeps balance details when API credit is unavailable", () => {
  assert.deepEqual(snapshotFromBalancePayload({ is_available: false, balance_infos: [details] }, 456), {
    state: "unavailable",
    balance: { currency: "CNY", total: "12.34", granted: "2.34", toppedUp: "10.00" },
    updatedAt: 456,
  });
});

test("reports unavailable when no balance details are returned", () => {
  assert.deepEqual(snapshotFromBalancePayload({ is_available: false }, 789), { state: "unavailable" });
});
