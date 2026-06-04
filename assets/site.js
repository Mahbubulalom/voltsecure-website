/* ==========================================================
   VoltSecure - SHARED SITE CONFIG
   Single source of truth for placeholders that still need
   client confirmation before public launch. Change values
   here and the whole site picks them up - no need to edit
   40+ inlined footers.
   ========================================================== */
window.VS_CONFIG = {
  social: {
    // TODO Cai: confirm real VoltSecure URLs before launch
    linkedin:  'https://www.linkedin.com/',
    instagram: 'https://www.instagram.com/',
    facebook:  'https://www.facebook.com/'
  },
  ga4: {
    // TODO Cai: paste live GA4 measurement ID here (e.g. 'G-XXXXXXXXXX')
    id: ''   // empty = analytics disabled; tag fires only when id is set
  },
  fca: {
    // TODO Cai: confirm FCA accreditation tier wording shown on
    // accreditations.html (e.g. 'Registered' / 'Authorised')
    tier: 'Registered'
  }
};

/* Rewrite the placeholder social links in the footer using the
   config above. Runs once on DOMContentLoaded. */
document.addEventListener('DOMContentLoaded', function(){
  var cfg = (window.VS_CONFIG && window.VS_CONFIG.social) || {};
  var match = {
    'linkedin.com':  cfg.linkedin,
    'instagram.com': cfg.instagram,
    'facebook.com':  cfg.facebook
  };
  document.querySelectorAll('a[href]').forEach(function(a){
    Object.keys(match).forEach(function(host){
      if (a.href.indexOf(host) !== -1 && match[host]) {
        a.href = match[host];
      }
    });
  });
});

/* ==========================================================
   VoltSecure - SHARED I18N ENGINE (English / German)
   Single source of truth for translations. The dictionary covers
   nav, footer, CTAs, common section headings and shared button
   labels - i.e. everything that appears on more than one page.
   Pages with extensive per-page copy (e.g. index.html) extend
   the dictionary at runtime via window.VS_I18N.extend({...}).

   How it works:
   - Selected language is persisted in localStorage as 'volt.lang'
   - On DOMContentLoaded every page calls applyLang(persistedLang)
     so the DE selection sticks across navigation
   - The shared .lang-toggle button (logic further down) fires a
     'voltlangchange' CustomEvent which calls applyLang(newLang)
   - Translation walks text nodes and replaces matches from the
     dictionary - non-matching text stays as-is, so partial
     coverage degrades gracefully
   ========================================================== */
(function(){
  function norm(s){ return (s||'').replace(/ /g,' ').replace(/\s+/g,' ').trim(); }

  // Shared dictionary - English -> German for strings that appear
  // across every page. Page-specific copy lives in per-page extends.
  var DE_MAP = {
    // ---------- Navigation ----------
    'Services': 'Leistungen',
    'Projects': 'Projekte',
    'About': 'Über uns',
    'Accreditations': 'Akkreditierungen',
    'Contact': 'Kontakt',
    'Request a quote →': 'Angebot anfordern →',
    'Request a quote': 'Angebot anfordern',
    'Quote': 'Angebot',
    'Switch language': 'Sprache wechseln',
    // ---------- Footer columns ----------
    'International': 'International',
    'VoltSecure UK': 'VoltSecure UK',
    'VoltSecure Deutschland': 'VoltSecure Deutschland',
    'VoltSecure Ireland': 'VoltSecure Irland',
    'About us': 'Über uns',
    'Case studies': 'Fallstudien',
    'Contact us': 'Kontakt aufnehmen',
    'ESG & social value': 'ESG & sozialer Wert',
    'VoltSecure & you': 'VoltSecure & Sie',
    'Employees': 'Mitarbeiter',
    'Jobs & apprenticeships': 'Jobs & Ausbildung',
    'Media enquiries': 'Presseanfragen',
    'Suppliers': 'Lieferanten',
    'Follow us': 'Folgen Sie uns',
    // Policy bar
    'Accessibility': 'Barrierefreiheit',
    'Carbon reduction plan': 'Klimaschutzplan',
    'Cookie policy': 'Cookie-Richtlinie',
    'Modern slavery statement': 'Erklärung zu moderner Sklaverei',
    'Privacy notice': 'Datenschutzerklärung',
    'Site terms': 'Nutzungsbedingungen',
    'All rights reserved': 'Alle Rechte vorbehalten',
    // ---------- Common CTAs / buttons ----------
    'Read case study →': 'Fallstudie lesen →',
    'View case study →': 'Fallstudie ansehen →',
    'Read more →': 'Mehr lesen →',
    'Read example →': 'Beispiel ansehen →',
    'View all projects →': 'Alle Projekte ansehen →',
    'Start a project →': 'Projekt starten →',
    'See recent work': 'Aktuelle Projekte ansehen',
    'Get in touch': 'Kontakt aufnehmen',
    'Discuss a similar brief →': 'Ähnlichen Auftrag besprechen →',
    'Call 02922 641046': 'Anruf 02922 641046',
    // ---------- Common section headings ----------
    'Selected work': 'Ausgewählte Projekte',
    'Recent projects.': 'Aktuelle Projekte.',
    'Coverage': 'Abdeckung',
    'What clients say': 'Was Kunden sagen',
    'Capabilities': 'Leistungen',
    'How we operate': 'So arbeiten wir',
    'Got a similar brief?': 'Ähnlicher Auftrag?',
    'Start a project': 'Projekt starten',
    // ---------- Common copy fragments ----------
    'Fire, security & electrical engineering for commercial estates across the UK, Ireland and continental Europe.':
      'Brandschutz-, Sicherheits- und Elektrotechnik für gewerbliche Immobilien in Großbritannien, Irland und Kontinentaleuropa.',
    'Engineer-led. South Wales-based. UK and Europe-operating.':
      'Ingenieur-geführt. Mit Sitz in Südwales. Tätig in Großbritannien und Europa.',
    'Caerphilly HQ': 'Hauptsitz Caerphilly',
    'Pontypridd Service Hub': 'Service-Hub Pontypridd',
    'Pontypridd Operations Hub': 'Operations-Hub Pontypridd',
    'Phone': 'Telefon',
    'Email': 'E-Mail',
    'Head office': 'Hauptsitz'
  };

  window.VS_I18N = {
    de: DE_MAP,
    // English-by-default current language
    currentLang: 'en',
    extend: function(more){
      Object.keys(more || {}).forEach(function(k){ DE_MAP[k] = more[k]; });
      // Re-apply if we're already in DE so the new keys take effect
      if (window.VS_I18N.currentLang === 'de') applyLang('de');
    }
  };

  // Build reverse lookup once - English (normalised) -> German
  function buildIdx(){
    var en2de = {}, de2en = {};
    Object.keys(DE_MAP).forEach(function(en){
      en2de[norm(en)] = DE_MAP[en];
      de2en[norm(DE_MAP[en])] = en;
    });
    return { en2de: en2de, de2en: de2en };
  }

  function walkText(root, fn){
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        // Skip script/style/noscript
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var t = (p.tagName || '').toUpperCase();
        if (t==='SCRIPT'||t==='STYLE'||t==='NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) fn(n);
  }

  function applyLang(lang){
    if (!lang) lang = 'en';
    // Going to EN: the safest way to fully restore the original
    // markup (no many-to-one reverse-mapping ambiguity) is to set
    // the preference and reload. The autoApply on the next load
    // sees 'en' and does nothing, so the markup stays original.
    if (lang === 'en') {
      try { localStorage.setItem('volt.lang', 'en'); } catch(e){}
      // Only reload if we actually were in DE (avoid infinite loops)
      if (window.VS_I18N.currentLang === 'de') {
        location.reload();
        return;
      }
      window.VS_I18N.currentLang = 'en';
      document.documentElement.lang = 'en';
      updateToggleLabels('en');
      return;
    }
    // Going to DE: walk text nodes and substitute
    var idx = buildIdx();
    walkText(document.body, function(node){
      var key = norm(node.nodeValue);
      if (idx.en2de[key]){
        var m = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
        node.nodeValue = (m?m[1]:'') + idx.en2de[key] + (m?m[3]:'');
      }
    });
    window.VS_I18N.currentLang = 'de';
    document.documentElement.lang = 'de';
    try { localStorage.setItem('volt.lang', 'de'); } catch(e){}
    updateToggleLabels('de');
  }

  function updateToggleLabels(lang){
    var other = lang === 'en' ? 'de' : 'en';
    document.querySelectorAll('.lang-toggle').forEach(function(btn){
      var lab = btn.querySelector('.lt-label');
      if (lab) lab.textContent = other.toUpperCase();
    });
  }
  window.applyLang = applyLang; // expose so per-page scripts can call it

  // Apply persisted language. Runs immediately if DOM already parsed
  // (handles late-loaded site.js / cache-bust reinjections), otherwise
  // waits for DOMContentLoaded.
  function autoApply(){
    var lang = 'en';
    try { lang = localStorage.getItem('volt.lang') || 'en'; } catch(e){}
    if (lang !== 'en') applyLang(lang);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoApply);
  } else {
    autoApply();
  }

  // Bridge: any lang-toggle click -> flip language site-wide
  // (capture phase so we run before the legacy bubble-phase handler).
  // We do NOT dispatch voltlangchange here - the legacy handler below
  // dispatches it once, which the index.html page-specific applyLang
  // listens for. Dispatching twice would translate then untranslate.
  document.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('.lang-toggle');
    if (!btn) return;
    e.preventDefault();
    var next = window.VS_I18N.currentLang === 'en' ? 'de' : 'en';
    applyLang(next);
  }, true);
})();

/* VoltSecure - shared site scripts: mobile menu + lang toggle */
(function(){
  const burger = document.querySelector('.burger');
  const links  = document.querySelector('.nav-links');
  let menuOpen = false;
  function setMenu(open){
    menuOpen = open;
    if(!links) return;
    links.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if(!burger) return;
    burger.innerHTML = open
      ? '<span style="transform:rotate(45deg) translate(3px,3px)"></span><span style="opacity:0"></span><span style="transform:rotate(-45deg) translate(3px,-3px)"></span>'
      : '<span></span><span></span><span></span>';
  }
  if(burger && links){
    burger.addEventListener('click', () => setMenu(!menuOpen));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  /* language toggle - remembers preference, updates flag/label */
  function flagSVG(lang){
    if(lang==='de'){
      return '<svg viewBox="0 0 24 16" width="22" height="14"><rect width="24" height="5.33" y="0" fill="#000"/><rect width="24" height="5.33" y="5.33" fill="#DD0000"/><rect width="24" height="5.33" y="10.66" fill="#FFCE00"/></svg>';
    }
    return '<svg viewBox="0 0 24 16" width="22" height="14"><rect width="24" height="16" fill="#012169"/><path d="M0,0 L24,16 M24,0 L0,16" stroke="#fff" stroke-width="2.4"/><path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" stroke-width="1.2"/><path d="M12,0 V16 M0,8 H24" stroke="#fff" stroke-width="4"/><path d="M12,0 V16 M0,8 H24" stroke="#C8102E" stroke-width="2.4"/></svg>';
  }

  let currentLang = 'en';
  try { currentLang = localStorage.getItem('volt.lang') || 'en'; } catch(e){}

  function renderToggles(){
    const other = currentLang === 'en' ? 'de' : 'en';
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.innerHTML = flagSVG(other) + ' <span class="lt-label">' + other.toUpperCase() + '</span>';
    });
  }
  renderToggles();

  // Keep this listener for the SVG flag re-render only. The actual translation
  // is handled by the shared VS_I18N engine higher up which preventDefaults the
  // click in its capture-phase handler; this listener just makes sure the flag
  // icon flips immediately to show the opposite language.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-toggle');
    if(!btn) return;
    // VS_I18N has already toggled currentLang via its capture-phase handler.
    // Sync our local copy from localStorage and re-render the flag.
    try { currentLang = localStorage.getItem('volt.lang') || 'en'; } catch(e){}
    renderToggles();
    // Old per-page bridge event - kept for back-compat with the legacy
    // applyLang() in index.html that listens for voltlangchange.
    document.dispatchEvent(new CustomEvent('voltlangchange', { detail: { lang: currentLang } }));
  });
  /* projects.html - service-type filter */
  (function(){
    const grid = document.querySelector('.proj-grid');
    const buttons = document.querySelectorAll('.pf-btn');
    if(!grid || !buttons.length) return;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        buttons.forEach(b => b.classList.toggle('is-active', b===btn));
        grid.querySelectorAll('.pcard').forEach(card => {
          const services = (card.dataset.services || '').split(/\s+/);
          const show = (f === 'all') || services.includes(f);
          card.style.display = show ? '' : 'none';
        });
        if(typeof gtag === 'function') gtag('event','filter_projects',{filter:f});
      });
    });
  })();

  /* contact form - fire GA4 lead event on submit */
  (function(){
    const form = document.getElementById('contactForm');
    if(!form) return;
    form.addEventListener('submit', () => {
      if(typeof gtag === 'function'){
        gtag('event','generate_lead',{
          form: 'contact',
          service: (form.querySelector('[name=service]') || {}).value || '(unspecified)'
        });
      }
    });
  })();
})();
