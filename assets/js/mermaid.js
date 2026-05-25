(function () {
  // Render fenced ```mermaid blocks via mermaid.js, lazy-loaded only when at
  // least one such block exists on the page.
  //
  // We use the high-level mermaid.run() API: convert each kramdown wrapper
  // (<div class="language-mermaid">...) into a plain <div class="mermaid">
  // containing the source text, then ask mermaid.run({ nodes }) to render
  // each in place. While the script is in flight the text shows in a dashed
  // box so a CDN failure doesn't leave the reader staring at a blank gap.
  const article = document.querySelector('article');
  if (!article) return;

  const blocks = Array.from(article.querySelectorAll('div.language-mermaid'));
  if (!blocks.length) return;

  const stubs = blocks.map((wrapper) => {
    const code = wrapper.querySelector('code');
    const source = (code ? code.textContent : '').trim();
    const stub = document.createElement('div');
    stub.className = 'mermaid mermaid-pending';
    stub.textContent = source;
    wrapper.parentNode.replaceChild(stub, wrapper);
    return stub;
  });

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  script.async = true;

  script.addEventListener('load', async () => {
    if (!window.mermaid) {
      console.error('[mermaid] script loaded but window.mermaid undefined');
      return;
    }
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
        flowchart: { htmlLabels: true },
      });
      await window.mermaid.run({ nodes: stubs });
      stubs.forEach((s) => s.classList.remove('mermaid-pending'));
    } catch (err) {
      console.error('[mermaid] render failed:', err);
    }
  });

  script.addEventListener('error', () => {
    console.error('[mermaid] failed to load mermaid.min.js from CDN');
  });

  document.body.appendChild(script);
})();
