You are building the marketing landing page for a product called Life RPG. Award-site quality, in the register of Awwwards Site of the Day. Read this entire brief before writing any code.

## HARD CONSTRAINTS. Read these first.

1. DO NOT run `git push`, `git remote add`, `gh repo create`, or any command that sends code to GitHub or any remote. Do not initialize a remote. Local commits are fine. Someone else owns the repository.
2. Build ONLY the landing page and the design system. Do NOT build authentication, a database, API routes, or the logged in application. Another engineer is building those in parallel. If you create a `/app/(app)` or `/dashboard` route you have gone out of scope.
3. Stack is fixed: Next.js App Router, TypeScript, Tailwind CSS, GSAP with ScrollTrigger, Lenis for smooth scroll. No other UI libraries. No component kits. No shadcn. No Framer Motion. No three.js. No 3D models.
4. No external image, video, audio, or model files. Every visual is CSS, SVG, or Canvas drawn in code. The page must work with zero network requests beyond fonts.
5. Total JavaScript budget excluding GSAP and Lenis: under 60KB. This page is graded on performance.

## THE PRODUCT

Life RPG turns real life tasks into an RPG. You add quests, complete them, earn XP and gold, level attributes like Intellect and Strength, and build streaks.

The signature mechanic, and the thing the landing page exists to sell: **the world starts dark and you buy the light back.** A new user lands in a cold, desaturated, barely lit world. Gold spent in the shop unlocks visual tiers that progressively warm and illuminate the entire interface. You do not buy a hat for your character. You buy the lighting of the world you live in.

The landing page must perform that arc. The page starts in near darkness at the top and is fully warm and lit by the bottom. Scrolling the page is a demonstration of the core mechanic.

## PALETTE

Backgrounds, in scroll order from top of page to bottom. Each section interpolates into the next. Never a hard edge between two background colors.

```
--void      #06070B   preloader, cinematic, hero
--ink       #0A0F1C
--deep      #101829
--slate     #171C2E
--plum      #221E2E
--warm      #2C2128
--ember     #38271C   final call to action
--closing   #0A0B10   footer, returns to darkness
```

Foreground and accent:

```
--cream     #F2ECE2   primary text
--muted     #9D9385   secondary text
--amber     #F0A44C   primary accent, the lamplight
--gold      #FFC46B   highlight, level up, hover
--sage      #8FAE93   success, completed quests
--rose      #C98A7F   warning, decay
--steel     #7D8FB3   informational, cool counterweight
```

Rules on color. Amber is the only bright accent above the fold. Sage, rose, and steel do not appear until the page has scrolled past the midpoint, because they represent later unlocked tiers. Do not use pure white anywhere. Do not use pure black anywhere. Do not use a purple to blue gradient.

## TYPOGRAPHY

Three roles. Load from Google Fonts only.

- Display, all headings, all large numerals: **Pixelify Sans**, weight 600 and 700. Pixel character without being illegible.
- Micro labels, stat readouts, nav items, buttons, eyebrows: **Silkscreen**, weight 400 and 700, uppercase, letter spacing 0.14em minimum. Never larger than 13px.
- Body copy, all paragraphs, all running text: **Instrument Sans**, weights 400 and 500. This is not negotiable. Pixel fonts at paragraph length are unreadable and fail accessibility, which is graded.

Type rules. Headings get `text-wrap: balance`. Body measure stays near 65 characters. All numeric readouts get `font-variant-numeric: tabular-nums`. Set one type scale and do not deviate from it.

## PIXEL CHARACTERS

Four original sprites, authored by you, drawn as SVG built from a rect grid with `shape-rendering: crispEdges`. Define each sprite as a TypeScript array of pixel rows mapping characters to palette colors, then render the grid. This makes them animatable and keeps them as code, not assets. Do not trace or copy any existing game character.

1. **The Lampbearer.** A small hooded traveler, roughly 16 by 24 pixels, carrying a lantern that is the only light source on it. Hood and cloak in deep indigo, lantern glow in amber. Idle animation: a two frame vertical bob on a 1.6s loop, plus the lantern glow pulsing on a slightly offset cycle so the two never sync. This is the protagonist and appears in the hero.

2. **The Moth.** A tiny companion, roughly 9 by 9 pixels, cream and pale amber, that drifts on a slow irregular path around the Lampbearer's lantern. Never a perfect circle. Use a slow figure eight with randomized amplitude. It represents your streak.

3. **The Idle One.** A slumped, desaturated, grey version of the Lampbearer with the lantern dark and unlit. Used in the section about decay and missed days. Same silhouette as the Lampbearer so the contrast reads instantly.

4. **The Warden.** A larger boss sprite, roughly 32 by 32 pixels, an angular armored silhouette with two amber eye pixels, used in the section about breaking large projects into campaigns. Slow menacing idle. Only the eyes animate.

Every sprite must sit on the page at a scale where pixels are crisp and clearly visible. Integer scaling only. Never scale a sprite by a fractional multiplier or the pixels blur and the whole effect dies.

## PAGE STRUCTURE

### 0. Preloader
Full bleed `--void`. Centered, a Silkscreen counter running 0 to 100 with tabular numerals so it does not jitter. Beneath it, a thin progress bar 240px wide, 3px tall, amber fill, hard edges, no rounding. The counter does not run on a fake timer. It reflects actual font and asset readiness, then completes. On 100, everything except the counter fades, and the counter is replaced by the words PRESS TO BEGIN in Silkscreen with a slow amber pulse. Wait for a real click or keypress. That interaction is what unlocks browser audio, so it must be a genuine user gesture. Respect `prefers-reduced-motion` by shortening this to a simple fade.

### 1. Cinematic, roughly 4 seconds, skippable
After the click. Pure `--void`. A single amber pixel ignites at center. It expands into a ring of drifting amber embers rendered on a Canvas, roughly 120 particles, each a 2px or 3px square, never a circle, drifting outward with slight turbulence and fading. As the embers spread, the Lampbearer sprite fades up at center, small, lantern lighting. A vignette softens the edges. The title LIFE RPG resolves in Pixelify Sans, letter by letter, each character arriving with a 40ms stagger and a one frame vertical offset so it snaps rather than eases. Hold 700ms. Then the whole cinematic layer wipes upward with a clip-path reveal to expose the hero. A small SKIP control in Silkscreen sits bottom right the entire time. Anyone who has already seen it once, tracked in sessionStorage, skips straight to the hero.

### 2. Navbar
Fixed. Transparent over the hero, then on scroll past 80px it gains a backdrop blur and a very subtle `--ink` tint at around 70 percent opacity. No border. No outline. No drop shadow. It separates from the page by blur and tint only.

Left: the wordmark LIFE RPG in Pixelify Sans, with a 6px amber square sitting before it as a bullet, aligned to the pixel grid.
Center: four links in Silkscreen uppercase. `HOW IT WORKS`, `QUESTS`, `THE SHOP`, `ATTRIBUTES`. Each link has an underline that is a 2px amber bar which draws in from the left on hover over 240ms with a custom cubic bezier, not a default ease. Active section link stays lit as you scroll, driven by ScrollTrigger.
Right: `LOG IN` as a plain text link, then `START A QUEST` as the only solid button on the page above the fold. Solid amber fill, `--void` text, square corners, no radius at all. On hover it does not change color. It shifts 2px up and 2px left and an amber shadow offset appears down and right, like a pixel art button being pressed in reverse.
Mobile: the center links collapse into a full screen overlay that wipes in from the right with a clip-path, links staggering in. No hamburger icon made of three perfectly even lines. Use a 2 by 2 pixel square grid glyph instead.

### 3. Hero
Background `--void` into `--ink`. Asymmetric. Do not center this.

Left two thirds: an eyebrow in Silkscreen reading `CHAPTER ONE`. Then the headline in Pixelify Sans at a large scale, on three lines:

```
YOUR LIFE
IS ALREADY
AN RPG
```

Then one paragraph in Instrument Sans, `--muted`, at 65 character measure: "You are already grinding. Waking up early, reading the hard chapter, going back to the gym after a week off. The problem is that none of it shows up anywhere. Life RPG gives that work a number, a level, and a world that lights up when you do it."

Then two controls side by side. `START A QUEST` solid amber. `SEE HOW IT WORKS` as text with a small pixel arrow that nudges right on hover.

Right third: the Lampbearer standing in a pool of amber radial light on the void, the Moth orbiting the lantern. Behind them, a Canvas particle field of slow drifting embers, low density, never distracting. The light pool subtly breathes.

Scroll cue at bottom: a 1px vertical amber line that grows downward and resets on a loop. No mouse icon. No chevron. No the word "scroll".

### 4. How It Works. Pinned horizontal scroll.
Background `--ink` into `--deep`. This section pins and the content moves horizontally as the user scrolls vertically. Three panels.

Panel one, `ADD A QUEST`: a pixel styled input mock with the text "Read 20 pages of DDIA" appearing character by character as if typed, then an attribute tag `INTELLECT` snapping in beside it, then `+40 XP` arriving with a one frame overshoot.
Panel two, `COMPLETE IT`: the same quest row, with a checkbox that fills sage. On fill, eight small amber pixel squares burst outward and fall with gravity, then fade. The XP bar beneath advances with a numeric counter that ticks up rather than sliding smoothly.
Panel three, `THE WORLD CHANGES`: the same UI shown twice side by side, dim on the left and warm on the right, with a draggable vertical divider the user can move to compare. This is the product thesis and it must be interactive, not a static image.

Panels are separated by generous space and connected by a dotted amber line with a small square node at each panel, drawn in SVG and animated with `stroke-dashoffset` as the section scrubs.

### 5. The Shop and the Tiers
Background `--deep` into `--slate` into `--plum`. The centerpiece.

A headline: `BUY THE LIGHT BACK`. One short paragraph explaining that gold earned from real work unlocks visual tiers, and that the entire interface warms as you progress.

Then four tier cards laid out on a diagonal ascending rightward, not a neat row. Each card is a small live preview of the actual dashboard at that tier, rendered in miniature with real UI elements, not a screenshot and not an illustration.

```
TIER 0   COLD START    free            near monochrome, one weak lamp
TIER 1   LAMPLIGHT     400 gold        amber enters, ink deepens
TIER 2   BLOOM         1,200 gold      sage and rose accents, ambient embers
TIER 3   ASCENDANT     3,000 gold      full warmth, gold leaf, volumetric light
```

As this section scrolls, the section background itself warms in step with which card is in view, scrubbed with ScrollTrigger. The page is demonstrating the mechanic on the visitor without telling them. Locked tiers show a small pixel padlock and are desaturated. Do not put a border around these cards. Separate them with background lightness and the light they cast.

### 6. Attributes
Background `--plum`. Four attributes: `INTELLECT`, `STRENGTH`, `DISCIPLINE`, `SPIRIT`. Not a card grid. Lay them out as four horizontal rows, each with the name in Silkscreen at left, a segmented pixel bar in the middle built of discrete 8px blocks with 2px gaps so it reads as pixel art rather than a progress bar, and the value in Pixelify Sans at right. Bars fill left to right on scroll into view, staggered by 90ms, blocks snapping on one at a time rather than filling smoothly. Beside them, a short paragraph explaining that quest categories feed specific attributes.

### 7. Campaigns and the Warden
Background `--warm`. The Warden sprite at a large integer scale on the left, eyes glowing. On the right, the explanation that large projects become Campaigns broken into stages, with a climactic completion. Show a vertical stage list with three of four stages complete. A thin amber line connects the stages and is drawn as the section enters view. Above the Warden, a health bar that depletes in four steps, one per completed stage, as the user scrolls through this section.

### 8. Final call to action
Background `--warm` into `--ember`. This is the warmest, brightest moment on the page, the payoff of the entire scroll journey. The Lampbearer returns, now at a larger scale, lantern at full brightness, standing in a wide warm pool of light with the Moth and several more moths circling. Embers drift upward across the full width.

Headline in Pixelify Sans: `CHAPTER TWO STARTS TONIGHT`. One line of body copy. A single large `START A QUEST` button. Nothing else. No secondary link, no email capture, no feature list.

### 9. Footer
Background drops back to `--closing`, returning to darkness, closing the loop the preloader opened. Sparse. Wordmark at left with the amber square. Three plain text columns of links. A single line of copy in Silkscreen at the bottom. No social icon row. No newsletter form. No "built with" badge.

## GSAP. This is what the page is graded on.

Use ScrollTrigger throughout. Use Lenis for smooth scroll and register it with ScrollTrigger's ticker so the two stay in sync. Never fight the browser's native scroll.

Required techniques:

- **Background interpolation.** The page background transitions continuously through the palette sequence above, scrubbed to scroll position. Use a single fixed background layer and tween its color, rather than giving each section its own background, so transitions are genuinely continuous with no seam. This is the most important single effect on the page.
- **Pinned horizontal section** for How It Works, with `scrub: 1` so it feels weighted rather than locked to the scrollbar.
- **Character level text reveals** on every major headline. Split into characters, stagger 25ms, arrive with a small vertical offset that snaps on a single frame rather than easing, matching the pixel aesthetic. Never use a blur or fade for headline reveals. Snap, do not float.
- **Parallax at three depths** in the hero and final section. Particle layer slowest, sprite layer medium, text layer fastest.
- **Counter tweens** on every number. Numbers count up, they never just appear.
- **Magnetic hover** on the primary buttons. The button translates toward the cursor by a small factor, capped at 6px, and springs back on leave.
- **Clip-path wipes** for section entrances rather than opacity fades. Fading in is the default that every generated site uses. Wipe instead.
- **`gsap.matchMedia()`** to disable pinning and heavy scrub effects below 900px width. Mobile gets simpler entrance animations only. Responsiveness is graded.
- **`prefers-reduced-motion`** honored globally. All scrub and parallax disabled, content visible immediately at its resting state.

Every custom ease must be a named cubic bezier you chose deliberately. Do not leave anything on `power2.out` by default across the whole page.

Critically: every section must be readable and complete at its resting state without scrolling to trigger it. Nothing is parked at `opacity: 0` waiting for an observer. If JavaScript fails, the page still reads.

## THINGS THAT WILL MAKE THIS LOOK AI GENERATED. Avoid all of them.

Visual:
- Rounded pill badges, especially ones with a small dot and a word inside. Do not use a single one.
- Border and outline on cards. Use background lightness, shadow, and cast light to separate things. Nothing on this page has a 1px grey stroke.
- Uniform border radius everywhere. This page is pixel themed. Corners are square. A radius above 2px should not appear anywhere.
- The three column feature grid with an icon, a bold title, and two lines of grey text. Never build this layout.
- Emoji used as section markers or bullets.
- Everything centered. Only the final call to action is centered. Everything else is asymmetric.
- Purple to blue gradients. Glassmorphism. Neon glow on everything.
- Drop shadows applied uniformly to every element.
- Perfectly even spacing between every section. Vary section rhythm deliberately.
- Fake testimonials, fake company logos, fake star ratings, fake user counts. Invent nothing that claims to be real.

Copy:
- No em dashes. No en dashes. No hyphens used as dramatic pauses. Use periods and commas. This is a hard rule, check every string before you finish.
- No "Unlock your potential", "Take it to the next level", "Seamlessly", "Elevate", "Supercharge", "In today's fast paced world", "Say goodbye to", "The future of".
- No sentence that begins "Whether you are a student, a professional, or".
- No three item lists where every item is the same length and rhythm.
- Write short, specific, concrete sentences. Name real things. "Read the hard chapter" is better than "achieve your goals".
- Never use the word "journey" as a noun for the user's experience.

## ACCESSIBILITY. Graded explicitly.

Semantic HTML with a real heading hierarchy, one `h1`. Every interactive element reachable by Tab with a visible focus state, a 2px amber offset outline, which is the only place an outline is permitted. Contrast of all body text against its background at 4.5:1 minimum, verify this against the actual palette above. `aria-hidden` on every decorative sprite and particle canvas. The preloader and cinematic must be skippable by keyboard alone. All animation suppressed under `prefers-reduced-motion`.

## DELIVERABLES

- A working Next.js App Router page at `/`.
- `app/globals.css` containing every palette value above as CSS custom properties, and `tailwind.config.ts` extending them as named tokens. Another engineer is building the logged in app against these exact token names, so do not rename them.
- Sprites in `components/sprites/`, each as its own component with its pixel data array colocated.
- GSAP setup isolated in `lib/animations/`, not scattered through components.
- A short `DESIGN_NOTES.md` listing the fonts, the eases you chose, and the token names, so the app side can match.

Build the whole page. Do not stub sections with placeholder comments. Do not push to GitHub.
