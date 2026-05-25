(function () {
  // Hairline reading-progress bar pinned to the top of the viewport.
  // Width is driven by transform: scaleX so we never trigger layout/paint
  // outside the bar itself.
  const bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let rafId = 0;

  function update() {
    rafId = 0;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.max(0, Math.min(1, window.scrollY / total)) : 0;
    bar.style.transform = 'scaleX(' + pct + ')';
  }

  function schedule() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
})();
