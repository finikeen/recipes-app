# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build to dist/
npm run preview  # Preview the production build
```

There are no tests configured yet.

## Architecture

This is a Vue 3 SPA for managing recipes. The stack is: **Vue 3** (Composition API, `<script setup>`) + **Vite** + **Pinia** + **Vue Router** + **PrimeVue** (Aura theme) + **Tailwind CSS v4**.

### Key wiring (src/main.js)

- PrimeVue is configured globally with the Aura preset; dark mode toggles via the `.dark` class on an ancestor element.
- Tailwind is integrated via `@tailwindcss/vite` plugin (no `tailwind.config.js`); PrimeVue semantic tokens are exposed to Tailwind through `tailwindcss-primeui`.
- `@` is aliased to `src/`.

### File layout

```
src/
  main.js                          # App bootstrap
  App.vue                          # Root layout: AppNavbar + <RouterView>
  router/index.js                  # All routes
  components/AppNavbar.vue         # Global nav
  assets/main.css                  # @import tailwindcss + tailwindcss-primeui
  features/recipes/
    store.js                       # Pinia store (useRecipesStore)
    components/RecipeCard.vue      # Card component wrapping PrimeVue Card
    views/
      HomeView.vue                 # /
      RecipeDetailView.vue         # /recipes/:id
      RecipeFormView.vue           # /recipes/new  and  /recipes/:id/edit
  views/
    NotFoundView.vue               # catch-all 404
```

### Routes

| Path | Name | Component |
|------|------|-----------|
| `/` | `home` | HomeView |
| `/recipes/:id` | `recipe-detail` | RecipeDetailView |
| `/recipes/new` | `recipe-create` | RecipeFormView |
| `/recipes/:id/edit` | `recipe-edit` | RecipeFormView |
| `/:pathMatch(.*)* ` | `not-found` | NotFoundView (lazy) |

`RecipeFormView` is shared between create and edit; distinguish the mode via the presence of the `:id` param.

### Styling conventions

- Use PrimeVue semantic color tokens (`text-color`, `text-muted-color`, `bg-surface-0`, `border-surface`, etc.) for theme-aware styling rather than raw Tailwind colors. These are provided by `tailwindcss-primeui`.
- PrimeVue components are imported directly per-component (e.g. `import Card from 'primevue/card'`), not globally registered.

## Additional Coding Preferences

- Do NOT use semicolons for JavaScript
- Do NOT apply tailwind classes directly to component templates unless essential or just 2 at most. If an element needs more than 2 tailwind classes, combine them into a custom class using the `@apply` directive.
- Use minimal project dependencies, where possible
- Use the `git switch -c` command to switch to new branches, not `git checkout`
