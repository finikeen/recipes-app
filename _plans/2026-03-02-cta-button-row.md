# Plan: Home Page CTA Button Row

## Context

The home page currently shows a featured recipe hero with two buttons: "Load another" and "View full recipe →". There is no way for users to jump to browse filtered by meal type from the home page. This feature adds a row of five stylish pill buttons above the hero — Breakfast, Lunch, Dinner, Special, Reforge — making it easy to navigate to recipes by context. "Load Another" is retired from the hero and reborn as "Reforge" in the CTA row.

---

## Approach

### Navigation strategy: URL query params

Pre-filtering is passed as `?tags=<comma-separated-tags>` to the browse route. BrowseView reads this on mount and pre-populates its active tag filters using the existing `toggleTag()` function from `useRecipeSearch`. This keeps state bookmarkable and avoids Pinia side-effects.

Button → route mapping:
- **Breakfast** → `/browse?tags=breakfast`
- **Lunch** → `/browse?tags=lunch`
- **Dinner** → `/browse?tags=dinner`
- **Special** → `/browse?tags=vegan,dairy-free,vegetarian,seafood`
- **Reforge** → emits `reforge` → `pickRandom()` in HomeView (no navigation)

---

## Implementation Steps

### Step 1 — Add query param pre-filtering to BrowseView

**File:** `src/features/recipes/views/BrowseView.vue`

- Import `useRoute` from `vue-router`
- In `onMounted` (after recipes are loaded, or in a `watchEffect` once recipes are available), read `route.query.tags`
- Split by comma, trim, and call `toggleTag(tag)` for each non-empty tag
- Existing `toggleTag` from `useRecipeSearch` handles adding to `activeTagFilters` Set — reuse as-is

> Note: call `toggleTag` only once on mount (not reactively), so the user can still change filters after landing.

### Step 2 — Create CtaButtonRow component

**New file:** `src/features/recipes/components/CtaButtonRow.vue`

Structure:
```
<script setup>
  const emit = defineEmits(['reforge'])
  const router = useRouter()

  const MEAL_BUTTONS = [
    { label: 'Breakfast', icon: '🌅', tags: ['breakfast'] },
    { label: 'Lunch',     icon: '☀️',  tags: ['lunch'] },
    { label: 'Dinner',    icon: '🌙', tags: ['dinner'] },
    { label: 'Special',  icon: '✨', tags: ['vegan', 'dairy-free', 'vegetarian', 'seafood'] },
  ]

  function browse(tags) {
    router.push({ name: 'browse', query: { tags: tags.join(',') } })
  }
</script>

<template>
  <div class="cta-row" role="navigation" aria-label="Browse by meal type">
    <button v-for="btn in MEAL_BUTTONS" ... @click="browse(btn.tags)">
      <span class="cta-row__icon">{{ btn.icon }}</span>
      {{ btn.label }}
    </button>
    <button class="cta-row__reforge" @click="emit('reforge')">
      🔥 Reforge
    </button>
  </div>
</template>
```

Styling (BEM, scoped `@apply`, `@reference "../../../assets/main.css"`):
- `.cta-row` — `flex flex-wrap justify-center gap-3 py-6`
- `.cta-row__btn` — pill shape, `bg-surface-100`, `text-color`, `rounded-full`, `px-5 py-2.5`, `font-semibold`, `text-sm`, transition on hover; hover lifts with `var(--primary-color)` border glow
- `.cta-row__reforge` — same pill but with a subtle forge-orange border / glow to distinguish it from the meal type buttons

### Step 3 — Update HomeView to use CtaButtonRow

**File:** `src/features/recipes/views/HomeView.vue`

- Import and render `<CtaButtonRow @reforge="pickRandom" />` above the `<HeroRecipe>` block (inside the `v-if="!recipesStore.loading"` guard so it only shows once recipes are ready)
- Remove `@load-another="pickRandom"` listener from `<HeroRecipe>` (event will no longer be emitted)

### Step 4 — Remove "Load another" from HeroRecipe

**File:** `src/features/recipes/components/HeroRecipe.vue`

- Remove the `<button class="forge__button" @click="emit('load-another')">Load another</button>` element from `.hero__actions`
- Remove `"load-another"` from `defineEmits([...])`
- `.hero__actions` now contains only the "View full recipe →" primary button

---

## Files Modified

| File | Change |
|------|--------|
| `src/features/recipes/views/BrowseView.vue` | Read `route.query.tags` on mount, call `toggleTag` |
| `src/features/recipes/components/CtaButtonRow.vue` | **New** — CTA button row component |
| `src/features/recipes/views/HomeView.vue` | Add `<CtaButtonRow>`, remove `@load-another` |
| `src/features/recipes/components/HeroRecipe.vue` | Remove "Load another" button and emit |

---

## Reused Utilities

- `toggleTag(tag)` from `useRecipeSearch` (`src/features/recipes/composables/useRecipeSearch.js`) — already handles adding tags to `activeTagFilters` Set
- `pickRandom()` in `HomeView.vue` — already exists, just wired to new component via emit
- `forge__button` / `forge__button-primary` base styles — reference for new `.cta-row__btn` styling

---

## Verification

1. Run `npm run dev`
2. On the home page — confirm:
   - The hero no longer has a "Load another" button
   - The CTA row appears above the hero with 5 buttons
   - "Reforge" button cycles the hero recipe (does not navigate)
3. Click **Breakfast** → browse page opens with "breakfast" tag chip pre-active, recipes filtered
4. Click **Lunch** / **Dinner** → same for their respective tags
5. Click **Special** → browse page opens with vegan, dairy-free, vegetarian, seafood tags all pre-active (OR logic, any matching recipe shown)
6. Refresh `/browse?tags=dinner` directly → filters apply on load
7. Verify responsive wrapping on mobile viewport (≤480px)
