/**
 * dsh-balance-viewer — client half.
 *
 * Browser bundle served by the DSH client module system under /plugins.
 * Registers a badge into the `sidebar.footer.action` slot: an activity LED
 * plus the DeepSeek balance, with a popover panel showing granted/topped-up
 * details, refresh, and API-key management (via the host `balance` RPC).
 *
 * Written in the runtime bundle format (no build step): the factory body runs
 * lazily at first materialization; `apply` is the Cordis browser plugin entry.
 */
window.__ModuleLoader__.load({
  id: "dsh-balance-viewer",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");
    var jsxRuntime = require("react/jsx-runtime");
    var primitives = require("@deepseek-ai/dsh-client-ui-primitives");
    var h = jsxRuntime.jsx;

    function remoteValue(result) {
      if (result !== null && typeof result === "object" && result.ok === true) return result.value;
      var code = result?.error?.code;
      throw new Error("deepseek-balance: Remote call failed" + (typeof code === "string" ? " (" + code + ")" : ""));
    }

    function callBalance(ctx, method, args) {
      return ctx.connection.rpc.call("/api", "balance/" + method, { args: args || {} }).then(remoteValue);
    }

    // ---------------------------------------------------------------- CSS ----
    var css =
      ".dbb_layer{flex:none;align-items:center;width:100%;margin:8px 0 0;display:flex;position:relative}" +
      ".dbb_badge{width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:none;border-radius:12px;align-items:center;gap:8px;margin:0 -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;display:inline-flex;overflow:hidden}" +
      ".dbb_badge:hover,.dbb_badge[data-open]{background:var(--dsw-alias-interactive-bg-hover)}" +
      ".dbb_layer.dbb_rail{margin:0}.dbb_layer.dbb_rail .dbb_badge{border-radius:50%;justify-content:center;width:36px;height:36px;padding:0}" +
      ".dbb_led{border-radius:50%;flex:none;width:8px;height:8px}" +
      ".dbb_label{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-variant-numeric:tabular-nums;overflow:hidden}" +
      ".dbb_panel{z-index:30;background:var(--dsw-specific-menu);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);width:320px;max-width:calc(100vw - 24px);max-height:70vh;box-shadow:var(--dsw-elevation-prominent);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;border-radius:12px;flex-direction:column;display:flex;position:fixed;overflow:hidden}" +
      ".dbb_head{box-sizing:border-box;flex:none;justify-content:space-between;align-items:center;min-height:44px;padding:10px 12px;display:flex}" +
      ".dbb_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:20px}" +
      ".dbb_close{width:24px;height:24px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:999px;justify-content:center;align-items:center;margin-left:4px;padding:0;display:inline-flex}" +
      ".dbb_close:hover{background:var(--dsw-alias-interactive-bg-hover)}" +
      ".dbb_body{flex:1;min-height:0;padding:0 12px 12px;overflow-y:auto}" +
      ".dbb_total{color:var(--dsw-alias-label-primary);font-size:22px;font-weight:600;line-height:1.4;font-variant-numeric:tabular-nums}" +
      ".dbb_detail{justify-content:space-between;align-items:center;border-top:.5px solid var(--dsw-alias-border-l2);padding:6px 0;display:flex}" +
      ".dbb_detailKey{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}" +
      ".dbb_detailValue{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}" +
      ".dbb_state{color:var(--dsw-alias-label-tertiary);margin:4px 0;font-size:12px;line-height:18px}" +
      ".dbb_stateError{color:var(--dsw-alias-state-error-primary)}" +
      ".dbb_updated{color:var(--dsw-alias-label-caption);margin:4px 0;font-size:11px;line-height:16px}" +
      ".dbb_actions{align-items:center;gap:8px;margin-top:8px;display:flex}" +
      ".dbb_button{height:28px;color:var(--dsw-alias-label-primary);cursor:pointer;background:var(--dsw-alias-interactive-bg-hover);border:none;border-radius:8px;align-items:center;gap:6px;padding:0 10px;font-family:inherit;font-size:12px;display:inline-flex}" +
      ".dbb_button:hover{background:var(--dsw-alias-interactive-bg-hover)}" +
      ".dbb_buttonDanger{color:var(--dsw-alias-state-error-primary)}" +
      ".dbb_keyRow{align-items:center;gap:6px;border-top:.5px solid var(--dsw-alias-border-l2);margin-top:8px;padding-top:8px;display:flex}" +
      ".dbb_input{box-sizing:border-box;height:30px;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;flex:1;min-width:0;padding:0 10px;font-family:inherit;font-size:12px}" +
      ".dbb_input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}" +
      ".dbb_keyHint{color:var(--dsw-alias-label-caption);margin:4px 0 0;font-size:11px;line-height:16px}";
    var tagId = "dsh-balance-viewer/style";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
      var styleTag = document.createElement("style");
      styleTag.dataset.plugin = "dsh-balance-viewer";
      styleTag.dataset.pluginCss = tagId;
      styleTag.textContent = css;
      document.head.appendChild(styleTag);
    }

    // --------------------------------------------------------------- i18n ----
    var NS = "deepseek-balance";
    var dicts = {
      fr: {
        badgeAria: "Solde DeepSeek",
        loading: "Chargement…",
        missingKey: "Clé API manquante",
        invalidKey: "Clé API invalide",
        unavailable: "Solde indisponible",
        network: "Erreur réseau",
        timeout: "Délai dépassé",
        rpc: "Service balance injoignable",
        panelTitle: "Solde DeepSeek",
        granted: "Offert",
        toppedUp: "Rechargé",
        refresh: "Rafraîchir",
        keyLabel: "Clé API",
        keyPlaceholder: "sk-…",
        keySave: "Enregistrer",
        keyRemove: "Supprimer",
        keyConfigured: "Clé configurée — remplacez-la ou supprimez-la.",
        keyUnconfigured: "Aucune clé configurée.",
        keySaved: "Clé enregistrée.",
        keyRemoved: "Clé supprimée.",
        updated: "Mis à jour à {time}",
        close: "Fermer",
      },
      en: {
        badgeAria: "DeepSeek balance",
        loading: "Loading…",
        missingKey: "No API key",
        invalidKey: "Invalid API key",
        unavailable: "Balance unavailable",
        network: "Network error",
        timeout: "Request timed out",
        rpc: "Balance service unreachable",
        panelTitle: "DeepSeek balance",
        granted: "Granted",
        toppedUp: "Topped up",
        refresh: "Refresh",
        keyLabel: "API key",
        keyPlaceholder: "sk-…",
        keySave: "Save",
        keyRemove: "Remove",
        keyConfigured: "Key configured — replace or remove it.",
        keyUnconfigured: "No API key configured.",
        keySaved: "Key saved.",
        keyRemoved: "Key removed.",
        updated: "Updated {time}",
        close: "Close",
      },
    };

    /** Fallback translator when the framework passes no `t` prop. */
    function fallbackT(key, params) {
      var lang = typeof navigator !== "undefined" && String(navigator.language).toLowerCase().startsWith("fr") ? "fr" : "en";
      var text = dicts[lang][key] ?? dicts.en[key] ?? key;
      if (params) for (var k in params) text = text.replace("{" + k + "}", params[k]);
      return text;
    }

    // -------------------------------------------------------------- store ----
    /** Observable balance snapshot: getSnapshot/subscribe (useSyncExternalStore). */
    function createStore(ctx) {
      var listeners = new Set();
      var snapshot = { state: "loading" };
      var inFlight = null;
      return {
        getSnapshot: function () {
          return snapshot;
        },
        subscribe: function (fn) {
          listeners.add(fn);
          return function () {
            listeners.delete(fn);
          };
        },
        refresh: function () {
          if (inFlight !== null) return;
          inFlight = callBalance(ctx, "get")
            .then(
              function (result) {
                snapshot = result && typeof result === "object" ? result : { state: "error", code: "empty" };
              },
              function () {
                snapshot = { state: "error", code: "rpc" };
              },
            )
            .finally(function () {
              inFlight = null;
              for (var _i = 0, _list = [...listeners]; _i < _list.length; _i++) _list[_i]();
            });
        },
      };
    }

    // ------------------------------------------------------------ component --
    function ledColorOf(state) {
      if (state === "ok") return "var(--dsw-alias-state-success-primary)";
      if (state === "missing-key") return "var(--dsw-alias-state-warn-label)";
      if (state === "loading") return "var(--dsw-alias-label-tertiary)";
      return "var(--dsw-alias-state-error-primary)";
    }

    function stateMessage(snapshot, t) {
      if (snapshot.state === "ok") return null;
      if (snapshot.state === "loading") return t("loading");
      if (snapshot.state === "missing-key") return t("missingKey");
      if (snapshot.state === "invalid-key") return t("invalidKey");
      if (snapshot.state === "unavailable") return t("unavailable");
      if (snapshot.code === "timeout") return t("timeout");
      if (snapshot.code === "network") return t("network");
      if (snapshot.code === "rpc" || snapshot.code === "empty") return t("rpc");
      if (typeof snapshot.code === "string" && snapshot.code.startsWith("http-")) {
        return "HTTP " + snapshot.code.slice(5);
      }
      return t("network");
    }

    function BalanceBadge(props) {
      var wide = props.wide === true;
      var t = typeof props.t === "function" ? props.t : fallbackT;
      var useBalance = props.useBalance;
      var onRefresh = props.onRefresh;
      var onSetKey = props.onSetKey;
      var onRemoveKey = props.onRemoveKey;
      var onDescribeKey = props.onDescribeKey;

      var snapshot = useBalance(function (s) {
        return s;
      });
      var openState = React.useState(false);
      var open = openState[0];
      var setOpen = openState[1];
      var keyInputState = React.useState("");
      var keyInput = keyInputState[0];
      var setKeyInput = keyInputState[1];
      var keyStatusState = React.useState(null);
      var keyStatus = keyStatusState[0];
      var setKeyStatus = keyStatusState[1];
      var busyState = React.useState(false);
      var busy = busyState[0];
      var setBusy = busyState[1];
      var noticeState = React.useState(null);
      var notice = noticeState[0];
      var setNotice = noticeState[1];
      var anchorState = React.useState(void 0);
      var anchor = anchorState[0];
      var setAnchor = anchorState[1];
      var rootRef = React.useRef(null);

      primitives.useDismissOnOutsidePointer(rootRef, open, setOpen);

      React.useLayoutEffect(
        function () {
          if (!open) return;
          var place = function () {
            var rect = rootRef.current && rootRef.current.getBoundingClientRect();
            if (rect === null || rect === void 0) return;
            setAnchor({ left: rect.left, bottom: window.innerHeight - rect.top + 8 });
          };
          place();
          window.addEventListener("resize", place);
          return function () {
            window.removeEventListener("resize", place);
          };
        },
        [open],
      );

      React.useEffect(
        function () {
          if (!open) return;
          var alive = true;
          onDescribeKey().then(
            function (status) {
              if (alive) setKeyStatus(status);
            },
            function () {
              if (alive) setKeyStatus({ configured: false, writable: false });
            },
          );
          return function () {
            alive = false;
          };
        },
        [open],
      );

      var message = stateMessage(snapshot, t);
      var label = snapshot.state === "ok" ? snapshot.balance.total + " " + snapshot.balance.currency : message;
      var updatedText = snapshot.updatedAt !== void 0 ? t("updated", { time: new Date(snapshot.updatedAt).toLocaleTimeString() }) : null;

      var saveKey = function () {
        if (busy || keyInput.trim().length === 0) return;
        setBusy(true);
        setNotice(null);
        onSetKey(keyInput.trim()).then(
          function () {
            setBusy(false);
            setKeyInput("");
            setNotice(t("keySaved"));
            setKeyStatus({ configured: true });
          },
          function () {
            setBusy(false);
            setNotice(t("rpc"));
          },
        );
      };

      var removeKey = function () {
        if (busy) return;
        setBusy(true);
        setNotice(null);
        onRemoveKey().then(
          function () {
            setBusy(false);
            setNotice(t("keyRemoved"));
            setKeyStatus({ configured: false });
          },
          function () {
            setBusy(false);
            setNotice(t("rpc"));
          },
        );
      };

      return h(
        "div",
        { ref: rootRef, className: wide ? "dbb_layer" : "dbb_layer dbb_rail" },
        h(
          "button",
          {
            type: "button",
            className: "dbb_badge",
            "data-open": open || void 0,
            "data-state": snapshot.state,
            "aria-label": t("badgeAria"),
            title: label,
            onClick: function () {
              setOpen(function (value) {
                return !value;
              });
            },
          },
          h("span", { className: "dbb_led", style: { background: ledColorOf(snapshot.state) } }),
          wide ? h("span", { className: "dbb_label" }, label) : null,
        ),
        open && anchor !== void 0
          ? h(
              "section",
              { className: "dbb_panel", style: anchor, "aria-label": t("panelTitle") },
              h(
                "div",
                { className: "dbb_head" },
                h("span", { className: "dbb_title" }, t("panelTitle")),
                h(
                  "button",
                  { type: "button", className: "dbb_close", "aria-label": t("close"), onClick: function () { setOpen(false); } },
                  h(primitives.IconCloseOutline16, { size: 14 }),
                ),
              ),
              h(
                "div",
                { className: "dbb_body" },
                snapshot.state === "ok"
                  ? h(
                      "div",
                      null,
                      h("div", { className: "dbb_total" }, snapshot.balance.total + " " + snapshot.balance.currency),
                      h(
                        "div",
                        { className: "dbb_detail" },
                        h("span", { className: "dbb_detailKey" }, t("granted")),
                        h("span", { className: "dbb_detailValue" }, snapshot.balance.granted + " " + snapshot.balance.currency),
                      ),
                      h(
                        "div",
                        { className: "dbb_detail" },
                        h("span", { className: "dbb_detailKey" }, t("toppedUp")),
                        h("span", { className: "dbb_detailValue" }, snapshot.balance.toppedUp + " " + snapshot.balance.currency),
                      ),
                    )
                  : h("p", { className: "dbb_state" + (snapshot.state !== "loading" ? " dbb_stateError" : "") }, message),
                updatedText !== null ? h("p", { className: "dbb_updated" }, updatedText) : null,
                h(
                  "div",
                  { className: "dbb_actions" },
                  h(
                    "button",
                    { type: "button", className: "dbb_button", onClick: onRefresh },
                    h(primitives.IconRefreshOutline16, { size: 14 }),
                    t("refresh"),
                  ),
                ),
                h(
                  "div",
                  { className: "dbb_keyRow" },
                  h("input", {
                    className: "dbb_input",
                    type: "password",
                    placeholder: t("keyPlaceholder"),
                    "aria-label": t("keyLabel"),
                    value: keyInput,
                    disabled: busy,
                    onKeyDown: function (event) {
                      if (event.key === "Enter") saveKey();
                    },
                    onChange: function (event) {
                      setKeyInput(event.target.value);
                    },
                  }),
                  h(
                    "button",
                    { type: "button", className: "dbb_button", disabled: busy || keyInput.trim().length === 0, onClick: saveKey },
                    h(primitives.IconCheckOutline16, { size: 14 }),
                    t("keySave"),
                  ),
                  keyStatus !== null && keyStatus.configured === true
                    ? h(
                        "button",
                        { type: "button", className: "dbb_button dbb_buttonDanger", disabled: busy, onClick: removeKey },
                        h(primitives.IconTrashOutline16, { size: 14 }),
                        t("keyRemove"),
                      )
                    : null,
                ),
                h("p", { className: "dbb_keyHint" }, keyStatus !== null && keyStatus.configured === true ? t("keyConfigured") : t("keyUnconfigured")),
                notice !== null ? h("p", { className: "dbb_state" }, notice) : null,
              ),
            )
          : null,
      );
    }

    // --------------------------------------------------------------- plugin --
    var inject = ["slots", "locale", "remote", "connection"];

    function apply(ctx) {
      var t = ctx.locale.bind(NS);
      ctx.effect(
        function () {
          ctx.locale.register(NS, dicts);
        },
        "deepseek-balance: locale dictionaries",
      );

      var store = createStore(ctx);
      var port = {
        refresh: function () {
          store.refresh();
        },
        setApiKey: function (key) {
          return callBalance(ctx, "setApiKey", { apiKey: key }).then(function () {
            store.refresh();
          });
        },
        removeApiKey: function () {
          return callBalance(ctx, "removeApiKey").then(function () {
            store.refresh();
          });
        },
        describeKey: function () {
          return callBalance(ctx, "describeKey");
        },
      };

      var pollTimer = setInterval(function () {
        store.refresh();
      }, 30_000);
      ctx.effect(
        function () {
          return function () {
            clearInterval(pollTimer);
          };
        },
        "deepseek-balance: poll timer",
      );

      ctx.effect(
        function () {
          return ctx.remote.$on("credentials/reference-updated", function () {
            store.refresh();
          });
        },
        "deepseek-balance: credential updates",
      );
      ctx.on("connection/reset", function () {
        store.refresh();
      });

      store.refresh();

      ctx.slots.inject("sidebar.footer.action", function () {
        return ctx.slots.register(
          {
            name: "sidebar.footer.action",
            id: "deepseek-balance",
            order: 200,
            locale: NS,
            inject: function () {
              return {
                hooks: { balance: store },
                onRefresh: port.refresh,
                onSetKey: port.setApiKey,
                onRemoveKey: port.removeApiKey,
                onDescribeKey: port.describeKey,
              };
            },
          },
          BalanceBadge,
        );
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
