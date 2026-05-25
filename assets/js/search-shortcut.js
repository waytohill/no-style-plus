(function () {
  // Press `/` from any page to jump into the search input.
  // - Already on /search/? Focus the input directly.
  // - Anywhere else? Navigate to /search/.
  // Skip when the user is typing in a form field or contenteditable element.
  function isTyping(el) {
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTyping(e.target)) return;

    const isSearchPage = window.location.pathname.replace(/\/$/, '') === '/search';
    if (isSearchPage) {
      const input = document.getElementById('search-input');
      if (input) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    } else {
      e.preventDefault();
      window.location.href = '/search/';
    }
  });
})();
