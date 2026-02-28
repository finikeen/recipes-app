# Phase 1 — Vue Best Practices Refactor

**Date**: 2026-02-26
**Branch**: `feature/src-refactor`
**Skill**: `vue-best-practices`

## Context

Two views exceed the "focused component" threshold defined by the `vue-best-practices` skill and contain orchestration logic that belongs in composables:

- `RecipeFormView.vue` (~228 lines): owns form state, ingredient management, direction management, validation, and submit
- `BrowseView.vue` (~220 lines): owns search query, tag filtering, and pagination

Additionally, ingredient-fetching logic is duplicated between `HeroRecipe.vue` and `RecipeDetailView.vue`.

## Pre-flight

Before writing any code, load the `vue-best-practices` skill and read its core references:
- `references/reactivity.md`
- `references/sfc.md`
- `references/component-data-flow.md`
- `references/composables.md`

---

## Step 1 — Create `useRecipeIngredients` composable

**New file**: `src/features/recipes/composables/useRecipeIngredients.js`

**Why**: The same subcollection-fetch watcher pattern exists in two places:
- `src/features/recipes/components/HeroRecipe.vue:51-67`
- `src/features/recipes/views/RecipeDetailView.vue` (ingredients watcher + fetch)

**API**:
```js
// Accepts a ref or getter — e.g. () => props.recipe?.id
const { ingredients, loading } = useRecipeIngredients(recipeIdRef)
```

**Rules**:
- Return `readonly(ingredients)` — consumers cannot mutate directly
- Loading state is `false` until first fetch begins
- When `recipeIdRef` changes to a falsy value, clear `ingredients` and reset `loading`

**Update callers**:
- `HeroRecipe.vue`: replace the inline `watch + ingredientsLoading + subcollectionIngredients` block with `useRecipeIngredients(() => props.recipe?.id)`
- `RecipeDetailView.vue`: replace equivalent watcher block

---

## Step 2 — Create `useIngredients` composable

**New file**: `src/features/recipes/composables/useIngredients.js`

**Why**: `RecipeFormView.vue` manages a `ref([])` ingredient array with add/remove/update helpers inline.

**API**:
```js
const { ingredients, addIngredient, removeIngredient, updateIngredient } = useIngredients(initialValue)
// initialValue: optional array (for edit mode pre-population)
```

**Rules**:
- Each ingredient is a plain string or object `{ name, quantity, unit }` — match existing shape
- `addIngredient()` appends a blank entry
- `removeIngredient(index)` removes by index
- `updateIngredient(index, value)` replaces by index
- Return `readonly(ingredients)` and expose mutations via explicit functions

---

## Step 3 — Create `useDirections` composable

**New file**: `src/features/recipes/composables/useDirections.js`

**Why**: `RecipeFormView.vue` manages a `ref([])` directions array with add/remove/reorder helpers inline.

**API**:
```js
const { directions, addDirection, removeDirection, moveDirection } = useDirections(initialValue)
```

**Rules**:
- Each direction is a plain string
- `moveDirection(fromIndex, toIndex)` supports drag-reorder UX
- Return `readonly(directions)` with explicit action functions

---

## Step 4 — Create `useRecipeForm` composable

**New file**: `src/features/recipes/composables/useRecipeForm.js`

**Why**: `RecipeFormView.vue` owns form state, error tracking, `derivedTags` logic, and submit orchestration — all independent concerns mixed in one place.

**API**:
```js
const {
  name, description, errors,
  derivedTags,
  ingredients, addIngredient, removeIngredient, updateIngredient,
  directions, addDirection, removeDirection, moveDirection,
  validate, submitForm, loading
} = useRecipeForm({ recipeId, onSuccess })
```

**Rules**:
- Internally composes `useIngredients()` and `useDirections()`
- `derivedTags` is a `computed` derived from `name + description + ingredients` (keep existing stopword logic)
- `validate()` returns `true/false` and sets `errors` reactive object
- `submitForm()` calls `recipesStore.addRecipe` or `recipesStore.updateRecipe` based on `recipeId`
- `loading` mirrors the store's loading state

**After extraction**: `RecipeFormView.vue` should be ~40 lines — just router params, `useRecipeForm()` call, and template.

---

## Step 5 — Create `useRecipeSearch` composable

**New file**: `src/features/recipes/composables/useRecipeSearch.js`

**Why**: `BrowseView.vue` owns search query state, tag filter state, and the computed filtered result — all co-mixed with pagination and layout.

**API**:
```js
const { searchQuery, activeTagFilters, filteredRecipes, toggleTag, clearFilters } = useRecipeSearch(recipesRef)
```

**Rules**:
- `searchQuery` is a writable `ref('')`
- `activeTagFilters` is a `ref(new Set())`
- `filteredRecipes` is `computed` — filters `recipesRef` by query + active tags
- `toggleTag(tag)` adds/removes from Set; triggers recompute
- `clearFilters()` resets both query and tag filters

---

## Step 6 — Create `usePagination` composable

**New file**: `src/features/recipes/composables/usePagination.js`

**Why**: `BrowseView.vue` owns `currentPage` + pagination math inline.

**API** (options object pattern per skill):
```js
const { currentPage, paginatedItems, totalPages } = usePagination(itemsRef, { pageSize: 12 })
```

**Rules**:
- Auto-resets `currentPage` to 1 when `itemsRef` changes (watch)
- `paginatedItems` is a `computed` slice
- `totalPages` is a `computed`

**After Steps 5–6**: `BrowseView.vue` should be ~50 lines — store call, composable calls, and template.

---

## Step 7 — Fix silent error in AuthView

**File**: `src/features/auth/views/AuthView.vue`

Current:
```js
catch { /* nothing */ }
```

Fix: Either re-throw so `AuthenticationForm` can display it, or set a local `error` ref and pass to the form component. The auth store already has `store.error` — confirm the catch block isn't swallowing a display that already works; if it is, just remove the catch entirely.

---

## Step 8 — Template audit (all `.vue` files)

Check each file for:

| Rule | What to look for | Fix |
|------|-----------------|-----|
| No `v-if` + `v-for` on same element | `<el v-for="..." v-if="...">` | Move condition to `computed` filter |
| Class selectors in scoped CSS | `h1 { }`, `p { }` element selectors in `<style scoped>` | Replace with `.class-name { }` |
| SFC block order | `<template>` before `<script>` | Reorder to `<script>` → `<template>` → `<style>` |
| `useTemplateRef()` for DOM refs | `const el = ref(null)` used as template ref | Replace with `useTemplateRef('el')` where Vue 3.5+ applies |

---

## Files Changed

| File | Action |
|------|--------|
| `src/features/recipes/composables/useRecipeIngredients.js` | **Create** |
| `src/features/recipes/composables/useIngredients.js` | **Create** |
| `src/features/recipes/composables/useDirections.js` | **Create** |
| `src/features/recipes/composables/useRecipeForm.js` | **Create** |
| `src/features/recipes/composables/useRecipeSearch.js` | **Create** |
| `src/features/recipes/composables/usePagination.js` | **Create** |
| `src/features/recipes/components/HeroRecipe.vue` | Modify — use `useRecipeIngredients` |
| `src/features/recipes/views/RecipeDetailView.vue` | Modify — use `useRecipeIngredients` |
| `src/features/recipes/views/RecipeFormView.vue` | Modify — gut logic into composables |
| `src/features/recipes/views/BrowseView.vue` | Modify — gut logic into composables |
| `src/features/auth/views/AuthView.vue` | Modify — fix silent catch |
| All `.vue` files | Audit template patterns |

## Reference Patterns

- Auth store structure: `src/features/auth/store.js` — follow `readonly()` + named action pattern
- `@reference "../../../assets/main.css"` required in all new `<style scoped>` blocks

## Verification

```bash
npm run test   # All existing tests still pass
npm run build  # No build errors
npm run dev    # Smoke test: create/edit recipe, browse, auth
```
