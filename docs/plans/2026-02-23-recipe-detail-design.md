# Recipe Detail Page — Design

**Date:** 2026-02-23

## Summary

Replace the placeholder `RecipeDetailView.vue` with a full recipe detail page. Single forge card with two zones: a header (placeholder image + title/description/tags + owner actions) and a body (ingredients and directions in two side-by-side columns, fully expanded — no tabs, no scroll caps).

## Layout

```
← Browse                               (back link, above card)

┌──────────────────────────────────────────────────────┐
│  [placeholder img]  │  Recipe Title                  │
│  (forge-textured    │  Description text...            │  ← header zone (flex row, stacks on mobile)
│   div + icon)       │  [tag] [tag] [tag]              │
│                     │  [Edit]  [Delete]  (owner only) │
├─────────────────────┴────────────────────────────────┤
│  Ingredients                │  Directions             │  ← body zone (two columns on md+,
│  • item 1                   │  1. Step one            │    single column on mobile)
│  • item 2                   │  2. Step two            │
│  • item 3                   │  3. Step three          │
└──────────────────────────────────────────────────────┘
```

All logic is contained in `RecipeDetailView.vue`. No new component files.

## Data & State

```js
const recipe = ref(null)
const loading = ref(false)
const notFound = ref(false)
const ingredients = ref([])
const ingredientsLoading = ref(false)
const deleting = ref(false)
```

### Data fetching

On `onMounted`, two parallel fetches:
- `recipeService.getRecipeById(route.params.id)` → `recipe`
- `recipeService.getIngredients(route.params.id)` → `ingredients`

If `getRecipeById` returns `null` → `notFound.value = true`; show a "Recipe not found" message with a link back to Browse.

### Ingredient resolution

Same logic as `HeroRecipe`: subcollection results preferred; fallback to `recipe.ingredients` array; `null` if neither exists (renders an empty state).

### Owner check

```js
const isOwner = computed(() =>
  authStore.user?.uid && recipe.value?.userId === authStore.user.uid
)
```

Uses `useAuthStore()`. No route guard — the page is publicly readable.

### Loading states

Skeleton placeholders for both zones during initial fetch, consistent with Browse and Home patterns.

## Owner Actions

### Edit

Navigates to the existing edit route:

```js
router.push({ name: 'recipe-edit', params: { id: recipe.value.id } })
```

### Delete

Uses PrimeVue `useConfirm()` + `<ConfirmDialog />` in the template:

```js
confirm.require({
  message: 'Are you sure you want to delete this recipe? This cannot be undone.',
  header: 'Delete Recipe',
  icon: 'pi pi-exclamation-triangle',
  acceptClass: 'p-button-danger',
  accept: async () => {
    deleting.value = true
    await recipesStore.deleteRecipe(recipe.value.id)
    router.push({ name: 'home' })
  }
})
```

After deletion, redirects to Home.

Buttons use existing `forge__button` / `forge__button-danger` classes and are only rendered when `isOwner` is true.

## Placeholder Image

A styled `<div>` — forge-textured background with a centered decorative SVG icon (cauldron or flame). No `imageUrl` field exists in the recipe data model; this is purely decorative.

## Out of Scope

- Recipe image upload / real image display
- Comments or ratings
- Social sharing
- Servings scaler
