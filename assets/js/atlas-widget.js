(function () {
  'use strict';

  function matchReply(message) {
    const text = String(message || '').toLowerCase();
    if (/strateg|invest|private equity|hedge fund|real estate|credit/.test(text)) {
      return 'We focus on four core strategies — Private Equity, Hedge Fund Solutions, Real Estate, and Credit &amp; Insurance. You can explore each in detail on our <a href="strategies.html">Investment Approach</a> page.';
    }
    if (/contact|enquir|talk to someone|human|call|email|reach/.test(text)) {
      return 'You can reach our team directly through our <a href="contact.html">Investor Enquiry</a> form, or call us on +27 72 416 6083.';
    }
    if (/leadership|team|who runs|ceo|management/.test(text)) {
      return 'Our leadership team is led by Tebogo Mkhize (CEO) and Michael van der Merwe (CIO), along with heads of Real Assets and Credit &amp; Insurance. You can meet the full team on our <a href="leadership.html">Leadership</a> page.';
    }
    if (/about|company|who are you|history|based/.test(text)) {
      return 'Giantfuse Capital Partners is a South African alternative investment and asset management firm based in Sandton, Johannesburg. Read more on our <a href="about.html">About</a> page.';
    }
    return 'I\'m not able to answer that directly, but our team can help — reach out through our <a href="contact.html">Investor Enquiry</a> form and we\'ll get back to you.';
  }

  const GREETING = 'Hi, I\'m Atlas — I can help you learn about our investment strategies, leadership team, or how to get in touch. What would you like to know?';
  const TYPING_DELAY_MS = 600;

  function init() {
    if (typeof document === 'undefined') return;
    const launcher = document.querySelector('#atlas-launcher');
    const panel = document.querySelector('#atlas-panel');
    const closeBtn = document.querySelector('#atlas-close-btn');
    const messages = document.querySelector('#atlas-messages');
    const form = document.querySelector('#atlas-input-form');
    const input = document.querySelector('#atlas-input');
    const voiceToggle = document.querySelector('#atlas-voice-toggle');
    if (!launcher || !panel || !messages || !form || !input) return;

    let greeted = false;
    let voiceOn = false;
    const voiceSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

    function stripHtml(html) {
      const el = document.createElement('div');
      el.innerHTML = html;
      return el.textContent;
    }

    function speak(html) {
      if (!voiceSupported || !voiceOn) return;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(stripHtml(html)));
    }

    function addMessage(text, sender) {
      const el = document.createElement('div');
      el.className = 'atlas-message atlas-message-' + sender;
      if (sender === 'bot') {
        el.innerHTML = text;
        speak(text);
      } else {
        el.textContent = text;
      }
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
      const el = document.createElement('div');
      el.className = 'atlas-typing';
      el.id = 'atlas-typing-indicator';
      el.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
      const el = document.querySelector('#atlas-typing-indicator');
      if (el) el.remove();
    }

    function setOpen(isOpen) {
      panel.classList.toggle('is-open', isOpen);
      panel.setAttribute('aria-hidden', String(!isOpen));
      launcher.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        input.focus();
        if (!greeted) {
          greeted = true;
          addMessage(GREETING, 'bot');
        }
      } else if (voiceSupported) {
        window.speechSynthesis.cancel();
      }
    }

    launcher.addEventListener('click', () => {
      setOpen(!panel.classList.contains('is-open'));
    });
    if (closeBtn) {
      closeBtn.addEventListener('click', () => setOpen(false));
    }
    if (voiceToggle) {
      if (!voiceSupported) {
        voiceToggle.hidden = true;
      } else {
        const iconMuted = voiceToggle.querySelector('.atlas-icon-muted');
        const iconUnmuted = voiceToggle.querySelector('.atlas-icon-unmuted');
        voiceToggle.addEventListener('click', () => {
          voiceOn = !voiceOn;
          voiceToggle.setAttribute('aria-pressed', String(voiceOn));
          voiceToggle.setAttribute('aria-label', voiceOn ? 'Turn Atlas voice off' : 'Turn Atlas voice on');
          if (iconMuted) iconMuted.hidden = voiceOn;
          if (iconUnmuted) iconUnmuted.hidden = !voiceOn;
          if (!voiceOn) {
            window.speechSynthesis.cancel();
          }
        });
      }
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      addMessage(value, 'user');
      input.value = '';
      showTyping();
      setTimeout(() => {
        hideTyping();
        addMessage(matchReply(value), 'bot');
      }, TYPING_DELAY_MS);
    });
  }

  const api = { matchReply, init };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.AtlasWidget = window.Giantfuse.AtlasWidget || {};
    Object.assign(window.Giantfuse.AtlasWidget, api);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
