(function () {
  'use strict';

  function isValidEmailFormat(value) {
    if (typeof value !== 'string') return false;
    const at = value.indexOf('@');
    if (at < 1) return false;
    const afterAt = value.slice(at + 1);
    const dot = afterAt.indexOf('.');
    return dot > 0 && dot < afterAt.length - 1;
  }

  function isPhase1Valid(data) {
    return Boolean(data.persona) &&
      Array.isArray(data.solutions) && data.solutions.length > 0 &&
      Boolean(data.purpose);
  }

  function isPhase2Valid(data) {
    return Boolean(data.fullName && data.fullName.trim()) &&
      isValidEmailFormat(data.workEmail) &&
      Boolean(data.company && data.company.trim());
  }

  const api = { isValidEmailFormat, isPhase1Valid, isPhase2Valid };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.ContactForm = window.Giantfuse.ContactForm || {};
    Object.assign(window.Giantfuse.ContactForm, api);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
