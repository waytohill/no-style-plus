(function () {
  // Tufte-style sidenotes (progressive enhancement).
  //
  // kramdown emits each footnote as an inline <sup id="fnref:N"><a href="#fn:N">N</a></sup>
  // marker plus an <li id="fn:N"> entry inside <div class="footnotes"> at the
  // article tail. We don't change either output — we just clone the body of
  // every footnote next to its inline reference as an <aside class="sidenote">.
  // CSS floats the asides into the right margin on wide viewports and hides
  // them on narrow ones, where the original tail block remains the canonical
  // rendering. Clicks on the inline marker keep working in both modes.
  const article = document.querySelector('article');
  if (!article) return;

  const refs = article.querySelectorAll('sup[id^="fnref:"]');
  if (!refs.length) return;

  refs.forEach((sup) => {
    if (sup.nextElementSibling && sup.nextElementSibling.classList &&
        sup.nextElementSibling.classList.contains('sidenote')) {
      return;
    }

    const link = sup.querySelector('a[href^="#fn:"]');
    if (!link) return;

    const fnId = link.getAttribute('href').slice(1);
    const fnLi = document.getElementById(fnId);
    if (!fnLi) return;

    const clone = fnLi.cloneNode(true);
    clone.querySelectorAll('a.reversefootnote').forEach((el) => el.remove());

    const aside = document.createElement('aside');
    aside.className = 'sidenote';
    aside.setAttribute('role', 'note');

    const num = document.createElement('span');
    num.className = 'sidenote-num';
    num.textContent = link.textContent.trim();
    aside.appendChild(num);

    const inner = clone.querySelector('p') || clone;
    while (inner.firstChild) {
      aside.appendChild(inner.firstChild);
    }

    sup.parentNode.insertBefore(aside, sup.nextSibling);
  });
})();
