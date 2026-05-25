(function () {
  // Markdown convention reused from CommonMark:
  //   ![alt](url "caption")
  // kramdown emits <img ... title="caption"> wrapped in a <p>. We promote
  // any standalone titled image into a <figure> + <figcaption> so the
  // caption renders below the image. The title attribute is dropped to
  // suppress the browser's default tooltip (the caption now serves that role).
  const article = document.querySelector('article');
  if (!article) return;

  article.querySelectorAll('img[title]').forEach((img) => {
    if (!img.title) return;
    if (img.closest('figure')) return;

    const p = img.parentElement;
    const standalone =
      p && p.tagName === 'P' &&
      p.children.length === 1 &&
      p.textContent.trim() === '';
    if (!standalone) return;

    const fig = document.createElement('figure');
    fig.className = 'fig-image';

    const cap = document.createElement('figcaption');
    cap.textContent = img.title;

    img.removeAttribute('title');
    fig.appendChild(img);
    fig.appendChild(cap);
    p.parentNode.replaceChild(fig, p);
  });
})();
