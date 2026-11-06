// Refresh calendar boundaries and selections made in another page or tab.
(() => {
  const sync = () => window.SeasonScene.syncTheme();
  setInterval(sync, 1000);
  document.addEventListener('visibilitychange', sync);
})();
