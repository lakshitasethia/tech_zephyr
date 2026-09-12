# Life RPG: second polish pass

Your first pass fixed the layout. This pass is about motion, atmosphere and craft.

Run `npm run dev` and watch every change in the browser at 1440px and 400px. Do not work blind.

---

## HARD CONSTRAINTS (unchanged from the first pass)

1. **Do not run `git push`.** Do not add a remote. Local commits only.
2. **Do not touch:** `lib/supabase/**`, `lib/game/**`, `lib/actions/**`, `supabase/**`, `middleware.ts`, `app/play/**`, `app/login/**`, `app/signup/**`, `components/play/**`, `components/auth/**`, `README.md`.
3. **Do not rename any CSS custom property.** The app dashboard is built against these exact names.
4. No new dependencies. GSAP and Lenis are already installed. Everything stays CSS, SVG, Canvas and Web Audio. No image, audio or video files.
5. `npm run build` must pass. No em dashes or en dashes anywhere in `app/`, `components/`, `lib/`.
6. Note the tree moved since your last pass: landing sections now live in `components/landing/`.

**Performance budget.** This project is graded on load speed. Everything below must add under 25KB of JavaScript combined. If an effect cannot be done inside that budget, simplify it rather than dropping the budget.

---

## 1. Navbar links do not scroll smoothly. Fix this first.

Clicking `HOW IT WORKS`, `QUESTS`, `THE SHOP` or `ATTRIBUTES` currently jumps instantly. Lenis is running the page scroll, so a native anchor jump fights it.

- Intercept the click, `preventDefault()`, and call `lenis.scrollTo(target, { offset: -navHeight, duration: 1.4, easing: <your custom ease> })`.
- Offset by the real navbar height so the section heading is not hidden underneath it.
- Keep the URL hash updating with `history.pushState` so links remain shareable.
- Keyboard: Enter on a focused nav link must do the same smooth scroll, and focus must move to the target section (give each section `tabindex="-1"` and call `.focus({preventScroll:true})` after the scroll settles). Skipping this breaks keyboard navigation, which is graded.
- Under `prefers-reduced-motion`, jump instantly instead. Do not animate.

There is one exported Lenis instance in `lib/animations/gsapSetup.ts`. Reuse it. Do not create a second one.

---

## 2. The intro sequence: typewriter, then the bulb

Replaces the current cut from `[ PRESS TO BEGIN ]` straight to the hero.

**Total budget: 5 seconds.** Skippable at every moment. Plays **once per session** via `sessionStorage`, so a refresh during judging goes straight to the hero.

### Beat 1: typewriter, 0.0s to 2.2s

On a `--void` field, after the click that unlocks audio, type two short lines in Silkscreen with a blinking block caret:

```
> THE LANTERN WENT OUT SOME TIME AGO.
> NOBODY IS COMING TO RELIGHT IT.
```

- Type character by character, roughly 28ms per character, with slight random jitter so it does not feel mechanical.
- A short pause between the two lines.
- **Typewriter sound, synthesized in Web Audio, no files.** Per character: a very short square or triangle blip, 8ms to 14ms, around 900Hz to 1400Hz, randomised per keystroke, at low gain. A slightly lower, longer thunk on space and on line end. Keep total gain low. This must never be loud.
- Provide a mute control. A small speaker glyph in the corner, keyboard reachable, remembered in `localStorage`. Some judges will have their volume up.

### Beat 2: the bulb drops, 2.2s to 4.2s

The line of text fades. Then:

- A pixel bulb on a thin cord **drops in from above the top edge**, falling fast.
- It **overshoots**, then swings on the cord with **decaying oscillation**. Use a real damped pendulum feel: rotate around the cord's top anchor point, not the bulb's own centre, with amplitude decaying over roughly 4 to 5 swings. `transform-origin` at the top of the cord. GSAP with a custom ease, or successive tweens with shrinking rotation values.
- On the **second swing**, the filament **flickers**: on, off, on-brighter, settling lit. Two or three irregular flickers, not a smooth fade.
- As it lights, warm amber light **radiates outward** from the bulb: a radial gradient scaling up and fading, plus the ember Canvas beginning to drift. The light should wash across the frame and reveal the page beneath.
- Sound: a low filament hum fading in as it lights, and a soft mechanical thunk on the drop. Synthesized.

### Beat 3: handoff, 4.2s to 5.0s

The light expands until it covers the frame, then the intro layer clip-path wipes away to the hero. The bulb should feel like it becomes the hero's lantern light. Match the position and warmth so the transition reads as continuous rather than as two separate scenes.

### Non-negotiables

- A `SKIP` control visible the entire time, keyboard reachable.
- Any key or click skips to the hero immediately.
- Under `prefers-reduced-motion`: no typing animation, no swing. Show both lines at once, hold 600ms, cut to the hero.
- The hero must be fully rendered underneath the whole time. If JavaScript fails, the visitor sees the hero, never a black screen.

---

## 3. Cursor light. Scoped, not global.

You asked for a flashlight or spotlight reveal. Do **not** apply a mask over the whole page: it hurts readability, does nothing on touch devices, and reads as a gimmick. Two scoped uses instead, both of which serve the product's actual metaphor.

### 3a. Hero: additive warm light, always on

A soft warm radial that follows the pointer and **adds** brightness. It never hides anything. Implement as a fixed radial-gradient layer in `screen` or `soft-light` blend mode at low opacity, positioned from pointer coordinates.

- Lerp the position, roughly `pos += (target - pos) * 0.12` per frame, so it trails the cursor with weight rather than snapping.
- Drive it in a single `requestAnimationFrame` loop. Never update it in a raw `mousemove` handler.
- Use `transform: translate3d()` on a fixed element. Never animate `background-position` or the gradient's own coordinates, both of which repaint the whole layer.
- Text contrast must not drop anywhere the light passes.

### 3b. One dedicated reveal moment: the Cold Start tier

In the Shop section, the Tier 0 "Cold Start" card is the one that is meant to feel dark and empty. Make it a genuine reveal: the card renders nearly black, and moving the pointer across it reveals, inside a soft circular window, the fully lit version of the same scene underneath.

- Two stacked layers, the lit one revealed through a `mask-image` or `-webkit-mask-image` radial gradient positioned at the pointer.
- This is the single best demonstration of the whole product thesis. Give it a short Silkscreen label: `MOVE YOUR CURSOR`.

### Required fallbacks

- **Touch devices get neither.** Gate both behind `window.matchMedia('(hover: hover) and (pointer: fine)')`. On a phone, the Tier 0 card shows the lit state at partial opacity with a slow ambient sweep instead, so the idea still lands.
- Both disabled under `prefers-reduced-motion`.
- The reveal card must not be the only way to read any information. Keep a readable caption outside the masked area.

---

## 4. More GSAP

Add these where they earn their place. Do not add motion to everything: the restraint is what makes the busy moments land.

- **Section headings:** each major heading resolves character by character on scroll into view, snapping on a single frame with a vertical offset rather than fading. You have `lib/animations/textReveals.ts` already. Apply it consistently to every section heading, not just some.
- **Numbers count up** whenever they scroll into view. XP values, gold costs, tier prices, Warden HP percentage, attribute levels. None of them should simply appear.
- **Warden HP bar** should deplete in four discrete steps as the Campaigns section scrolls, one per completed stage, with a small shake on each hit.
- **Parallax at three depths** in the hero and final CTA. Ember canvas slowest, sprite mid, text fastest.
- **The dotted connector line** in How It Works should draw via `stroke-dashoffset` as the horizontal track scrubs, not appear all at once.
- **Magnetic buttons:** the two primary CTAs translate toward the cursor, capped at 6px, springing back on leave. Desktop pointer only.
- **Scroll velocity skew:** a very subtle skewY on section content proportional to scroll velocity, clamped to about 1.5 degrees. This is the single cheapest effect that makes a page feel expensive. Do not overdo it.

Every ease must be a cubic bezier you chose deliberately. Do not leave the whole page on `power2.out`.

All of it inside `gsap.matchMedia()`, with pinning and scrub disabled below 900px, and everything disabled under `prefers-reduced-motion`.

---

## 5. The pixel sprites need real work

This is the weakest craft on the page. They currently read as flat blobs. Push much harder.

**Technique, applies to all four:**

- **Use a colour ramp, not a flat fill.** Every material needs at least four values: deep shadow, base, light, and a highlight. A cloak drawn in one navy will always look like a blob. The same cloak in four values reads as fabric.
- **Commit to one light source.** The lantern. Every sprite is lit from that direction, with the opposite side in shadow and a rim of warm amber on the lit edge.
- **Silhouette first.** Squint at each sprite. If you cannot tell what it is from the outline alone, the interior detail will not save it.
- **Go bigger.** If 16 by 24 cannot carry the detail, use 24 by 36 or 32 by 48. More pixels is the honest fix for "not enough detail". Keep integer scaling only, always a whole number multiple, or the pixels blur and the entire aesthetic collapses.
- **Add a two frame idle** to each: a one pixel vertical bob, offset in phase between sprites so they never move in unison.
- **Ground them.** A small dark elliptical shadow under each sprite. Without it they float.

**Per sprite:**

- **The Lampbearer.** Your protagonist, on screen the most, currently the least readable. The hood opening must read as a dark void with no face. The cloak needs folds, at least two shadow values falling away from the lantern side. The lantern is the brightest object on the page: a warm core, a lighter housing, a visible handle, and amber spill onto the hand and the lower cloak. Add a subtle two frame flicker to the lantern glow, on a different cycle from the body bob.
- **The Moth.** Still the worst. Currently reads as a white `V` scribble. Draw it larger, with a visible body segment between two wings, and give the wings a two frame flap with a distinguishable up and down pose. It should be recognisable as a moth when paused.
- **The Warden.** Better after your last pass. Now add material: plate edges catching light, a darker recessed visor with the two amber eyes set inside it rather than painted on, and a suggestion of weight in the lower body. It should look heavy.
- **The Idle One.** Must be an exact silhouette match for the Lampbearer so the comparison reads instantly. Same pose, same dimensions, desaturated to grey, lantern dark and glassy with no glow. Add a slight slump: shoulders lowered by one or two pixels, head tilted down.

Keep pixel data in a readable format. A string array per row with a character to colour map is far easier to iterate on than an array of coordinates.

---

## 6. Small defects found in review

- **Attributes section shows `0 LVL` on all four rows** and the segmented bars render nearly invisible against the background. The section reads as broken. Give it plausible demo values, for example Intellect 19, Strength 12, Discipline 15, Spirit 8, and raise the contrast of the unfilled bar segments so the track is visible.
- **Tier 3 card:** `ASCENDANT` and `3,000 GOLD` sit on colliding baselines. Fix the alignment.
- **Panel 03 comparison slider:** text fragments bleed through at the divider. Visible artefacts read `UESTS` and `TR GRESS`. The clipped layer is not being masked cleanly.

---

## AUDIO RULES

All sound is synthesized with the Web Audio API. No audio files.

- Create the `AudioContext` **only after the user's first click**, never on load. Browsers block it otherwise and the console error is a bad look.
- Keep master gain low. Assume a judge with headphones on.
- One mute toggle, visible, keyboard reachable, persisted in `localStorage`, honoured by every sound on the page.
- If `AudioContext` fails for any reason, everything visual must continue normally. Wrap it in try/catch and never let audio break the page.

---

## DO NOT REGRESS

- No em dashes or en dashes. Verify with `grep -rnE "—|–" app components lib`, must return nothing.
- No rounded pills, no card borders or outlines, no radius above 2px except circular glow elements.
- No emoji, no fake testimonials, no invented statistics.
- Every section readable at rest with JavaScript disabled. Nothing parked at `opacity: 0` waiting on a ScrollTrigger.
- The only outline is the 2px amber focus ring.
- No horizontal page scroll at any width.

---

## WHEN DONE

1. `npm run build` passes.
2. `grep -rnE "—|–" app components lib` returns nothing.
3. Tab through the entire page with no mouse. Confirm the intro is skippable, the nav scrolls smoothly, and focus lands on the right section.
4. Load with `prefers-reduced-motion` enabled. Confirm no intro animation, no parallax, no cursor light, and that everything is readable.
5. Check at 400px: no horizontal scroll, no cursor effects active, intro still skippable.
6. Report the JavaScript bundle size delta for this pass.
7. Summarise what you changed and anything you chose not to do, with the reason.
