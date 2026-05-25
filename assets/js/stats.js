(function () {
  // Aggregate per-post view counts from GoatCounter's public counter
  // endpoint and render a simple text bar chart sorted by hit count.
  // Posts list comes from /search.json so we don't need a second data
  // source. Failure (CDN unreachable, GC blocked) shows an explanatory
  // message instead of a half-empty list.
  const list = document.getElementById('stats-list');
  const info = document.getElementById('stats-info');
  if (!list || !info) return;

  // Read the GoatCounter site slug from the element's data attribute,
  // which is rendered by Jekyll from site.goat_counter in stats.md.
  const SITE = list.getAttribute('data-gc-site') || '';
  if (!SITE) {
    info.textContent = 'GoatCounter not configured (set goat_counter in _config.yml).';
    return;
  }

  const TOTAL_PATH = 'TOTAL';

  function counterUrl(path) {
    return `https://${SITE}.goatcounter.com/counter/${encodeURIComponent(path)}.json`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  let lastError = null;

  async function fetchCount(path) {
    try {
      const r = await fetch(counterUrl(path), { mode: 'cors', credentials: 'omit' });
      if (!r.ok) {
        if (r.status === 403) lastError = 'forbidden';
        else lastError = lastError || 'http';
        return 0;
      }
      const data = await r.json();
      return data.count_unique ?? data.count ?? 0;
    } catch (e) {
      lastError = lastError || 'cors';
      return 0;
    }
  }

  function failureMessage() {
    if (lastError === 'forbidden' || lastError === 'cors') {
      return 'Stats unavailable. Enable "Public access" (Counter only) in ' +
        `<a href="https://${SITE}.goatcounter.com/settings/main" rel="noreferrer">` +
        `GoatCounter settings</a>.`;
    }
    return 'No data available (API unreachable).';
  }

  async function load() {
    const idxResp = await fetch('/search.json', { cache: 'no-cache' }).catch(() => null);
    if (!idxResp || !idxResp.ok) {
      info.textContent = 'Could not load post list.';
      return;
    }
    const posts = await idxResp.json();

    const totalPromise = fetchCount(TOTAL_PATH);
    const countPromises = posts.map((p) => fetchCount(p.url).then((c) => ({ post: p, count: c })));
    const total = await totalPromise;
    const rows = await Promise.all(countPromises);

    rows.sort((a, b) => b.count - a.count);
    const max = rows.reduce((m, r) => Math.max(m, r.count), 0);
    const allZero = max === 0;

    info.innerHTML = allZero
      ? failureMessage()
      : `<strong>${posts.length}</strong> posts · <strong>${total}</strong> total views (sorted by unique visitors)`;

    list.innerHTML = rows.map(({ post, count }) => {
      const pct = max > 0 ? Math.max(2, (count / max) * 100) : 0;
      return [
        '<li>',
        `  <span class="stats-bar" style="width: ${pct.toFixed(1)}%"></span>`,
        `  <a class="stats-title" href="${escapeHtml(post.url)}">${escapeHtml(post.title)}</a>`,
        `  <span class="stats-num">${count}</span>`,
        '</li>',
      ].join('');
    }).join('');
  }

  load();
})();
