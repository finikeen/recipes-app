# CTA Button Row — Mobile Layout Design

**Date:** 2026-03-02
**Status:** Approved

## Problem

The `CtaButtonRow` component renders 5 buttons (Breakfast, Lunch, Dinner, Special, Reforge) in a horizontal row. On mobile screens (< 640px) the buttons are too cramped to be usable.

## Decision

**Icon-only on mobile, full pill on desktop.**

All 5 buttons remain visible in a single row on all screen sizes. On mobile, labels are visually hidden (but readable by screen readers). On desktop (≥ sm / 640px), the full emoji + label pill is shown.

## Layout

**Mobile (< 640px):**
- Buttons are compact squares (~44×44px, meeting touch target guidelines)
- Only the emoji icon is visible
- Label text rendered as `sr-only` for screen reader accessibility
- Buttons distributed evenly across the full row width

**Desktop (≥ sm):**
- Current appearance unchanged — emoji + label pill buttons
- `justify-between` layout with meal buttons left, Reforge right

## Accessibility

- Each button gets a descriptive `aria-label` (e.g. `"Browse Breakfast"`, `"Browse Lunch"`, `"Reforge recipe"`)
- The emoji icon span keeps `aria-hidden="true"`
- Label text wrapped in a `cta-row__label` span, hidden on mobile with `@apply sm:inline hidden`
- Touch target minimum 44×44px on mobile

## Changes

**`CtaButtonRow.vue` only:**

1. Add `ariaLabel` field to each entry in `MEAL_BUTTONS` (e.g. `"Browse Breakfast"`)
2. Bind `aria-label` on each meal button and on the Reforge button
3. Wrap label text in a `<span class="cta-row__label">` element
4. In scoped styles:
   - `.cta-row__label`: `@apply hidden sm:inline`
   - `.cta-row__btn` mobile: fixed square dimensions, centered content
   - `.cta-row__btn` sm+: existing pill style (padding, rounded-full)
   - `.cta-row__icon` mobile: slightly larger emoji size
