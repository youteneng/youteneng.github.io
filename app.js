const foodDatabase = window.FOOD_DATABASE || [];
const analytics = window.CKDAnalytics;

const mealCatalog = {
  breakfast: {
    label: "早餐",
    icon: "早",
    items: [
      {
        id: "b1",
        title: "小米粥 + 鸡蛋白",
        subtitle: "温和低钾早餐，适合 CKD 患者",
        ingredients: ["小米 20g", "鸡蛋清 80g", "焯生菜 80g"],
        nutrients: { energy: 250, protein: 10, sodium: 180, potassium: 150, phosphorus: 80 },
        flags: ["default", "lowK", "lowP"],
      },
      {
        id: "b2",
        title: "白吐司 + 苹果片 + 牛奶",
        subtitle: "便于执行，适合 1-3 期常规日",
        ingredients: ["白吐司 2 片", "苹果 110g", "全脂奶 130g"],
        nutrients: { energy: 310, protein: 8, sodium: 170, potassium: 230, phosphorus: 120 },
        flags: ["default"],
      },
      {
        id: "b3",
        title: "米粥 + 蛋清卷",
        subtitle: "低蛋白日可保留优质蛋白比例",
        ingredients: ["大米 25g", "鸡蛋清 80g", "芝麻油 5g"],
        nutrients: { energy: 270, protein: 9, sodium: 120, potassium: 90, phosphorus: 40 },
        flags: ["lowK", "lowP", "stage45"],
      },
    ],
  },
  lunch: {
    label: "午餐",
    icon: "午",
    items: [
      {
        id: "l1",
        title: "清炒丝瓜 + 白米饭",
        subtitle: "低钾蔬菜搭配主食",
        ingredients: ["丝瓜 180g", "白米饭 150g", "鸡胸肉 35g"],
        nutrients: { energy: 420, protein: 12, sodium: 400, potassium: 280, phosphorus: 120 },
        flags: ["default"],
      },
      {
        id: "l2",
        title: "清蒸鸡胸 + 冬瓜饭",
        subtitle: "低盐、高优质蛋白午餐",
        ingredients: ["鸡胸肉 35g", "冬瓜 200g", "大米 40g", "菜籽油 5g"],
        nutrients: { energy: 445, protein: 15, sodium: 230, potassium: 260, phosphorus: 125 },
        flags: ["lowNa", "lowK"],
      },
      {
        id: "l3",
        title: "低蛋白面 + 番茄鸡丝",
        subtitle: "更适合 4-5 期控蛋白",
        ingredients: ["麦淀粉面 35g", "鸡胸肉 25g", "番茄 50g", "油麦菜 80g"],
        nutrients: { energy: 410, protein: 10, sodium: 210, potassium: 250, phosphorus: 105 },
        flags: ["stage45", "lowP"],
      },
    ],
  },
  dinner: {
    label: "晚餐",
    icon: "晚",
    items: [
      {
        id: "d1",
        title: "番茄蛋花汤 + 白饭",
        subtitle: "清淡晚餐，适量控钠",
        ingredients: ["番茄 60g", "鸡蛋清 80g", "白米饭 130g"],
        nutrients: { energy: 380, protein: 10, sodium: 420, potassium: 350, phosphorus: 130 },
        flags: ["default"],
      },
      {
        id: "d2",
        title: "菜花蛋清烩 + 馒头",
        subtitle: "高钾风险时更稳妥",
        ingredients: ["菜花 100g", "鸡蛋清 80g", "馒头 40g", "萝卜 80g"],
        nutrients: { energy: 320, protein: 10, sodium: 160, potassium: 170, phosphorus: 75 },
        flags: ["lowK", "lowP", "stage45"],
      },
      {
        id: "d3",
        title: "白姑鱼蒸饭 + 焯娃娃菜",
        subtitle: "优质蛋白占比更高",
        ingredients: ["白姑鱼 35g", "大米 35g", "娃娃菜 100g"],
        nutrients: { energy: 390, protein: 14, sodium: 210, potassium: 240, phosphorus: 125 },
        flags: ["default"],
      },
    ],
  },
  snack: {
    label: "加餐",
    icon: "加",
    items: [
      {
        id: "s1",
        title: "苹果半个",
        subtitle: "低钾水果首选",
        ingredients: ["苹果 55g"],
        nutrients: { energy: 50, protein: 0.3, sodium: 1, potassium: 80, phosphorus: 10 },
        flags: ["lowK", "lowP", "default"],
      },
      {
        id: "s2",
        title: "香梨 + 西米小点",
        subtitle: "补能量但不明显抬高蛋白",
        ingredients: ["香梨 100g", "西米 15g"],
        nutrients: { energy: 88, protein: 0.5, sodium: 4, potassium: 96, phosphorus: 11 },
        flags: ["stage45", "lowP"],
      },
      {
        id: "s3",
        title: "苏打饼 2 片 + 梨块",
        subtitle: "食欲一般时更容易执行",
        ingredients: ["苏打饼 20g", "香梨 80g"],
        nutrients: { energy: 120, protein: 1.8, sodium: 95, potassium: 110, phosphorus: 25 },
        flags: ["default"],
      },
    ],
  },
};

const state = {
  activeView: "home",
  profile: null,
  targets: null,
  communityModalOpen: false,
  featureToastTimer: null,
  mealSelections: {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  },
  intake: {
    energy: 0,
    protein: 0,
    sodium: 0,
    potassium: 0,
    phosphorus: 0,
  },
};

const mealKeyOrder = ["breakfast", "lunch", "dinner", "snack"];

function inferStage(egfr) {
  if (!egfr && egfr !== 0) return 3;
  if (egfr >= 90) return 1;
  if (egfr >= 60) return 2;
  if (egfr >= 30) return 3;
  if (egfr >= 15) return 4;
  return 5;
}

function getIdealWeight(profile) {
  return profile.sex === "male" ? profile.height - 105 : profile.height - 107;
}

function getProteinPerKg(stage) {
  return stage <= 2 ? 0.8 : 0.6;
}

function calculateTargets(profile) {
  const idealWeight = Math.max(35, Math.round(getIdealWeight(profile)));
  const stage = inferStage(profile.egfr);
  const protein = +(idealWeight * getProteinPerKg(stage)).toFixed(1);
  const energyBase = stage >= 4 ? 33 : 35;
  const energy = Math.round(idealWeight * energyBase);
  const sodium = profile.hypertension || profile.edema ? 2000 : 2200;
  const potassium = profile.hyperkalemia ? 2000 : 2200;
  const phosphorus = profile.hyperphosphatemia || stage >= 4 ? 800 : 900;

  return {
    stage,
    idealWeight,
    energy,
    protein,
    sodium,
    potassium,
    phosphorus,
    qualityProtein: +(protein * 0.65).toFixed(1),
  };
}

function pickInitialIndex(mealKey, profile) {
  return 0;
}

function getMealOptions(mealKey, profile) {
  return mealCatalog[mealKey].items.filter((item) => {
    if (profile.stage >= 4 && item.flags.includes("stage45")) return true;
    if (profile.hyperkalemia && item.flags.includes("lowK")) return true;
    if (profile.hyperphosphatemia && item.flags.includes("lowP")) return true;
    return item.flags.includes("default") || item.flags.includes("lowNa");
  });
}

function normalizeNumber(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseForm(form) {
  const data = new FormData(form);
  const profile = {
    sex: data.get("sex"),
    height: Number(data.get("height")),
    edema: data.get("edema") === "on",
    hypertension: data.get("hypertension") === "on",
    creatinine: normalizeNumber(data.get("creatinine")),
    bun: normalizeNumber(data.get("bun")),
    egfr: normalizeNumber(data.get("egfr")),
    albumin: normalizeNumber(data.get("albumin")),
    potassiumLab: normalizeNumber(data.get("potassium")),
    phosphorusLab: normalizeNumber(data.get("phosphorus")),
    sodiumLab: normalizeNumber(data.get("sodium")),
    hemoglobin: normalizeNumber(data.get("hemoglobin")),
  };

  const targets = calculateTargets({
    ...profile,
    hyperkalemia: profile.potassiumLab != null && profile.potassiumLab > 5.5,
    hyperphosphatemia: profile.phosphorusLab != null && profile.phosphorusLab > 1.45,
  });

  return {
    ...profile,
    stage: targets.stage,
    hyperkalemia: profile.potassiumLab != null && profile.potassiumLab > 5.5,
    hyperphosphatemia: profile.phosphorusLab != null && profile.phosphorusLab > 1.45,
  };
}

function formatValue(value, unit) {
  return `${value}${unit}`;
}

function setActiveView(view) {
  state.activeView = view;
  document.querySelectorAll(".view").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.view === view);
  });
  document.querySelectorAll(".nav-tab").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.nav === view);
  });
  analytics.track("view_change", { view });
  analytics.trackPageView(`/${view}`);
}

function setCommunityModal(open) {
  state.communityModalOpen = open;
  const modal = document.getElementById("community-modal");
  modal.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
  analytics.track(open ? "community_modal_open" : "community_modal_close", { source: state.activeView });
}

function showFeatureToast(message = "敬请期待高阶版本") {
  const toast = document.getElementById("feature-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-visible");
  window.clearTimeout(state.featureToastTimer);
  state.featureToastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => {
      toast.hidden = true;
    }, 180);
  }, 1800);
}

function renderBudget() {
  const budgetGrid = document.getElementById("budget-grid");
  const { targets } = state;
  const items = [
    ["热量", formatValue(targets.energy, " kcal")],
    ["蛋白质", formatValue(targets.protein, " g")],
    ["钠", formatValue(targets.sodium, " mg")],
    ["钾", formatValue(targets.potassium, " mg")],
    ["磷", formatValue(targets.phosphorus, " mg")],
  ];

  budgetGrid.innerHTML = items
    .map(
      ([label, value]) => `
        <div class="budget-item">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");

  const notes = [
    `根据 eGFR 推断当前为 CKD ${targets.stage} 期。`,
    `理想体重约 ${targets.idealWeight} kg，蛋白建议 ${targets.protein} g/天，其中优质蛋白约 ${targets.qualityProtein} g/天。`,
  ];
  if (state.profile.hyperkalemia) notes.push("当前血钾偏高，已优先筛选低钾食谱与低钾食材。");
  if (state.profile.hyperphosphatemia) notes.push("当前血磷偏高，已优先筛选低磷方案。");
  if (state.profile.hypertension || state.profile.edema) notes.push("存在高血压或浮肿，钠摄入按更严格目标控制。");

  document.getElementById("stage-copy").textContent = notes.join(" ");
}

function getSelectedMeal(mealKey) {
  const options = getMealOptions(mealKey, state.profile);
  const index = Math.min(state.mealSelections[mealKey], Math.max(0, options.length - 1));
  state.mealSelections[mealKey] = index;
  return options[index];
}

function renderMeals() {
  const container = document.getElementById("meal-sections");
  container.innerHTML = mealKeyOrder
    .map((mealKey) => {
      const group = mealCatalog[mealKey];
      const recipe = getSelectedMeal(mealKey);
      if (!recipe) return "";
      return `
        <section class="meal-group" data-meal-key="${mealKey}">
          <div class="meal-heading"><span>${group.label}</span></div>
          <article class="card meal-card">
            <div class="meal-copy">
              <h3>${recipe.title}</h3>
              <p>${recipe.subtitle}</p>
              <div class="nutrient-tags">
                <span class="tag">${recipe.nutrients.energy} kcal</span>
                <span class="tag">蛋白 ${recipe.nutrients.protein}g</span>
                <span class="tag">钠 ${recipe.nutrients.sodium}mg</span>
                <span class="tag">钾 ${recipe.nutrients.potassium}mg</span>
                <span class="tag">磷 ${recipe.nutrients.phosphorus}mg</span>
              </div>
              <div class="ingredient-copy">食材份量：${recipe.ingredients.join(" · ")}</div>
            </div>
            <div class="meal-actions">
              <button class="button button-light meal-button" type="button" data-action="swap" data-meal="${mealKey}">换一换</button>
              <button class="button button-green meal-button" type="button" data-action="log" data-meal="${mealKey}">摄入记录</button>
            </div>
          </article>
        </section>
      `;
    })
    .join("");
}

function clampRatio(current, target) {
  if (target <= 0) return 0;
  return Math.min(current / target, 1);
}

function renderIntake() {
  const targets = state.targets;
  const metrics = [
    ["总热量", "energy", targets.energy, "kcal"],
    ["总蛋白质", "protein", targets.protein, "g"],
    ["总钠", "sodium", targets.sodium, "mg"],
    ["总钾", "potassium", targets.potassium, "mg"],
    ["总磷", "phosphorus", targets.phosphorus, "mg"],
  ];

  document.getElementById("intake-stats").innerHTML = metrics
    .map(([label, key, target, unit]) => {
      const current = +state.intake[key].toFixed(1);
      const over = current > target;
      return `
        <div class="progress-row">
          <div class="progress-label${over ? " is-over" : ""}">
            <span>${label}</span>
            <span>${current} / ${target} ${unit}</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar${over ? " is-over" : ""}" style="width: ${clampRatio(current, target) * 100}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  const warnings = [];
  if (state.intake.protein > targets.protein) warnings.push("总蛋白质");
  if (state.intake.sodium > targets.sodium) warnings.push("总钠");
  if (state.intake.potassium > targets.potassium) warnings.push("总钾");
  if (state.intake.phosphorus > targets.phosphorus) warnings.push("总磷");

  const warningBox = document.getElementById("intake-warning");
  if (warnings.length > 0) {
    warningBox.hidden = false;
    warningBox.textContent = `△ 已超过当日${warnings.join("、")}预算，请注意饮食调整。`;
  } else {
    warningBox.hidden = true;
    warningBox.textContent = "";
  }
}

function scoreFood(item, profile) {
  let score = item.sodium * 0.2 + item.protein * 2;
  if (profile.hyperkalemia) score += item.potassium;
  if (profile.hyperphosphatemia) score += item.phosphorus * 1.2;
  if (profile.hypertension || profile.edema) score += item.sodium;
  if (profile.stage >= 4) score += item.protein * 6;
  return score;
}

function filterFoods(query) {
  const normalized = query.trim().toLowerCase();
  let items = foodDatabase.filter((item) => {
    if (!normalized) return true;
    return item.name.toLowerCase().includes(normalized) || item.category.toLowerCase().includes(normalized);
  });

  if (state.profile.hyperkalemia) {
    items = items.filter((item) => !item.tags.includes("highK") && !item.tags.includes("veryHighK"));
  }
  if (state.profile.hyperphosphatemia) {
    items = items.filter((item) => !item.tags.includes("highP") && !item.tags.includes("veryHighP"));
  }
  if (state.profile.hypertension || state.profile.edema) {
    items = items.filter((item) => !item.tags.includes("veryHighNa"));
  }

  return items.sort((a, b) => scoreFood(a, state.profile) - scoreFood(b, state.profile));
}

function groupFoods(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

function renderFoodDatabase() {
  const query = document.getElementById("food-search").value;
  const items = filterFoods(query).slice(0, 72);
  const grouped = groupFoods(items);
  const groups = Object.entries(grouped);

  document.getElementById("food-summary").textContent = `已根据当前化验条件筛选更适合的交换食材，当前展示 ${items.length} 条结果。`;
  if (groups.length === 0) {
    document.getElementById("food-results").innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" aria-hidden="true"></div>
        <strong>未找到匹配食材</strong>
        <p>可以换一个关键词，或先清空搜索词后再查看当前风险条件下的推荐食材。</p>
      </div>
    `;
    return;
  }

  document.getElementById("food-results").innerHTML = groups
    .map(
      ([category, group]) => `
        <section class="food-group">
          <div class="food-group-header">
            <strong>${category}</strong>
            <span>${group.length} 条</span>
          </div>
          <table class="food-table">
            <thead>
              <tr>
                <th>食材</th>
                <th>每份</th>
                <th>蛋白</th>
                <th>钠</th>
                <th>钾</th>
                <th>磷</th>
                <th>能量</th>
              </tr>
            </thead>
            <tbody>
              ${group
                .map(
                  (item) => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.portion}</td>
                      <td>${item.protein}g</td>
                      <td>${item.sodium}mg</td>
                      <td>${item.potassium}mg</td>
                      <td>${item.phosphorus}mg</td>
                      <td>${item.energy}kcal</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </section>
      `,
    )
    .join("");
}

function renderPlanView() {
  renderBudget();
  renderMeals();
  renderIntake();
  renderFoodDatabase();
}

function getCurrentPlanTotals() {
  return mealKeyOrder.reduce(
    (acc, mealKey) => {
      const recipe = getSelectedMeal(mealKey);
      if (!recipe) return acc;
      acc.energy += recipe.nutrients.energy;
      acc.protein += recipe.nutrients.protein;
      acc.sodium += recipe.nutrients.sodium;
      acc.potassium += recipe.nutrients.potassium;
      acc.phosphorus += recipe.nutrients.phosphorus;
      return acc;
    },
    { energy: 0, protein: 0, sodium: 0, potassium: 0, phosphorus: 0 },
  );
}

function resetIntake() {
  state.intake = {
    energy: 0,
    protein: 0,
    sodium: 0,
    potassium: 0,
    phosphorus: 0,
  };
}

function buildPlan(profile) {
  state.profile = profile;
  state.targets = calculateTargets(profile);
  mealKeyOrder.forEach((mealKey) => {
    state.mealSelections[mealKey] = pickInitialIndex(mealKey, profile);
  });
  resetIntake();
  renderPlanView();
  const planTotals = getCurrentPlanTotals();
  analytics.track("meal_plan_generated", {
    stage: state.targets.stage,
    hyperkalemia: profile.hyperkalemia,
    hyperphosphatemia: profile.hyperphosphatemia,
    hypertension: profile.hypertension,
    edema: profile.edema,
    proteinTarget: state.targets.protein,
    planProtein: planTotals.protein,
    planEnergy: planTotals.energy,
  });
  setActiveView("plan");
}

function handleSwap(mealKey) {
  const options = getMealOptions(mealKey, state.profile);
  if (options.length <= 1) return;
  const previousRecipe = getSelectedMeal(mealKey);
  state.mealSelections[mealKey] = (state.mealSelections[mealKey] + 1) % options.length;
  const nextRecipe = getSelectedMeal(mealKey);
  analytics.track("recipe_swap", {
    mealKey,
    fromRecipeId: previousRecipe?.id,
    toRecipeId: nextRecipe?.id,
    toRecipeName: nextRecipe?.title,
  });
  renderMeals();
}

function handleLog(mealKey) {
  const recipe = getSelectedMeal(mealKey);
  Object.keys(state.intake).forEach((key) => {
    state.intake[key] += recipe.nutrients[key];
  });
  analytics.track("nutrition_intake_logged", {
    mealKey,
    recipeId: recipe.id,
    recipeName: recipe.title,
    protein: recipe.nutrients.protein,
    energy: recipe.nutrients.energy,
  });
  const overLimitTriggered =
    state.intake.protein > state.targets.protein ||
    state.intake.sodium > state.targets.sodium ||
    state.intake.potassium > state.targets.potassium ||
    state.intake.phosphorus > state.targets.phosphorus;
  if (overLimitTriggered) {
    analytics.track("nutrition_over_limit_triggered", {
      mealKey,
      recipeId: recipe.id,
      recipeName: recipe.title,
    });
  }
  renderIntake();
}

function bindEvents() {
  document.querySelectorAll("[data-nav]").forEach((node) => {
    node.addEventListener("click", () => {
      const target = node.dataset.nav;
      if (target === "plan" && !state.targets) {
        setActiveView("labs");
        return;
      }
      setActiveView(target);
    });
  });

  document.getElementById("start-use-btn").addEventListener("click", () => {
    analytics.track("home_cta_start_use_click", { source: "home_hero" });
    setActiveView("labs");
  });

  document.querySelectorAll("[data-open-community]").forEach((node) => {
    node.addEventListener("click", () => {
      analytics.track("community_entry_click", { source: node.id || node.textContent.trim() });
      setCommunityModal(true);
    });
  });

  document.querySelectorAll("[data-close-community]").forEach((node) => {
    node.addEventListener("click", () => {
      setCommunityModal(false);
    });
  });

  document.getElementById("lab-form").addEventListener("submit", (event) => {
    event.preventDefault();
    analytics.track("lab_form_submit", { source: "lab_form" });
    buildPlan(parseForm(event.currentTarget));
  });

  document.getElementById("meal-sections").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const mealKey = button.dataset.meal;
    const action = button.dataset.action;
    const recipe = getSelectedMeal(mealKey);
    analytics.track("recipe_click", {
      mealKey,
      action,
      recipeId: recipe?.id,
      recipeName: recipe?.title,
    });
    if (action === "swap") handleSwap(mealKey);
    if (action === "log") handleLog(mealKey);
  });

  document.getElementById("food-search").addEventListener("input", () => {
    if (!state.profile) return;
    analytics.track("food_search", { query: document.getElementById("food-search").value.trim() });
    renderFoodDatabase();
  });

  document.querySelectorAll('.qr-card, .modal-link').forEach((node) => {
    node.addEventListener("click", () => {
      analytics.track("community_qr_source_open", { source: node.className });
    });
  });

  document.querySelectorAll("[data-premium-feature]").forEach((node) => {
    node.addEventListener("click", () => {
      analytics.track("premium_feature_click", {
        feature: node.dataset.premiumFeature,
        location: node.dataset.premiumLocation || state.activeView,
        label: node.textContent.trim(),
      });
      showFeatureToast();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.communityModalOpen) {
      setCommunityModal(false);
    }
  });
}

function seedDemo() {
  const form = document.getElementById("lab-form");
  form.elements.sex.value = "female";
  form.elements.height.value = 160;
  form.elements.egfr.value = 28;
  form.elements.potassium.value = 4.9;
  form.elements.phosphorus.value = 1.2;
  form.elements.albumin.value = 38;
}

async function initApp() {
  seedDemo();
  bindEvents();
  analytics.bootstrap();
  setActiveView("home");
}

initApp();
