(function () {
  // Vim-style j/k navigation across listing pages.
  // Activates whenever the page contains <ul.archive-list> or the search
  // results list. j moves cursor down, k up, Enter opens, Esc clears.
  // Suppressed while focus is in a form field or contenteditable element so
  // typing the letter j or k inside the search box still works normally.
  const lists = document.querySelectorAll('ul.archive-list, ul#search-results');
  if (!lists.length) return;

  const items = [];
  lists.forEach((ul) => {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const link = li.querySelector('a[href]');
      if (link) items.push({ li, link });
    });
  });
  if (!items.length) return;

  let cursor = -1;

  function setCursor(i) {
    if (cursor >= 0 && items[cursor]) {
      items[cursor].li.classList.remove('kb-cursor');
    }
    cursor = Math.max(-1, Math.min(items.length - 1, i));
    if (cursor >= 0) {
      items[cursor].li.classList.add('kb-cursor');
      items[cursor].li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function isTyping(el) {
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTyping(e.target)) return;

    if (e.key === 'j' || e.key === 'J') {
      e.preventDefault();
      setCursor(cursor < 0 ? 0 : cursor + 1);
    } else if (e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      setCursor(cursor < 0 ? items.length - 1 : cursor - 1);
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      items[cursor].link.click();
    } else if (e.key === 'Escape' && cursor >= 0) {
      setCursor(-1);
    }
  });

  // Re-scan when the search page mutates the results list.
  const searchResults = document.getElementById('search-results');
  if (searchResults) {
    new MutationObserver(() => {
      items.length = 0;
      lists.forEach((ul) => {
        ul.querySelectorAll(':scope > li').forEach((li) => {
          const link = li.querySelector('a[href]');
          if (link) items.push({ li, link });
        });
      });
      cursor = -1;
    }).observe(searchResults, { childList: true });
  }
})();
