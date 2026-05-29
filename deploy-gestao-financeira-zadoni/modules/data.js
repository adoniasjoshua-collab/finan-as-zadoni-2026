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

  global.ZadoniModules = global.ZadoniModules || {};
  global.ZadoniModules.data = {
    parseJsonList: parseJsonList,
    parseJsonObject: parseJsonObject,
    saveJson: saveJson
  };
})(window);
