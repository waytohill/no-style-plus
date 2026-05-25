(function () {
  // Cycle the page theme between auto / light / dark via the body[a]
  // attribute that the SCSS dark-appearance mixin keys off of. The user's
  // choice persists in localStorage; on first visit we leave the body
  // attribute alone so the existing site.theme_config.appearance default
  // (typically "auto") wins.
  const KEY = 'theme';
  const ORDER = ['auto', 'light', 'dark'];
  const LABEL = { auto: 'auto', light: 'light', dark: 'dark' };

  // Apply saved preference before painting if any.
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) { /* private mode */ }
  if (saved && ORDER.includes(saved)) {
    document.body.setAttribute('a', saved);
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Toggle theme (auto/light/dark)');

  function current() {
    const v = document.body.getAttribute('a');
    return ORDER.includes(v) ? v : 'auto';
  }

  function refresh() {
    const cur = current();
    btn.textContent = LABEL[cur];
    btn.title = 'Theme: ' + cur + ' (click to cycle)';
  }

  btn.addEventListener('click', () => {
    const cur = current();
    const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
    document.body.setAttribute('a', next);
    try { localStorage.setItem(KEY, next); } catch (_) {}
    refresh();
  });

  document.body.appendChild(btn);
  refresh();
})();
