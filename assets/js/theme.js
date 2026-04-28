// Manual theme toggle. Persists choice in localStorage and overrides the
// system preference (which is the default until the user explicitly picks).
(function () {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;

  var root = document.documentElement;
  var mql = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return mql.matches ? 'dark' : 'light';
  }

  function syncPressed() {
    btn.setAttribute('aria-pressed', currentTheme() === 'dark' ? 'true' : 'false');
  }

  btn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    syncPressed();
  });

  mql.addEventListener('change', syncPressed);
  syncPressed();
})();
