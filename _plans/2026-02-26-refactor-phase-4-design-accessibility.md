# Phase 4 — Design & Accessibility Audit

**Date**: 2026-02-26
**Branch**: `feature/src-refactor`
**Skills**: `frontend-architect`, `frontend-design`
**Depends on**: Phases 1–3 complete

## Context

The Forge aesthetic is a distinctive dark/amber/purple theme — industrial, glowing, craft-forward. This phase has two goals:
1. Close WCAG 2.1 AA accessibility gaps
2. Audit the Forge aesthetic for consistency and strengthen any weak spots

---

## Step 13 — WCAG 2.1 AA Accessibility Fixes

### 13.1 — Skip Navigation Link

**File**: `src/App.vue`

Add a skip link as the first focusable element so keyboard users can bypass the navbar:

```html
<template>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <AppNavbar />
  <main id="main-content">
    <RouterView />
  </main>
</template>
```

Style the skip link to be visually hidden until focused:
```css
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 999;
}
.skip-link:focus {
  left: 1rem;
  top: 1rem;
}
```

### 13.2 — Clickable RecipeCard Semantics

**File**: `src/features/recipes/components/RecipeCard.vue`

The card currently emits a `click` event but has no keyboard equivalent. When `clickable` prop is true:

- Add `role="article"` to the card root (it represents a recipe document)
- Add `tabindex="0"` to make it focusable
- Add `@keydown.enter="emit('click', recipe)"` and `@keydown.space.prevent="emit('click', recipe)"`
- Add `aria-label` with the recipe name: `aria-label="View recipe: {{ recipe.name }}"`

### 13.3 — Form Error Accessibility

**File**: `src/features/auth/components/AuthenticationForm.vue`

For each input with a validation error:
- Error message element gets a unique `id` (e.g., `email-error`)
- Input gets `aria-describedby="email-error"` and `aria-invalid="true"` when error exists

```html
<input
  id="email"
  v-model="email"
  :aria-invalid="!!errors.email"
  :aria-describedby="errors.email ? 'email-error' : undefined"
/>
<p v-if="errors.email" id="email-error" role="alert">{{ errors.email }}</p>
```

Apply the same pattern to `RecipeFormView.vue` form fields (after Phase 1 refactor exposes `errors` from `useRecipeForm`).

### 13.4 — Loading State ARIA Live Regions

**Files**: `src/features/recipes/views/BrowseView.vue`, `src/features/recipes/views/HomeView.vue`

Wrap loading indicators in an `aria-live` region so screen readers announce state changes:

```html
<div aria-live="polite" aria-atomic="true">
  <div v-if="loading" aria-label="Loading recipes...">
    <!-- skeleton loaders -->
  </div>
</div>
```

### 13.5 — Color Contrast Verification

Verify these color combinations against WCAG AA (4.5:1 for normal text, 3:1 for large text):

| Foreground | Background | Usage | Expected |
|-----------|------------|-------|----------|
| `#e8a042` (amber) | `#1a1625` (dark bg) | Headings, accents | Should pass large text (3:1) |
| `#e8a042` (amber) | `#24202e` (card bg) | Button text | Needs verification |
| `#c4b5a0` (muted) | `#1a1625` | Body text | Needs verification |
| `#ffffff` | `#e8a042` | Button text on amber | Needs verification |

Use the browser DevTools accessibility panel or https://webaim.org/resources/contrastchecker to verify. Adjust the amber shade slightly if any combination fails — aim for `#f0a84e` (slightly lighter) if needed.

### 13.6 — AppNavbar Keyboard Navigation

**File**: `src/components/AppNavbar.vue`

Verify:
- Sign in/sign out button is reachable and activatable via keyboard
- Focus styles are visible (check that `outline` is not removed globally in CSS)
- Nav links have descriptive text (not icon-only without aria-label)

---

## Step 14 — Forge Aesthetic Audit

### 14.1 — Typography Consistency

Audit each view for heading hierarchy and font usage:
- H1 headings should use the display font (confirm it's not Inter/system font)
- Verify `forge-theme.css` CSS variables for `--font-display` and `--font-body` are applied consistently across all views
- Recipe name in `RecipeCard`, `HeroRecipe`, and `RecipeDetailView` should use the same display treatment

### 14.2 — Animation Consistency (`forge-animations.css`)

Check that entrance animations are applied consistently:
- `RecipeCard` components in `BrowseView` and `HomeView` should animate on mount (staggered if possible)
- `HeroRecipe` should have a subtle entrance
- Form fields in `RecipeFormView` should have focus micro-interactions (glow/border transition)

If `forge-animations.css` defines animation classes, verify they're applied to the right elements. Add any missing animation class applications.

### 14.3 — Texture & Depth

Verify `forge-textures.css` texture patterns are used:
- Hero/header sections (not just a flat dark color)
- `HeroRecipe` banner area
- Page backgrounds in `RecipeDetailView`

If any view is using a plain solid background where a texture would reinforce the Forge aesthetic, apply the appropriate texture class.

### 14.4 — Hover States

Audit interactive elements for Forge-appropriate hover states:
- `RecipeCard`: should have a glow/lift effect on hover (amber border or box-shadow)
- Tag buttons in `BrowseView`: active state should feel distinct (filled vs outline)
- Nav links: subtle amber underline or glow

### 14.5 — Mobile Responsive (320px and 768px)

Test each view at these breakpoints:
- `HomeView`: Hero recipe and card grid should stack cleanly
- `BrowseView`: Search bar + tag filters should not overflow; grid collapses to 1 column
- `RecipeDetailView`: Ingredients/directions tab panel readable at 320px
- `RecipeFormView`: Dynamic ingredient/direction rows should be usable on mobile (add/remove buttons accessible)
- `AppNavbar`: Mobile nav should not break layout

Fix any overflow, truncation, or unreadable layouts found.

### 14.6 — Visual Hierarchy Check

In `RecipeDetailView` and `RecipeFormView`:
- Ensure clear visual separation between sections (negative space or dividers)
- Amber accent usage should guide the eye to primary actions (submit button, featured recipe name)
- Purple accents (`#8b5cf6`) should be used for secondary/hover states, not primary

---

## Files Changed

| File | Changes |
|------|---------|
| `src/App.vue` | Skip navigation link |
| `src/features/recipes/components/RecipeCard.vue` | Role, tabindex, keyboard handlers, aria-label |
| `src/features/auth/components/AuthenticationForm.vue` | aria-describedby, aria-invalid, role="alert" |
| `src/features/recipes/views/RecipeFormView.vue` | aria-describedby on form fields |
| `src/features/recipes/views/BrowseView.vue` | aria-live region |
| `src/features/recipes/views/HomeView.vue` | aria-live region |
| All `.vue` files | Typography, animation, texture, hover state fixes as needed |

---

## Verification

```bash
npm run test   # All tests still pass (accessibility attribute changes may affect selectors)
npm run dev    # Manual smoke test
```

Manual accessibility checks:
1. Tab through the entire app without a mouse — verify logical focus order
2. Activate the skip link (Tab on page load → Enter) — focus should jump to `#main-content`
3. Navigate to a recipe card with keyboard, press Enter — should open detail view
4. Submit an empty auth form — error messages should be announced by screen reader (use browser accessibility tree inspector)
5. Resize browser to 320px — verify all views are usable

Visual checks:
1. Open each view and verify Forge aesthetic is consistent
2. Verify animations play on initial page load
3. Hover over recipe cards — confirm glow/lift effect
4. Check color contrast in both dark theme and any light areas
