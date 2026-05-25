(function () {
  // Set loading="lazy" on every main-content image that doesn't already
  // declare a loading mode. Browsers default to eager loading; this defers
  // off-screen images until they near the viewport. Skips images already
  // explicitly marked (so a writer can opt-in to eager with loading="eager").
  document.querySelectorAll('main img:not([loading])').forEach((img) => {
    img.loading = 'lazy';
  });
})();
