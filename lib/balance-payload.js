/**
 * Convert a successful DeepSeek balance response into the public snapshot.
 * DeepSeek can return balance details while `is_available` is false; those
 * amounts remain useful and must not be discarded.
 */
export function snapshotFromBalancePayload(data, updatedAt = Date.now()) {
  const info = Array.isArray(data?.balance_infos) ? data.balance_infos[0] : void 0;
  if (info === void 0) return { state: "unavailable" };
  return {
    state: data?.is_available === true ? "ok" : "unavailable",
    balance: {
      currency: String(info.currency ?? ""),
      total: String(info.total_balance ?? ""),
      granted: String(info.granted_balance ?? ""),
      toppedUp: String(info.topped_up_balance ?? ""),
    },
    updatedAt,
  };
}
