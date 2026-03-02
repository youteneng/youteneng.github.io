(function bootstrapBaiduAnalytics() {
  const BAIDU_ANALYTICS_ID = window.CKD_BAIDU_ANALYTICS_ID || "";
  const _hmt = (window._hmt = window._hmt || []);

  function injectScript() {
    if (!BAIDU_ANALYTICS_ID) return;
    if (document.querySelector(`script[data-baidu-hm="${BAIDU_ANALYTICS_ID}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://hm.baidu.com/hm.js?${BAIDU_ANALYTICS_ID}`;
    script.dataset.baiduHm = BAIDU_ANALYTICS_ID;
    document.head.appendChild(script);
  }

  function normalizeLabel(payload) {
    if (!payload) return "";
    return Object.entries(payload)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}:${String(value)}`)
      .join("|")
      .slice(0, 255);
  }

  function toFlag(value) {
    return value ? "1" : "0";
  }

  function toShortText(value) {
    if (value === undefined || value === null || value === "") return "";
    return String(value).replace(/\s+/g, "_").slice(0, 80);
  }

  function buildLabel(keys, payload, fallback) {
    if (!payload) return fallback || "";
    const parts = keys
      .map((key) => {
        const value = payload[key];
        if (value === undefined || value === null || value === "") return "";
        return `${key}:${toShortText(value)}`;
      })
      .filter(Boolean);
    return parts.join("|") || fallback || "";
  }

  function eventMap(eventName, payload) {
    const defaults = {
      category: "ckd_general",
      action: eventName,
      label: normalizeLabel(payload),
      value: 1,
    };

    const mapping = {
      session_start: {
        category: "page_engagement",
        action: "session_start",
        label: buildLabel(["page"], payload, window.location.pathname),
      },
      view_change: {
        category: "page_engagement",
        action: "view_change",
        label: buildLabel(["view"], payload),
      },
      home_cta_start_use_click: {
        category: "conversion_funnel",
        action: "home_start_use_click",
        label: buildLabel(["source"], payload, "home"),
      },
      community_entry_click: {
        category: "community_conversion",
        action: "entry_click",
        label: buildLabel(["source"], payload),
      },
      community_modal_open: {
        category: "community_conversion",
        action: "modal_open",
        label: buildLabel(["source"], payload),
      },
      community_modal_close: {
        category: "community_conversion",
        action: "modal_close",
        label: buildLabel(["source"], payload),
      },
      community_qr_source_open: {
        category: "community_conversion",
        action: "qr_source_open",
        label: buildLabel(["source"], payload),
      },
      lab_form_submit: {
        category: "conversion_funnel",
        action: "lab_submit",
        label: buildLabel(["source"], payload, "lab_form"),
      },
      meal_plan_generated: {
        category: "meal_plan_core",
        action: "generate_plan",
        label: [
          `stage:${toShortText(payload?.stage)}`,
          `risk_k:${toFlag(payload?.hyperkalemia)}`,
          `risk_p:${toFlag(payload?.hyperphosphatemia)}`,
          `htn:${toFlag(payload?.hypertension)}`,
          `edema:${toFlag(payload?.edema)}`,
        ].join("|"),
      },
      recipe_click: {
        category: "recipe_engagement",
        action: "cta_click",
        label: buildLabel(["mealKey", "action", "recipeName"], payload),
      },
      recipe_swap: {
        category: "recipe_engagement",
        action: "swap_recipe",
        label: buildLabel(["mealKey", "toRecipeName"], payload),
      },
      nutrition_intake_logged: {
        category: "nutrition_tracking",
        action: "intake_log",
        label: buildLabel(["mealKey", "recipeName"], payload),
      },
      nutrition_over_limit_triggered: {
        category: "nutrition_tracking",
        action: "over_limit_trigger",
        label: buildLabel(["mealKey", "recipeName"], payload),
      },
      food_search: {
        category: "food_library",
        action: "search_keyword",
        label: buildLabel(["query"], payload),
      },
      premium_feature_click: {
        category: "premium_interest",
        action: "feature_click",
        label: buildLabel(["feature", "location", "label"], payload),
      },
    };

    return {
      ...defaults,
      ...(mapping[eventName] || {}),
      label: normalizeLabel(payload),
    };
  }

  function track(eventName, payload) {
    const event = eventMap(eventName, payload);
    _hmt.push(["_trackEvent", event.category, event.action, event.label, event.value]);
  }

  function trackPageView(path) {
    if (!path) return;
    _hmt.push(["_trackPageview", path]);
  }

  function bootstrap() {
    injectScript();
    track("session_start", {
      page: window.location.pathname,
    });
  }

  window.CKDAnalytics = {
    bootstrap,
    track,
    trackPageView,
  };
})();
