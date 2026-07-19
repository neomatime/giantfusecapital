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

  const api = { matchReply };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.AtlasWidget = window.Giantfuse.AtlasWidget || {};
    Object.assign(window.Giantfuse.AtlasWidget, api);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
