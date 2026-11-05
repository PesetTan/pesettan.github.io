# The Tan Family

GitHub Pages serves `docs/` from `main` at https://www.thetanfamily.net/.

- `/`: Windswept family landing page. Edit `family/`. Sam’s card links to the résumé.
- `/sam/resume/`: Angular résumé. Edit `src/`. Its base URL and output directory are configured in `angular.json`.
- `/resume/Sam-Peset-Tan-Resume.pdf`: existing PDF download kept available for saved links. The résumé build also includes its own PDF under `/sam/resume/resume/`.
- `/inbrnd/`: existing independent content, preserved.

Run `npm ci` then `npm run build`. The build places Angular output in `docs/sam/resume/`, copies the family landing page into `docs/`, and retains the custom domain. Keep `docs/resume/` and `docs/inbrnd/` when publishing.

Preview with `python3 -m http.server 4388 --directory docs`.
