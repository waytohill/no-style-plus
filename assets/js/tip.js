(function () {
  // Single floating tooltip element used by both:
  //   1. .tip-host > .tip elements (data-driven, e.g. menu hovers)
  //   2. Internal post links (data fetched from /search.json once on load)
  //
  // The tooltip's top-left anchors at the cursor and follows mouse movement,
  // flipping to the opposite side when it would overflow the viewport.
  // pointer-events: none keeps it from stealing hover state from neighbors.
  const tip = document.createElement('div');
  tip.id = 'global-tip';
  tip.setAttribute('role', 'tooltip');
  tip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tip);

  const PAD = 8;
  const OFFSET = 6;
  const CAP_W = 420;
  const CAP_H = 340;

  let activeTrigger = null;
  let lastX = 0;
  let lastY = 0;
  let rafId = 0;

  // Best-effort fetch of the post index. Failure silently disables link
  // previews — .tip-host hovers keep working regardless.
  let postIndex = null;
  fetch('/search.json', { cache: 'default' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!Array.isArray(data)) return;
      postIndex = new Map();
      data.forEach((p) => {
        if (p && p.url) postIndex.set(p.url, p);
      });
    })
    .catch(() => {});

  function applyCaps() {
    tip.style.maxWidth = Math.min(CAP_W, window.innerWidth - 2 * PAD) + 'px';
    tip.style.maxHeight = Math.min(CAP_H, window.innerHeight - 2 * PAD) + 'px';
  }

  function position(x, y) {
    const rect = tip.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    let left = x + OFFSET;
    let top = y + OFFSET;

    if (left + w + PAD > window.innerWidth) {
      const flipped = x - w - OFFSET;
      left = flipped >= PAD ? flipped : Math.max(PAD, window.innerWidth - w - PAD);
    }
    if (top + h + PAD > window.innerHeight) {
      const flipped = y - h - OFFSET;
      top = flipped >= PAD ? flipped : Math.max(PAD, window.innerHeight - h - PAD);
    }

    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function schedulePosition() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      position(lastX, lastY);
    });
  }

  function showHTML(html, x, y) {
    if (!html || !html.trim()) return;
    tip.innerHTML = html;
    applyCaps();
    tip.classList.add('visible');
    tip.setAttribute('aria-hidden', 'false');
    lastX = x;
    lastY = y;
    schedulePosition();
  }

  function hide() {
    tip.classList.remove('visible');
    tip.setAttribute('aria-hidden', 'true');
    activeTrigger = null;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function buildLinkPreview(meta) {
    const title = escapeHtml(meta.title || '');
    const date = escapeHtml(meta.date || '');
    const tags = Array.isArray(meta.tags) ? meta.tags : [];
    const cats = Array.isArray(meta.categories) ? meta.categories : [];
    let desc = (meta.description || '').trim();
    if (!desc && meta.content) {
      const raw = String(meta.content).replace(/\s+/g, ' ').trim();
      desc = raw.slice(0, 160);
      if (raw.length > desc.length) desc += '…';
    }
    desc = escapeHtml(desc);

    const metaParts = [];
    if (date) metaParts.push(date);
    if (cats.length) metaParts.push(cats.map((c) => escapeHtml(c)).join(', '));
    if (tags.length) metaParts.push(tags.map((t) => '#' + escapeHtml(t)).join(' '));

    return [
      '<div class="link-preview">',
      '<div class="lp-title">', title, '</div>',
      metaParts.length ? '<div class="lp-meta">' + metaParts.join(' · ') + '</div>' : '',
      desc ? '<div class="lp-desc">' + desc + '</div>' : '',
      '</div>'
    ].join('');
  }

  function pathFromHref(href) {
    if (!href) return null;
    try {
      const u = new URL(href, window.location.href);
      if (u.origin !== window.location.origin) return null;
      return u.pathname;
    } catch (_) {
      return null;
    }
  }

  document.addEventListener('mouseover', (e) => {
    // 1. .tip-host wins (existing behavior — sidebar, menu items)
    const host = e.target.closest('.tip-host');
    if (host) {
      if (host === activeTrigger) return;
      activeTrigger = host;
      const src = host.querySelector(':scope > .tip');
      if (src && src.innerHTML.trim()) {
        showHTML(src.innerHTML, e.clientX, e.clientY);
      } else {
        hide();
      }
      return;
    }

    // 2. internal post-link preview (search results, related posts, archive,
    //    in-prose links — anything pointing at a known post URL)
    if (!postIndex) return;
    const a = e.target.closest('a[href]');
    if (!a) return;
    if (a.closest('.tip-host')) return;
    const path = pathFromHref(a.getAttribute('href'));
    if (!path) return;
    if (path === window.location.pathname) return;
    const meta = postIndex.get(path);
    if (!meta) return;
    if (a === activeTrigger) return;
    activeTrigger = a;
    showHTML(buildLinkPreview(meta), e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', (e) => {
    if (!activeTrigger) return;
    if (typeof activeTrigger.contains === 'function' &&
        !activeTrigger.contains(e.target) &&
        activeTrigger !== e.target) {
      hide();
      return;
    }
    lastX = e.clientX;
    lastY = e.clientY;
    schedulePosition();
  });

  document.addEventListener('mouseleave', hide);
  window.addEventListener('blur', hide);
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', () => {
    if (activeTrigger) {
      applyCaps();
      schedulePosition();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
})();
