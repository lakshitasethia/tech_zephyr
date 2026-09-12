# Life RPG landing page: repair and polish pass

You are fixing an existing Next.js 16 + React 19 + Tailwind v4 landing page. The visual direction, palette, typography and GSAP work are all in place and are good. Do not redesign it. Repair it, then raise the craft.

Run `npm run dev` and look at the page yourself at 1440px and at 390px before and after every change. Do not work blind.

---

## HARD CONSTRAINTS

1. **Do not run `git push`**, do not add a remote, do not create a PR. Local commits only.
2. **Do not touch these files or directories.** Another engineer owns them and is working in the same repo right now:
   - `lib/supabase/**`, `lib/game/**`, `lib/actions/**`
   - `supabase/**`
   - `middleware.ts`
   - `app/play/**`, `app/login/**`, `app/signup/**`
   - `components/play/**`, `components/auth/**`
   - `README.md`
3. **Do not rename any CSS custom property** in `app/globals.css`. The application dashboard is built against these exact token names: `--void --ink --deep --slate --plum --warm --ember --closing --cream --muted --amber --gold --sage --rose --steel`. Changing values is fine. Changing names breaks the other half of the app.
4. Do not add any dependency. No component library, no icon package, no 3D, no image or video files. Everything stays CSS, SVG and Canvas.
5. `npm run build` must pass when you are done.

---

## THE ONE BUG. Fix this first, then re-look at everything.

**Roughly 80 percent of the visible problems come from a single rule** in `app/globals.css`:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: 0px;
}
```

This is unlayered CSS. Tailwind v4 emits its utilities inside `@layer utilities`. **Unlayered CSS beats layered CSS regardless of specificity**, so this one rule silently overrides every single Tailwind margin and padding utility on the page.

Verified in the browser: a hero section carrying `pt-32 pb-20 px-6 sm:px-8` computes to `padding: 0px`. An element carrying `max-w-7xl mx-auto` computes to `margin-left: 0px`. The rules exist in the stylesheet. They are simply losing the cascade. Deleting this one rule at runtime immediately restored `padding: 128px 32px 80px` and `margin-left: 215px`.

That is why:
- every heading, paragraph and button sits flush against the left edge of the viewport with zero gutter
- content is clipped at the right edge on mobile
- sections have enormous empty vertical gaps, because `min-h-screen` plus `justify-between` with no padding pushes content to the extreme top and bottom
- nothing is horizontally centred even where `mx-auto` is applied

**The fix:**

```css
@import "tailwindcss";
@config "../tailwind.config.ts";

@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
  }
  /* Do NOT reset margin and padding globally. Tailwind Preflight already
     normalises these, and an unlayered reset outranks every spacing utility. */
}
```

Delete `margin: 0`, `padding: 0` and `border-radius: 0px` from the universal selector entirely. If specific elements need a zero radius, set it on those elements or via the Tailwind theme, never with a global `*` rule.

Then audit the rest of `app/globals.css` for the same mistake: **any unlayered rule that sets a property Tailwind also controls is a landmine.** Move genuine base styles into `@layer base`, and keep component classes like `.pixel-btn-amber` and `.nav-link-draw` as they are, since those are not competing with utilities.

**Re-screenshot the whole page after this fix before doing anything else.** Several items listed below may already be resolved, and the remaining spacing work is much smaller than it currently looks.

---

## TYPOGRAPHY. Everything is too small.

The single biggest remaining complaint after spacing.

`.font-micro` in `app/globals.css` is locked at `font-size: 11px`. It is used for the navigation, every eyebrow, every stat label and every button label, which is most of the interface text on the page. At 11px, Silkscreen is close to illegible and fails the accessibility bar this project is graded on.

- Make `.font-micro` a fluid **13px to 15px**, and never let it fall below 12px. Keep `letter-spacing: 0.14em`.
- Navigation links and button labels specifically should sit at the **14px to 15px** end.
- Body copy currently uses `text-base sm:text-lg` (16px rising to 18px). Move it to **17px rising to 19px**, with `line-height: 1.7`. Long-form pixel-adjacent layouts need more leading than a normal marketing page.
- Keep the measure at 65 characters. It is correct.
- Check contrast: `--muted` `#9D9385` on `--ink` `#0A0F1C` must clear **4.5:1** for body text. If it does not, lighten `--muted` until it does. Do not fix contrast by making text bigger.

Set a single type scale and apply it consistently. Right now heading sizes are ad hoc per component, for example `text-5xl sm:text-7xl lg:text-[5.25rem]` on the hero and unrelated values elsewhere.

---

## SECTION BY SECTION

### Navbar
- It **overlaps the hero**. The `CHAPTER ONE` eyebrow renders underneath the fixed bar. Give the hero enough top padding to clear the navbar's real height, and verify at 1440px and 390px.
- Nav links are too small. See typography above.
- The mobile menu glyph is fine as a pixel grid. Keep it.

### Preloader
- The 0 to 100 counter **is never visible**. The page goes straight to `[ PRESS TO BEGIN ]`. Either the count is finishing instantly or it is not rendering. Make the count actually visible for at least 900ms, with the progress bar filling alongside it, then transition to the prompt.
- `[ PRESS TO BEGIN ]` is tiny and centred on a black field. Scale it up, and keep the amber pulse.

### Hero
- After the spacing fix, verify the left gutter and the `max-w-7xl` centring both apply.
- **The light pool behind the Lampbearer renders as a hard-edged rectangle** at desktop width. It should be a soft radial falloff with no visible boundary. Check that the gradient element is square with `border-radius: 50%`, or better, use a `radial-gradient` whose outer stop reaches full transparency well inside the element's bounds.
- There is a large dead zone below the CTA row. Rebalance so the hero fills its height deliberately rather than collapsing to the top.

### How It Works, the pinned horizontal section
- **Panels are clipped at both viewport edges.** Panel 01 loses its left edge, Panel 03 loses its right edge and its text runs off screen. The horizontal track needs leading and trailing padding so the first and last panels come fully into view.
- The section heading stays pinned at the left edge and gets cut off. Give it the same gutter as everything else.
- Panel heights are ragged. Give the three panels one consistent height and inner padding so they read as one object.
- There is a very large empty gap above the section heading. Tighten it.
- The drag-to-compare divider in Panel 03 works and is good. Keep it, but make sure it is keyboard operable: it must be focusable and movable with left and right arrow keys, with an `aria-label` and `aria-valuenow`.

### The Shop tiers
- Same clipping at the left edge, and a very large dead gap before the section.
- Card headings are cut off by the navbar when the section scrolls under it.
- The four tier cards are the most important section on the page, because the tier system is the product's signature mechanic. Give them more presence: larger previews, clearer locked and unlocked states, and a visible progression from cold monochrome on Tier 0 to full warmth on Tier 3. Right now all four previews look nearly identical.

### Attributes
- **The section heading overlaps the first attribute row.** `FOUR ATTRIBUTES` and the `INTELLECT` row collide, and body text renders behind the segmented bar.
- The segmented pixel bars are good. Keep them and give them room.

### Campaigns and the Warden
- This is the best composed section on the page. Keep the layout.
- Still needs the left gutter.
- **The Warden does not read as menacing.** At present it reads as a friendly round character with orange eyes. Make the silhouette more angular and imposing: broader shoulders, a narrower head, sharper shoulder and helmet edges, a darker body with the only warm pixels being the eyes. It should feel like a threat, not a mascot.

### Final CTA
- **The Lampbearer sprite overlaps the `CHAPTER TWO` headline.** Its feet nearly touch the text. Add clear vertical separation.
- **The moths read as small white `V` scribbles**, not as moths. At their current scale they look like specks of noise. Either increase their pixel scale so the wing shape is legible, or redesign the sprite so it is recognisable at the size it actually renders.
- The radial glow has a faintly visible circular boundary. Soften the outer stop.
- Otherwise this section is strong. It is the best moment on the page.

### Footer
- Currently the weakest part of the page and needs rebuilding.
- It starts abruptly with no separation from the CTA section above it.
- The tagline **overlaps the bottom bar text**.
- Link columns are cramped against the bottom edge with no breathing room, and the whole footer is compressed into roughly the last 100px of the page.
- Rebuild it: generous top padding, a clear top edge created by a background shift rather than a border, comfortable column spacing, and real vertical rhythm between the wordmark block, the link columns and the bottom line. It should feel like the deliberate close of the scroll journey, since the background returns to `--closing` here and closes the loop the preloader opened.

---

## PIXEL SPRITES

The four sprites work structurally, but they read as blobs at their current size and detail.

- **Integer scaling only.** Verify every sprite is scaled by a whole number multiple. Any fractional scale blurs the pixels and destroys the effect.
- **The Lampbearer** is the protagonist and appears twice. Its silhouette is unclear: the hood, face and lantern do not separate. Raise the internal contrast. The cloak should be the dark mass, the hood opening should be readable, and the lantern should be the single brightest element. Consider a slightly larger grid if 16 by 24 is not enough to carry the detail.
- **The Moth** is the worst offender. Redesign so it is legible at render size.
- **The Warden** needs the menace described above.
- **The Idle One** should be instantly recognisable as the same silhouette as the Lampbearer, only grey and slumped with the lantern dark. Verify the silhouettes actually match.

---

## MOBILE, 390px

Check every section. Confirmed broken at present:
- Content runs flush to both edges with no gutter.
- The `+40 XP` label in the How It Works panel is clipped off the right edge.
- Verify no horizontal page scroll at any width. Only the intentional horizontal track may scroll sideways, inside its own container.
- Confirm `gsap.matchMedia()` is actually disabling pinning below 900px. The pinned section is the most likely thing to break on a phone.

---

## THINGS THAT MUST NOT REGRESS

These are already correct. Keep them that way.

- **Zero em dashes and zero en dashes** anywhere in `app/`, `components/` or `lib/`. Verify with `grep -rnE "—|–" app components lib` before you finish. It must return nothing.
- No rounded pill badges. No card borders or outlines. No radius above 2px except on radial glow elements, which are circles by necessity.
- No emoji. No three-column icon-title-paragraph feature grid. No fake testimonials or invented statistics.
- Every section must be fully readable at rest with JavaScript disabled. Nothing parked at `opacity: 0` waiting on a ScrollTrigger.
- The only permitted outline is the 2px amber focus ring.
- All motion suppressed under `prefers-reduced-motion`.

---

## WHEN YOU ARE DONE

1. `npm run build` passes.
2. `grep -rnE "—|–" app components lib` returns nothing.
3. Screenshots at 1440px and 390px of: hero, How It Works, Shop tiers, Attributes, Campaigns, Final CTA, footer.
4. Confirm in the browser that a section carrying `px-6` actually computes a non-zero padding. That is the regression test for the root cause bug.
5. Write a short summary of what you changed and anything you chose not to change.
