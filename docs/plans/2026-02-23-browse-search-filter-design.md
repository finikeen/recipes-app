# Browse Page Search & Filter — Design

**Date:** 2026-02-23

## Summary

Add client-side search and tag filtering to the Browse page (`BrowseView.vue`). Users can search recipes by name and filter by tags using a collapsible panel. Tags available in the panel update dynamically based on the current name search results.

## Requirements

- Text search on recipe **name only** (case-insensitive)
- Tag filtering with **OR logic** (any selected tag matches)
- **100+ tags** — shown in a collapsible panel, not inline
- Tags in the panel are **dynamic**: derived from name-filtered results, not all recipes
- Filtering is **client-side only** — no Firestore queries
- Pagination resets to page 0 when either filter changes

## Architecture

All logic is contained in `BrowseView.vue`. No store changes, no new component files.

### State

```js
const searchQuery = ref('')
const activeTagFilters = ref(new Set())
const filtersOpen = ref(false)
```

### Computed Chain

1. `nameFilteredRecipes` — `recipesStore.recipes` filtered by `searchQuery` on `recipe.name`
2. `availableTags` — unique sorted tags derived from `nameFilteredRecipes`
3. `filteredRecipes` — `nameFilteredRecipes` further filtered by `activeTagFilters` (OR: recipe has at least one active tag)
4. `paginatedRecipes` — slice of `filteredRecipes` (existing logic, updated source)

### Watchers

- Watch `searchQuery` and `activeTagFilters` → reset `currentPage.value` to 0

### Tag Toggle

Since Vue 3 Sets aren't reactive by default, toggle by reassigning:

```js
const toggleTag = (tag) => {
  const next = new Set(activeTagFilters.value)
  next.has(tag) ? next.delete(tag) : next.add(tag)
  activeTagFilters.value = next
}
```

## UI Layout

```
[ Search recipes...         ] [ 🔽 Filters (3) ]
──────────────────────────────────────────────────
▼ (collapsible panel, v-show)
  [ chicken ] [ pasta ] [ quick ] [ vegetarian ] ...
  (wrapping chips, scrollable, max-height ~200px)
  [ Clear all ]
```

### Filter Bar

- Search input: PrimeVue `InputText`, full width minus the Filters button
- Filters button: shows active tag count badge when tags are selected; glows purple when active
- Collapsible panel: `v-show` toggled by `filtersOpen`; no animation needed

### Tag Chips

- Styled as existing `.recipe-card__tag` chips
- Active state: filled purple background (consistent with existing arcane forge accent)
- **Clear all** link visible inside the panel when `activeTagFilters.size > 0`

### Empty States

- No name match + no tag filters active → "No recipes found."
- Tags filtered to zero results → same empty state message

## Out of Scope

- Server-side / Firestore filtering
- Description search
- AND logic for tags
- Saved/persisted filter state
