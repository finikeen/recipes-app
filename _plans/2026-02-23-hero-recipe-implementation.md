# Hero Recipe Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-width split-reveal hero recipe component for the homepage — the "anvil" of the forge — showing title, description, tags, and tabbed ingredients/directions.

**Architecture:** A new `HeroRecipe.vue` component receives a recipe prop from `HomeView`, fetches the ingredients subcollection internally, and emits `load-another` / `view-recipe` events. `HomeView` is updated to swap out `RecipeCard` for `HeroRecipe` and handle the new events.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), Pinia, Vue Router, Firebase Firestore (subcollection query), Tailwind CSS v4 via `@apply`, forge CSS utility classes.

---

## Context: Forge Theme Classes

These reusable classes are defined in `src/styles/forge-*.css` and are safe to use without importing:

- `.forge__card` — dark surface card with gradient top border (purple→amber via `::before`)
- `.forge__texture-stone` — stone block texture overlay via `::before` (conflicts with `.forge__card::before` if on same element — use on a child wrapper or accept the override)
- `.forge__runic-border` — runic SVG border on top edge via `::after`
- `.forge__tag` — purple rune chip tag button
- `.forge__button` — purple outline button
- `.forge__button-primary` — amber fill button
- `--primary-color` — amber `#e8a042`
- `--purple-accent` — purple `#8b5cf6`
- `--text-color` — silver `#c8c4d4`
- `--text-color-secondary` — muted `#8a849a`
- `--surface-100` — subtle divider `#2e2a3a`
- `--surface-200` — border `#383245`

## Context: Firestore Subcollection Pattern

The `ingredients` subcollection lives at `recipes/{recipeId}/ingredients`. Each document has fields: `quantity` (string/number), `unit` (string), `item` (string). Use Firebase `collection(db, 'recipes', recipeId, 'ingredients')` + `getDocs`.

## Context: `@reference` Directive

Every `<style scoped>` block that uses `@apply` must start with:
```css
@reference "../../../assets/main.css";
```
(adjust relative path based on file location — this path is correct for files in `src/features/recipes/components/` and `src/features/recipes/views/`)

---

## Task 1: Add `getIngredients` to recipeService

**Files:**
- Modify: `src/features/recipes/services/recipeService.js`

### Step 1: Add `collection` and `orderBy` to the Firebase imports (if not already present)

Open `src/features/recipes/services/recipeService.js`. The top import already includes `collection` and `getDocs`. No changes needed to imports.

### Step 2: Add `getIngredients` method to `recipeService`

Add this method inside the `recipeService` object, after `getAllRecipes`:

```js
async getIngredients(recipeId) {
  try {
    const ingredientsRef = collection(db, 'recipes', recipeId, 'ingredients')
    const querySnapshot = await getDocs(ingredientsRef)
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
  } catch (err) {
    throw new Error(`Failed to get ingredients: ${err.message}`)
  }
}
```

### Step 3: Verify the file looks correct

The full export object should now have these methods: `addRecipe`, `updateRecipe`, `deleteRecipe`, `getRecipeById`, `getUserRecipes`, `getAllRecipes`, `getIngredients`.

### Step 4: Commit

```bash
git add src/features/recipes/services/recipeService.js
git commit -m "feat: add getIngredients subcollection method to recipeService"
```

---

## Task 2: Build `HeroRecipe.vue`

**Files:**
- Create: `src/features/recipes/components/HeroRecipe.vue`

### Step 1: Create the file with script setup

Create `src/features/recipes/components/HeroRecipe.vue` with this script block:

```vue
<script setup>
import { ref, watch, computed } from 'vue'
import Skeleton from 'primevue/skeleton'
import { recipeService } from '@/features/recipes/services/recipeService'

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['load-another', 'view-recipe'])

// Tab state: 'ingredients' | 'directions'
const activeTab = ref('ingredients')

// Ingredients subcollection state
const subcollectionIngredients = ref([])
const ingredientsLoading = ref(false)

// Fetch subcollection when recipe changes
watch(
  () => props.recipe?.id,
  async (id) => {
    if (!id) return
    ingredientsLoading.value = true
    subcollectionIngredients.value = []
    try {
      const results = await recipeService.getIngredients(id)
      subcollectionIngredients.value = results
    } catch {
      subcollectionIngredients.value = []
    } finally {
      ingredientsLoading.value = false
    }
  },
  { immediate: true }
)

// Resolved ingredient lines: subcollection preferred, fallback to recipe.ingredients array
const ingredientLines = computed(() => {
  if (subcollectionIngredients.value.length > 0) {
    return subcollectionIngredients.value.map(({ quantity, unit, item }) =>
      [quantity, unit, item].filter(Boolean).join(' ')
    )
  }
  if (Array.isArray(props.recipe.ingredients) && props.recipe.ingredients.length > 0) {
    return props.recipe.ingredients
  }
  return null // null means "no ingredients"
})

const directionLines = computed(() => {
  if (Array.isArray(props.recipe.directions) && props.recipe.directions.length > 0) {
    return props.recipe.directions
  }
  return null // null means "no directions"
})

const displayTags = computed(() => {
  const tags = props.recipe.tags ?? []
  return tags.slice(0, 5)
})
</script>
```

### Step 2: Add the template

Add this `<template>` block after the `<script setup>`:

```vue
<template>
  <article class="hero forge__card forge__runic-border" :aria-label="recipe.name">
    <!-- Left panel: identity -->
    <div class="hero__identity">
      <h2 class="hero__title">{{ recipe.name ?? 'Untitled Recipe' }}</h2>

      <p class="hero__description">
        {{ recipe.description?.trim() || 'No description provided.' }}
      </p>

      <div v-if="displayTags.length" class="hero__tags" aria-label="Tags">
        <button
          v-for="(tag, i) in displayTags"
          :key="`${tag}-${i}`"
          class="forge__tag"
        >
          {{ tag }}
        </button>
      </div>

      <div class="hero__actions">
        <button class="forge__button" @click="emit('load-another')">
          Load another
        </button>
        <button
          class="forge__button forge__button-primary"
          @click="emit('view-recipe', recipe.id)"
        >
          View full recipe →
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="hero__divider" aria-hidden="true"></div>

    <!-- Right panel: tabbed content -->
    <div class="hero__content">
      <!-- Tab bar -->
      <div class="hero__tabs" role="tablist" aria-label="Recipe details">
        <button
          role="tab"
          :aria-selected="activeTab === 'ingredients'"
          :class="['hero__tab', { 'hero__tab--active': activeTab === 'ingredients' }]"
          @click="activeTab = 'ingredients'"
        >
          Ingredients
        </button>
        <button
          role="tab"
          :aria-selected="activeTab === 'directions'"
          :class="['hero__tab', { 'hero__tab--active': activeTab === 'directions' }]"
          @click="activeTab = 'directions'"
        >
          Directions
        </button>
      </div>

      <!-- Tab panels -->
      <div class="hero__panel" role="tabpanel">
        <!-- Ingredients tab -->
        <template v-if="activeTab === 'ingredients'">
          <template v-if="ingredientsLoading">
            <Skeleton v-for="n in 5" :key="n" class="hero__skeleton-row" height="1.25rem" />
          </template>
          <ul v-else-if="ingredientLines" class="hero__list">
            <li
              v-for="(line, i) in ingredientLines"
              :key="i"
              class="hero__list-item"
            >
              {{ line }}
            </li>
          </ul>
          <p v-else class="hero__empty">No ingredients listed.</p>
        </template>

        <!-- Directions tab -->
        <template v-if="activeTab === 'directions'">
          <ol v-if="directionLines" class="hero__list hero__list--ordered">
            <li
              v-for="(step, i) in directionLines"
              :key="i"
              class="hero__list-item"
            >
              {{ step }}
            </li>
          </ol>
          <p v-else class="hero__empty">No directions listed.</p>
        </template>
      </div>
    </div>
  </article>
</template>
```

### Step 3: Add scoped styles

Add this `<style scoped>` block after `<template>`:

```vue
<style scoped>
@reference "../../../assets/main.css";

/* Layout */
.hero {
  @apply w-full flex flex-col;
  padding: 0;
  overflow: hidden;
}

@media (min-width: 768px) {
  .hero {
    @apply flex-row;
    min-height: 360px;
  }
}

/* Left: identity panel */
.hero__identity {
  @apply flex flex-col gap-4 p-6;
  flex: 0 0 40%;
}

/* Title */
.hero__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
  text-shadow:
    0 0 16px rgba(232, 160, 66, 0.5),
    0 0 32px rgba(232, 160, 66, 0.2);
  margin: 0;
}

/* Description */
.hero__description {
  color: var(--text-color-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Tags */
.hero__tags {
  @apply flex flex-wrap gap-2;
}

/* CTAs */
.hero__actions {
  @apply flex flex-col gap-3 mt-auto pt-4;
}

@media (min-width: 480px) {
  .hero__actions {
    @apply flex-row;
  }
}

/* Divider */
.hero__divider {
  width: 1px;
  background-color: var(--surface-200);
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.2);
  flex-shrink: 0;
  display: none;
}

@media (min-width: 768px) {
  .hero__divider {
    display: block;
  }
}

/* Right: content panel */
.hero__content {
  @apply flex flex-col;
  flex: 1;
  min-width: 0;
}

/* Tab bar */
.hero__tabs {
  @apply flex;
  border-bottom: 1px solid var(--surface-200);
  padding: 0 1.5rem;
  flex-shrink: 0;
}

.hero__tab {
  background: transparent;
  border: none;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.875rem 1rem;
  cursor: pointer;
  position: relative;
  transition: color 150ms ease;
  letter-spacing: 0.04em;
  font-variant: small-caps;
}

.hero__tab::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--purple-accent), var(--primary-color));
  opacity: 0;
  transition: opacity 150ms ease;
}

.hero__tab--active {
  color: var(--text-color);
}

.hero__tab--active::after {
  opacity: 1;
}

.hero__tab:hover:not(.hero__tab--active) {
  color: var(--text-color);
}

.hero__tab:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: -2px;
}

/* Tab panel */
.hero__panel {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  max-height: 280px;
  box-shadow: inset 0 8px 12px rgba(0, 0, 0, 0.2);
}

/* List */
.hero__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hero__list--ordered {
  list-style: none;
  counter-reset: direction-counter;
}

.hero__list-item {
  color: var(--text-color);
  font-size: 0.9375rem;
  line-height: 1.5;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-100);
}

.hero__list-item:last-child {
  border-bottom: none;
}

.hero__list--ordered .hero__list-item {
  counter-increment: direction-counter;
  padding-left: 2rem;
  position: relative;
}

.hero__list--ordered .hero__list-item::before {
  content: counter(direction-counter) '.';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.8125rem;
}

/* Empty state */
.hero__empty {
  color: var(--text-color-secondary);
  font-style: italic;
  font-size: 0.9375rem;
  margin: 0;
  padding: 1rem 0;
}

/* Skeleton rows */
.hero__skeleton-row {
  @apply mb-3;
  display: block;
}
</style>
```

### Step 4: Verify the full component structure

The file should have three blocks in order: `<script setup>`, `<template>`, `<style scoped>`. Check that `@reference "../../../assets/main.css"` is the first line of the style block.

### Step 5: Commit

```bash
git add src/features/recipes/components/HeroRecipe.vue
git commit -m "feat: add HeroRecipe split-reveal component with tabbed ingredients/directions"
```

---

## Task 3: Update `HomeView.vue`

**Files:**
- Modify: `src/features/recipes/views/HomeView.vue`

### Step 1: Swap imports in the script block

Replace the `RecipeCard` import with `HeroRecipe` and add `useRouter`:

Remove:
```js
import RecipeCard from "@/features/recipes/components/RecipeCard.vue"
```

Add:
```js
import { useRouter } from 'vue-router'
import HeroRecipe from "@/features/recipes/components/HeroRecipe.vue"
```

### Step 2: Add `goToRecipe` handler

After `const recipesStore = useRecipesStore()`, add:

```js
const router = useRouter()

const goToRecipe = (recipeId) => {
  router.push({ name: 'recipe-detail', params: { id: recipeId } })
}
```

### Step 3: Replace the template body

Replace the entire `<template>` block with:

```vue
<template>
  <div class="featured__container forge__texture-subtle">
    <h1 class="featured__title sr-only">Recipe Forge</h1>

    <div v-if="recipesStore.loading" class="featured__skeleton">
      <div class="featured__skeleton-left">
        <Skeleton width="60%" height="2rem" class="featured__skeleton-row" />
        <Skeleton width="90%" height="1rem" class="featured__skeleton-row" />
        <Skeleton width="80%" height="1rem" class="featured__skeleton-row" />
        <Skeleton width="40%" height="1rem" class="featured__skeleton-row" />
        <div class="featured__skeleton-tags">
          <Skeleton width="60px" height="1.5rem" />
          <Skeleton width="80px" height="1.5rem" />
          <Skeleton width="50px" height="1.5rem" />
        </div>
      </div>
      <div class="featured__skeleton-right">
        <Skeleton width="100%" height="2rem" class="featured__skeleton-row" />
        <Skeleton v-for="n in 5" :key="n" width="100%" height="1.25rem" class="featured__skeleton-row" />
      </div>
    </div>

    <div v-else-if="!featuredRecipe" class="featured__empty-message">
      No recipes yet.
    </div>

    <template v-else>
      <HeroRecipe
        :recipe="featuredRecipe"
        @load-another="pickRandom"
        @view-recipe="goToRecipe"
      />
    </template>
  </div>
</template>
```

### Step 4: Update the styles

Replace the entire `<style scoped>` block with:

```vue
<style scoped>
@reference "../../../assets/main.css";

.featured__container {
  @apply w-full;
}

.featured__title {
  @apply text-3xl font-bold text-color mb-6;
}

.featured__empty-message {
  @apply text-muted-color text-center py-12;
}

/* Skeleton: two-column layout mirrors the hero */
.featured__skeleton {
  @apply flex gap-6 p-6;
  background-color: var(--surface-0);
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  min-height: 320px;
}

.featured__skeleton-left {
  @apply flex flex-col gap-3;
  flex: 0 0 40%;
}

.featured__skeleton-right {
  @apply flex flex-col gap-3;
  flex: 1;
}

.featured__skeleton-row {
  display: block;
}

.featured__skeleton-tags {
  @apply flex gap-2 mt-2;
}
</style>
```

### Step 5: Verify

Run `npm run dev` and open `http://localhost:3000`. Confirm:
- Hero renders with left/right split on desktop
- Tabs switch between Ingredients and Directions
- "Load another" reshuffles the recipe
- "View full recipe →" navigates to the recipe detail page
- Loading skeleton shows while recipes are fetching

### Step 6: Commit

```bash
git add src/features/recipes/views/HomeView.vue
git commit -m "feat: replace RecipeCard with HeroRecipe on homepage"
```
