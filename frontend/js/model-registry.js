(function () {
  const STORAGE_KEYS = {
    suppliers: "model_demo_suppliers_v1",
    models: "model_demo_models_v1"
  };

  const THINKING_MODES = ["disabled", "enabled", "auto"];
  const JSON_MODES = ["none", "json_object"];
  const REASONING_EFFORTS = ["minimal", "low", "medium", "high"];

  const DEFAULT_SUPPLIERS = [
    {
      supplierCode: "volc",
      supplierName: "火山方舟",
      status: "active",
      description: "适合接入豆包 / Responses 风格模型。",
      sortOrder: 10
    },
    {
      supplierCode: "aliyun",
      supplierName: "阿里云百炼",
      status: "active",
      description: "适合接入通义千问兼容 Responses 的模型。",
      sortOrder: 20
    },
    {
      supplierCode: "deepseek",
      supplierName: "DeepSeek",
      status: "active",
      description: "适合接入 DeepSeek 系列模型。",
      sortOrder: 30
    },
    {
      supplierCode: "openai",
      supplierName: "OpenAI",
      status: "active",
      description: "适合接入 OpenAI 模型。",
      sortOrder: 40
    }
  ];

  const DEFAULT_MODELS = [
    {
      modelKey: "volc-doubao-seed-2-0-pro",
      supplierCode: "volc",
      displayName: "Doubao Seed 2.0 Pro",
      providerModelId: "doubao-seed-2-0-pro-250415",
      status: "active",
      supportsThinking: true,
      supportsTextInput: true,
      supportsImageInput: true,
      supportsJson: true,
      supportsStreaming: true,
      reasoningEfforts: ["low", "medium", "high"],
      pricing: {
        mode: "tiered",
        flat: { input: "", output: "" },
        tiered: {
          threshold: "32000",
          tier1: { input: "0.0032", output: "0.0160" },
          tier2: { input: "0.0048", output: "0.0240" }
        }
      },
      defaultConfig: {
        thinkingMode: "auto",
        reasoningEffort: "medium",
        streamEnabled: false,
        jsonMode: "none",
        temperature: "0.2",
        maxTokens: "131072",
        timeout: "300",
        extraBody: ""
      },
      pricingHint: "阶梯模式",
      linkedNodes: 3
    },
    {
      modelKey: "volc-doubao-seed-1-6-flash",
      supplierCode: "volc",
      displayName: "Doubao Seed 1.6 Flash",
      providerModelId: "doubao-seed-1-6-flash-250228",
      status: "active",
      supportsThinking: false,
      supportsTextInput: true,
      supportsImageInput: false,
      supportsJson: true,
      supportsStreaming: true,
      reasoningEfforts: [],
      pricing: {
        mode: "flat",
        flat: { input: "0.0008", output: "0.0024" },
        tiered: {
          threshold: "",
          tier1: { input: "", output: "" },
          tier2: { input: "", output: "" }
        }
      },
      defaultConfig: {
        thinkingMode: "disabled",
        reasoningEffort: "",
        streamEnabled: true,
        jsonMode: "none",
        temperature: "0.3",
        maxTokens: "64000",
        timeout: "180",
        extraBody: ""
      },
      pricingHint: "统一模式",
      linkedNodes: 2
    },
    {
      modelKey: "aliyun-qwen-3-5-plus",
      supplierCode: "aliyun",
      displayName: "Qwen 3.5 Plus",
      providerModelId: "qwen3.5-plus",
      status: "active",
      supportsThinking: true,
      supportsTextInput: true,
      supportsImageInput: false,
      supportsJson: true,
      supportsStreaming: true,
      reasoningEfforts: ["minimal", "low", "medium", "high"],
      pricing: {
        mode: "flat",
        flat: { input: "", output: "" },
        tiered: {
          threshold: "",
          tier1: { input: "", output: "" },
          tier2: { input: "", output: "" }
        }
      },
      defaultConfig: {
        thinkingMode: "enabled",
        reasoningEffort: "medium",
        streamEnabled: false,
        jsonMode: "none",
        temperature: "0.3",
        maxTokens: "32000",
        timeout: "300",
        extraBody: ""
      },
      pricingHint: "",
      linkedNodes: 0
    },
    {
      modelKey: "aliyun-qwen-3-5-flash",
      supplierCode: "aliyun",
      displayName: "Qwen 3.5 Flash",
      providerModelId: "qwen3.5-flash",
      status: "active",
      supportsThinking: false,
      supportsTextInput: true,
      supportsImageInput: false,
      supportsJson: true,
      supportsStreaming: true,
      reasoningEfforts: [],
      pricing: {
        mode: "flat",
        flat: { input: "", output: "" },
        tiered: {
          threshold: "",
          tier1: { input: "", output: "" },
          tier2: { input: "", output: "" }
        }
      },
      defaultConfig: {
        thinkingMode: "disabled",
        reasoningEffort: "",
        streamEnabled: true,
        jsonMode: "none",
        temperature: "0.5",
        maxTokens: "16000",
        timeout: "180",
        extraBody: ""
      },
      pricingHint: "",
      linkedNodes: 5
    },
    {
      modelKey: "deepseek-v3-2",
      supplierCode: "deepseek",
      displayName: "DeepSeek V3.2",
      providerModelId: "deepseek-v3.2",
      status: "active",
      supportsThinking: true,
      supportsTextInput: true,
      supportsImageInput: false,
      supportsJson: false,
      supportsStreaming: true,
      reasoningEfforts: ["low", "medium", "high"],
      pricing: {
        mode: "flat",
        flat: { input: "", output: "" },
        tiered: {
          threshold: "",
          tier1: { input: "", output: "" },
          tier2: { input: "", output: "" }
        }
      },
      defaultConfig: {
        thinkingMode: "enabled",
        reasoningEffort: "medium",
        streamEnabled: false,
        jsonMode: "none",
        temperature: "0.3",
        maxTokens: "32000",
        timeout: "300",
        extraBody: ""
      },
      pricingHint: ""
    },
    {
      modelKey: "openai-gpt-4o-mini",
      supplierCode: "openai",
      displayName: "GPT-4o mini",
      providerModelId: "gpt-4o-mini",
      status: "active",
      supportsThinking: false,
      supportsTextInput: true,
      supportsImageInput: true,
      supportsJson: true,
      supportsStreaming: true,
      reasoningEfforts: [],
      pricing: {
        mode: "flat",
        flat: { input: "", output: "" },
        tiered: {
          threshold: "",
          tier1: { input: "", output: "" },
          tier2: { input: "", output: "" }
        }
      },
      defaultConfig: {
        thinkingMode: "disabled",
        reasoningEffort: "",
        streamEnabled: true,
        jsonMode: "none",
        temperature: "0.3",
        maxTokens: "16000",
        timeout: "180",
        extraBody: ""
      },
      pricingHint: "",
      linkedNodes: 1
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadJSON(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "");
      return Array.isArray(parsed) || typeof parsed === "object" ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeSupplier(raw, index) {
    return {
      supplierCode: String(raw?.supplierCode || raw?.code || `supplier-${index + 1}`).trim(),
      supplierName: String(raw?.supplierName || raw?.name || `供应商-${index + 1}`).trim(),
      status: raw?.status === "disabled" ? "disabled" : "active",
      description: String(raw?.description || "").trim(),
      sortOrder: Number.isFinite(Number(raw?.sortOrder)) ? Number(raw.sortOrder) : (index + 1) * 10
    };
  }

  function normalizeThinkingMode(value) {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "on" || normalized === "enabled") return "enabled";
    if (normalized === "auto") return "auto";
    return "disabled";
  }

  function normalizeJsonMode(value) {
    return String(value || "").toLowerCase() === "json_object" ? "json_object" : "none";
  }

  function normalizeReasoningEffort(value) {
    const normalized = String(value || "").toLowerCase();
    return REASONING_EFFORTS.includes(normalized) ? normalized : "";
  }

  function sanitizeEnumList(list, allowed) {
    const result = Array.isArray(list) ? list.map((item) => String(item || "").toLowerCase()) : [];
    const filtered = result.filter((item) => allowed.includes(item));
    return filtered.length ? [...new Set(filtered)] : [];
  }

  function normalizeDefaultConfig(rawConfig, rawModel) {
    const defaults = rawConfig && typeof rawConfig === "object" ? rawConfig : {};
    return {
      thinkingMode: normalizeThinkingMode(defaults.thinkingMode || defaults.deepMode || rawModel?.deepMode),
      reasoningEffort: normalizeReasoningEffort(defaults.reasoningEffort || rawModel?.reasoningEffort),
      streamEnabled: Boolean(defaults.streamEnabled ?? rawModel?.streamEnabled ?? false),
      jsonMode: normalizeJsonMode(defaults.jsonMode || rawModel?.jsonMode || rawModel?.supportsJson && "json_object"),
      temperature: String(defaults.temperature ?? rawModel?.temp ?? rawModel?.temperature ?? "0.3"),
      seed: String(defaults.seed ?? rawModel?.seed ?? ""),
      maxTokens: String(defaults.maxTokens ?? rawModel?.maxTokens ?? "32000"),
      timeout: String(defaults.timeout ?? rawModel?.timeout ?? "300"),
      extraBody: String(defaults.extraBody ?? rawModel?.extraBody ?? "")
    };
  }

  function normalizePricing(rawPricing, rawModel) {
    const pricing = rawPricing && typeof rawPricing === "object" ? rawPricing : {};
    const legacyMode = String(rawModel?.pricingMode || pricing.mode || "flat").toLowerCase();
    const mode = legacyMode === "tiered" ? "tiered" : "flat";
    const flat = pricing.flat && typeof pricing.flat === "object" ? pricing.flat : {};
    const tiered = pricing.tiered && typeof pricing.tiered === "object" ? pricing.tiered : {};
    const tier1 = tiered.tier1 && typeof tiered.tier1 === "object" ? tiered.tier1 : {};
    const tier2 = tiered.tier2 && typeof tiered.tier2 === "object" ? tiered.tier2 : {};
    return {
      mode,
      flat: {
        input: String(flat.input ?? rawModel?.flatInputPrice ?? ""),
        output: String(flat.output ?? rawModel?.flatOutputPrice ?? "")
      },
      tiered: {
        threshold: String(tiered.threshold ?? rawModel?.tieredThreshold ?? ""),
        tier1: {
          input: String(tier1.input ?? rawModel?.tier1InputPrice ?? ""),
          output: String(tier1.output ?? rawModel?.tier1OutputPrice ?? "")
        },
        tier2: {
          input: String(tier2.input ?? rawModel?.tier2InputPrice ?? ""),
          output: String(tier2.output ?? rawModel?.tier2OutputPrice ?? "")
        }
      }
    };
  }

  function normalizeModel(raw, index) {
    const supportsThinking = Boolean(raw?.supportsThinking || raw?.reasoningEfforts?.length);
    const supportsJson = Boolean(raw?.supportsJson || raw?.jsonModes?.includes?.("json_object"));
    const jsonModes = sanitizeEnumList(raw?.jsonModes || (supportsJson ? ["none", "json_object"] : ["none"]), JSON_MODES);
    const reasoningEfforts = supportsThinking
      ? sanitizeEnumList(raw?.reasoningEfforts || ["low", "medium", "high"], REASONING_EFFORTS)
      : [];
    const defaultConfig = normalizeDefaultConfig(raw?.defaultConfig, raw);
    const pricing = normalizePricing(raw?.pricing, raw);
    const normalized = {
      modelKey: String(raw?.modelKey || raw?.id || `model-${index + 1}`).trim(),
      supplierCode: String(raw?.supplierCode || raw?.provider || "unknown").trim(),
      displayName: String(raw?.displayName || raw?.name || `模型-${index + 1}`).trim(),
      providerModelId: String(raw?.providerModelId || raw?.modelId || raw?.id || `model-${index + 1}`).trim(),
      status: raw?.status === "disabled" ? "disabled" : "active",
      supportsThinking,
      supportsTextInput: Boolean(raw?.supportsTextInput ?? raw?.supportsText ?? true),
      supportsImageInput: Boolean(raw?.supportsImageInput || raw?.supportsImage),

      supportsJson,
      supportsStreaming: raw?.supportsStreaming !== false,
      jsonModes: jsonModes.length ? jsonModes : ["none"],
      reasoningEfforts,
      pricing,
      defaultConfig,
      pricingHint: String(raw?.pricingHint || "").trim(),
      description: String(raw?.description || "").trim()
    };

    if (!normalized.supportsThinking) {
      normalized.defaultConfig.thinkingMode = "disabled";
      normalized.defaultConfig.reasoningEffort = "";
    } else if (!normalized.reasoningEfforts.includes(normalized.defaultConfig.reasoningEffort)) {
      normalized.defaultConfig.reasoningEffort = normalized.reasoningEfforts[0] || "medium";
    }

    if (!normalized.jsonModes.includes(normalized.defaultConfig.jsonMode)) {
      normalized.defaultConfig.jsonMode = normalized.jsonModes.includes("json_object") ? "json_object" : "none";
    }

    return normalized;
  }

  function ensureSeedData() {
    const currentSuppliers = loadJSON(STORAGE_KEYS.suppliers, []);
    if (!Array.isArray(currentSuppliers) || !currentSuppliers.length) {
      saveJSON(STORAGE_KEYS.suppliers, DEFAULT_SUPPLIERS.map(normalizeSupplier));
    } else {
      saveJSON(STORAGE_KEYS.suppliers, currentSuppliers.map(normalizeSupplier));
    }

    const currentModels = loadJSON(STORAGE_KEYS.models, []);
    if (!Array.isArray(currentModels) || !currentModels.length) {
      saveJSON(STORAGE_KEYS.models, DEFAULT_MODELS.map(normalizeModel));
    } else {
      saveJSON(STORAGE_KEYS.models, currentModels.map(normalizeModel));
    }
  }

  function getSuppliers(options = {}) {
    ensureSeedData();
    const includeDisabled = Boolean(options.includeDisabled);
    return loadJSON(STORAGE_KEYS.suppliers, [])
      .map(normalizeSupplier)
      .filter((item) => includeDisabled || item.status === "active")
      .sort((a, b) => a.sortOrder - b.sortOrder || a.supplierName.localeCompare(b.supplierName, "zh-CN"));
  }

  function getSupplierByCode(code) {
    return getSuppliers({ includeDisabled: true }).find((item) => item.supplierCode === code) || null;
  }

  function saveSuppliers(nextSuppliers) {
    saveJSON(STORAGE_KEYS.suppliers, nextSuppliers.map(normalizeSupplier));
  }

  function getModels(options = {}) {
    ensureSeedData();
    const includeDisabled = Boolean(options.includeDisabled);
    const supplierStatus = new Map(
      getSuppliers({ includeDisabled: true }).map((item) => [item.supplierCode, item.status])
    );
    return loadJSON(STORAGE_KEYS.models, [])
      .map(normalizeModel)
      .filter((item) => {
        if (includeDisabled) return true;
        return item.status === "active" && supplierStatus.get(item.supplierCode) !== "disabled";
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName, "zh-CN"));
  }

  function saveModels(nextModels) {
    saveJSON(STORAGE_KEYS.models, nextModels.map(normalizeModel));
  }

  function getModelByKey(modelKey) {
    return getModels({ includeDisabled: true }).find((item) => item.modelKey === modelKey) || null;
  }

  function getModelByProviderId(providerModelId) {
    return (
      getModels({ includeDisabled: true }).find((item) => item.providerModelId === providerModelId) || null
    );
  }

  function getModelsBySupplier(supplierCode, options = {}) {
    return getModels(options).filter((item) => item.supplierCode === supplierCode);
  }

  function toUiThinkingMode(mode) {
    const normalized = normalizeThinkingMode(mode);
    if (normalized === "enabled") return "on";
    if (normalized === "auto") return "auto";
    return "off";
  }

  function fromUiThinkingMode(mode) {
    return normalizeThinkingMode(mode);
  }

  function getDefaultModel() {
    return getModels()[0] || getModels({ includeDisabled: true })[0] || null;
  }

  function buildModelConfig(source = {}) {
    const rawConfig = source?.modelConfig && typeof source.modelConfig === "object" ? source.modelConfig : source;
    const candidateKey =
      rawConfig.modelKey || rawConfig.model || rawConfig.providerModelIdSnapshot || rawConfig.providerModelId || "";
    let model = getModelByKey(candidateKey) || getModelByProviderId(candidateKey);
    if (!model && rawConfig.supplierCode) {
      model = getModelsBySupplier(rawConfig.supplierCode)[0] || null;
    }
    if (!model) {
      model = getDefaultModel();
    }
    const seededDefaults = clone(model?.defaultConfig || normalizeDefaultConfig({}, {}));
    const config = {
      supplierCode: model?.supplierCode || String(rawConfig.supplierCode || ""),
      modelKey: model?.modelKey || String(rawConfig.modelKey || rawConfig.model || ""),
      providerModelIdSnapshot:
        model?.providerModelId ||
        String(rawConfig.providerModelIdSnapshot || rawConfig.providerModelId || rawConfig.model || ""),
      thinkingMode: normalizeThinkingMode(
        rawConfig.thinkingMode || rawConfig.deepMode || rawConfig.deepthink || seededDefaults.thinkingMode
      ),
      reasoningEffort: normalizeReasoningEffort(rawConfig.reasoningEffort || seededDefaults.reasoningEffort),
      streamEnabled: Boolean(rawConfig.streamEnabled ?? rawConfig.stream ?? seededDefaults.streamEnabled),
      jsonMode: normalizeJsonMode(rawConfig.jsonMode || rawConfig.jsonOutput || seededDefaults.jsonMode),
      temperature: String(rawConfig.temperature ?? rawConfig.temp ?? seededDefaults.temperature),
      seed: String(rawConfig.seed ?? seededDefaults.seed ?? ""),
      maxTokens: String(rawConfig.maxTokens ?? seededDefaults.maxTokens),
      timeout: String(rawConfig.timeout ?? seededDefaults.timeout),
      extraBody: String(rawConfig.extraBody ?? seededDefaults.extraBody ?? "")
    };
    return coerceModelConfig(model, config).config;
  }

  function coerceModelConfig(model, rawConfig = {}) {
    const targetModel = model || getModelByKey(rawConfig.modelKey) || getDefaultModel();
    const config = {
      supplierCode: targetModel?.supplierCode || "",
      modelKey: targetModel?.modelKey || "",
      providerModelIdSnapshot: targetModel?.providerModelId || "",
      thinkingMode: normalizeThinkingMode(rawConfig.thinkingMode),
      reasoningEffort: normalizeReasoningEffort(rawConfig.reasoningEffort),
      streamEnabled: Boolean(rawConfig.streamEnabled),
      jsonMode: normalizeJsonMode(rawConfig.jsonMode),
      temperature: String(rawConfig.temperature ?? targetModel?.defaultConfig?.temperature ?? "0.3"),
      seed: String(rawConfig.seed ?? targetModel?.defaultConfig?.seed ?? ""),
      maxTokens: String(rawConfig.maxTokens ?? targetModel?.defaultConfig?.maxTokens ?? "32000"),
      timeout: String(rawConfig.timeout ?? targetModel?.defaultConfig?.timeout ?? "300"),
      extraBody: String(rawConfig.extraBody ?? targetModel?.defaultConfig?.extraBody ?? "")
    };
    const warnings = [];

    if (!targetModel?.supportsThinking) {
      if (config.thinkingMode !== "disabled" || config.reasoningEffort) {
        warnings.push("当前模型不支持深度思考，已自动关闭。");
      }
      config.thinkingMode = "disabled";
      config.reasoningEffort = "";
    } else {
      if (!THINKING_MODES.includes(config.thinkingMode)) {
        config.thinkingMode = targetModel.defaultConfig.thinkingMode;
      }
      if (!targetModel.reasoningEfforts.includes(config.reasoningEffort)) {
        config.reasoningEffort = targetModel.defaultConfig.reasoningEffort || targetModel.reasoningEfforts[0] || "";
      }
    }

    if (!targetModel?.supportsStreaming) {
      if (config.streamEnabled) warnings.push("当前模型不支持流式输出，已自动关闭。");
      config.streamEnabled = false;
    }

    if (!targetModel?.jsonModes.includes(config.jsonMode)) {
      if (config.jsonMode !== "none") warnings.push("当前模型不支持所选 JSON 模式，已回退为文本输出。");
      config.jsonMode = targetModel?.jsonModes.includes("json_object") ? "json_object" : "none";
    }

    return { config, warnings };
  }

  function renderModelOptions(selectEl, options = {}) {
    if (!selectEl) return [];
    const includeDisabled = Boolean(options.includeDisabled);
    const supplierCode = String(options.supplierCode || "").trim();
    const preferredKey = String(options.preferredKey || "").trim();
    const models = supplierCode
      ? getModelsBySupplier(supplierCode, { includeDisabled })
      : getModels({ includeDisabled });
    selectEl.innerHTML = models
      .map((model) => {
        const supplier = getSupplierByCode(model.supplierCode);
        const suffix = supplier ? ` · ${supplier.supplierName}` : "";
        return `<option value="${model.modelKey}">${model.displayName}${suffix}</option>`;
      })
      .join("");
    if (preferredKey && models.some((item) => item.modelKey === preferredKey)) {
      selectEl.value = preferredKey;
    } else if (models[0]) {
      selectEl.value = models[0].modelKey;
    }
    return models;
  }

  function getModelPriceHint(modelKey) {
    const model = getModelByKey(modelKey);
    if (!model) return "";
    if (model.pricing?.mode === "tiered") {
      const { threshold, tier1, tier2 } = model.pricing.tiered || {};
      if (threshold || tier1?.input || tier1?.output || tier2?.input || tier2?.output) {
        return `阶梯模式 | <=${threshold || "-"} 输入 ${tier1?.input || "-"} / 输出 ${tier1?.output || "-"}，>${threshold || "-"} 输入 ${tier2?.input || "-"} / 输出 ${tier2?.output || "-"}`;
      }
    }
    if (model.pricing?.mode === "flat") {
      const { input, output } = model.pricing.flat || {};
      if (input || output) {
        return `统一模式 | 输入 ${input || "-"} / 输出 ${output || "-"}`;
      }
    }
    return model.pricingHint || "";
  }

  window.ModelRegistryDemo = {
    STORAGE_KEYS,
    THINKING_MODES,
    JSON_MODES,
    REASONING_EFFORTS,
    ensureSeedData,
    getSuppliers,
    saveSuppliers,
    getSupplierByCode,
    getModels,
    saveModels,
    getModelByKey,
    getModelByProviderId,
    getModelsBySupplier,
    getDefaultModel,
    buildModelConfig,
    coerceModelConfig,
    renderModelOptions,
    getModelPriceHint,
    normalizeThinkingMode,
    normalizeJsonMode,
    normalizeReasoningEffort,
    toUiThinkingMode,
    fromUiThinkingMode
  };
})();
