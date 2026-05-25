(function () {
  const headings = document.querySelectorAll('article h2[id], article h3[id]');
  headings.forEach((h) => {
    if (h.querySelector('.anchor-link')) return;
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.className = 'anchor-link';
    a.textContent = '#';
    a.setAttribute('aria-label', 'Copy anchor link');
    a.addEventListener('click', (e) => {
      if (navigator.clipboard) {
        const url = window.location.origin + window.location.pathname + '#' + h.id;
        navigator.clipboard.writeText(url).catch(() => {});
      }
    });
    h.appendChild(a);
  });
})();
