(function () {
  // GitHub-style admonitions / callouts.
  //
  // Source markdown:
  //   > [!NOTE]
  //   > Useful information.
  //
  // kramdown renders that as a plain <blockquote>. We post-process: detect
  // the [!TYPE] marker in the first paragraph, strip it, replace with a
  // labelled header, and add a callout-<type> class for styling hooks.
  const article = document.querySelector('article');
  if (!article) return;

  const TYPES = {
    note:      'NOTE',
    tip:       'TIP',
    important: 'IMPORTANT',
    warning:   'WARNING',
    caution:   'CAUTION'
  };
  const RE = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>|\n)?/i;

  article.querySelectorAll('blockquote').forEach((bq) => {
    const firstP = bq.querySelector('p');
    if (!firstP) return;

    const html = firstP.innerHTML;
    const m = html.match(RE);
    if (!m) return;

    const type = m[1].toLowerCase();
    bq.classList.add('callout', 'callout-' + type);

    firstP.innerHTML = html.replace(RE, '');

    const label = document.createElement('p');
    label.className = 'callout-label';
    label.textContent = TYPES[type] || type.toUpperCase();
    bq.insertBefore(label, firstP);

    // If the first paragraph is now empty (the marker was on its own line),
    // drop it so the layout doesn't get an awkward blank.
    if (!firstP.innerHTML.replace(/&nbsp;|\s/g, '').length) {
      firstP.remove();
    }
  });
})();
