import { boot, startGame, flush } from './engine/store.js';
import { startApp, showTitle } from './ui/app.js';

(async () => {
  const hasSave = await boot();
  showTitle(async (mode, opts) => {
    if (mode === 'new') await startGame(opts.name, opts.pace, opts.diagnostic);
    startApp();
  }, hasSave);
})();

document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
window.addEventListener('pagehide', () => flush());

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
