(function (global) {
  'use strict';

  function setHidden(node, hidden) {
    if (!node) return;
    if (hidden) node.setAttribute('hidden', 'hidden');
    else node.removeAttribute('hidden');
  }

  function toggleClass(node, className, enabled) {
    if (!node || !className) return;
    node.classList.toggle(className, !!enabled);
  }

  global.ZadoniModules = global.ZadoniModules || {};
  global.ZadoniModules.ui = {
    setHidden: setHidden,
    toggleClass: toggleClass
  };
})(window);
