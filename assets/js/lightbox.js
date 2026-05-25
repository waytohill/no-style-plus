(function () {
  // Click any main-content image to open it full-size over a dim overlay.
  // Skips images already wrapped in <a> (let the link navigate) and any image
  // explicitly opted out with class="no-zoom".
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<img alt="">';
  document.body.appendChild(overlay);

  const inner = overlay.querySelector('img');
  let prevOverflow = '';

  function open(src, alt) {
    inner.src = src;
    inner.alt = alt || '';
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    inner.src = '';
    document.body.style.overflow = prevOverflow;
  }

  document.addEventListener('click', (e) => {
    const img = e.target.closest('main img');
    if (!img) return;
    if (img.classList.contains('no-zoom')) return;
    if (img.closest('a')) return;
    if (img.closest('#lightbox')) return;
    e.preventDefault();
    open(img.currentSrc || img.src, img.alt);
  });

  overlay.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) close();
  });
})();
