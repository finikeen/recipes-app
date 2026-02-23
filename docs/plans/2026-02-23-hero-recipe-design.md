# Hero Recipe Design

**Date:** 2026-02-23
**Status:** Approved
**Scope:** Full-width hero recipe component for the homepage — the "anvil" of the forge

## Vision

Replace the current compact `RecipeCard` on HomeView with a commanding, full-width hero component that showcases a single random recipe with title, truncated description, tags, ingredients, and directions. Styled as a heavy stone anvil — the centerpiece of the forge.

## Component

**New file:** `src/features/recipes/components/HeroRecipe.vue`

**HomeView changes:** Replace the `RecipeCard` wrapper with `<HeroRecipe>`, passing the recipe as a prop and handling `load-another` / `view-recipe` events.

## Layout

### Desktop: Two-column split

```
┌─────────────────────────────────────────────────────────┐
│  [gradient top border — purple → amber]                  │
│                                                          │
│  LEFT ~40%                │  RIGHT ~60%                  │
│  ─────────────────────────│──────────────────────────    │
│  RECIPE TITLE             │  [Ingredients] [Directions]  │
│  (large, amber glow)      │  ─────────────────────────   │
│                           │  • 2 cups flour              │
│  Description truncated    │  • 1 tsp salt                │
│  to 3–4 lines...          │  • ...                       │
│                           │  (scrollable)                │
│  🔷 tag  🔷 tag  🔷 tag  │                              │
│                           │                              │
│  [Load another]           │                              │
│  [View full recipe →]     │                              │
└─────────────────────────────────────────────────────────┘
```

### Mobile: Stacked vertically
Identity panel (title, description, tags, CTAs) on top; tabs panel (ingredients/directions) below.

## Props & Events

- **Props:** `recipe` (Object, required)
- **Emits:** `load-another`, `view-recipe` (with recipe id)

## Data & Async

### Ingredients
`HeroRecipe` watches `recipe.id` and calls `recipeService.getIngredients(recipeId)` (new method) on each change.

- **Subcollection available:** format each document as `"quantity unit item"` (e.g. "2 cups flour")
- **Subcollection empty/error:** fall back to `recipe.ingredients` string array
- **Neither exists:** show "No ingredients listed."

### Directions
Read directly from `recipe.directions` (array of strings). Each string is a numbered step. If absent: "No directions listed."

### Loading states
- **HomeView loading recipes:** show full skeleton (both panels outlined)
- **Subcollection fetching after recipe arrives:** right panel shows skeleton rows; left panel is already populated

## Visual Styling

### Outer wrapper
Full-width `forge__card` with stone texture and runic border. No max-width constraint — spans the full container. This is the anvil.

### Left panel
- **Title:** ~1.75rem, amber (`--primary-color`), soft amber text-shadow glow
- **Description:** 3–4 line clamp, muted silver (`--text-color-secondary`)
- **Tags:** existing `.forge__tag` rune chip style (purple outline)
- **CTAs (bottom of panel):**
  - "Load another" → `.forge__button` (purple outline)
  - "View full recipe →" → `.forge__button.forge__button-primary` (amber fill)

### Panel divider
1px vertical line in `--surface-200` with a faint purple glow — a seam in the stone.

### Right panel — tabs
- **Tab bar:** two buttons ("Ingredients" / "Directions")
  - Inactive: muted silver text, transparent bg
  - Active: amber+purple gradient underline (matching the card's top border gradient)
- **Content area:** fixed height (~280px), `overflow-y: auto`, subtle inset shadow for depth
- **Ingredients list:** plain list, no bullets, faint `--surface-100` divider between items
- **Directions list:** numbered steps, same divider style

## New Service Method

`recipeService.getIngredients(recipeId)` — fetches the `ingredients` subcollection for a recipe, returning an array of `{ quantity, unit, item }` objects.

## Files Changed

| File | Change |
|------|--------|
| `src/features/recipes/components/HeroRecipe.vue` | **New** — hero component |
| `src/features/recipes/views/HomeView.vue` | Replace `RecipeCard` with `HeroRecipe`, add `goToRecipe` handler |
| `src/features/recipes/services/recipeService.js` | Add `getIngredients(recipeId)` method |
