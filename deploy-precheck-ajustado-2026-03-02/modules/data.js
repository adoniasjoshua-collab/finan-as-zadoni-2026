(function (global) {
  'use strict';

  function parseJsonList(storage, key) {
    try {
      const raw = storage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      storage.removeItem(key);
      return [];
    }
  }

  function parseJsonObject(storage, key, fallback) {
    try {
      const raw = storage.getItem(key);
      if (!raw) return Object.assign({}, fallback || {});
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return Object.assign({}, fallback || {});
      }
      return parsed;
    } catch (error) {
      storage.removeItem(key);
      return Object.assign({}, fallback || {});
    }
  }

  function saveJson(storage, key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  function normalizeId(value, generateUuid) {
    const id = String(value || '').trim();
    if (id) return id;
    if (typeof generateUuid === 'function') return generateUuid();
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function normalizeMovementEntry(entry, tools) {
    const calc = tools && tools.calc ? tools.calc : {};
    const toIsoDateFromAny = calc.toIsoDateFromAny || function (value) { return String(value || '').slice(0, 10); };
    const toIsoTimestamp = calc.toIsoTimestamp || function (value) { return String(value || ''); };
    const generateUuid = tools && tools.generateUuid;
    const raw = entry && typeof entry === 'object' ? entry : {};
    const createdAt = toIsoTimestamp(raw.createdAt, raw.date);
    return {
      id: normalizeId(raw.id, generateUuid),
      source: String(raw.source || ''),
      sourceId: normalizeId(raw.sourceId || raw.id, generateUuid),
      date: toIsoDateFromAny(raw.date, new Date().toISOString().slice(0, 10)),
      createdAt: createdAt,
      amount: Number(raw.amount || 0),
      type: String(raw.type || ''),
      notes: String(raw.notes || ''),
      isOtherFunding: !!raw.isOtherFunding,
      fundingSource: String(raw.fundingSource || ''),
      payload: raw.payload && typeof raw.payload === 'object' ? Object.assign({}, raw.payload) : {}
    };
  }

  function createMovementLedger(collections, tools) {
    const calc = tools && tools.calc ? tools.calc : {};
    const toIsoDateFromAny = calc.toIsoDateFromAny || function (value) { return String(value || '').slice(0, 10); };
    const toIsoTimestamp = calc.toIsoTimestamp || function (value) { return String(value || ''); };
    const generateUuid = tools && tools.generateUuid;
    const rows = [];

    (collections.purchases || []).forEach(function (item) {
      const sourceId = normalizeId(item.id, generateUuid);
      const date = toIsoDateFromAny(item.purchaseDate || item.date || item.createdAt);
      rows.push(normalizeMovementEntry({
        id: 'purchase:' + sourceId,
        source: 'purchase',
        sourceId: sourceId,
        date: date,
        createdAt: toIsoTimestamp(item.createdAt, date),
        amount: Number(item.total || 0),
        type: String(item.type || 'Compra'),
        notes: String(item.notes || ''),
        isOtherFunding: !!item.isOtherFunding,
        fundingSource: String(item.fundingSource || ''),
        payload: {
          item: String(item.item || ''),
          quantity: Number(item.quantity || 0),
          supplier: String(item.supplier || ''),
          isInventoryPurchase: !!item.isInventoryPurchase
        }
      }, tools));
    });

    (collections.withdrawals || []).forEach(function (item) {
      const sourceId = normalizeId(item.id, generateUuid);
      const date = toIsoDateFromAny(item.withdrawalDate || item.date || item.createdAt);
      rows.push(normalizeMovementEntry({
        id: 'withdrawal:' + sourceId,
        source: 'withdrawal',
        sourceId: sourceId,
        date: date,
        createdAt: toIsoTimestamp(item.createdAt, date),
        amount: Number(item.amount || 0),
        type: String(item.type || 'Saída'),
        notes: String(item.notes || ''),
        isOtherFunding: !!item.isOtherFunding,
        fundingSource: String(item.fundingSource || ''),
        payload: {
          flowType: String(item.flowType || ''),
          linkedSource: String(item.linkedSource || ''),
          linkedTransactionId: String(item.linkedTransactionId || '')
        }
      }, tools));
    });

    (collections.partnerContributions || []).forEach(function (item) {
      const sourceId = normalizeId(item.id, generateUuid);
      const date = toIsoDateFromAny(item.date || item.createdAt);
      rows.push(normalizeMovementEntry({
        id: 'distribution:' + sourceId,
        source: 'distribution',
        sourceId: sourceId,
        date: date,
        createdAt: toIsoTimestamp(item.createdAt, date),
        amount: Number(item.amount || 0),
        type: String(item.partner || 'Sócio'),
        notes: String(item.notes || ''),
        isOtherFunding: !!item.isOtherFunding,
        fundingSource: String(item.fundingSource || ''),
        payload: {
          partner: String(item.partner || ''),
          cycleKey: String(item.cycleKey || '')
        }
      }, tools));
    });

    (collections.adsInvestments || []).forEach(function (item) {
      const sourceId = normalizeId(item.id, generateUuid);
      const date = toIsoDateFromAny(item.date || item.createdAt);
      rows.push(normalizeMovementEntry({
        id: 'ads:' + sourceId,
        source: 'ads',
        sourceId: sourceId,
        date: date,
        createdAt: toIsoTimestamp(item.createdAt, date),
        amount: Number(item.amount || 0),
        type: String(item.platform || 'Ads'),
        notes: String(item.notes || ''),
        isOtherFunding: !!item.isOtherFunding,
        fundingSource: String(item.fundingSource || ''),
        payload: {
          platform: String(item.platform || ''),
          method: String(item.method || '')
        }
      }, tools));
    });

    return rows.sort(function (a, b) {
      if (a.date === b.date) return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }

  function hydrateMovementCollections(entries, tools) {
    const calc = tools && tools.calc ? tools.calc : {};
    const toIsoDateFromAny = calc.toIsoDateFromAny || function (value) { return String(value || '').slice(0, 10); };
    const toIsoTimestamp = calc.toIsoTimestamp || function (value) { return String(value || ''); };
    const isInventoryPurchaseType = tools && tools.isInventoryPurchaseType;

    const collections = {
      purchases: [],
      withdrawals: [],
      partnerContributions: [],
      adsInvestments: []
    };

    (entries || []).forEach(function (raw) {
      const item = normalizeMovementEntry(raw, tools);
      const payload = item.payload || {};
      if (item.source === 'purchase') {
        collections.purchases.push({
          id: item.sourceId,
          purchaseDate: toIsoDateFromAny(item.date),
          date: toIsoDateFromAny(item.date),
          type: item.type,
          item: String(payload.item || ''),
          quantity: Number(payload.quantity || 0),
          total: Number(item.amount || 0),
          supplier: String(payload.supplier || ''),
          notes: item.notes,
          isInventoryPurchase: typeof isInventoryPurchaseType === 'function'
            ? isInventoryPurchaseType(item.type)
            : !!payload.isInventoryPurchase,
          isOtherFunding: !!item.isOtherFunding,
          fundingSource: item.isOtherFunding ? item.fundingSource : '',
          createdAt: toIsoTimestamp(item.createdAt, item.date)
        });
        return;
      }
      if (item.source === 'withdrawal') {
        collections.withdrawals.push({
          id: item.sourceId,
          withdrawalDate: toIsoDateFromAny(item.date),
          date: toIsoDateFromAny(item.date),
          type: item.type,
          flowType: String(payload.flowType || ''),
          amount: Number(item.amount || 0),
          notes: item.notes,
          isOtherFunding: !!item.isOtherFunding,
          fundingSource: item.isOtherFunding ? item.fundingSource : '',
          linkedSource: String(payload.linkedSource || ''),
          linkedTransactionId: String(payload.linkedTransactionId || ''),
          createdAt: toIsoTimestamp(item.createdAt, item.date)
        });
        return;
      }
      if (item.source === 'distribution') {
        collections.partnerContributions.push({
          id: item.sourceId,
          date: toIsoDateFromAny(item.date),
          partner: String(payload.partner || item.type || ''),
          amount: Number(item.amount || 0),
          notes: item.notes,
          isOtherFunding: !!item.isOtherFunding,
          fundingSource: item.isOtherFunding ? item.fundingSource : '',
          createdAt: toIsoTimestamp(item.createdAt, item.date),
          cycleKey: String(payload.cycleKey || '')
        });
        return;
      }
      if (item.source === 'ads') {
        collections.adsInvestments.push({
          id: item.sourceId,
          date: toIsoDateFromAny(item.date),
          platform: String(payload.platform || item.type || 'Ads'),
          amount: Number(item.amount || 0),
          method: String(payload.method || 'PIX Prepaid'),
          notes: item.notes,
          isOtherFunding: !!item.isOtherFunding,
          fundingSource: item.isOtherFunding ? item.fundingSource : '',
          createdAt: toIsoTimestamp(item.createdAt, item.date)
        });
      }
    });

    return collections;
  }

  function readMovementLedger(storage, key, tools) {
    const raw = parseJsonObject(storage, key, { version: 1, entries: [] });
    const entries = Array.isArray(raw.entries) ? raw.entries : [];
    return entries.map(function (item) {
      return normalizeMovementEntry(item, tools);
    });
  }

  function writeMovementLedger(storage, key, entries) {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      entries: Array.isArray(entries) ? entries : []
    };
    saveJson(storage, key, payload);
  }

  global.ZadoniModules = global.ZadoniModules || {};
  global.ZadoniModules.data = {
    parseJsonList: parseJsonList,
    parseJsonObject: parseJsonObject,
    saveJson: saveJson,
    createMovementLedger: createMovementLedger,
    hydrateMovementCollections: hydrateMovementCollections,
    readMovementLedger: readMovementLedger,
    writeMovementLedger: writeMovementLedger
  };
})(window);
