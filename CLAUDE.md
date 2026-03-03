# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Recipe Forge** is a Vue 3 SPA for storing, browsing, and discovering recipes. It uses Firebase for auth/data, PrimeVue 4 for UI, Tailwind CSS 4 for utilities, and a companion Express.js server for recipe scraping. The visual theme is called **Arcane Forge** — a dark/light dual-mode design with amber primary colors and purple accents.

---

## Commands

```bash
npm run dev      # Start Vite dev server (port 3000) + Express scraper server (port 3001) concurrently
npm run server   # Express scraper server only (port 3001)
npm run build    # Production build to dist/
npm run preview  # Preview the production build
npm test         # Run Vitest in single-run mode (no watch)
```

> **Note:** `npm run dev` runs both servers via `concurrently`. The Vite dev server proxies `/api` → `http://localhost:3001`. Always start both for the scraper feature to work.

---

## Directory Structure

```
recipes-app/
├── server/                     # Express.js scraper server (not part of the Vite bundle)
│   ├── index.js                # POST /api/scrape endpoint
│   ├── scraper.js              # JSON-LD + HTML heuristic recipe extraction (cheerio)
│   └── enricher.js             # Optional Ollama-based enrichment (keywords, enrichedSteps)
├── src/
│   ├── main.js                 # App entry: Pinia, Router, PrimeVue, Firebase auth init
│   ├── App.vue                 # Root component (AppNavbar + RouterView)
│   ├── theme.js                # PrimeVue "ForgePreset" (extends Aura, amber primary)
│   ├── router/
│   │   └── index.js            # Vue Router: routes + auth guard (recipe-create, recipe-edit)
│   ├── assets/
│   │   └── main.css            # CSS entry: imports forge styles + Tailwind + tailwindcss-primeui
│   ├── styles/
│   │   ├── forge-theme.css     # CSS custom properties for light/dark Forge theme
│   │   ├── forge-components.css # Reusable forge component classes (.forge__card, .forge__button, etc.)
│   │   ├── forge-textures.css  # Texture overlay classes (.forge__texture-stone, etc.)
│   │   └── forge-animations.css # Keyframe animations
│   ├── services/
│   │   └── firebase.js         # Firebase init: auth, db (Firestore), storage
│   ├── composables/
│   │   └── useColorMode.js     # Dark/light toggle (persisted to localStorage, applies .dark to <html>)
│   ├── components/
│   │   ├── AppNavbar.vue       # Top navigation bar (logo, nav links, dark mode toggle)
│   │   ├── NavLinks.vue        # Navigation links (Home, Browse, Ingredient Search, auth actions)
│   │   └── ForgeFlame.vue      # Animated flame SVG logo icon
│   ├── views/
│   │   └── NotFoundView.vue    # 404 catch-all
│   └── features/
│       ├── auth/
│       │   ├── store.js        # Pinia auth store (signUp, signIn, logout, initializeAuthListener)
│       │   ├── components/
│       │   │   └── AuthenticationForm.vue  # Login/register form
│       │   └── views/
│       │       └── AuthView.vue            # Auth page view
│       └── recipes/
│           ├── store.js        # Pinia recipes store (addRecipe, updateRecipe, deleteRecipe, load*)
│           ├── services/
│           │   └── recipeService.js        # Firestore CRUD for recipes + ingredients subcollection
│           ├── composables/
│           │   ├── useRecipeForm.js        # Form state for create/edit (validation, submit, scraped data)
│           │   ├── useRecipeSearch.js      # Name/keyword search + tag filter for recipe lists
│           │   ├── useIngredientSearch.js  # Ingredient-based recipe discovery ("brew" mode)
│           │   ├── useIngredientParser.js  # Parse "2 cups flour" → {quantity, unit, item}
│           │   ├── useIngredients.js       # Reactive ingredient list management for forms
│           │   ├── useDirections.js        # Reactive direction list management for forms
│           │   ├── useRecipeIngredients.js # Fetch + cache ingredients for a recipe detail view
│           │   └── usePagination.js        # Generic pagination composable
│           ├── components/
│           │   ├── RecipeCard.vue          # Recipe summary card (clickable, tag filter)
│           │   ├── HeroRecipe.vue          # Featured recipe banner
│           │   ├── CtaButtonRow.vue        # Meal-type CTA buttons (pre-filters Browse view)
│           │   ├── RecipeSourceUrl.vue     # URL input + scrape button for recipe import
│           │   └── TagFilterModal.vue      # Modal for selecting keyword/tag filters
│           └── views/
│               ├── HomeView.vue            # Hero + user's own recipes
│               ├── BrowseView.vue          # All recipes with search, keyword, and tag filters
│               ├── RecipeDetailView.vue    # Full recipe view (ingredients, enriched steps)
│               ├── RecipeFormView.vue      # Create / edit recipe form
│               └── IngredientSearchView.vue # Ingredient-based search ("What can I cook?")
├── src/__tests__/              # Vitest tests (mirrors src structure)
│   ├── components/             # Component tests (*.spec.js)
│   ├── composables/            # Composable tests (*.spec.js)
│   ├── services/               # Service tests (*.test.js)
│   ├── stores/                 # Store tests (*.test.js)
│   └── views/                  # View tests (*.spec.js)
├── _plans/                     # Feature planning documents (Markdown)
├── _specs/                     # Feature spec documents (Markdown)
├── docs/                       # Technical documentation
│   ├── firebase-setup.md
│   └── firestore-security-rules.md
└── .claude/
    ├── agents/                 # Custom Claude agent definitions
    └── commands/               # Custom slash commands (commit-message-v2, component, spec-v2)
```

---

## Routes

| Route | Name | Auth Required | Component |
|-------|------|---------------|-----------|
| `/` | `home` | No | `HomeView` |
| `/browse` | `browse` | No | `BrowseView` |
| `/recipes/:id` | `recipe-detail` | No | `RecipeDetailView` |
| `/recipes/new` | `recipe-create` | **Yes** | `RecipeFormView` |
| `/recipes/:id/edit` | `recipe-edit` | **Yes** | `RecipeFormView` |
| `/ingredient-search` | `ingredient-search` | No | `IngredientSearchView` |
| `/auth` | `auth` | No | `AuthView` |
| `/:pathMatch(.*)` | `not-found` | No | `NotFoundView` |

The router guard in `src/router/index.js` waits for Firebase auth state (`authStore.authReady`) before evaluating protected routes.

---

## Firestore Data Model

### `recipes` collection

```js
{
  name: string,           // IMPORTANT: use `name` not `title` when querying
  description: string,
  tags: string[],         // legacy field — prefer `keywords`
  keywords: string[],     // preferred — generated by enricher or form derivedTags
  ingredients: string[],  // denormalized string array (e.g. "2 cups flour")
  directions: string[],   // ordered step strings
  sourceUrl: string,      // optional — URL the recipe was scraped from
  userId: string,         // Firebase Auth UID of owner
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### `recipes/{id}/ingredients` subcollection

```js
{
  quantity: string,   // e.g. "2"
  unit: string,       // e.g. "cups"
  item: string,       // e.g. "flour"
}
```

> Ingredients are stored in both the parent document (denormalized string array) and the subcollection (structured). The subcollection is authoritative for the detail/edit view.

### Security rules summary

- **Read**: public (no auth required) for both `recipes` and `ingredients`
- **Write**: authenticated user only, must own the parent recipe (`userId == request.auth.uid`)
- Full rules in `docs/firestore-security-rules.md`

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build | Vite 7 |
| UI | PrimeVue 4 (Aura-based ForgePreset), PrimeIcons |
| CSS | Tailwind CSS 4 + `tailwindcss-primeui` |
| State | Pinia 3 |
| Router | Vue Router 4 |
| Backend/DB | Firebase 12 (Auth, Firestore, Storage) |
| Scraper server | Express 4 + node-fetch + cheerio + parse-ingredient |
| AI enrichment | Ollama (optional, `glm-5:cloud` model) |
| Testing | Vitest 4 + Vue Test Utils 2 + jsdom + @pinia/testing |

---

## Coding Conventions

### Vue SFC structure

- Order: `<script setup>` → `<template>` → `<style scoped>`
- Plain JavaScript (no TypeScript)
- No semicolons
- For PrimeVue: import paths use full names (e.g., `primevue/confirmationservice` not `primevue/confirmservice`). `PrimeVueResolver` handles most auto-imports — only keep explicit imports for services and directives.

### Styling

- Use PrimeVue semantic color tokens (`text-color`, `text-muted-color`, `bg-surface-0`, `border-surface`, etc.) for theme-aware styling rather than raw Tailwind colors. These are provided by `tailwindcss-primeui`.
- Use Forge CSS custom properties (e.g., `var(--primary-color)`, `var(--purple-accent)`, `var(--ember-color)`) for Forge-specific colors in `<style scoped>` blocks.
- Do NOT apply Tailwind classes directly to templates unless essential or just 2 at most. If an element needs more than 2 classes, combine them into a custom class using `@apply`.
- Scoped styles using `@apply` must include this reference directive at the top (use the correct relative path to `src/assets/main.css`):
  ```css
  @reference "../../../assets/main.css";
  ```
- Follow BEM naming for custom CSS classes (e.g., `.recipe-card__title`, `.rform__field`).
- Only use valid Tailwind utility classes. Do not invent classes like `ease` or `font-inherit`. When unsure, check the Tailwind docs or grep existing usage in the codebase.
- Shared component classes live in `src/styles/forge-components.css` (`.forge__card`, `.forge__button`, `.forge__button-primary`, `.forge__tag`, `.forge__link`, `.forge__runic-border`, etc.).

### Theme: Arcane Forge

Two modes, toggled by adding/removing `.dark` on `<html>`:

- **Light**: warm parchment (`#fdf8f0`), amber primary (`#c07820`), purple accent (`#6d3fcf`)
- **Dark**: dungeon darkness (`#1a1722`), amber primary (`#e8a042`), purple accent (`#8b5cf6`)

Dark mode selector is `.dark` (configured in `main.js` via `darkModeSelector: '.dark'`). The `useColorMode` composable manages toggle + localStorage persistence.

### Keywords vs Tags

Recipes have two overlapping fields — `keywords` (preferred, generated by the Ollama enricher or `derivedTags`) and `tags` (legacy). Always read with fallback: `recipe.keywords ?? recipe.tags ?? []`. The `useRecipeSearch` and `useIngredientSearch` composables implement this automatically via `getKeywords(r)`.

### Accessibility

- Accessible form labels and ARIA attributes where appropriate (WCAG 2.1 Level AA).
- Responsive layout suitable for mobile and desktop.
- Interactive non-button elements (cards) must have `role`, `tabindex`, and keyboard event handlers (`.enter`, `.space`).

### Git

- Use `git switch -c` to create and switch to new branches (not `git checkout -b`).
- Always commit or stash changes before starting new features or switching branches. Never block progress by refusing to proceed due to uncommitted changes — instead, offer to commit/stash automatically and continue.

### Firebase

- Only use the Firebase web SDK; do not create any backend functions or use the Admin SDK.
- Prefer v9 modular imports (not the older namespaced API).
- When modifying security rules, always ensure subcollections (e.g., `ingredients`) are covered. When querying recipes, use the `name` field (not `title`) and ensure public/unauthenticated access where specified.
- Firestore is initialized with `persistentLocalCache` + `persistentMultipleTabManager` for offline support.

### Scraper Server

- The Express server runs on port 3001, Vite proxies `/api` → `http://localhost:3001`.
- `POST /api/scrape` accepts `{ url }`, returns `{ success, recipe }` or `{ success: false, failureReason }`.
- The server first tries JSON-LD structured data (`extractJsonLd`), then falls back to HTML heuristics (`extractHtmlHeuristics`).
- Ollama enrichment is best-effort — if unavailable, the scrape still succeeds without enrichment.

### Code Editing

- When doing bulk find-and-replace across files, always do a second verification pass to catch files missed by the initial regex/search pattern.

### Checking Documentation

- **Important:** When implementing any lib/framework-specific features, ALWAYS check the appropriate lib/framework documentation using the Context7 MCP server before writing any code.

---

## Testing

- Test runner: Vitest (`npm test` for a single run)
- Test environment: jsdom (configured in `vite.config.js`)
- Tests live in `src/__tests__/` mirroring the source structure. Some component tests are colocated with components (e.g., `src/features/recipes/components/*.spec.js`).
- Firebase is mocked in tests — see existing test files for patterns.
- Pinia stores are tested with `@pinia/testing` (`createTestingPinia`).
- Components are mounted with `@vue/test-utils` (`mount` / `shallowMount`).

---

## Environment Variables

Copy `.env.example` → `.env.local` and fill in your Firebase credentials:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

All `VITE_*` variables are exposed to the frontend via `import.meta.env`.

---

## Custom Claude Commands

These slash commands are available via `.claude/commands/`:

- `/commit-message-v2` — Generate a conventional commit message from staged diff
- `/component` — Scaffold a new Vue component using TDD (creates spec + component)
- `/spec-v2` — Create a feature spec file from a short idea description

A custom agent is also defined in `.claude/agents/a11y-reviewer.md` for accessibility reviews.
