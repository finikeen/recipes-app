# Recipe Detail Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder `RecipeDetailView.vue` with a full recipe detail page: header zone (placeholder image + title/description/tags + owner actions) and a two-column body zone (ingredients + directions, fully expanded, no tabs).

**Architecture:** All logic in `RecipeDetailView.vue`. Data fetched on mount in parallel via `recipeService`. Owner check via `authStore.user.uid === recipe.userId`. Delete uses PrimeVue `ConfirmDialog` + `useConfirm()`. `ConfirmService` must be registered globally in `main.js` first.

**Tech Stack:** Vue 3 `<script setup>`, Pinia (`useRecipesStore` + `useAuthStore`), Firebase Firestore (`recipeService`), PrimeVue (`Skeleton`, `ConfirmDialog`, `useConfirm`, `ConfirmService`), Tailwind CSS v4 + `tailwindcss-primeui`, forge theme classes.

> **Note:** No test suite is configured in this project. Skip all test steps; implement directly.

---

### Task 1: Register ConfirmService in `main.js`

**Files:**
- Modify: `src/main.js`

PrimeVue's `useConfirm()` composable requires `ConfirmService` to be registered with the app — otherwise it throws at runtime.

**Step 1: Add the import and registration**

Open `src/main.js`. Add one import and one `app.use()` call:

```js
// Add after the existing PrimeVue import line:
import ConfirmService from 'primevue/confirmservice'

// Add after app.use(PrimeVue, { ... }):
app.use(ConfirmService)
```

The final `main.js` should look like:

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmService from 'primevue/confirmservice'
import ForgePreset from './theme.js'
import 'primeicons/primeicons.css'
import router from './router/index.js'
import App from './App.vue'
import './assets/main.css'
import { useAuthStore } from './features/auth/store.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: ForgePreset,
    options: {
      darkModeSelector: '.dark'
    }
  }
})
app.use(ConfirmService)

// Initialize Firebase auth listener before mounting
const authStore = useAuthStore()
authStore.initializeAuthListener().then(() => {
  app.mount('#app')
})
```

**Step 2: Verify dev server still starts**

Run: `npm run dev`
Expected: No errors in the terminal or browser console.

---

### Task 2: Add `forge__button-danger` to `forge-components.css`

**Files:**
- Modify: `src/styles/forge-components.css`

The Delete button needs a red danger variant that follows the same pattern as the existing `forge__button-primary`.

**Step 1: Append the danger variant**

Open `src/styles/forge-components.css`. Add these rules after the `.forge__button-primary` block (around line 141):

```css
/* Danger button: red with matching hover glow */
.forge__button-danger {
  border-color: #e05252;
  color: #e05252;
}

.forge__button-danger:hover:not(:disabled) {
  background-color: rgba(224, 82, 82, 0.05);
  border-color: #f87171;
  color: #f87171;
  box-shadow:
    0 0 12px rgba(224, 82, 82, 0.4),
    0 0 24px rgba(224, 82, 82, 0.15);
}

.forge__button-danger:active:not(:disabled) {
  background-color: rgba(224, 82, 82, 0.15);
}
```

**Step 2: Verify in browser**

The class won't be used yet, but the dev server should still compile cleanly with no errors.

---

### Task 3: Implement `RecipeDetailView.vue`

**Files:**
- Modify: `src/features/recipes/views/RecipeDetailView.vue`

Replace the entire placeholder file with the full implementation below.

**Step 1: Replace the file contents**

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog'
import Skeleton from 'primevue/skeleton'
import { useRecipesStore } from '@/features/recipes/store'
import { useAuthStore } from '@/features/auth/store'
import { recipeService } from '@/features/recipes/services/recipeService'

const route = useRoute()
const router = useRouter()
const recipesStore = useRecipesStore()
const authStore = useAuthStore()
const confirm = useConfirm()

const recipe = ref(null)
const loading = ref(false)
const notFound = ref(false)
const ingredients = ref([])
const ingredientsLoading = ref(false)
const deleting = ref(false)

const isOwner = computed(() =>
  authStore.user?.uid && recipe.value?.userId === authStore.user.uid
)

const ingredientLines = computed(() => {
  if (ingredients.value.length > 0) {
    return ingredients.value.map(({ quantity, unit, item }) =>
      [quantity, unit, item].filter(Boolean).join(' ')
    )
  }
  if (Array.isArray(recipe.value?.ingredients) && recipe.value.ingredients.length > 0) {
    return recipe.value.ingredients
  }
  return null
})

const directionLines = computed(() => {
  if (Array.isArray(recipe.value?.directions) && recipe.value.directions.length > 0) {
    return recipe.value.directions
  }
  return null
})

const handleEdit = () => {
  router.push({ name: 'recipe-edit', params: { id: recipe.value.id } })
}

const handleDelete = () => {
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
}

onMounted(async () => {
  const id = route.params.id
  loading.value = true
  ingredientsLoading.value = true
  try {
    const [fetchedRecipe, fetchedIngredients] = await Promise.all([
      recipeService.getRecipeById(id),
      recipeService.getIngredients(id)
    ])
    recipe.value = fetchedRecipe
    ingredients.value = fetchedIngredients
    if (!fetchedRecipe) notFound.value = true
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
    ingredientsLoading.value = false
  }
})
</script>

<template>
  <div class="detail">
    <RouterLink :to="{ name: 'browse' }" class="detail__back forge__link">
      ← Browse
    </RouterLink>

    <!-- Not found -->
    <div v-if="notFound" class="detail__not-found">
      <p class="detail__not-found-msg">Recipe not found.</p>
      <RouterLink :to="{ name: 'browse' }" class="forge__link">← Back to Browse</RouterLink>
    </div>

    <!-- Loading skeleton -->
    <div
      v-else-if="loading"
      class="detail__card forge__card forge__runic-border forge__texture-stone"
    >
      <div class="detail__header">
        <Skeleton class="detail__image" />
        <div class="detail__meta">
          <Skeleton width="60%" height="2rem" class="detail__skeleton-row" />
          <Skeleton width="90%" height="1rem" class="detail__skeleton-row" />
          <Skeleton width="80%" height="1rem" class="detail__skeleton-row" />
          <div class="detail__skeleton-tags">
            <Skeleton width="60px" height="1.5rem" />
            <Skeleton width="80px" height="1.5rem" />
            <Skeleton width="50px" height="1.5rem" />
          </div>
        </div>
      </div>
      <div class="detail__divider" aria-hidden="true"></div>
      <div class="detail__body">
        <div class="detail__col">
          <Skeleton v-for="n in 6" :key="n" width="100%" height="1.25rem" class="detail__skeleton-row" />
        </div>
        <div class="detail__col">
          <Skeleton v-for="n in 4" :key="n" width="100%" height="1.25rem" class="detail__skeleton-row" />
        </div>
      </div>
    </div>

    <!-- Recipe content -->
    <article
      v-else-if="recipe"
      class="detail__card forge__card forge__runic-border forge__texture-stone"
      :aria-label="recipe.name"
    >
      <ConfirmDialog />

      <!-- Header zone -->
      <div class="detail__header">
        <!-- Placeholder image -->
        <div class="detail__image" aria-hidden="true">
          <i class="pi pi-book detail__image-icon"></i>
        </div>

        <!-- Meta -->
        <div class="detail__meta">
          <h1 class="detail__title">{{ recipe.name ?? 'Untitled Recipe' }}</h1>
          <p class="detail__description">{{ recipe.description?.trim() || 'No description provided.' }}</p>

          <div v-if="recipe.tags?.length" class="detail__tags" aria-label="Tags">
            <span
              v-for="(tag, i) in recipe.tags"
              :key="`${tag}-${i}`"
              class="forge__tag"
            >{{ tag }}</span>
          </div>

          <div v-if="isOwner" class="detail__actions">
            <button class="forge__button" @click="handleEdit" :disabled="deleting">
              Edit
            </button>
            <button
              class="forge__button forge__button-danger"
              @click="handleDelete"
              :disabled="deleting"
            >
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="detail__divider" aria-hidden="true"></div>

      <!-- Body zone -->
      <div class="detail__body">
        <!-- Ingredients -->
        <section class="detail__col" aria-label="Ingredients">
          <h2 class="detail__col-heading">Ingredients</h2>
          <template v-if="ingredientsLoading">
            <Skeleton
              v-for="n in 5"
              :key="n"
              width="100%"
              height="1.25rem"
              class="detail__skeleton-row"
            />
          </template>
          <ul v-else-if="ingredientLines" class="detail__list">
            <li v-for="(line, i) in ingredientLines" :key="i" class="detail__list-item">
              {{ line }}
            </li>
          </ul>
          <p v-else class="detail__empty">No ingredients listed.</p>
        </section>

        <!-- Directions -->
        <section class="detail__col detail__col--directions" aria-label="Directions">
          <h2 class="detail__col-heading">Directions</h2>
          <ol v-if="directionLines" class="detail__list detail__list--ordered">
            <li v-for="(step, i) in directionLines" :key="i" class="detail__list-item">
              {{ step }}
            </li>
          </ol>
          <p v-else class="detail__empty">No directions listed.</p>
        </section>
      </div>
    </article>
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.detail {
  @apply w-full;
}

.detail__back {
  @apply inline-block mb-4 text-sm;
}

.detail__not-found {
  @apply text-center py-12;
}

.detail__not-found-msg {
  @apply text-muted-color mb-4;
}

/* Suppress forge__card hover lift — full-page card should not move */
.detail__card:hover {
  transform: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

.detail__card {
  @apply w-full;
  padding: 0;
  overflow: hidden;
}

/* ── Header zone ─────────────────────────────── */

.detail__header {
  @apply flex gap-6 p-6;
  flex-direction: column;
}

@media (min-width: 640px) {
  .detail__header {
    flex-direction: row;
    align-items: flex-start;
  }
}

/* Placeholder image */
.detail__image {
  flex-shrink: 0;
  width: 100%;
  height: 200px;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--surface-100) 0%, var(--surface-200) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

@media (min-width: 640px) {
  .detail__image {
    width: 220px;
    height: auto;
    min-height: 180px;
  }
}

.detail__image::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 40%, rgba(232, 160, 66, 0.08) 0%, transparent 70%),
    radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 60%);
}

.detail__image-icon {
  font-size: 3rem;
  color: var(--primary-color);
  opacity: 0.6;
  position: relative;
  z-index: 1;
}

/* Meta */
.detail__meta {
  @apply flex flex-col gap-3;
  flex: 1;
  min-width: 0;
}

.detail__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
  text-shadow:
    0 0 16px rgba(232, 160, 66, 0.5),
    0 0 32px rgba(232, 160, 66, 0.2);
  margin: 0;
}

.detail__description {
  color: var(--text-color-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}

.detail__tags {
  @apply flex flex-wrap gap-2;
}

.detail__actions {
  @apply flex gap-3 pt-2;
  flex-wrap: wrap;
}

/* Skeleton */
.detail__skeleton-row {
  @apply mb-2;
  display: block;
}

.detail__skeleton-tags {
  @apply flex gap-2 mt-1;
}

/* ── Divider ─────────────────────────────────── */

.detail__divider {
  height: 1px;
  background-color: var(--surface-200);
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.15);
}

/* ── Body zone ───────────────────────────────── */

.detail__body {
  @apply flex flex-col gap-8 p-6;
}

@media (min-width: 768px) {
  .detail__body {
    @apply flex-row;
    align-items: flex-start;
  }
}

.detail__col {
  @apply flex flex-col gap-3;
  flex: 1;
}

/* On mobile, directions get a top border separator */
.detail__col--directions {
  border-top: 1px solid var(--surface-200);
  padding-top: 1.5rem;
}

@media (min-width: 768px) {
  .detail__col--directions {
    border-top: none;
    border-left: 1px solid var(--surface-200);
    padding-top: 0;
    padding-left: 2rem;
  }
}

.detail__col-heading {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: 0.06em;
  font-variant: small-caps;
  margin: 0;
  border-bottom: 1px solid var(--surface-100);
  padding-bottom: 0.5rem;
}

/* Lists */
.detail__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.detail__list--ordered {
  counter-reset: direction-counter;
}

.detail__list-item {
  color: var(--text-color);
  font-size: 0.9375rem;
  line-height: 1.5;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-100);
}

.detail__list-item:last-child {
  border-bottom: none;
}

.detail__list--ordered .detail__list-item {
  counter-increment: direction-counter;
  padding-left: 2rem;
  position: relative;
}

.detail__list--ordered .detail__list-item::before {
  content: counter(direction-counter) ".";
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.8125rem;
}

/* Empty state */
.detail__empty {
  color: var(--text-color-secondary);
  font-style: italic;
  font-size: 0.9375rem;
  margin: 0;
}
</style>
```

**Step 2: Verify in the browser**

1. Run `npm run dev` if not already running.
2. Navigate to a recipe card on the Browse page and click through to its detail page (or navigate to `/recipes/<some-id>` directly).
3. Check:
   - Loading skeleton appears briefly then recipe loads
   - Header: placeholder image left, title/description/tags right
   - Body: ingredients on left, directions on right (stacked on mobile)
   - "← Browse" link at top navigates back to `/browse`
4. Navigate to `/recipes/nonexistent-id` — should show "Recipe not found."
5. If logged in as the recipe owner, Edit and Delete buttons appear in the header.
6. Click Delete — confirm dialog appears. Click Cancel → nothing happens. Click confirm → recipe deleted, redirected to home.

---

### Task 4: Commit

```bash
git add src/main.js src/styles/forge-components.css src/features/recipes/views/RecipeDetailView.vue
git commit -m "feat: implement recipe detail page with owner actions"
```
