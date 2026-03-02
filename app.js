const foodDatabase = window.FOOD_DATABASE || [];
const foodExchangeReference = window.FOOD_EXCHANGE_REFERENCE || [];
const nutritionLabelGuidance = window.NUTRITION_LABEL_GUIDANCE || [];
const guidelineRecipes = window.GUIDELINE_RECIPES || {};
const guidelineDayPlans = window.GUIDELINE_DAY_PLANS || [];
const analytics = window.CKDAnalytics || {
  bootstrap() {},
  track() {},
  trackPageView() {},
};

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

Object.entries(guidelineRecipes).forEach(([mealKey, items]) => {
  if (!mealCatalog[mealKey] || !Array.isArray(items)) return;
  mealCatalog[mealKey].items.push(...items);
});

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
  dayPlanFilters: {
    region: "all",
    season: "all",
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
  return profile.height - 105;
}

function getProteinPlan(profile, stage, idealWeight) {
  if (stage <= 2) {
    const protein = +(idealWeight * 0.8).toFixed(1);
    return {
      protein,
      proteinMin: protein,
      proteinMax: protein,
      proteinDisplay: `${protein} g`,
      proteinLimit: protein,
      proteinUpperSafe: +(idealWeight * 1.3).toFixed(1),
    };
  }

  if (profile.diabetes) {
    const proteinMin = +(idealWeight * 0.6).toFixed(1);
    const proteinMax = +(idealWeight * 0.8).toFixed(1);
    const protein = +(((proteinMin + proteinMax) / 2).toFixed(1));
    return {
      protein,
      proteinMin,
      proteinMax,
      proteinDisplay: `${proteinMin}-${proteinMax} g`,
      proteinLimit: proteinMax,
      proteinUpperSafe: null,
    };
  }

  const protein = +(idealWeight * 0.6).toFixed(1);
  return {
    protein,
    proteinMin: protein,
    proteinMax: protein,
    proteinDisplay: `${protein} g`,
    proteinLimit: protein,
    proteinUpperSafe: null,
  };
}

function calculateTargets(profile) {
  const idealWeight = Math.max(35, Math.round(getIdealWeight(profile)));
  const stage = inferStage(profile.egfr);
  const proteinPlan = getProteinPlan(profile, stage, idealWeight);
  const energyMin = Math.round(idealWeight * 30);
  const energyMax = Math.round(idealWeight * 35);
  const energyRecommended = Math.round((energyMin + energyMax) / 2);
  const sodium = 2300;
  const potassiumRestricted = Boolean(profile.hyperkalemia);
  const phosphorusRestricted = Boolean(profile.hyperphosphatemia || stage >= 3);
  const potassiumMin = potassiumRestricted ? 2000 : null;
  const potassiumMax = potassiumRestricted ? 3000 : null;
  const phosphorusMin = phosphorusRestricted ? 800 : null;
  const phosphorusMax = phosphorusRestricted ? 1000 : null;
  const fluidRestricted = Boolean(profile.edema || profile.oliguria);
  const urineBasedFluid = profile.urineOutput != null ? Math.round(profile.urineOutput + 500) : null;
  const fluidMin = fluidRestricted ? urineBasedFluid : 1500;
  const fluidMax = fluidRestricted ? urineBasedFluid : 1700;
  const phosphorus = phosphorusRestricted ? 1000 : null;
  const potassium = potassiumRestricted ? 3000 : null;

  return {
    stage,
    idealWeight,
    energy: energyRecommended,
    energyMin,
    energyMax,
    protein: proteinPlan.protein,
    proteinMin: proteinPlan.proteinMin,
    proteinMax: proteinPlan.proteinMax,
    proteinDisplay: proteinPlan.proteinDisplay,
    proteinLimit: proteinPlan.proteinLimit,
    sodium,
    potassium,
    phosphorus,
    qualityProtein: +(proteinPlan.protein * 0.5).toFixed(1),
    proteinUpperSafe: proteinPlan.proteinUpperSafe,
    potassiumRestricted,
    potassiumMin,
    potassiumMax,
    phosphorusRestricted,
    phosphorusMin,
    phosphorusMax,
    fluidRestricted,
    urineBasedFluid,
    fluidMin,
    fluidMax,
  };
}

function pickInitialIndex(mealKey, profile) {
  return 0;
}

function getMealOptions(mealKey, profile) {
  return mealCatalog[mealKey].items.filter((item) => {
    if (profile.stage >= 3 && item.flags.includes("stage45")) return true;
    if (profile.hyperkalemia && item.flags.includes("lowK")) return true;
    if ((profile.hyperphosphatemia || profile.stage >= 3) && item.flags.includes("lowP")) return true;
    if ((profile.hypertension || profile.edema) && item.flags.includes("lowNa")) return true;
    return item.flags.includes("default");
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
    diabetes: data.get("diabetes") === "on",
    oliguria: data.get("oliguria") === "on",
    urineOutput: normalizeNumber(data.get("urineOutput")),
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
  const pageNameMap = {
    home: "home",
    labs: "lab_input",
    plan: "diet_plan",
    community: "community",
  };
  const pageName = pageNameMap[view];
  if (!pageName) return;
  analytics.trackPageView(pageName, { page_name: pageName });
}

function setCommunityModal(open) {
  state.communityModalOpen = open;
  const modal = document.getElementById("community-modal");
  modal.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
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
    ["热量", `${targets.energyMin}-${targets.energyMax} kcal`],
    ["蛋白质", targets.proteinDisplay],
    ["钠", `≤${targets.sodium} mg`],
    [
      "钾",
      targets.potassiumRestricted
        ? `${targets.potassiumMin}-${targets.potassiumMax} mg`
        : "通常不限制",
    ],
    [
      "磷",
      targets.phosphorusRestricted
        ? `≤${targets.phosphorusMax} mg`
        : "个体化",
    ],
    [
      "液体",
      targets.fluidRestricted
        ? targets.urineBasedFluid != null
          ? `约 ${targets.urineBasedFluid} mL`
          : "按尿量与水肿调整"
        : `${targets.fluidMin}-${targets.fluidMax} mL`,
    ],
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
    `理想体重按身高-105 估算，约 ${targets.idealWeight} kg。能量建议 ${targets.energyMin}-${targets.energyMax} kcal/天。`,
  ];
  if (targets.stage <= 2) {
    notes.push(`蛋白建议 ${targets.protein} g/天，并避免长期高蛋白饮食（>${targets.proteinUpperSafe} g/天）。`);
  } else if (state.profile.diabetes) {
    notes.push(`合并糖尿病时，蛋白建议 ${targets.proteinMin}-${targets.proteinMax} g/天，当前按中间值 ${targets.protein} g/天估算。`);
  } else {
    notes.push(`蛋白建议 ${targets.protein} g/天，其中优质蛋白不少于 ${targets.qualityProtein} g/天。`);
  }
  if (targets.potassiumRestricted) notes.push("当前血钾偏高，已按指南限制钾摄入并优先筛选低钾方案。");
  if (targets.phosphorusRestricted) notes.push("当前阶段或化验提示需控制磷摄入，已优先筛选低磷食谱与食材。");
  if (!targets.potassiumRestricted && targets.stage <= 2) notes.push("当前阶段通常无需常规限钾，可结合化验结果动态调整。");
  if (!state.profile.hyperphosphatemia && targets.stage <= 2) notes.push("当前阶段磷摄入以个体化管理为主，无需默认严格限磷。");
  if (state.profile.oliguria || state.profile.edema) {
    if (targets.urineBasedFluid != null) {
      notes.push(`结合少尿/水肿情况，饮水量暂按前一日尿量+500 mL 估算，约 ${targets.urineBasedFluid} mL/天。`);
    } else {
      notes.push("存在少尿或水肿时，饮水量需结合前一日尿量和临床建议个体化调整。");
    }
  }
  if (state.profile.hypertension) notes.push("钠摄入以不超过 2300 mg/天为基础，并应结合血压控制情况进一步管理。");

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
              ${recipe.sourceNote ? `<div class="meal-source-note">${recipe.sourceNote}</div>` : ""}
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

function getStageGroup() {
  return state.targets && state.targets.stage <= 2 ? "1-2" : "3-5";
}

function getDayPlanFilters() {
  const stageGroup = getStageGroup();
  return guidelineDayPlans.filter((plan) => {
    if (plan.stageGroup !== stageGroup) return false;
    if (state.dayPlanFilters.region !== "all" && plan.region !== state.dayPlanFilters.region) return false;
    if (state.dayPlanFilters.season !== "all" && plan.season !== state.dayPlanFilters.season) return false;
    return true;
  });
}

function hydrateDayPlanOptions() {
  const regionSelect = document.getElementById("day-plan-region");
  const seasonSelect = document.getElementById("day-plan-season");
  if (!regionSelect || !seasonSelect) return;

  const stageGroup = getStageGroup();
  const stagePlans = guidelineDayPlans.filter((plan) => plan.stageGroup === stageGroup);
  const regions = [...new Set(stagePlans.map((plan) => plan.region))];
  const seasons = [...new Set(stagePlans.map((plan) => plan.season))];

  regionSelect.innerHTML = `<option value="all">全部地区</option>${regions
    .map((region) => `<option value="${region}">${region}</option>`)
    .join("")}`;
  seasonSelect.innerHTML = `<option value="all">全部季节</option>${seasons
    .map((season) => `<option value="${season}">${season}</option>`)
    .join("")}`;

  regionSelect.value = regions.includes(state.dayPlanFilters.region) ? state.dayPlanFilters.region : "all";
  seasonSelect.value = seasons.includes(state.dayPlanFilters.season) ? state.dayPlanFilters.season : "all";
  state.dayPlanFilters.region = regionSelect.value;
  state.dayPlanFilters.season = seasonSelect.value;
}

function renderDayPlans() {
  hydrateDayPlanOptions();
  const plans = getDayPlanFilters();
  const stageGroup = getStageGroup();
  const summary = document.getElementById("day-plan-summary");
  const results = document.getElementById("day-plan-results");
  if (!summary || !results) return;

  summary.textContent = `当前按 CKD ${stageGroup} 期口径筛选，找到 ${plans.length} 组地区 / 季节整天方案。`;
  if (plans.length === 0) {
    results.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" aria-hidden="true"></div>
        <strong>暂无匹配的整天方案</strong>
        <p>可以切换地区或季节查看其他指南示例，或先使用下方单餐推荐完成当天安排。</p>
      </div>
    `;
    return;
  }

  results.innerHTML = plans
    .map(
      (plan) => `
        <article class="day-plan-item">
          <div class="day-plan-item-head">
            <div>
              <strong>${plan.title}</strong>
              <p>${plan.sourceNote}</p>
            </div>
            <div class="day-plan-badges">
              <span class="tag">${plan.region}</span>
              <span class="tag">${plan.season}</span>
              <span class="tag">CKD ${plan.stageGroup} 期</span>
            </div>
          </div>
          <div class="day-plan-meals">
            <div><span>早餐</span><strong>${plan.meals.breakfast}</strong></div>
            <div><span>上午加餐</span><strong>${plan.meals.snack1}</strong></div>
            <div><span>午餐</span><strong>${plan.meals.lunch}</strong></div>
            <div><span>下午加餐</span><strong>${plan.meals.snack2}</strong></div>
            <div><span>晚餐</span><strong>${plan.meals.dinner}</strong></div>
          </div>
          <div class="day-plan-highlights">
            ${plan.highlights.map((item) => `<span class="tag">${item}</span>`).join("")}
          </div>
          <div class="day-plan-totals">
            <span>能量 ${plan.totals.energy} kcal</span>
            <span>蛋白 ${plan.totals.protein} g</span>
            <span>钠 ${plan.totals.sodium} mg</span>
            <span>钾 ${plan.totals.potassium} mg</span>
            <span>磷 ${plan.totals.phosphorus} mg</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function clampRatio(current, target) {
  if (target <= 0) return 0;
  return Math.min(current / target, 1);
}

function renderIntake() {
  const targets = state.targets;
  const metrics = [
    ["总热量", "energy", targets.energyMax, "kcal"],
    ["总蛋白质", "protein", targets.proteinLimit, "g"],
    ["总钠", "sodium", targets.sodium, "mg"],
    ["总钾", "potassium", targets.potassium, "mg"],
    ["总磷", "phosphorus", targets.phosphorus, "mg"],
  ];

  document.getElementById("intake-stats").innerHTML = metrics
    .map(([label, key, target, unit]) => {
      const current = +state.intake[key].toFixed(1);
      const unrestricted = target == null;
      if (unrestricted) {
        return `
          <div class="progress-row">
            <div class="progress-label">
              <span>${label}</span>
              <span>${current} ${unit} / 个体化管理</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" style="width: 0%"></div>
            </div>
          </div>
        `;
      }
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
  if (state.intake.protein > targets.proteinLimit) warnings.push("总蛋白质");
  if (state.intake.sodium > targets.sodium) warnings.push("总钠");
  if (targets.potassium != null && state.intake.potassium > targets.potassium) warnings.push("总钾");
  if (targets.phosphorus != null && state.intake.phosphorus > targets.phosphorus) warnings.push("总磷");

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
  if (profile.hyperphosphatemia || profile.stage >= 3) score += item.phosphorus * 1.2;
  if (profile.hypertension || profile.edema) score += item.sodium;
  if (profile.stage >= 3) score += item.protein * 6;
  return score;
}

function filterFoods(query) {
  const normalized = query.trim().toLowerCase();
  let items = foodDatabase.filter((item) => {
    if (!normalized) return true;
    return item.name.toLowerCase().includes(normalized) || item.category.toLowerCase().includes(normalized);
  });

  if (state.targets?.potassiumRestricted) {
    items = items.filter((item) => !item.tags.includes("highK") && !item.tags.includes("veryHighK"));
  }
  if (state.targets?.phosphorusRestricted) {
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

function renderFoodKnowledge() {
  const labelContainer = document.getElementById("label-guide-cards");
  const exchangeContainer = document.getElementById("exchange-reference-cards");
  if (!labelContainer || !exchangeContainer) return;

  labelContainer.innerHTML = nutritionLabelGuidance
    .map(
      (section) => `
        <article class="knowledge-card">
          <div class="knowledge-card-head">
            <strong>${section.title}</strong>
            <span>指南第 ${section.sourcePage} 页</span>
          </div>
          <ul class="knowledge-list">
            ${section.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");

  exchangeContainer.innerHTML = foodExchangeReference
    .map(
      (section) => `
        <article class="exchange-card">
          <div class="exchange-card-head">
            <strong>${section.title}</strong>
            <span>指南第 ${section.sourcePage} 页</span>
          </div>
          <p>${section.summary}</p>
          <ul class="exchange-list">
            ${section.rows.map((row) => `<li>${row}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function flattenExchangeEntries() {
  return foodExchangeReference.flatMap((section) =>
    section.rows.map((row, index) => ({
      id: `${section.sourcePage}-${index}`,
      title: section.title,
      summary: section.summary,
      row,
      sourcePage: section.sourcePage,
    })),
  );
}

function flattenGuidelineRecipeEntries() {
  return Object.entries(guidelineRecipes).flatMap(([mealKey, items]) =>
    items.map((item) => ({
      ...item,
      mealKey,
    })),
  );
}

function matchesQuery(parts, query) {
  if (!query) return true;
  return parts.join(" ").toLowerCase().includes(query);
}

function renderExchangeSearch(query) {
  const entries = flattenExchangeEntries()
    .filter((entry) => matchesQuery([entry.title, entry.summary, entry.row], query))
    .slice(0, 18);
  const container = document.getElementById("exchange-search-results");
  if (!container) return;
  if (entries.length === 0) {
    container.innerHTML = `
      <div class="guide-empty">
        <strong>未找到匹配的交换份条目</strong>
        <p>可以尝试输入“面制品”“水果”“调味料”这类关键词。</p>
      </div>
    `;
    return;
  }

  container.innerHTML = entries
    .map(
      (entry) => `
        <article class="guide-card">
          <div class="guide-card-head">
            <strong>${entry.title}</strong>
            <span>指南第 ${entry.sourcePage} 页</span>
          </div>
          <p>${entry.row}</p>
          <small>${entry.summary}</small>
        </article>
      `,
    )
    .join("");
}

function renderRecipeSearch(query) {
  const entries = flattenGuidelineRecipeEntries()
    .filter((entry) =>
      matchesQuery(
        [
          entry.title,
          entry.subtitle,
          entry.mealKey,
          entry.ingredients.join(" "),
          entry.sourceNote || "",
        ],
        query,
      ),
    )
    .slice(0, 16);
  const container = document.getElementById("recipe-search-results");
  if (!container) return;
  if (entries.length === 0) {
    container.innerHTML = `
      <div class="guide-empty">
        <strong>未找到匹配的指南食谱</strong>
        <p>可以尝试输入“早餐”“龙井虾仁”“华南”等关键词。</p>
      </div>
    `;
    return;
  }

  container.innerHTML = entries
    .map(
      (entry) => `
        <article class="guide-card">
          <div class="guide-card-head">
            <strong>${entry.title}</strong>
            <span>${mealCatalog[entry.mealKey]?.label || entry.mealKey}</span>
          </div>
          <p>${entry.subtitle}</p>
          <small>食材：${entry.ingredients.join(" · ")}</small>
          <div class="guide-meta-row">
            <span>${entry.nutrients.energy} kcal</span>
            <span>蛋白 ${entry.nutrients.protein}g</span>
            <span>钠 ${entry.nutrients.sodium}mg</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderDayPlanSearch(query) {
  const entries = guidelineDayPlans
    .filter((entry) =>
      matchesQuery(
        [
          entry.title,
          entry.region,
          entry.season,
          entry.stageGroup,
          entry.meals.breakfast,
          entry.meals.lunch,
          entry.meals.dinner,
          entry.sourceNote,
        ],
        query,
      ),
    )
    .slice(0, 12);
  const container = document.getElementById("dayplan-search-results");
  if (!container) return;
  if (entries.length === 0) {
    container.innerHTML = `
      <div class="guide-empty">
        <strong>未找到匹配的整天方案</strong>
        <p>可以尝试输入“夏季”“东北”“3-5”等关键词。</p>
      </div>
    `;
    return;
  }

  container.innerHTML = entries
    .map(
      (entry) => `
        <article class="guide-card">
          <div class="guide-card-head">
            <strong>${entry.title}</strong>
            <span>${entry.season} · CKD ${entry.stageGroup} 期</span>
          </div>
          <p>${entry.region} · ${entry.sourceNote}</p>
          <small>早餐：${entry.meals.breakfast}</small>
          <small>午餐：${entry.meals.lunch}</small>
          <small>晚餐：${entry.meals.dinner}</small>
          <div class="guide-meta-row">
            <span>${entry.totals.energy} kcal</span>
            <span>蛋白 ${entry.totals.protein}g</span>
            <span>钠 ${entry.totals.sodium}mg</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderFoodDatabase() {
  const searchField = document.getElementById("food-search");
  const foodSummary = document.getElementById("food-summary");
  const foodResults = document.getElementById("food-results");
  if (!searchField || !foodSummary || !foodResults) return;
  const query = document.getElementById("food-search").value.trim().toLowerCase();
  const items = filterFoods(query).slice(0, 72);
  const grouped = groupFoods(items);
  const groups = Object.entries(grouped);

  renderFoodKnowledge();
  foodSummary.textContent =
    `当前数据库已覆盖食材、交换份、指南单餐食谱和整天方案。食材结果 ${items.length} 条，交换份 ${flattenExchangeEntries().length} 条，单餐食谱 ${flattenGuidelineRecipeEntries().length} 条，整天方案 ${guidelineDayPlans.length} 条。`;
  renderExchangeSearch(query);
  renderRecipeSearch(query);
  renderDayPlanSearch(query);
  if (groups.length === 0) {
    foodResults.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" aria-hidden="true"></div>
        <strong>未找到匹配食材</strong>
        <p>可以换一个关键词，或先清空搜索词后再查看当前风险条件下的推荐食材。</p>
      </div>
    `;
    return;
  }

  foodResults.innerHTML = groups
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
  state.dayPlanFilters = { region: "all", season: "all" };
  mealKeyOrder.forEach((mealKey) => {
    state.mealSelections[mealKey] = pickInitialIndex(mealKey, profile);
  });
  resetIntake();
  renderPlanView();
  const planTotals = getCurrentPlanTotals();
  analytics.track("state_plan_generated", {
    page_name: "diet_plan",
    ckd_stage: state.targets.stage,
    stage_group: state.targets.stage <= 2 ? "1_2" : "3_5",
    has_hyperkalemia: profile.hyperkalemia,
    has_hyperphosphatemia: profile.hyperphosphatemia,
    has_hypertension: profile.hypertension,
    has_edema: profile.edema,
    has_diabetes: profile.diabetes,
    has_oliguria: profile.oliguria,
    urine_output: profile.urineOutput,
    protein_target: state.targets.proteinLimit,
    plan_protein: planTotals.protein,
    plan_energy: planTotals.energy,
  });
  setActiveView("plan");
}

function handleSwap(mealKey) {
  const options = getMealOptions(mealKey, state.profile);
  if (options.length <= 1) return;
  const previousRecipe = getSelectedMeal(mealKey);
  state.mealSelections[mealKey] = (state.mealSelections[mealKey] + 1) % options.length;
  const nextRecipe = getSelectedMeal(mealKey);
  analytics.track("click_replace_meal", {
    page_name: "diet_plan",
    meal_type: mealKey,
    recipe_name: nextRecipe?.title,
    previous_recipe_name: previousRecipe?.title,
  });
  renderMeals();
}

function handleLog(mealKey) {
  const recipe = getSelectedMeal(mealKey);
  Object.keys(state.intake).forEach((key) => {
    state.intake[key] += recipe.nutrients[key];
  });
  analytics.track("click_record_intake", {
    page_name: "diet_plan",
    meal_type: mealKey,
    recipe_name: recipe.title,
    recipe_energy: recipe.nutrients.energy,
    recipe_protein: recipe.nutrients.protein,
  });
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
    analytics.track("click_start_use", {
      page_name: "home",
      entry_location: "home_hero",
    });
    setActiveView("labs");
  });

  document.querySelectorAll("[data-open-community]").forEach((node) => {
    node.addEventListener("click", () => {
      analytics.track("click_join_community", {
        page_name:
          {
            home: "home",
            labs: "lab_input",
            plan: "diet_plan",
            community: "community",
          }[state.activeView] || state.activeView,
        entry_location: node.id || node.textContent.trim(),
      });
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
    const profile = parseForm(event.currentTarget);
    analytics.track("submit_lab_input", {
      page_name: "lab_input",
      module_name: "lab_form",
      ckd_stage: profile.stage,
      stage_group: profile.stage <= 2 ? "1_2" : "3_5",
      has_hyperkalemia: profile.hyperkalemia,
      has_hyperphosphatemia: profile.hyperphosphatemia,
      has_hypertension: profile.hypertension,
      has_edema: profile.edema,
      has_diabetes: profile.diabetes,
      has_oliguria: profile.oliguria,
      urine_output: profile.urineOutput,
    });
    buildPlan(profile);
  });

  document.getElementById("meal-sections").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const mealKey = button.dataset.meal;
    const action = button.dataset.action;
    if (action === "swap") handleSwap(mealKey);
    if (action === "log") handleLog(mealKey);
  });

  const foodSearch = document.getElementById("food-search");
  if (foodSearch) {
    foodSearch.addEventListener("input", () => {
      if (!state.profile) return;
      renderFoodDatabase();
    });
  }

  const dayPlanRegion = document.getElementById("day-plan-region");
  const dayPlanSeason = document.getElementById("day-plan-season");
  if (dayPlanRegion) {
    dayPlanRegion.addEventListener("change", (event) => {
      state.dayPlanFilters.region = event.currentTarget.value;
      renderDayPlans();
    });
  }
  if (dayPlanSeason) {
    dayPlanSeason.addEventListener("change", (event) => {
      state.dayPlanFilters.season = event.currentTarget.value;
      renderDayPlans();
    });
  }

  document.querySelectorAll(".qr-card, .modal-link").forEach((node) => {
    node.addEventListener("click", () => {
      analytics.track("click_open_qr", {
        page_name: "community",
        entry_location: node.className,
      });
    });
  });

  document.querySelectorAll("[data-premium-feature]").forEach((node) => {
    node.addEventListener("click", () => {
      analytics.track("click_unlock_pro", {
        page_name:
          {
            home: "home",
            labs: "lab_input",
            plan: "diet_plan",
            community: "community",
          }[state.activeView] || state.activeView,
        feature_name: node.dataset.premiumFeature,
        entry_location: node.dataset.premiumLocation || state.activeView,
        button_label: node.textContent.trim(),
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
  form.elements.urineOutput.value = 1200;
}

async function initApp() {
  seedDemo();
  bindEvents();
  analytics.bootstrap();
  setActiveView("home");
}

initApp();
