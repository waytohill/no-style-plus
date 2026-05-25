(function () {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const info = document.getElementById('search-info');
  if (!input || !results || !info) return;

  const HISTORY_KEY = 'search-history';
  const HISTORY_MAX = 5;

  const indexPromise = fetch('/search.json', { cache: 'no-cache' })
    .then((r) => r.json())
    .catch(() => null);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function loadHistory() {
    try {
      const v = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (_) {
      return [];
    }
  }

  function saveHistory(q) {
    if (!q) return;
    const list = loadHistory().filter((x) => x !== q);
    list.unshift(q);
    if (list.length > HISTORY_MAX) list.length = HISTORY_MAX;
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (_) {}
  }

  function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY); } catch (_) {}
  }

  function renderHistory() {
    const history = loadHistory();
    if (!history.length) {
      results.innerHTML = '';
      info.textContent = '';
      return;
    }
    info.innerHTML = 'Recent searches · <a href="#" id="search-history-clear">clear</a>';
    results.innerHTML = history
      .map((q) => {
        const safe = escapeHtml(q);
        return '<li class="search-history-item">' +
          '<a href="?q=' + encodeURIComponent(q) + '">' + safe + '</a>' +
          '</li>';
      })
      .join('');
    const clearLink = document.getElementById('search-history-clear');
    if (clearLink) {
      clearLink.addEventListener('click', (e) => {
        e.preventDefault();
        clearHistory();
        renderHistory();
      });
    }
  }

  function buildSnippet(content, tokens) {
    if (!content || !tokens.length) return '';
    const lower = content.toLowerCase();
    let bestPos = -1;
    for (const t of tokens) {
      if (!t) continue;
      const p = lower.indexOf(t);
      if (p !== -1 && (bestPos === -1 || p < bestPos)) bestPos = p;
    }
    if (bestPos === -1) return '';

    const win = 60;
    const start = Math.max(0, bestPos - win);
    const end = Math.min(content.length, bestPos + win + 20);
    let raw = content.slice(start, end);
    if (start > 0) raw = '…' + raw;
    if (end < content.length) raw = raw + '…';

    let html = escapeHtml(raw);
    const parts = tokens.map(escapeRegex).filter(Boolean);
    if (parts.length) {
      const re = new RegExp('(' + parts.join('|') + ')', 'gi');
      html = html.replace(re, '<mark>$1</mark>');
    }
    return html;
  }

  async function runSearch(q) {
    q = q.trim().toLowerCase();
    if (!q) {
      renderHistory();
      return;
    }

    const data = await indexPromise;
    if (!data) {
      info.textContent = 'Failed to load index.';
      return;
    }

    const tokens = q.split(/\s+/).filter(Boolean);
    const matches = data.filter((post) => {
      const haystack = [
        post.title,
        post.description,
        post.content,
        (post.tags || []).join(' '),
        (post.categories || []).join(' ')
      ].join(' ').toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });

    info.textContent = matches.length === 0
      ? 'No results.'
      : matches.length + ' result(s).';

    if (matches.length > 0) saveHistory(q);

    results.innerHTML = matches
      .map((post) => {
        const title = escapeHtml(post.title).toLowerCase();
        const snippet = buildSnippet(post.content || '', tokens);
        return '<li>' +
          '<span>' + escapeHtml(post.date) + '</span> ' +
          '<a href="' + escapeHtml(post.url) + '">' + title + '</a>' +
          (snippet ? '<div class="search-snippet">' + snippet + '</div>' : '') +
          '</li>';
      })
      .join('');
  }

  let timer;
  input.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(e.target.value), 120);
  });

  const urlQ = new URLSearchParams(location.search).get('q');
  if (urlQ) {
    input.value = urlQ;
    runSearch(urlQ);
  } else {
    renderHistory();
  }
})();
