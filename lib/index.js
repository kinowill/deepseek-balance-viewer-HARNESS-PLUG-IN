/**
 * dsh-balance-viewer — host half.
 *
 * A Cordis Service exposed to the browser through a Typert Remote namespace
 * named `balance`. It answers the current DeepSeek platform balance, fetched
 * from https://api.deepseek.com/user/balance with the API key stored in the
 * DSH credentials store (reference DEEPSEEK_BALANCE_API_KEY) — the key never
 * appears in configuration files, patches, or this repository.
 *
 * @module dsh-balance-viewer
 */
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import z from "@deepseek-ai/schemastery";
import { snapshotFromBalancePayload } from "./balance-payload.js";

export { snapshotFromBalancePayload } from "./balance-payload.js";

/** Cordis plugin name used by loader diagnostics. */
export const name = "deepseek-balance";

/** Services required by this plugin. `logger` is a ctx accessor, not a service. */
export const inject = ["credentials"];

/** Credential reference: POSIX-identifier-shaped, distinct from DEEPSEEK_API_KEY. */
const API_KEY_REF = credentialRef("DEEPSEEK_BALANCE_API_KEY");

/** DeepSeek platform balance endpoint (same as the Python viewer). */
const BALANCE_URL = "https://api.deepseek.com/user/balance";

/** Per-request timeout in milliseconds. */
const REQUEST_TIMEOUT_MS = 15_000;

/** Validated plugin configuration. */
export const Config = z.object({
  /** Poll interval in milliseconds; minimum 10 seconds. */
  intervalMs: z.number().min(10_000).default(60_000),
});

/**
 * Prototype property the Typert Gateway reads in source mode
 * (remoteMethods()). The published @deepseek-ai packages receive these
 * markers from the Typert build pipeline; this package applies them by hand,
 * in the exact marker shape the protocol expects.
 */
const REMOTE_METHOD_DESCRIPTOR = "@deepseek-ai/dsh-typert-protocol/remote-methods";

/** Remote method names exposed under the `balance` namespace. */
const REMOTE_METHODS = ["get", "refresh", "setApiKey", "removeApiKey", "describeKey"];

export class BalanceService extends TypertRemoteService {
  static inject = inject;
  static Config = Config;

  /** Latest snapshot: { state, balance?, code?, updatedAt? }. */
  snapshot = { state: "loading" };

  /** Single-flight guard for refresh(). */
  refreshing = null;

  /** Polling timer. */
  timer = null;

  constructor(ctx, config) {
    super(ctx, "balance");
    this.config = config;
    this.refresh();
    this.timer = setInterval(() => {
      this.refresh();
    }, config.intervalMs);
    if (typeof this.timer.unref === "function") this.timer.unref();
    ctx.effect(() => () => {
      if (this.timer !== null) clearInterval(this.timer);
      this.timer = null;
    });
  }

  /** Remote: current snapshot (cached; never triggers a fetch). */
  async get() {
    return this.snapshot;
  }

  /** Remote: force a fetch now; concurrent callers share one flight. */
  async refresh() {
    if (this.refreshing !== null) return this.refreshing;
    this.refreshing = this._doRefresh().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  async _doRefresh() {
    let key;
    try {
      key = (await this.ctx.credentials.resolve(API_KEY_REF))?.value;
    } catch (error) {
      this.ctx.logger?.warn?.(`deepseek-balance: credential resolution failed: ${String(error)}`);
      key = void 0;
    }
    if (typeof key !== "string" || key.length === 0) {
      this.snapshot = { state: "missing-key" };
      return this.snapshot;
    }
    try {
      const response = await fetch(BALANCE_URL, {
        method: "GET",
        headers: { accept: "application/json", authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.status === 401) {
        this.snapshot = { state: "invalid-key" };
        return this.snapshot;
      }
      if (!response.ok) {
        this.snapshot = { state: "error", code: `http-${response.status}` };
        return this.snapshot;
      }
      const data = await response.json();
      this.snapshot = snapshotFromBalancePayload(data);
    } catch (error) {
      const aborted = error?.name === "TimeoutError" || error?.name === "AbortError";
      this.snapshot = { state: "error", code: aborted ? "timeout" : "network" };
    }
    return this.snapshot;
  }

  /** Remote: store a new API key in the DSH credentials store, then re-fetch. */
  async setApiKey(apiKey) {
    if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
      throw new Error("deepseek-balance: apiKey must be a non-empty string");
    }
    await this.ctx.credentials.set(API_KEY_REF, apiKey.trim());
    return this.refresh();
  }

  /** Remote: remove the stored key. */
  async removeApiKey() {
    await this.ctx.credentials.unset(API_KEY_REF);
    this.snapshot = { state: "missing-key" };
    return this.snapshot;
  }

  /** Remote: whether a key is configured — never its value. */
  async describeKey() {
    return this.ctx.credentials.describe(API_KEY_REF);
  }
}

// Apply the Typert Remote markers by hand (see REMOTE_METHOD_DESCRIPTOR above).
Object.defineProperty(BalanceService.prototype, REMOTE_METHOD_DESCRIPTOR, {
  configurable: true,
  value: Object.freeze({
    version: 1,
    methods: Object.freeze(
      REMOTE_METHODS.map((method) =>
        Object.freeze({ method, invocation: Object.freeze({ kind: "direct" }) }),
      ),
    ),
  }),
});

export default BalanceService;
