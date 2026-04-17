(function () {
  const STORAGE_KEYS = {
    suppliers: "model_demo_suppliers_v1",
    models: "model_demo_models_v1"
  };

  const THINKING_MODES = ["disabled", "enabled", "auto"];
  const JSON_MODES = ["none", "json_object"];
  const REASONING_EFFORTS = ["minimal", "low", "medium", "high"];

  function createEmptyPricing() {
    return {
      version: 4,
      mode: "flat",
      thinking: {
        cacheHit: {
          mode: "flat",
          flat: { input: "", output: "" },
          tiers: [{ upTo: "", input: "", output: "" }]
        },
        cacheMiss: {
          mode: "flat",
          flat: { input: "", output: "" },
          tiers: [{ upTo: "", input: "", output: "" }]
        }
      },
      nonThinking: {
        cacheHit: {
          mode: "flat",
          flat: { input: "", output: "" },
          tiers: [{ upTo: "", input: "", output: "" }]
        },
        cacheMiss: {
          mode: "flat",
          flat: { input: "", output: "" },
          tiers: [{ upTo: "", input: "", output: "" }]
        }
      },
      multimodal: []
    };
  }

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
      thinkingType: "auto",
      supportsTextInput: true,
      supportsImageInput: true,
      supportsJson: true,
      supportsStreaming: true,
      reasoningEfforts: ["low", "medium", "high"],
      pricing: {
        version: 4,
        thinking: {
          cacheHit: {
            mode: "tiered",
            flat: { input: "", output: "" },
            tiers: [
              { upTo: "32000", input: "0.0032", output: "0.0160" },
              { upTo: "", input: "0.0048", output: "0.0240" }
            ]
          },
          cacheMiss: {
            mode: "flat",
            flat: { input: "0.0032", output: "0.0160" },
            tiers: [{ upTo: "", input: "", output: "" }]
          }
        },
        nonThinking: {
          cacheHit: {
            mode: "flat",
            flat: { input: "0.0032", output: "0.0160" },
            tiers: [{ upTo: "", input: "", output: "" }]
          },
          cacheMiss: {
            mode: "flat",
            flat: { input: "0.0032", output: "0.0160" },
            tiers: [{ upTo: "", input: "", output: "" }]
          }
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
        version: 4,
        thinking: {
          cacheHit: {
            mode: "flat",
            flat: { input: "", output: "" },
            tiers: [{ upTo: "", input: "", output: "" }]
          },
          cacheMiss: {
            mode: "flat",
            flat: { input: "", output: "" },
            tiers: [{ upTo: "", input: "", output: "" }]
          }
        },
        nonThinking: {
          cacheHit: {
            mode: "flat",
            flat: { input: "0.0004", output: "0.0012" },
            tiers: [{ upTo: "", input: "", output: "" }]
          },
          cacheMiss: {
            mode: "flat",
            flat: { input: "0.0008", output: "0.0024" },
            tiers: [{ upTo: "", input: "", output: "" }]
          }
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
      thinkingType: "onoff",
      supportsTextInput: true,
      supportsImageInput: false,
      supportsJson: true,
      supportsStreaming: true,
      reasoningEfforts: ["minimal", "low", "medium", "high"],
      pricing: createEmptyPricing(),
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
      pricing: createEmptyPricing(),
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
      thinkingType: "onoff",
      supportsTextInput: true,
      supportsImageInput: false,
      supportsJson: false,
      supportsStreaming: true,
      reasoningEfforts: ["low", "medium", "high"],
      pricing: createEmptyPricing(),
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
      pricing: createEmptyPricing(),
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

  function normalizePriceValue(value) {
    return String(value ?? "").trim();
  }

  function normalizeTierMode(value) {
    return String(value || "").toLowerCase() === "tiered" ? "tiered" : "flat";
  }

  function normalizeTierList(list) {
    const source = Array.isArray(list) ? list : [];
    const tiers = source.map((item) => ({
      upTo: normalizePriceValue(item?.upTo),
      input: normalizePriceValue(item?.input),
      output: normalizePriceValue(item?.output)
    }));
    return tiers.length ? tiers : [{ upTo: "", input: "", output: "" }];
  }

  function normalizeFlatPair(rawFlat) {
    const flat = rawFlat && typeof rawFlat === "object" ? rawFlat : {};
    return {
      input: normalizePriceValue(flat.input),
      output: normalizePriceValue(flat.output)
    };
  }

  function normalizeBucket(rawBucket) {
    const bucket = rawBucket && typeof rawBucket === "object" ? rawBucket : {};
    return {
      mode: normalizeTierMode(bucket.mode),
      flat: normalizeFlatPair(bucket.flat),
      tiers: normalizeTierList(bucket.tiers)
    };
  }

  function normalizePricingV4(rawPricing) {
    const pricing = rawPricing && typeof rawPricing === "object" ? rawPricing : {};
    const thinking = pricing.thinking && typeof pricing.thinking === "object" ? pricing.thinking : {};
    const nonThinking = pricing.nonThinking && typeof pricing.nonThinking === "object" ? pricing.nonThinking : {};
    const rawMultimodal = Array.isArray(pricing.multimodal) ? pricing.multimodal : [];
    const multimodal = rawMultimodal.map((item) => ({
      type: normalizePriceValue(item?.type),
      input: normalizePriceValue(item?.input),
      output: normalizePriceValue(item?.output)
    })).filter((item) => item.type || item.input || item.output);
    let mode = String(pricing.mode || "").toLowerCase();
    if (!mode) {
      if (multimodal.length) {
        mode = "multimodal";
      } else {
        mode = normalizeTierMode(thinking.cacheHit?.mode || nonThinking.cacheHit?.mode);
      }
    }
    if (!["flat", "tiered", "multimodal"].includes(mode)) mode = "flat";
    return {
      version: 4,
      mode,
      thinking: {
        cacheHit: normalizeBucket(thinking.cacheHit),
        cacheMiss: normalizeBucket(thinking.cacheMiss)
      },
      nonThinking: {
        cacheHit: normalizeBucket(nonThinking.cacheHit),
        cacheMiss: normalizeBucket(nonThinking.cacheMiss)
      },
      multimodal
    };
  }

  function isPricingV4(rawPricing) {
    return Boolean(
      rawPricing &&
      typeof rawPricing === "object" &&
      (rawPricing.version === 4 || rawPricing.thinking?.cacheHit?.flat || rawPricing.nonThinking?.cacheMiss?.flat)
    );
  }

  function isPricingV3(rawPricing) {
    return Boolean(
      rawPricing &&
      typeof rawPricing === "object" &&
      (rawPricing.version === 3 || rawPricing.thinking?.cacheMissInput !== undefined || rawPricing.nonThinking?.cacheHitInput)
    );
  }

  function isPricingV2(rawPricing) {
    return Boolean(
      rawPricing &&
      typeof rawPricing === "object" &&
      rawPricing.version === 2 &&
      rawPricing.thinking &&
      !rawPricing.thinking.cacheMissInput
    );
  }

  function normalizeLegacyPricingV2(rawPricing) {
    const pricing = rawPricing && typeof rawPricing === "object" ? rawPricing : {};
    const v2Thinking = pricing.thinking && typeof pricing.thinking === "object" ? pricing.thinking : {};
    const v2NonThinking = pricing.nonThinking && typeof pricing.nonThinking === "object" ? pricing.nonThinking : {};
    const nextPricing = createEmptyPricing();
    nextPricing.thinking.cacheHit = {
      mode: normalizeTierMode(v2Thinking.cacheHitInput?.mode),
      flat: {
        input: normalizePriceValue(v2Thinking.cacheHitInput?.flatPrice),
        output: normalizePriceValue(v2Thinking.cacheMiss?.output)
      },
      tiers: normalizeTierList((v2Thinking.cacheHitInput?.tiers || []).map((item) => ({
        upTo: item?.upTo,
        input: item?.price,
        output: v2Thinking.cacheMiss?.output
      })))
    };
    nextPricing.thinking.cacheMiss = {
      mode: "flat",
      flat: {
        input: normalizePriceValue(v2Thinking.cacheMiss?.input),
        output: normalizePriceValue(v2Thinking.cacheMiss?.output)
      },
      tiers: [{ upTo: "", input: "", output: "" }]
    };
    nextPricing.nonThinking.cacheMiss = {
      mode: "flat",
      flat: {
        input: normalizePriceValue(v2NonThinking.input),
        output: normalizePriceValue(v2NonThinking.output)
      },
      tiers: [{ upTo: "", input: "", output: "" }]
    };
    return nextPricing;
  }

  function normalizeLegacyPricingV3(rawPricing) {
    const pricing = rawPricing && typeof rawPricing === "object" ? rawPricing : {};
    const nextPricing = createEmptyPricing();
    const thinking = pricing.thinking && typeof pricing.thinking === "object" ? pricing.thinking : {};
    const nonThinking = pricing.nonThinking && typeof pricing.nonThinking === "object" ? pricing.nonThinking : {};

    nextPricing.thinking.cacheHit = {
      mode: normalizeTierMode(thinking.cacheHitInput?.mode),
      flat: {
        input: normalizePriceValue(thinking.cacheHitInput?.flatPrice),
        output: normalizePriceValue(thinking.output)
      },
      tiers: normalizeTierList((thinking.cacheHitInput?.tiers || []).map((item) => ({
        upTo: item?.upTo,
        input: item?.price,
        output: thinking.output
      })))
    };
    nextPricing.thinking.cacheMiss = {
      mode: "flat",
      flat: {
        input: normalizePriceValue(thinking.cacheMissInput),
        output: normalizePriceValue(thinking.output)
      },
      tiers: [{ upTo: "", input: "", output: "" }]
    };
    nextPricing.nonThinking.cacheHit = {
      mode: normalizeTierMode(nonThinking.cacheHitInput?.mode),
      flat: {
        input: normalizePriceValue(nonThinking.cacheHitInput?.flatPrice),
        output: normalizePriceValue(nonThinking.output)
      },
      tiers: normalizeTierList((nonThinking.cacheHitInput?.tiers || []).map((item) => ({
        upTo: item?.upTo,
        input: item?.price,
        output: nonThinking.output
      })))
    };
    nextPricing.nonThinking.cacheMiss = {
      mode: "flat",
      flat: {
        input: normalizePriceValue(nonThinking.cacheMissInput),
        output: normalizePriceValue(nonThinking.output)
      },
      tiers: [{ upTo: "", input: "", output: "" }]
    };
    return nextPricing;
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
    if (isPricingV4(rawPricing)) {
      return normalizePricingV4(rawPricing);
    }
    if (isPricingV3(rawPricing)) {
      return normalizePricingV4(normalizeLegacyPricingV3(rawPricing));
    }
    if (isPricingV2(rawPricing)) {
      return normalizePricingV4(normalizeLegacyPricingV2(rawPricing));
    }

    const pricing = rawPricing && typeof rawPricing === "object" ? rawPricing : {};
    const legacyMode = String(rawModel?.pricingMode || pricing.mode || "flat").toLowerCase();
    const mode = legacyMode === "tiered" ? "tiered" : "flat";
    const flat = pricing.flat && typeof pricing.flat === "object" ? pricing.flat : {};
    const tiered = pricing.tiered && typeof pricing.tiered === "object" ? pricing.tiered : {};
    const tier1 = tiered.tier1 && typeof tiered.tier1 === "object" ? tiered.tier1 : {};
    const tier2 = tiered.tier2 && typeof tiered.tier2 === "object" ? tiered.tier2 : {};
    const nextPricing = createEmptyPricing();

    if (mode === "tiered") {
      nextPricing.thinking.cacheHit.mode = "tiered";
      nextPricing.thinking.cacheHit.tiers = normalizeTierList([
        {
          upTo: tiered.threshold ?? rawModel?.tieredThreshold ?? "",
          input: tier1.input ?? rawModel?.tier1InputPrice ?? "",
          output: tier1.output ?? rawModel?.tier1OutputPrice ?? ""
        },
        {
          upTo: "",
          input: tier2.input ?? rawModel?.tier2InputPrice ?? "",
          output: tier2.output ?? rawModel?.tier2OutputPrice ?? ""
        }
      ]);
      nextPricing.thinking.cacheMiss.flat = {
        input: normalizePriceValue(tier1.input ?? rawModel?.tier1InputPrice ?? ""),
        output: normalizePriceValue(tier1.output ?? rawModel?.tier1OutputPrice ?? "")
      };
      nextPricing.nonThinking.cacheMiss.flat = {
        input: normalizePriceValue(tier1.input ?? rawModel?.tier1InputPrice ?? ""),
        output: normalizePriceValue(tier1.output ?? rawModel?.tier1OutputPrice ?? "")
      };
    } else {
      const inputPrice = normalizePriceValue(flat.input ?? rawModel?.flatInputPrice ?? "");
      const outputPrice = normalizePriceValue(flat.output ?? rawModel?.flatOutputPrice ?? "");
      nextPricing.nonThinking.cacheMiss.flat = { input: inputPrice, output: outputPrice };
      if (rawModel?.supportsThinking || rawModel?.thinkingType) {
        nextPricing.thinking.cacheMiss.flat = { input: inputPrice, output: outputPrice };
      }
    }

    return normalizePricingV4(nextPricing);
  }

  function normalizeModel(raw, index) {
    const inferredThinkingType = raw?.supportsThinking ? "auto" : undefined;
    const thinkingType = (raw?.thinkingType === "auto" || raw?.thinkingType === "onoff")
      ? raw.thinkingType
      : inferredThinkingType;
    const supportsThinking = Boolean(raw?.supportsThinking || thinkingType || raw?.reasoningEfforts?.length);
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
      thinkingType,
      supportsTextInput: Boolean(raw?.supportsTextInput ?? raw?.supportsText ?? true),
      supportsImageInput: Boolean(raw?.supportsImageInput || raw?.supportsImage),

      supportsJson,
      supportsStreaming: raw?.supportsStreaming !== false,
      jsonModes: jsonModes.length ? jsonModes : ["none"],
      reasoningEfforts,
      pricing,
      defaultConfig,
      pricingHint: String(raw?.pricingHint || raw?.pricingNote || "").trim(),
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
      const allowedModes = targetModel.thinkingType === "onoff"
        ? ["disabled", "enabled"]
        : THINKING_MODES;
      if (!allowedModes.includes(config.thinkingMode)) {
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

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildTierSummary(tiers = []) {
    const normalized = normalizeTierList(tiers).filter((item) => item.upTo || item.input || item.output);
    if (!normalized.length) return "-";
    let previous = "";
    return normalized.map((item, index) => {
      const range = item.upTo
        ? (index === 0 ? `≤${item.upTo}（含）` : `${previous || "-"} ~ ${item.upTo}（含）`)
        : (previous ? `>${previous}` : "最后一档");
      previous = item.upTo || previous;
      return `${range} 输入 ${item.input || "-"} / 输出 ${item.output || "-"}`;
    }).join("，");
  }

  function getModelPriceLines(modelOrKey) {
    const model = typeof modelOrKey === "string" ? getModelByKey(modelOrKey) : modelOrKey;
    if (!model) return [];
    const pricing = normalizePricing(model.pricing, model);
    const lines = [];
    const thinking = pricing.thinking || {};
    const nonThinking = pricing.nonThinking || {};
    const buckets = [
      { label: "思考 · 缓存命中", key: thinking.cacheHit, enabled: model.supportsThinking },
      { label: "思考 · 缓存未命中", key: thinking.cacheMiss, enabled: model.supportsThinking },
      { label: "非思考 · 缓存命中", key: nonThinking.cacheHit, enabled: true },
      { label: "非思考 · 缓存未命中", key: nonThinking.cacheMiss, enabled: true }
    ];
    const hasStructuredPricing = [
      ...buckets.flatMap(({ key }) => {
        const bucket = key || {};
        const flat = bucket.flat || {};
        return [
          flat.input,
          flat.output,
          ...(bucket.tiers || []).filter((item) => item.upTo || item.input || item.output).map((item) => `${item.upTo}:${item.input}:${item.output}`)
        ];
      })
    ].some((value) => String(value || "").trim());

    const hasMultimodalPricing = (pricing.multimodal || []).some((item) => item.type || item.input || item.output);

    if (!hasStructuredPricing && !hasMultimodalPricing) {
      return model.pricingHint ? [model.pricingHint] : [];
    }

    buckets.forEach(({ label, key, enabled }) => {
      const bucket = key || {};
      const flat = bucket.flat || {};
      const hasBucketPricing = Boolean(
        flat.input ||
        flat.output ||
        (bucket.tiers || []).some((item) => item.upTo || item.input || item.output)
      );
      if (!enabled && !hasBucketPricing) return;
      const summary = bucket.mode === "tiered"
        ? `梯度 ${buildTierSummary(bucket.tiers)}`
        : `统一 输入 ${flat.input || "-"} / 输出 ${flat.output || "-"}`;
      lines.push(`${label} ${summary}`);
    });

    const typeMap = { text: "文本", image: "图片", voice: "语音", video: "视频" };
    (pricing.multimodal || []).forEach((item) => {
      if (!item.type && !item.input && !item.output) return;
      lines.push(`多模态 · ${typeMap[item.type] || item.type || "-"} 输入 ${item.input || "-"} / 输出 ${item.output || "-"}`);
    });

    return lines;
  }

  function getModelPriceHint(modelKey) {
    const lines = getModelPriceLines(modelKey);
    return lines.join(" | ");
  }

  function renderModelPriceHtml(modelOrKey, options = {}) {
    const model = typeof modelOrKey === "string" ? getModelByKey(modelOrKey) : modelOrKey;
    const lines = getModelPriceLines(modelOrKey);
    if (!lines.length) {
      return `<div style="font-size:12px; color:${options.color || "var(--muted)"};">未配置模型价格</div>`;
    }
    const hasFallbackOnly = lines.length === 1 && model?.pricingHint && lines[0] === model.pricingHint;
    const color = options.color || "var(--muted)";
    const lineHeight = options.lineHeight || "1.6";
    const fontSize = options.fontSize || "12px";
    return `<div style="font-size:${fontSize}; color:${color}; line-height:${lineHeight};">${lines.map((line) => {
      const suffix = hasFallbackOnly ? "" : " (元/千tokens)";
      return `<div>${escapeHtml(line)}${suffix}</div>`;
    }).join("")}</div>`;
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
    getModelPriceLines,
    getModelPriceHint,
    renderModelPriceHtml,
    normalizeThinkingMode,
    normalizeJsonMode,
    normalizeReasoningEffort,
    toUiThinkingMode,
    fromUiThinkingMode
  };
})();
