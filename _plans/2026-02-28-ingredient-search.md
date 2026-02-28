# Implementation Plan: Ingredient Search

Spec: `_specs/2026-02-28-ingredient-search.md`
Branch: `claude/feature/ingredient-search`

## Overview

Build a dedicated Ingredient Search view that lets users select ingredients and tags, set a minimum match threshold via a slider, and see matching recipes in a responsive grid.

Ingredient names live in Firestore subcollections (`recipes/{id}/ingredients`). To avoid N+1 reads at search time, we will denormalize an `ingredientNames` string array onto each recipe document the first time its ingredients are loaded, and use that array for client-side matching.

---

## Phase 1 — Denormalize ingredient names onto recipe documents

**Goal:** Make ingredient matching fast and queryable from the already-loaded `recipes` array, without extra Firestore reads at search time.

**Files to touch:**
- `src/features/recipes/services/recipeService.js`

**Steps:**
1. Add a `getIngredientsForAllRecipes(recipeIds)` helper in `recipeService` that batch-fetches the `ingredients` subcollection for every recipe in one pass (or sequential fetches).
2. Add a `populateIngredientNames(recipes)` helper that, given a list of recipe objects, fetches their ingredient subcollections and returns the recipes augmented with an `ingredientNames: string[]` field (lowercased `item` values, deduplicated).
3. Do **not** write back to Firestore — keep `ingredientNames` in-memory only for now (no schema migration needed in this phase).

---

## Phase 2 — Composable: `useIngredientSearch`

**Goal:** Encapsulate all ingredient/tag filtering and slider logic in a reusable composable.

**Files to create:**
- `src/features/recipes/composables/useIngredientSearch.js`

**Exported state and functions:**
- `selectedIngredients` — `ref([])` of ingredient name strings the user has chosen
- `matchThreshold` — `ref(1)` — minimum number of selected ingredients that must be in a recipe
- `activeTagFilters` — `ref(new Set())` — selected tag strings
- `ingredientQuery` — `ref('')` — current text in the ingredient autocomplete input
- `allIngredientSuggestions` — `computed` — sorted unique list of all ingredient names across all recipes (derived from `recipesSource`)
- `filteredSuggestions` — `computed` — `allIngredientSuggestions` filtered by `ingredientQuery` (substring, case-insensitive), excluding already-selected ingredients
- `availableTags` — `computed` — all unique tags across all recipes, sorted
- `filteredRecipes` — `computed` — recipes where:
  - the count of `ingredientNames` that intersect `selectedIngredients` (lowercased) is ≥ `matchThreshold`
  - AND the recipe has all `activeTagFilters` tags (if any)
- `addIngredient(name)` — adds to `selectedIngredients`, clears `ingredientQuery`, clamps `matchThreshold` to new max
- `removeIngredient(name)` — removes from `selectedIngredients`, clamps `matchThreshold` to new max
- `toggleTag(tag)` — adds/removes from `activeTagFilters`
- `clearAll()` — resets everything to defaults

**Clamping rule:** after any change to `selectedIngredients`, `matchThreshold` is automatically clamped to `Math.min(matchThreshold, selectedIngredients.length)` with a minimum of 1.

---

## Phase 3 — Route and view scaffold

**Goal:** Create the new page and hook it into the router and nav.

**Files to create/touch:**
- `src/features/recipes/views/IngredientSearchView.vue` (new)
- `src/router/index.js`
- `src/components/AppNavbar.vue` (or wherever nav links live — verify path first)

**Steps:**
1. Create `IngredientSearchView.vue` with a minimal scaffold (heading, loading state placeholder).
2. Add a lazy-loaded route: `{ path: '/ingredient-search', name: 'ingredient-search', component: () => import(...) }`.
3. Add a nav link "Ingredient Search" pointing to `{ name: 'ingredient-search' }`.

---

## Phase 4 — Ingredient input and chips UI

**Goal:** Implement the ingredient typeahead input and selected-ingredient chips.

**Files to touch:**
- `src/features/recipes/views/IngredientSearchView.vue`

**Steps:**
1. Wire up `useIngredientSearch` composable and `useRecipesStore`.
2. On `onMounted`, call `loadAllRecipes()` then `populateIngredientNames()` to hydrate `ingredientNames` on the store recipes.
3. Add a PrimeVue `AutoComplete` input bound to `ingredientQuery`, using `filteredSuggestions` as the dropdown options. On select, call `addIngredient`.
4. Below the input, render `selectedIngredients` as removable chips (each with an × button that calls `removeIngredient`).
5. Show a loading skeleton grid while recipes are loading.

---

## Phase 5 — Slider and tag filters

**Goal:** Add the match-threshold slider and tag filter chips.

**Files to touch:**
- `src/features/recipes/views/IngredientSearchView.vue`

**Steps:**
1. Add a PrimeVue `Slider` component below the ingredient chips. Only show it when `selectedIngredients.length >= 2`. Bind `:min="1"`, `:max="selectedIngredients.length"`, `v-model="matchThreshold"`. Label: "Match at least {{ matchThreshold }} of {{ selectedIngredients.length }} ingredients".
2. Below the slider, render tag filter chips using the same `browse__filter-chip` pattern from `BrowseView`. Show all `availableTags`; highlight active ones. On click, call `toggleTag`.
3. Add a "Clear all" button that calls `clearAll()`. Only show it when any ingredient or tag is selected.

---

## Phase 6 — Results grid and empty states

**Goal:** Display filtered recipe cards and handle all result states.

**Files to touch:**
- `src/features/recipes/views/IngredientSearchView.vue`

**Steps:**
1. Show a results count heading: "N recipes found" (or hidden when 0).
2. Render `filteredRecipes` in a responsive grid using `RecipeCard`, matching the grid layout from `BrowseView`. Each card navigates to the recipe detail on click.
3. Empty state when `selectedIngredients.length === 0`: show a prompt like "Add ingredients above to find matching recipes."
4. Empty state when ingredients are selected but no recipes match: "No recipes match your selection. Try reducing the match threshold or removing an ingredient."
5. Add a loading skeleton grid (9 cards) shown while `recipesStore.loading` is true.

---

## Phase 7 — Styling

**Goal:** Style the view to match the existing app's Forge theme.

**Files to touch:**
- `src/features/recipes/views/IngredientSearchView.vue` (`<style scoped>`)

**Steps:**
1. Add `@reference "../../../assets/main.css";` at top of scoped styles.
2. Use BEM class names (`ingredient-search__*`).
3. Use PrimeVue semantic color tokens and existing `forge__*` utility classes for textures and borders.
4. Ensure the layout is responsive: single column on mobile, 2–3 columns on desktop for the results grid.

---

## Phase 8 — Tests

**Goal:** Cover the core matching logic with unit tests.

**Files to create:**
- `src/tests/useIngredientSearch.spec.js`

**Test cases:**
1. Single ingredient selected, threshold 1 — returns only recipes containing that ingredient
2. Multiple ingredients, threshold 1 — returns recipes containing any of the selected ingredients
3. Multiple ingredients, threshold = count — returns only recipes containing all selected ingredients
4. Threshold auto-clamps when an ingredient is removed
5. Combined ingredient + tag filter — both conditions must be satisfied
6. No match — `filteredRecipes` is empty; no error thrown
7. No ingredients selected — `filteredRecipes` returns all recipes (or empty set — decide and document in spec)
