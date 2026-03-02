# Logo & Favicon Design — Recipe Forge

**Date:** 2026-03-01

## Overview

Add a brand icon (SVG flame) and favicon to Recipe Forge. The icon integrates with the existing Arcane Forge theme — dual amber + purple flame, CSS-variable-aware, animated in sync with the existing `brand-flicker` system.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Symbol concept | Dual flame (amber + purple) | Directly visualizes the forge-fire theme and the amber/purple dual-color system |
| Navbar layout | Symbol + wordmark | Flame icon left of "Recipe Forge" text — classic lockup |
| Implementation | Inline SVG Vue component | Enables CSS variable colors, animation, and theme-awareness |
| Favicon | Separate `public/favicon.svg` | Hardcoded colors required outside DOM; simplified shape for small sizes |

## Icon — `ForgeFlame.vue`

### Structure

- **ViewBox:** `0 0 20 24`
- **Purple flame** (back layer): slightly wider, offset left, drawn first
- **Amber flame** (front layer): narrower, offset right, drawn on top
- Both paths taper to sharp points at the top, merging into a shared oval base
- SVG `<filter>` provides a soft glow behind the shape

### Colors

- Amber: `var(--primary-color)` — `#e8a042`
- Purple: `var(--purple-accent)` — `#8b5cf6`

### Props

- `size` (Number, default `24`) — controls rendered height in px

## Navbar Integration

- `ForgeFlame` placed immediately left of "Recipe Forge" text inside `.navbar__brand`
- Icon height: `22px`, vertically centered
- Gap between icon and text: `8px`
- Existing `brand-flicker` animation on `.forge__brand` applies to the whole lockup — icon glows in sync with text

## Favicon — `public/favicon.svg`

- Dark circle background (`#0a0812`) for readability on light browser tab bars
- Colors hardcoded (amber `#e8a042`, purple `#8b5cf6`)
- Dual-flame silhouette simplified for legibility at 16–32px
- `index.html` updated to point at `/favicon.svg`

## Files

| File | Change |
|------|--------|
| `src/components/ForgeFlame.vue` | New — SVG flame icon component |
| `public/favicon.svg` | New — standalone favicon SVG |
| `src/components/AppNavbar.vue` | Import ForgeFlame, update brand markup |
| `index.html` | Update favicon `href` to `/favicon.svg` |
