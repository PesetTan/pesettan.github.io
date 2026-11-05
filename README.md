# The Tan Family

GitHub Pages serves `docs/` from `main` at https://www.thetanfamily.net/.

- `/`: Windswept family landing page. Edit `family/`. Sam’s card links to the résumé.
- `/sam/resume/`: Angular résumé. Edit `src/`. Its base URL and output directory are configured in `angular.json`.
- `/resume/Sam-Peset-Tan-Resume.pdf`: existing PDF download kept available for saved links. The résumé build also includes its own PDF under `/sam/resume/resume/`.
- `/inbrnd/`: existing independent content, preserved.

Run `npm ci` then `npm run build`. The build places Angular output in `docs/sam/resume/`, copies the family landing page into `docs/`, and retains the custom domain. Keep `docs/resume/` and `docs/inbrnd/` when publishing.

Preview with `python3 -m http.server 4388 --directory docs`.

The landing page's tree swallows use curved flight paths, depth projection tied to the painting's crop, and short wingbeat bursts between glides. The illustration follows Cornell's tree swallow identification and foraging references linked in `family/app.js`; its flight paths are designed rather than recorded tracks. Run `node scripts/check-flight.mjs` to check path continuity, finite drawing coordinates, and pause/reduced-motion behavior.

Each full page load alternates between swallows and an egret, remembered per browser tab with session storage. The egret makes a 12-second angled arrival, spends exactly 120 seconds probing in the marsh, departs over 10 seconds, and repeats after a 3-second empty interval. The animation clock pauses when the page is hidden, offscreen, or explicitly paused. Reduced motion starts paused. `family/egret.js` owns the pose and sequence drawing; the marsh anchor follows the painting’s crop.
