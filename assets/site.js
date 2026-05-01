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

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-toggle');
    if(!btn) return;
    currentLang = currentLang === 'en' ? 'de' : 'en';
    try { localStorage.setItem('volt.lang', currentLang); } catch(e){}
    document.documentElement.lang = currentLang;
    renderToggles();
    // Fire a custom event so pages can do their own translation swap if they want
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
