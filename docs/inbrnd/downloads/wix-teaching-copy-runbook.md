# INBRND Wix installation: Flywheel with stage explanations

## Current component scope

The JavaScript renders only the flywheel section. In teaching mode, this means the assembling diagram, active-stage heading/question/description, and the final payoff sentence. Version A — Minimal hides the explanations and retains the final payoff sentence. A small Read without motion control is retained. There is no introduction, closing section, site header/footer, stage-navigation row, or small diagram caption in the component.

Use the existing Wix page for all surrounding headings, introductory copy, navigation, and closing content. The standalone examples contain only the component, so they show the intended embed boundary.

## Install

1. Use a duplicate or test Wix page. Add a Custom Element and set its tag exactly to `inbrnd-flywheel`.
2. Select a Velo custom-element file and paste the complete `wix/inbrnd-flywheel.js` into that file. The separate `page-code-teaching-copy.js` is only configuration; it is not the component source.
3. Alternatively choose Server URL and use `https://pesettan.github.io/inbrnd/inbrnd-flywheel.js`.
4. Set these attributes:

| Attribute | Value |
| --- | --- |
| asset-base | `https://pesettan.github.io/inbrnd/assets/` |
| content-mode | `teaching` |
| variant | `wheel` |
| emphasis | `ring` |
| heading-level | `2`, or the correct level within the Wix page |
| header-offset | Sticky header height in CSS pixels; default `0` |

5. Let the element fill the section width and grow with its content. Do not fix the entire element to one screen, clip it, or place it in a separately scrolling HTML iframe. Leave ancestor overflow compatible with sticky positioning.
6. Test the published Wix page while logged out. Wix Editor/Preview can wrap custom elements differently, so it is not proof of the installed scroll behavior.

## Responsive behavior

The layout follows the actual component width. Wider sections keep the explanation and wheel side by side; sections at 900px or narrower stack the wheel above the copy. Spacing and type scale use the component width. The SVG stays circular, and label/arrow clearance is recalculated after fonts and resizing.

Short viewports (480px available height or less, or under 680px for narrow sections), reduced motion, and manual Read without motion use the complete unpinned framework. Document touch scrolling remains native.

The existing scroll travel is retained: 475 viewport heights of travel for wide sections and 600 for narrow sections, plus the pinned viewport. The system completes at 80%, the payoff in both versions appears at 80–85%, and the final 15% holds the completed view. Upward scrolling reverses the same clock.

## Fonts and colors

The component reuses Editor’s Note Regular and Hairline. Asset URLs must be public HTTPS with appropriate font CORS. Neutrals use Paper `#FBFAF7`, Introspection `#2F2D2E`, Courage `#555555`, Margin `#DDD9D4`, and Reflection `#FCF1F1`. Approved ring endpoints remain `#D5A5B1` to `#945267`, with stroke 12–13 SVG units.

## Verification and fallback

Check forward/reverse scrolling, completion/hold/release, desktop/tablet/mobile widths, short landscape, narrow containers, keyboard focus, reduced motion, Read without motion, font loading, and reload midway. Verify header offset and parent sizing on the actual published Wix test page.

Standalone examples contain a complete light-DOM fallback before JavaScript initializes. A bare Wix custom element does not automatically inherit that surrounding HTML; provide and verify equivalent host-page fallback content during installation.

[Section-only preview](https://pesettan.github.io/inbrnd/embed/) · [Both modes](https://pesettan.github.io/inbrnd/versions/) · [Preserved original](https://pesettan.github.io/inbrnd/before/) · [Package](https://pesettan.github.io/inbrnd/downloads/inbrnd-flywheel-wix.zip)

Only the INBRND GitHub Pages subtree is published by this delivery. Live Wix installation, parent-container behavior, physical-device performance, and native browser 200% zoom remain separate validation steps.

## Final UX polish

The five-stage narrative, scroll duration, ring progression, and approved sentence reveal are unchanged. The final pass keeps stage explanations readable at handoffs, avoids repeated font/diagram measurements during steady scrolling, and slightly increases diagram text in sections at 360px or narrower. The working pre-polish version is preserved at `/inbrnd/pre-polish/`, with a comparison at `/inbrnd/polish-comparison/`.

Phone typography uses responsive sizes through 600px: larger stage and curved ring labels, and an approximately 11–14% larger payoff. The teaching payoff reserves extra space at widths up to 360px. Wheel dimensions, colors, sequence, and reveal timing are unchanged. Version A retains the final sentence and hides explanatory copy.

Version A — Minimal: https://pesettan.github.io/inbrnd/minimal/ (`content-mode="diagram"`). Version B — Educational: https://pesettan.github.io/inbrnd/educational/ (`content-mode="teaching"`). Both share one component and scroll timeline, including the approved final sentence reveal.
