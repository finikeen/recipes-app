# Recipes Vue 3 Scaffold Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold a clean Vue 3 + Vite starter project called "recipes" with Vue Router, Pinia, PrimeVue (styled/Aura), and Tailwind CSS v4 wired up and ready to build on.

**Architecture:** Feature-modular structure under `src/features/recipes/`. Top navbar layout via `App.vue`. PrimeVue in styled mode using Aura preset; Tailwind v4 via Vite plugin with `tailwindcss-primeui` bridging PrimeVue design tokens to Tailwind utilities.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), Vite, Vue Router 4, Pinia, PrimeVue 4 + @primevue/themes (Aura), Tailwind CSS v4 (@tailwindcss/vite), tailwindcss-primeui, primeicons. No TypeScript.

**Working directory:** `E:/Documents/workspaces/rezipees`

---

### Task 1: Scaffold the Vite project

**Files:**
- Create: `recipes/` (new directory via Vite scaffold)

**Step 1: Scaffold the project**

Run from `E:/Documents/workspaces/rezipees`:
```bash
npm create vite@latest recipes -- --template vue
```
Expected: Directory `recipes/` created with standard Vite Vue template files.

**Step 2: Enter the project and install base dependencies**

```bash
cd recipes && npm install
```
Expected: `node_modules/` created, no errors.

**Step 3: Verify it runs**

```bash
npm run dev
```
Expected: Dev server starts, browser shows default Vite + Vue welcome page. Then stop the server (Ctrl+C).

**Step 4: Commit initial scaffold**

```bash
git init
git add .
git commit -m "chore: initial vite vue scaffold"
```

---

### Task 2: Install all project dependencies

**Files:**
- Modify: `recipes/package.json` (via npm install)

**Step 1: Install routing, state, and UI libraries**

Run from `recipes/`:
```bash
npm install vue-router@4 pinia primevue @primevue/themes primeicons tailwindcss @tailwindcss/vite tailwindcss-primeui
```
Expected: All packages installed, no peer dependency errors. `package.json` updated.

**Step 2: Verify no audit issues**

```bash
npm audit
```
Expected: 0 vulnerabilities (or only dev-tooling warnings unrelated to the app).

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install vue-router, pinia, primevue, tailwind"
```

---

### Task 3: Configure Vite with Tailwind plugin and path alias

**Files:**
- Modify: `recipes/vite.config.js`

**Step 1: Replace vite.config.js contents**

Write this to `recipes/vite.config.js`:
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

**Step 2: Verify dev server still starts**

```bash
npm run dev
```
Expected: Dev server starts without errors. Stop server.

**Step 3: Commit**

```bash
git add vite.config.js
git commit -m "chore: add tailwind vite plugin and @ alias"
```

---

### Task 4: Set up CSS (Tailwind v4 + PrimeVue integration)

**Files:**
- Create: `recipes/src/assets/main.css`
- Delete: `recipes/src/style.css`
- Modify: `recipes/src/assets/base.css` (delete contents or remove entirely)

**Step 1: Create main.css**

Write this to `recipes/src/assets/main.css`:
```css
@import "tailwindcss";
@import "tailwindcss-primeui";
```

**Step 2: Remove Vite default styles**

Delete `recipes/src/style.css` (the Vite default global styles file).

Also clear `recipes/src/assets/base.css` if it exists — replace its contents with:
```css
/* base styles go here */
```

**Step 3: Update index.html title**

In `recipes/index.html`, change:
```html
<title>Vite + Vue</title>
```
to:
```html
<title>Recipes</title>
```

**Step 4: Commit**

```bash
git add src/assets/main.css index.html
git rm src/style.css
git commit -m "chore: set up tailwind v4 css and update page title"
```

---

### Task 5: Wire up main.js

**Files:**
- Modify: `recipes/src/main.js`

**Step 1: Replace main.js contents**

Write this to `recipes/src/main.js`:
```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import router from './router/index.js'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark'
    }
  }
})

app.mount('#app')
```

**Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: wire up pinia, vue-router, and primevue in main.js"
```

---

### Task 6: Create the router

**Files:**
- Create: `recipes/src/router/index.js`

**Step 1: Create router directory and index.js**

Write this to `recipes/src/router/index.js`:
```js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/features/recipes/views/HomeView.vue'
import RecipeDetailView from '@/features/recipes/views/RecipeDetailView.vue'
import RecipeFormView from '@/features/recipes/views/RecipeFormView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/recipes/:id',
    name: 'recipe-detail',
    component: RecipeDetailView
  },
  {
    path: '/recipes/new',
    name: 'recipe-create',
    component: RecipeFormView
  },
  {
    path: '/recipes/:id/edit',
    name: 'recipe-edit',
    component: RecipeFormView
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

**Step 2: Commit**

```bash
git add src/router/index.js
git commit -m "feat: add vue-router with 4 recipe routes + 404"
```

---

### Task 7: Create the Pinia store

**Files:**
- Create: `recipes/src/features/recipes/store.js`

**Step 1: Create the features directory structure and store**

Write this to `recipes/src/features/recipes/store.js`:
```js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref([])

  return { recipes }
})
```

**Step 2: Commit**

```bash
git add src/features/recipes/store.js
git commit -m "feat: add placeholder recipes pinia store"
```

---

### Task 8: Create stub view components

**Files:**
- Create: `recipes/src/features/recipes/views/HomeView.vue`
- Create: `recipes/src/features/recipes/views/RecipeDetailView.vue`
- Create: `recipes/src/features/recipes/views/RecipeFormView.vue`
- Create: `recipes/src/views/NotFoundView.vue`

**Step 1: Create HomeView.vue**

Write this to `recipes/src/features/recipes/views/HomeView.vue`:
```vue
<template>
  <div>
    <h1 class="text-3xl font-bold text-color mb-6">Recipes</h1>
    <p class="text-muted-color">No recipes yet. Add one to get started.</p>
  </div>
</template>

<script setup>
</script>
```

**Step 2: Create RecipeDetailView.vue**

Write this to `recipes/src/features/recipes/views/RecipeDetailView.vue`:
```vue
<template>
  <div>
    <h1 class="text-3xl font-bold text-color mb-6">Recipe #{{ route.params.id }}</h1>
    <p class="text-muted-color">Recipe detail coming soon.</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
```

**Step 3: Create RecipeFormView.vue**

Write this to `recipes/src/features/recipes/views/RecipeFormView.vue`:
```vue
<template>
  <div>
    <h1 class="text-3xl font-bold text-color mb-6">
      {{ isEdit ? 'Edit Recipe' : 'New Recipe' }}
    </h1>
    <p class="text-muted-color">Recipe form coming soon.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isEdit = computed(() => route.name === 'recipe-edit')
</script>
```

**Step 4: Create NotFoundView.vue**

Write this to `recipes/src/views/NotFoundView.vue`:
```vue
<template>
  <div class="flex flex-col items-center justify-center min-h-64 gap-4">
    <h1 class="text-6xl font-bold text-color">404</h1>
    <p class="text-muted-color text-lg">Page not found.</p>
    <RouterLink :to="{ name: 'home' }" class="text-primary hover:text-primary-emphasis">
      Go home
    </RouterLink>
  </div>
</template>

<script setup>
</script>
```

**Step 5: Commit**

```bash
git add src/features/recipes/views/ src/views/
git commit -m "feat: add stub views for home, detail, form, and 404"
```

---

### Task 9: Create the RecipeCard component

**Files:**
- Create: `recipes/src/features/recipes/components/RecipeCard.vue`

**Step 1: Create RecipeCard.vue**

Write this to `recipes/src/features/recipes/components/RecipeCard.vue`:
```vue
<template>
  <Card class="w-full">
    <template #title>{{ recipe.title ?? 'Untitled Recipe' }}</template>
    <template #content>
      <p class="text-muted-color">{{ recipe.description ?? 'No description.' }}</p>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card'

defineProps({
  recipe: {
    type: Object,
    required: true
  }
})
</script>
```

**Step 2: Commit**

```bash
git add src/features/recipes/components/RecipeCard.vue
git commit -m "feat: add placeholder RecipeCard component using PrimeVue Card"
```

---

### Task 10: Create the AppNavbar and App.vue shell

**Files:**
- Create: `recipes/src/components/AppNavbar.vue`
- Modify: `recipes/src/App.vue`

**Step 1: Create AppNavbar.vue**

Write this to `recipes/src/components/AppNavbar.vue`:
```vue
<template>
  <nav class="bg-surface-0 border-b border-surface px-6 py-3 flex items-center gap-6">
    <RouterLink :to="{ name: 'home' }" class="text-xl font-bold text-color no-underline">
      Recipes
    </RouterLink>
    <div class="flex gap-4 ml-auto">
      <RouterLink
        :to="{ name: 'home' }"
        class="text-muted-color hover:text-color transition-colors no-underline"
      >
        Browse
      </RouterLink>
      <RouterLink
        :to="{ name: 'recipe-create' }"
        class="text-muted-color hover:text-color transition-colors no-underline"
      >
        New Recipe
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
</script>
```

**Step 2: Replace App.vue**

Write this to `recipes/src/App.vue`:
```vue
<template>
  <div class="min-h-screen bg-surface-50">
    <AppNavbar />
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
</script>
```

**Step 3: Commit**

```bash
git add src/components/AppNavbar.vue src/App.vue
git commit -m "feat: add AppNavbar and App.vue shell layout"
```

---

### Task 11: Clean up Vite defaults

**Files:**
- Delete: `recipes/src/components/HelloWorld.vue`
- Delete: `recipes/src/components/TheWelcome.vue` (if exists)
- Delete: `recipes/src/components/icons/` (if exists)
- Modify: `recipes/src/assets/vue.svg` — keep or delete (not referenced)

**Step 1: Remove default Vite components**

```bash
rm -rf src/components/HelloWorld.vue
rm -rf src/components/TheWelcome.vue
rm -rf src/components/icons/
```

If `src/assets/vue.svg` and `public/vite.svg` exist, they can be removed too:
```bash
rm -f src/assets/vue.svg public/vite.svg
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove default vite/vue template boilerplate"
```

---

### Task 12: Final verification

**Step 1: Start the dev server**

```bash
npm run dev
```

**Step 2: Verify each route manually in the browser**

| URL | Expected |
|-----|----------|
| `http://localhost:5173/` | Navbar + "Recipes" heading, muted text |
| `http://localhost:5173/recipes/123` | "Recipe #123" heading |
| `http://localhost:5173/recipes/new` | "New Recipe" heading |
| `http://localhost:5173/recipes/123/edit` | "Edit Recipe" heading |
| `http://localhost:5173/anything` | "404" + "Go home" link |

**Step 3: Open Vue DevTools**

- Confirm Pinia tab shows `recipes` store with `recipes: []`
- Confirm Router tab shows current matched route

**Step 4: Check browser console**

Expected: 0 errors, 0 warnings about unresolved components.

**Step 5: Confirm Tailwind utilities are working**

Inspect the `<main>` element in DevTools — confirm `container` and `mx-auto` classes are applied and have effect.

**Step 6: Confirm PrimeVue is working**

Navigate to a route, inspect the navbar — `bg-surface-0` and `border-surface` should resolve to PrimeVue theme colors via the `tailwindcss-primeui` plugin.
