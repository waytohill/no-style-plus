(function () {
  // Pull the current page's hit count from GoatCounter's public counter
  // endpoint and drop it into the post-meta line.
  //
  // Requires GoatCounter site setting "Public access" to be enabled
  // (Counter-only is enough). Otherwise the endpoint returns 403 + no CORS
  // headers and the browser blocks the response — we silently hide the
  // placeholder in that case so the page still looks clean.
  const slot = document.querySelector('[data-view-count]');
  if (!slot) return;

  const site = slot.getAttribute('data-gc-site');
  if (!site) return;

  const path = window.location.pathname;
  const url = `https://${site}.goatcounter.com/counter/${encodeURIComponent(path)}.json`;

  fetch(url, { mode: 'cors', credentials: 'omit' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data) return;
      const n = data.count_unique ?? data.count;
      if (n == null) return;
      slot.textContent = ` · ${n} views`;
    })
    .catch(() => {
      // CORS / 403 / network — leave the slot empty.
    });
})();
