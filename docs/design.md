---
version: alpha
name: Wise-Inspired-design-analysis
description: An inspired interpretation of Wise's design language — a global money-transfer brand whose surface combines an unusually heavy near-black display sans (weight 900 at 64–126 px) with a vivid lime-green brand accent, sage-tinted surface neutrals, and rounded white cards on a pale green-tinted canvas; the whole system reads more like a Scandinavian fintech magazine than a bank.

colors:
  primary: "#9fe870"
  on-primary: "#0e0f0c"
  primary-active: "#cdffad"
  primary-neutral: "#c5edab"
  primary-pale: "#e2f6d5"
  ink: "#0e0f0c"
  ink-deep: "#163300"
  body: "#454745"
  mute: "#868685"
  canvas: "#ffffff"
  canvas-soft: "#e8ebe6"
  positive: "#2ead4b"
  positive-deep: "#054d28"
  warning: "#ffd11a"
  warning-deep: "#b86700"
  warning-content: "#4a3b1c"
  negative: "#d03238"
  negative-deep: "#a72027"
  negative-darkest: "#a7000d"
  negative-bg: "#320707"
  accent-orange: "#ffc091"
  accent-cyan: "#38c8ff"

rounded:
  none: 0px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
---

## Overview

Wise — the global money-transfer brand — wears its identity in a single signature pairing: a vivid lime-green `primary` (`#9fe870`) used as the CTA pill and brand accent, set against a pale sage-tinted canvas `canvas-soft` (`#e8ebe6`), and a near-black ink `ink` (`#0e0f0c`) with a hint of warmth. The brand reads more like a calm Scandinavian magazine than a bank — generous whitespace, large rounded cards, and an unusually heavy display sans set at weight 900 carrying every hero headline.

**Key Characteristics:**
- A single lime-green CTA accent `primary` (`#9fe870`) — the brand's universal primary action color. No second accent.
- Two-face display typography — Wise Sans (proprietary, weight 900) substituted with Manrope/Inter weight 800–900 + Inter weight 400–600 for body.
- `rounded.xl` 24 px is the canonical card and button radius. Generous, friendly.
- Sage-tinted canvas `canvas-soft` (`#e8ebe6`) is the page surface; white `canvas` (`#ffffff`) is reserved for cards.
- Surface contrast (sage page vs white cards) carries elevation — minimal shadows, hairline borders.
- A full semantic palette: positive green, warning yellow, negative red families for in-product status.

## Colors

- **Wise Green** `primary` `#9fe870` — universal CTA color (button fill, with ink text). Never used as text on white (fails contrast) and never repurposed as a success indicator.
- **Green Active** `#cdffad`, **Green Pale** `#e2f6d5` (soft tints, badge backgrounds).
- **Canvas** `#ffffff` (cards), **Canvas Soft** `#e8ebe6` (page background).
- **Ink** `#0e0f0c` (text/headings), **Ink Deep** `#163300` (forest-green emphasis), **Body** `#454745`, **Mute** `#868685`.
- **Positive** `#2ead4b` / deep `#054d28`. **Warning** `#ffd11a` / deep `#b86700`. **Negative** `#d03238` / darkest `#a7000d`.
- **Accent Orange** `#ffc091`, **Accent Cyan** `#38c8ff` (illustrative only).

## Typography
1. **Wise Sans** (proprietary) → substituted with **Manrope** weight 800/900 for hero/section headlines.
2. **Inter** weight 400/600 for sub-displays, body, labels.
Weight 900/800 for hero, weight 600 for everything else.

## Layout
- 4 px base spacing unit; bands use 48 px vertical padding; cards 24 px interior.
- Surface contrast (`canvas-soft` page → `canvas` cards) is the elevation cue.
- Breakpoints: Mobile < 768, Tablet 768–1023, Desktop ≥ 1024.

## Shapes
- `rounded.md` 12 px form inputs · `rounded.lg` 16 px mid cards · `rounded.xl` 24 px canonical button + card radius · `pill` status badges.

## Components
- **button-primary** — lime-green pill: bg `primary`, text `on-primary`, 24 px radius.
- **button-secondary** — sage: bg `canvas-soft`, text `ink`.
- **button-tertiary** — white outline: bg `canvas`, 1 px `ink` border.
- **card-content** — white card on sage canvas, 24 px radius, no/hairline border.
- **card-feature-dark** — polarity flip: bg `ink`, text `primary` green (promo moments).
- **text-input** — bg `canvas`, 1 px solid `ink` border, 12 px radius.
- **badge-positive** — bg `primary-pale`, text `positive-deep`, pill.
- **badge-negative** — bg `negative-bg`, white text, pill.

## Do's and Don'ts
- **Do** reserve `primary` lime green for primary CTAs; set headlines in weight 800–900; use 24 px radius for buttons/cards; cycle sage canvas → white cards for elevation; use the full semantic palette for status.
- **Don't** introduce a second brand accent; render heroes lighter than 800; use sharp rectangles on CTAs; pair the green CTA with a green background; or use lime green as text on white (it fails contrast — it is a fill color only).

---

## Implementation Notes (Chain-Check)

Applied to the Chain-Check dijital çek (digital cheque) dApp, a desktop dashboard:
- **Sage canvas** (`--bg-color: #e8ebe6`) page background with **white cards** (`--card-bg: #ffffff`), 24 px radius, hairline borders.
- **Lime green `#9fe870` is fill-only** — reserved for primary action buttons (with ink text) and the active-nav indicator. It is never used as text on white. Cheque amounts use heavy ink-deep `#163300`, not lime.
- **Ink `#0e0f0c` text**, `#454745` body/muted labels, `#868685` finest print.
- **Manrope 800** for headings (Wise Sans stand-in), **Inter** for body.
- Full semantic palette for status badges (positive/warning/negative).
- All theming is driven by CSS custom properties in `frontend/src/App.css`, so it cascades through components and their inline styles.
</content>
