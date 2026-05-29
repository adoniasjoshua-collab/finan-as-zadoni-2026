(function (global) {
  'use strict';

  function sanitizeIdList(ids) {
    return (Array.isArray(ids) ? ids : []).map(function (id) {
      return String(id || '').trim();
    }).filter(function (id) {
      return !!id;
    });
  }

  function buildUpsertRow(id, payload, createdAt) {
    return {
      id: String(id || ''),
      payload: Object.assign({}, payload || {}),
      created_at: String(createdAt || '')
    };
  }

  function getSupabaseErrorMessage(response) {
    if (!response || !response.error) return '';
    return String(response.error.message || 'erro desconhecido');
  }

  global.ZadoniModules = global.ZadoniModules || {};
  global.ZadoniModules.sync = {
    sanitizeIdList: sanitizeIdList,
    buildUpsertRow: buildUpsertRow,
    getSupabaseErrorMessage: getSupabaseErrorMessage
  };
})(window);
