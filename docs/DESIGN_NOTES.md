# Design Notes: Life RPG Landing Page

This document outlines the core tokens, fonts, animations, and eases utilized across the Life RPG landing page and design system, enabling the application engineering team to match the visual language seamlessly.

---

## 1. Palette & Design Tokens

Defined in `app/globals.css` and extended via `tailwind.config.ts`:

### Background Progression (Scroll Order)
- `--void`: `#06070B` (Preloader, cinematic, hero)
- `--ink`: `#0A0F1C` (Subtle navbar tint, cards)
- `--deep`: `#101829` (Intermediate cold layers)
- `--slate`: `#171C2E` (Shop entry)
- `--plum`: `#221E2E` (Attributes section)
- `--warm`: `#2C2128` (Campaigns / boss encounter)
- `--ember`: `#38271C` (Final CTA - maximum illumination)
- `--closing`: `#0A0B10` (Footer - return to darkness)

### Foreground & Accent Colors
- `--cream`: `#F2ECE2` (Primary readable text, contrast >= 4.5:1)
- `--muted`: `#9D9385` (Secondary descriptive copy)
- `--amber`: `#F0A44C` (Primary lamplight accent, only accent above the fold)
- `--gold`: `#FFC46B` (Level up, hover highlights, gold yields)
- `--sage`: `#8FAE93` (Success, completed quests, habit marks)
- `--rose`: `#C98A7F` (Warning, boss health, decay)
- `--steel`: `#7D8FB3` (Intellect, informational counterweight)

---

## 2. Typography

Google Fonts loaded with zero external layout shifts:

| Role | Font Family | Weights | Specification |
| :--- | :--- | :--- | :--- |
| **Display / Headings** | `Pixelify Sans` | 600, 700 | `text-wrap: balance`, integer snap reveals |
| **Micro / UI / Nav / Buttons** | `Silkscreen` | 400, 700 | Uppercase, `letter-spacing: 0.14em`, max 13px |
| **Body / Running Copy** | `Instrument Sans` | 400, 500 | Measure ~65ch, high legibility & accessible contrast |
| **Numeric Readouts** | Any | - | `font-variant-numeric: tabular-nums` |

---

## 3. Motion & Animation Eases

GSAP ScrollTrigger + Lenis smooth scroll ticker synchronization.

### Named Custom Eases
- `amberDraw`: `cubic-bezier(0.22, 1, 0.36, 1)`
  - Used for snappy 240ms navigation underline draw-in and progressive stage lines.
- `magneticSpring`: `cubic-bezier(0.34, 1.56, 0.64, 1)`
  - Used for button mouse-tracking attraction (max 6px) and elastic release.
- `pixelSnap`: `steps(1, end)`
  - Used for pixelated single-frame character reveals and retro sprite step animations.
- `wardenPound`: `cubic-bezier(0.8, 0, 0.2, 1)`
  - Used for cinematic curtain wipe and boss health bar stepped depletion.
- `smoothPalette`: `cubic-bezier(0.45, 0, 0.55, 1)`
  - Used for scrubbed background color interpolation.

---

## 4. Pixel Sprites & Integer Scaling

All sprites are rendered using `SpriteRenderer.tsx` with SVG `<rect>` elements and `shape-rendering="crispEdges"`.

- **The Lampbearer** (`components/sprites/Lampbearer.tsx`): 16x24 grid. 2-frame vertical bob (1.6s loop) + independent offset lantern pulse (2.1s loop).
- **The Moth** (`components/sprites/Moth.tsx`): 9x9 grid. Flutter + figure-eight irregular orbit with randomized amplitude.
- **The Idle One** (`components/sprites/IdleOne.tsx`): 16x24 grid. Slumped silhouette with extinguished lantern.
- **The Warden** (`components/sprites/Warden.tsx`): 32x32 grid. Heavy angular boss silhouette with pulsing amber eyes.

All sprite scaling must strictly use integer multipliers (e.g. `scale={2}`, `scale={4}`, `scale={6}`). Never use fractional scale values.
