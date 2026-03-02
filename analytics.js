(function setupCKDAnalytics(window) {
  const pageViewEventMap = {
    home: "view_home",
    lab_input: "view_lab_input",
    diet_plan: "view_diet_plan",
    community: "view_community",
  };

  function hasGtag() {
    return typeof window.gtag === "function";
  }

  function hasClarity() {
    return typeof window.clarity === "function";
  }

  function normalizeValue(value) {
    if (value == null) return undefined;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    const text = String(value).trim();
    return text ? text : undefined;
  }

  function normalizeParams(params) {
    return Object.entries(params || {}).reduce((acc, [key, value]) => {
      const normalized = normalizeValue(value);
      if (normalized !== undefined) acc[key] = normalized;
      return acc;
    }, {});
  }

  function setClarityTags(payload) {
    if (!hasClarity()) return;
    Object.entries(payload).forEach(([key, value]) => {
      window.clarity("set", key, String(value));
    });
  }

  const analytics = {
    bootstrap() {},
    track(eventName, params = {}) {
      const payload = normalizeParams(params);
      if (hasGtag()) {
        window.gtag("event", eventName, payload);
      }
      if (hasClarity()) {
        window.clarity("event", eventName);
        setClarityTags({ last_event: eventName, ...payload });
      }
    },
    trackPageView(pageName, params = {}) {
      const eventName = pageViewEventMap[pageName];
      const payload = normalizeParams({ page_name: pageName, ...params });
      if (!eventName) return;
      if (hasGtag()) {
        window.gtag("event", eventName, payload);
      }
      if (hasClarity()) {
        window.clarity("event", eventName);
        setClarityTags({ current_page: pageName, last_event: eventName, ...payload });
      }
    },
  };

  window.CKDAnalytics = analytics;
})(window);
