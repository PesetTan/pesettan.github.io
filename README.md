# The Tan Family

GitHub Pages serves `docs/` from `main` at https://www.thetanfamily.net/.

- `/`: Windswept family landing page. Edit `family/`. Sam’s card links to the résumé.
- `/sam/resume/`: Angular résumé. Edit `src/`. Its base URL and output directory are configured in `angular.json`.
- `/resume/Sam-Peset-Tan-Resume.pdf`: existing PDF download kept available for saved links. The résumé build also includes its own PDF under `/sam/resume/resume/`.
- `/inbrnd/`: existing independent content, preserved.

Run `npm ci` then `npm run build`. The build places Angular output in `docs/sam/resume/`, copies the family landing page into `docs/`, and retains the custom domain. Keep `docs/resume/` and `docs/inbrnd/` when publishing.

Preview with `python3 -m http.server 4388 --directory docs`.

The landing page's tree swallows use curved flight paths, depth projection tied to the painting's crop, and short wingbeat bursts between glides. Their routes sit deeper in the scene, so perspective makes them smaller and reduces their apparent travel; all body and wing colors blend toward a pale seasonal sky color with increasing depth. The illustration follows Cornell's tree swallow identification and foraging references linked in `family/app.js`; its flight paths are designed rather than recorded tracks. Run `node scripts/check-flight.mjs` to check path continuity, finite drawing coordinates, and pause/reduced-motion behavior.

Each full page load alternates between two season-appropriate bird scenes, remembered separately for each season per browser tab. Spring and summer alternate tree swallows and the egret; autumn alternates migrating northern pintails and the egret; winter alternates swimming/dabbling pintails and the egret. The egret makes a 12-second angled arrival, spends exactly 120 seconds probing in the marsh, departs over 10 seconds, and repeats after a 3-second empty interval. Its implementation in `family/egret.js` is preserved.

`family/seasons.js` selects meteorological seasons in `America/Los_Angeles`: March 1, June 1, September 1, and December 1. It supplies artwork, cloud assets, theme colors, and eligible birds. The palette is applied before CSS loads. A wall-clock check switches open pages at the season boundary (independent of animation pause), with additional checks on visibility and page restoration. No deployment or external API is needed for seasonal changes.

All four paintings share the same hill and shoreline registration and identical crop for both bird alternatives. Hills and terrain remain stationary. `family/atmosphere.js` draws feathered, transparent sculptural cloud banks on a separate canvas, drifting in two layers, plus the seasonal pintails. The defined foreground repeats every eight minutes; a smaller, softer distant layer repeats every eighteen minutes at roughly a third of the visible speed. Both drift in the same direction, share the scene clock, and repeat together every seventy-two minutes. Cloud banks overlap with broad smooth edge fades, dissolve into the horizon haze, and use the same periodic spacing at both ends of the loop; their cyan fringe is softened to blend into the seasonal sky. The scene animates automatically without a pause control; hidden/offscreen scenes stop drawing, and reduced motion keeps clouds and birds still. Generated artwork and its prompt set live in `family/assets/seasons/`.

Validation: `node scripts/check-flight.mjs` covers bird continuity, egret timing, seasonal selection, California date boundaries, fixed framing, pause, and live season changes. `node scripts/check-artwork.mjs` verifies matching dimensions, hill alignment, and real cloud transparency. If the local Angular LMDB cache crashes during `npm run build`, use `CI=1 npm run build` to bypass that optional local cache.

The seasonal icon beside “Coyote Hills · Close to home” quietly cycles spring → summer → autumn → winter. Only the icon is interactive, with a default cursor and no hover cue or tooltip. It remains a keyboard-accessible button with a descriptive accessible label. Manual selection lasts until reload or the next actual seasonal boundary; it is not stored.

Season icons are original inline SVG line drawings: sprout, sun, leaf, and snowflake. The adjacent “Coyote Hills” text links to the official East Bay Regional Park District page in a new tab, with an underline, small outward arrow, and pointer cursor on hover or keyboard focus. These cues apply only to the park link.

Color enhancement: the original sRGB paintings receive a small season-specific saturation/contrast lift with no change in geometry. On displays reporting `color-gamut: p3` and browsers supporting `color(display-p3 ...)`, the full coordinated theme uses the seasonal `p3Colors` palette; a faint soft-light color layer ties the sky and foreground to those same colors. Cloud pixels remain unfiltered to preserve highlight detail and alpha. Unsupported/standard-gamut displays retain the sRGB theme, and CSS responds automatically when the display capability changes. This is wide-gamut color enhancement, not an HDR remaster: source PNGs remain SDR and no extra peak luminance is claimed.

Run `node scripts/check-color.mjs` to verify both seasonal palettes, complete fallback tokens, and normal/large-text contrast. P3 rendering follows [WebKit’s Display-P3 guidance](https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/).

All interface arrows, and plus/close controls use inline SVG instead of Unicode icon characters. This prevents iOS Safari from selecting color emoji glyphs; icon strokes inherit the coordinated seasonal colors.

The closing mark uses the same Shared Roots Tan Family logo as the header. It links to `/design/` in the same tab, with a default cursor and no hover cue or tooltip; keyboard focus remains visible. The Design library is served by the separate GitHub Pages project at that existing URL.

Load performance: the landing page serves WebP delivery copies of the original seasonal PNGs. The painting is preloaded at high priority as soon as the California season is selected, before styles and animation scripts finish loading. Decorative clouds load at low priority. Originals remain available for editing and artwork registration checks. Regenerate delivery images with `python3 scripts/optimize-artwork.py` (requires Pillow); dimensions are retained and cloud alpha is verified pixel-for-pixel.
