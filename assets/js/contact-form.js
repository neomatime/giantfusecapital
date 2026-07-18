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
      Boolean(data.company && data.company.trim()) &&
      Boolean(data.country);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const PERSONAS = [
    { value: 'institutional', label: 'Institutional Investor', icon: 'building' },
    { value: 'family-office', label: 'Family Office / Investment Group', icon: 'people' },
    { value: 'hnwi', label: 'High-Net-Worth Individual', icon: 'target' },
    { value: 'intermediary', label: 'Intermediary / Advisor', icon: 'magnifyingGlass' },
    { value: 'other', label: 'Other', icon: 'lightbulb' }
  ];

  const SOLUTIONS = [
    { value: 'private-equity', label: 'Private Equity' },
    { value: 'hedge-fund-solutions', label: 'Hedge Fund Solutions' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'credit-insurance', label: 'Credit & Insurance' },
    { value: 'multi-strategy', label: 'Multi-Strategy Solutions' },
    { value: 'other', label: 'Other' }
  ];

  const PURPOSE_LABELS = {
    'investment-opportunity': 'Investment Opportunity',
    'partnership': 'Partnership Enquiry',
    'media-press': 'Media & Press',
    'careers': 'Careers',
    'general-question': 'General Question',
    'other': 'Other'
  };

  const COUNTRY_LABELS = {
    za: 'South Africa', bw: 'Botswana', ke: 'Kenya', mu: 'Mauritius',
    ng: 'Nigeria', uk: 'United Kingdom', us: 'United States', ae: 'United Arab Emirates', other: 'Other'
  };

  const CONTACT_PREF_LABELS = { email: 'Email', phone: 'Phone', either: 'Either' };
  const BEST_TIME_LABELS = {
    morning: 'Morning (08:00 – 12:00)', afternoon: 'Afternoon (12:00 – 17:00)',
    evening: 'Evening (after 17:00)', anytime: 'Anytime'
  };

  function renderPersonaGrid(container, icons) {
    PERSONAS.forEach((persona) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'persona-option';
      const inputId = `persona-${persona.value}`;
      wrapper.innerHTML = `
        <input type="radio" id="${inputId}" name="persona" value="${persona.value}">
        <label for="${inputId}">
          <span class="icon-badge icon-badge-outline">${(icons && icons[persona.icon]) || ''}</span>
          <span>${persona.label}</span>
        </label>
      `;
      container.appendChild(wrapper);
    });
  }

  function renderSolutionChecklist(container, icons) {
    const checkSvg = (icons && icons.checkmark) || '';
    SOLUTIONS.forEach((solution) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'solution-option';
      const inputId = `solution-${solution.value}`;
      wrapper.innerHTML = `
        <input type="checkbox" id="${inputId}" name="solutions" value="${solution.value}">
        <label for="${inputId}">
          <span class="check-mark">${checkSvg}</span>
          <span>${solution.label}</span>
        </label>
      `;
      container.appendChild(wrapper);
    });
  }

  function readFormData(form) {
    const fd = new FormData(form);
    return {
      persona: fd.get('persona'),
      solutions: fd.getAll('solutions'),
      purpose: fd.get('purpose') || '',
      enquiryNotes: fd.get('enquiryNotes') || '',
      fullName: fd.get('fullName') || '',
      workEmail: fd.get('workEmail') || '',
      company: fd.get('company') || '',
      jobTitle: fd.get('jobTitle') || '',
      country: fd.get('country') || '',
      phone: fd.get('phone') || '',
      contactPreference: fd.get('contactPreference') || 'email',
      bestTime: fd.get('bestTime') || '',
      additionalInfo: fd.get('additionalInfo') || ''
    };
  }

  function setFieldError(form, fieldName, hasError) {
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorEl) errorEl.hidden = !hasError;
    const group = errorEl ? errorEl.closest('.field-group') : null;
    if (group) group.classList.toggle('has-error', hasError);
  }

  function validatePhase1(form) {
    const data = readFormData(form);
    setFieldError(form, 'persona', !data.persona);
    setFieldError(form, 'solutions', data.solutions.length === 0);
    setFieldError(form, 'purpose', !data.purpose);
    return isPhase1Valid(data);
  }

  function validatePhase2(form) {
    const data = readFormData(form);
    setFieldError(form, 'fullName', !(data.fullName && data.fullName.trim()));
    setFieldError(form, 'workEmail', !isValidEmailFormat(data.workEmail));
    setFieldError(form, 'company', !(data.company && data.company.trim()));
    setFieldError(form, 'country', !data.country);
    return isPhase2Valid(data);
  }

  function reviewRow(label, value) {
    return `<div class="review-row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
  }

  function renderReview(data, container) {
    const personaLabel = (PERSONAS.find((p) => p.value === data.persona) || {}).label || '—';
    const solutionLabels = data.solutions.map((v) => (SOLUTIONS.find((s) => s.value === v) || {}).label || v).join(', ');
    let html = '<div class="review-group"><h4>Your Enquiry</h4><dl>';
    html += reviewRow('I am a(n)', personaLabel);
    html += reviewRow('Interested in', solutionLabels || '—');
    html += reviewRow('Purpose', PURPOSE_LABELS[data.purpose] || '—');
    if (data.enquiryNotes) html += reviewRow('Notes', data.enquiryNotes);
    html += '</dl></div><div class="review-group"><h4>Contact Details</h4><dl>';
    html += reviewRow('Full Name', data.fullName);
    html += reviewRow('Work Email', data.workEmail);
    html += reviewRow('Company', data.company);
    if (data.jobTitle) html += reviewRow('Job Title', data.jobTitle);
    html += reviewRow('Country', COUNTRY_LABELS[data.country] || '—');
    if (data.phone) html += reviewRow('Phone', `+27 ${data.phone}`);
    html += reviewRow('Contact Preference', CONTACT_PREF_LABELS[data.contactPreference] || '—');
    if (data.bestTime) html += reviewRow('Best Time', BEST_TIME_LABELS[data.bestTime] || data.bestTime);
    if (data.additionalInfo) html += reviewRow('Additional Info', data.additionalInfo);
    html += '</dl></div>';
    container.innerHTML = html;
  }

  function init() {
    if (typeof document === 'undefined') return;
    const form = document.querySelector('#enquiry-form');
    if (!form) return;

    const icons = (window.Giantfuse && window.Giantfuse.Icons) || {};
    const personaGrid = document.querySelector('#persona-grid');
    const solutionList = document.querySelector('#solution-checklist');
    if (personaGrid) renderPersonaGrid(personaGrid, icons);
    if (solutionList) renderSolutionChecklist(solutionList, icons);

    const steps = [...document.querySelectorAll('.enquiry-step')];
    const phases = [...document.querySelectorAll('.enquiry-phase')];
    const reviewContainer = document.querySelector('#enquiry-review');
    const successPanel = document.querySelector('#enquiry-success');
    let currentStep = 1;
    let maxCompletedStep = 0;

    function goToStep(n) {
      if (n > maxCompletedStep + 1) return;
      currentStep = n;
      phases.forEach((phase) => {
        phase.classList.toggle('is-active', Number(phase.dataset.phase) === n);
      });
      steps.forEach((step) => {
        const stepNum = Number(step.dataset.step);
        step.classList.toggle('is-active', stepNum === n);
        step.classList.toggle('is-complete', stepNum <= maxCompletedStep && stepNum !== n);
        const marker = step.querySelector('.enquiry-step-marker');
        if (marker) marker.disabled = stepNum > maxCompletedStep;
      });
      if (n === 3 && reviewContainer) {
        renderReview(readFormData(form), reviewContainer);
      }
    }

    form.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;
      if (action.dataset.action === 'next') {
        if (currentStep === 1 && !validatePhase1(form)) return;
        if (currentStep === 2 && !validatePhase2(form)) return;
        maxCompletedStep = Math.max(maxCompletedStep, currentStep);
        goToStep(currentStep + 1);
      } else if (action.dataset.action === 'back') {
        goToStep(currentStep - 1);
      }
    });

    steps.forEach((step) => {
      const marker = step.querySelector('.enquiry-step-marker');
      if (!marker) return;
      marker.addEventListener('click', () => goToStep(Number(step.dataset.step)));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.hidden = true;
      if (successPanel) successPanel.hidden = false;
    });

    if (successPanel) {
      const resetBtn = successPanel.querySelector('[data-action="reset"]');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          form.reset();
          form.hidden = false;
          successPanel.hidden = true;
          document.querySelectorAll('.field-group.has-error').forEach((g) => g.classList.remove('has-error'));
          document.querySelectorAll('.field-error').forEach((e) => { e.hidden = true; });
          maxCompletedStep = 0;
          goToStep(1);
        });
      }
    }

    goToStep(1);
  }

  const api = { isValidEmailFormat, isPhase1Valid, isPhase2Valid, escapeHtml, init };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.ContactForm = window.Giantfuse.ContactForm || {};
    Object.assign(window.Giantfuse.ContactForm, api);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
