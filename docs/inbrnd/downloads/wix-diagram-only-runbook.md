# Wix runbook: Just the circle

## Result

Shows a larger centered wheel. The hero, teaching paragraphs, closing copy, and diagram caption are hidden. Stage navigation and motion controls remain. This is the approved pink-ring design with Hairline outer labels, ivory focus, and a softly fading leading edge. Ordinary page scrolling controls assembly and reverses it.

Local review: http://localhost:5088/diagram-only/

This runbook prepares installation; the component has not yet been executed inside your Wix site. The live site has not been changed. Use a duplicate/test page first.

## Files and hosting

Unzip **inbrnd-flywheel-wix.zip** from the project's releases folder or the local review page. Inside the wix folder:

- **inbrnd-flywheel.js** — the component; its CSS is already embedded.
- **assets/editors-note-regular.woff2** and **assets/editors-note-hairline.otf** — required font files.
- **example-diagram-only.html** — a standalone example of this version.
- **page-code-diagram-only.js** — the optional Velo page code below.
- **runbooks/wix-diagram-only-runbook.md** — this guide.

The preview header, footer, and comparison controls are separate. They are not installed with the custom element; keep the existing INBRND Wix header and footer.

For the simplest reproducible setup, put **inbrnd-flywheel.js** and the **assets** directory on an HTTPS static host you control, preserving this structure:

```text
https://YOUR-ASSET-HOST/inbrnd/inbrnd-flywheel.js
https://YOUR-ASSET-HOST/inbrnd/assets/editors-note-regular.woff2
https://YOUR-ASSET-HOST/inbrnd/assets/editors-note-hairline.otf
```

**YOUR-ASSET-HOST is a placeholder, not an already-provisioned service.** No public asset hosting was created in this task. The localhost preview and owner-private ChatGPT Site are not usable asset hosts for public Wix visitors.

Verify each URL while logged out. The JS must return JavaScript rather than a sign-in or HTML page. Fonts must be accessible across origins; for these public font files, the host can return `Access-Control-Allow-Origin: *`. Serve the font types as `font/woff2` and `font/otf`. Use versioned folders for future updates so rollback stays easy.

## Add to Wix

1. In **Wix Editor**, use **Add Elements → Embed Code → Custom Element**. In **Wix Studio**, use **Add Elements → Embed & Social → Custom Element**.
2. Choose **Server URL** and enter the full HTTPS URL ending in **inbrnd-flywheel.js**.
3. Enter the exact tag name **inbrnd-flywheel**. If using the page code below, give the Wix element the ID **inbrndFlywheel**.

Wix documents these Custom Element entry points and HTTPS/domain requirements in its [Editor guide](https://support.wix.com/en/article/wix-editor-adding-a-custom-element-to-your-site) and [Studio guide](https://support.wix.com/en/article/studio-editor-adding-a-custom-element). Confirm the site's plan/domain configuration supports Custom Elements before installation.

### Alternative: host the JavaScript with Velo

Choose **Velo file** as the element source and replace the sample custom-element code with the contents of **inbrnd-flywheel.js**. Keep the tag name above. This avoids external JS hosting, but **asset-base still needs a public HTTPS directory containing the two fonts**. Font upload in Wix's typography picker alone does not configure this custom element's font URLs. [Wix's Velo setup guide](https://dev.wix.com/docs/velo/velo-only-apis/%24w/custom-element/add-a-custom-element)

## Configure this version

Use **Set Attributes** on the element, or use the Velo code below. All values are strings.

| Attribute | Value |
| --- | --- |
| asset-base | Your real HTTPS font directory, ending in `/` |
| variant | wheel |
| emphasis | ring |
| content-mode | diagram |
| heading-level | 2 |
| header-offset | 0 if no sticky header; otherwise its measured height in CSS pixels |

Omit **theme** for the approved ivory/pink palette. Only `content-mode="diagram"` hides the copy; `teaching` shows it.

```js
$w.onReady(() => {
  const wheel = $w('#inbrndFlywheel');
  wheel.setAttribute('asset-base', 'https://YOUR-ASSET-HOST/inbrnd/assets/');
  wheel.setAttribute('variant', 'wheel');
  wheel.setAttribute('emphasis', 'ring');
  wheel.setAttribute('content-mode', 'diagram');
  wheel.setAttribute('heading-level', '2');
  wheel.setAttribute('header-offset', '0');
});
```

Replace the asset URL and header offset before publishing. `heading-level="2"` assumes the Wix page already has its own main heading. Set it to `1` only if this component supplies the page's primary heading; this setting has no visible effect when the copy is hidden. Wix supports configuring custom elements through [setAttribute](https://dev.wix.com/docs/velo/velo-only-apis/%24w/custom-element/set-attribute).

## Size the section for scrolling

Place the element in normal page flow, spanning the section width. The component manages its own sticky diagram and responsive layout. Do not pin the entire Wix element, add scroll snapping, or nest it inside an HTML iframe with a separate scrollbar.

The host section must grow with the component's full content height. In Studio, use content-driven/Auto or Hug sizing **where the selected element exposes it**, with a responsive width. Avoid proportional scaling. Wix's available sizing controls vary by element; see [Studio sizing](https://support.wix.com/en/article/studio-editor-setting-the-size-of-your-elements).

The scroll story is intentionally taller than one screen: about 5.75 viewport heights on desktop or 7 on mobile, before the additional content. Do not set the whole element to one viewport tall. If Wix gives it a fixed-height wrapper, inspect that wrapper on the published test page and correct its sizing before continuing. A fixed pixel estimate is not a reliable cross-device solution. This parent-container behavior remains the installation-specific verification step.

For a sticky Wix header, set `header-offset` to its real height and check phone/tablet header variations. Check that parent overflow or Wix animations do not prevent the internal frame from sticking.

## Test before replacing the current section

Use a **published test page/site**, not just the editor Preview. Wix renders Custom Elements in an iframe in editor/Preview, which can change scrolling behavior. [Wix preview limitation](https://support.wix.com/en/article/wix-editor-adding-a-custom-element-to-your-site)

Expected first impression: The section begins with the quiet diagram foundation. Scroll to assemble the five parts. No hero, teaching paragraphs, caption, or closing text should appear.

- Confirm both font files and the JavaScript load for a logged-out visitor.
- Check the clockwise order: Positioning → Narrative → Platforms → Opportunities → Signals → Positioning.
- Inspect a partly drawn ring segment, its solid advancing edge, and a partially drawn connecting arrow.
- Complete the circle; both curved outer labels should appear with balanced spacing.
- Scroll upward to confirm precise reversal and verify the frame releases before the next Wix section.
- Test desktop, tablet, 390px and 320px phones, and landscape. Look for clipping, overlapping sections, or nested scrollbars.
- Use keyboard Tab/Enter on stage controls and try **Read without motion**. With reduced motion enabled, the full wheel should be stable.
- Reload midway through the story and check that the diagram matches the restored scroll position.

## Troubleshooting and rollback

| Symptom | Check |
| --- | --- |
| Blank element | HTTPS source URL, correct tag name, Custom Element eligibility, and JS response content. |
| Default-looking fonts | Exact asset-base path, both font files, and font CORS headers. |
| Whole story moves away instead of sticking | Test published behavior; inspect ancestor overflow, transforms, fixed heights, and whether the outer element was pinned. |
| Next Wix section overlaps the wheel | The host wrapper has not expanded to the component's content height. Correct that layout before launch. |
| Header covers labels | Set the actual header-offset and retest that breakpoint. |
| Wrong copy mode | Verify content-mode is `diagram` and no later page code overwrites it. |
| Full static wheel instead of animation | Check reduced-motion preference or the Read without motion control. Short landscape screens also use an unpinned layout. |

Keep the old Wix section recoverable until the new section passes the checks. To roll back, restore the prior section and remove/hide the custom element, or point it back to the previous versioned JS/assets folder. Do not overwrite the only copy of the previous release.

## Delivery validation

Local component checks and screenshots are recorded in docs/inbrnd-flywheel-plan.md. Published Wix execution, public asset deployment, and final parent-container sizing are still pending. This guide does not claim those steps have already passed.


## October 20 refinement

The five-stage system completes at 80% of the existing scroll travel. The teaching version reveals “As authority and recognition compound, career momentum grows.” between 80% and 85%, then holds the completed composition through 100%. The outer ring changes uniformly from soft pink to burgundy and grows from 12 to 13 SVG units. Its lower label is Career Momentum. The circle-only version retains no visible explanatory copy.

Stage emphasis uses solid color and opacity. There is no scaling, gradient highlight, scroll interception, or time-driven animation. Reduced motion and short screens display the complete system in normal flow.

The standalone HTML examples include the complete static diagram and five explanations before JavaScript initializes; they also work if the component script fails. A Wix Editor custom element does not automatically inherit this surrounding HTML, so the equivalent host-page fallback must be validated during Wix installation.

Public preview: https://pesettan.github.io/inbrnd/

Before and after: https://pesettan.github.io/inbrnd/comparison/

Preserved original: https://pesettan.github.io/inbrnd/before/

Wix installation and physical-device testing are not implied by GitHub Pages validation.

## October 2026 brand alignment

The bundle reuses the existing Editor’s Note Regular and Hairline font files. Shared neutral tokens now use Paper `#FBFAF7`, Introspection `#2F2D2E`, Courage `#555555`, Margin `#DDD9D4`, and Reflection `#FCF1F1`. The approved flywheel progression remains `#D5A5B1` to `#945267`; the prototype’s circular composition and serif/sans hierarchy take priority over other guideline examples. Body descriptions use 20px on roomy desktop layouts and 18px on compact/mobile layouts, with 1.5 line height and 0.02em tracking. The preserved Before page retains its original styling.
