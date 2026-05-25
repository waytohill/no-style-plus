(function () {
  const pres = document.querySelectorAll('article pre');
  pres.forEach((pre) => {
    const container = pre.closest('div.highlighter-rouge') || pre;
    if (container.querySelector(':scope > .copy-code-btn')) return;
    const code = pre.querySelector('code') || pre;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-code-btn';
    btn.textContent = '[copy]';
    btn.setAttribute('aria-label', 'Copy code');

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const text = code.innerText;
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }
      btn.textContent = ok ? '[copied]' : '[failed]';
      setTimeout(() => { btn.textContent = '[copy]'; }, 1500);
    });

    container.appendChild(btn);
  });
})();
