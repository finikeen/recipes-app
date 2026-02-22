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

This is a Vue 3 SPA for managing recipes. Stack: **Vue 3** (Composition API, `<script setup>`) + **Vite** + **Pinia** + **Vue Router** + **PrimeVue** (Aura theme) + **Tailwind CSS v4**.

### Key wiring (`src/main.js`)

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
  features/
    auth/
      components/AuthenticationForm.vue
      views/AuthView.vue
    recipes/
      store.js                     # Pinia store (useRecipesStore)
      components/RecipeCard.vue
      views/
        HomeView.vue               # /
        RecipeDetailView.vue       # /recipes/:id
        RecipeFormView.vue         # /recipes/new  and  /recipes/:id/edit
  views/
    NotFoundView.vue               # catch-all 404
_specs/                            # Feature spec files
_plans/                            # Implementation plan files
```

### Routes

| Path | Name | Component |
|------|------|-----------|
| `/` | `home` | HomeView |
| `/recipes/:id` | `recipe-detail` | RecipeDetailView |
| `/recipes/new` | `recipe-create` | RecipeFormView |
| `/recipes/:id/edit` | `recipe-edit` | RecipeFormView |
| `/auth` | `auth` | AuthView |
| `/:pathMatch(.*)*` | `not-found` | NotFoundView (lazy) |

`RecipeFormView` is shared between create and edit; distinguish the mode via the presence of the `:id` param.

## Coding Conventions

### Vue SFC structure

- Order: `<script setup>` → `<template>` → `<style scoped>`
- Plain JavaScript (no TypeScript)
- No semicolons

### Styling

- Use PrimeVue semantic color tokens (`text-color`, `text-muted-color`, `bg-surface-0`, `border-surface`, etc.) for theme-aware styling rather than raw Tailwind colors. These are provided by `tailwindcss-primeui`.
- Do NOT apply Tailwind classes directly to templates unless essential or just 2 at most. If an element needs more than 2 classes, combine them into a custom class using `@apply`.
- Scoped styles using `@apply` must include this reference directive at the top (use the correct relative path to `src/assets/main.css`):
  ```css
  @reference "../../../assets/main.css";
  ```
- Follow BEM naming for custom CSS classes.

### Components

- PrimeVue components are imported directly per-component (e.g. `import Card from 'primevue/card'`), not globally registered.
- Use PascalCase for component names, kebab-case for file names.

### Accessibility

- Accessible form labels and ARIA attributes where appropriate (WCAG 2.1 Level AA).
- Responsive layout suitable for mobile and desktop.

### Git

- Use `git switch -c` to create and switch to new branches (not `git checkout -b`).

### Checking Documentation

- **important:** When implementing any lib/framework-specific features, ALWAYS check the appropriate lib/framework documentation using the Context7 MCP server before writing any code.