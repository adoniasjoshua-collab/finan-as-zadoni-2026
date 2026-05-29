(function (global) {
  'use strict';

  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

  function toIsoDateFromAny(value, fallback) {
    const raw = String(value || '').trim();
    const safeFallback = DATE_REGEX.test(String(fallback || '')) ? String(fallback) : new Date().toISOString().slice(0, 10);
    if (!raw) return safeFallback;
    if (DATE_REGEX.test(raw)) {
      const dt = new Date(raw + 'T00:00:00');
      if (!Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === raw) return raw;
      return safeFallback;
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return safeFallback;
    return parsed.toISOString().slice(0, 10);
  }

  function isValidIsoDate(value) {
    const raw = String(value || '').trim();
    if (!DATE_REGEX.test(raw)) return false;
    const dt = new Date(raw + 'T00:00:00');
    return !Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === raw;
  }

  function toIsoTimestamp(value, fallbackDate) {
    const parsed = new Date(value || '');
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    const date = toIsoDateFromAny(fallbackDate, new Date().toISOString().slice(0, 10));
    return date + 'T00:00:00.000Z';
  }

  function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
  }

  global.ZadoniModules = global.ZadoniModules || {};
  global.ZadoniModules.calc = {
    toIsoDateFromAny: toIsoDateFromAny,
    isValidIsoDate: isValidIsoDate,
    toIsoTimestamp: toIsoTimestamp,
    roundMoney: roundMoney
  };
})(window);
