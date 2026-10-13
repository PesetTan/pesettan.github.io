// Paste into the Wix page code after replacing the asset URL and header offset.
$w.onReady(() => {
  const wheel = $w('#inbrndFlywheel');
  wheel.setAttribute('asset-base', 'https://pesettan.github.io/inbrnd/assets/');
  wheel.setAttribute('variant', 'wheel');
  wheel.setAttribute('emphasis', 'ring');
  wheel.setAttribute('content-mode', 'teaching');
  wheel.setAttribute('heading-level', '2');
  wheel.setAttribute('header-offset', '0');
});
