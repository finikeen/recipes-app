# Rezipees — Recipe Management SPA

A modern, theme-forge inspired recipe discovery and management application built with Vue 3, Vite, and Firebase. Browse recipes, manage your collection, and enjoy a beautifully themed dark-mode-ready interface.

## Features

- **Recipe Discovery** — Browse and search recipes with a hero-featured recipe showcase on the home page
- **Recipe Management** — Create, edit, and delete recipes with a rich form interface
- **Firebase Integration** — Real-time data synchronization with Firestore backend
- **Authentication** — User authentication with Firebase Auth
- **Theme System** — "Arcane Forge" custom theme with dark mode support
- **Responsive Design** — Mobile-friendly UI with PrimeVue components and Tailwind CSS
- **Testing** — Unit tests with Vitest (recipe service and authentication)

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API, `<script setup>`)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **UI Components**: PrimeVue (Aura theme with custom "Arcane Forge" preset)
- **Styling**: Tailwind CSS v4 with semantic token integration
- **Backend**: Firebase (Authentication, Firestore)
- **Testing**: Vitest, Vue Test Utils
- **Icons**: PrimeIcons

## Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn installed
- Firebase project credentials configured

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the dev server at `http://localhost:3000`.

### Build

```bash
npm run build
```

Produces an optimized production build in the `dist/` directory.

### Preview

```bash
npm run preview
```

Preview the production build locally.

### Testing

```bash
npm run test
```

Run tests with Vitest in headless mode.

## Project Structure

```
src/
  main.js                          # App entry point
  App.vue                          # Root component with AppNavbar
  theme.js                         # Arcane Forge theme configuration
  router/index.js                  # Route definitions
  components/
    AppNavbar.vue                  # Global navigation
  features/
    auth/
      store.js                     # Firebase authentication state (Pinia)
      components/
        AuthenticationForm.vue      # Login/signup form
      views/
        AuthView.vue               # Auth page
    recipes/
      store.js                     # Recipes state management (Pinia)
      components/
        RecipeCard.vue             # Recipe card component
        HeroRecipe.vue             # Featured recipe showcase
      services/
        recipeService.js           # Firestore API layer
      views/
        HomeView.vue               # / (home with hero featured recipe)
        BrowseView.vue             # Recipe browsing and search
        RecipeDetailView.vue       # /recipes/:id (single recipe view)
        RecipeFormView.vue         # /recipes/new and /recipes/:id/edit
  services/
    firebase.js                    # Firebase configuration and initialization
  styles/
    forge-*.css                    # Theme and animation styles
  views/
    NotFoundView.vue               # 404 catch-all page
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomeView | Recipe discovery with featured recipe |
| `/browse` | BrowseView | Browse and search all recipes |
| `/recipes/:id` | RecipeDetailView | View recipe details |
| `/recipes/new` | RecipeFormView | Create a new recipe |
| `/recipes/:id/edit` | RecipeFormView | Edit an existing recipe |
| `/auth` | AuthView | Authentication page |
| `/:pathMatch(.*)*` | NotFoundView | 404 page |

## Development Guidelines

### Code Style

- Vue SFCs use `<script setup>` syntax in this order: `<script setup>` → `<template>` → `<style scoped>`
- Plain JavaScript (no TypeScript)
- No semicolons
- See [CLAUDE.md](CLAUDE.md) for detailed conventions

### Styling

- Use PrimeVue semantic color tokens (`text-color`, `bg-surface-0`, `border-surface`, etc.) over raw Tailwind colors for theme consistency
- Apply `@apply` for custom CSS classes; avoid inline Tailwind unless essential
- Dark mode is toggled by adding the `.dark` class to an ancestor element
- Include the PrimeUI Tailwind plugin for semantic token access

### Component Imports

- Import PrimeVue components per-component (e.g., `import Card from 'primevue/card'`), not globally
- Use PascalCase for component names, kebab-case for file names

### Testing

- Unit tests located in `src/__tests__/`
- Test recipe service and authentication flows
- Use Vitest and Vue Test Utils

## Configuration Files

- **`vite.config.js`** — Vite bundler configuration with Vue and Tailwind plugins
- **`firebase.json`** — Firebase Hosting and Firestore indexes/rules
- **`firestore.rules`** — Firestore security rules
- **`theme.js`** — PrimeVue Arcane Forge theme preset
- **`src/assets/main.css`** — Global Tailwind and PrimeUI semantic token imports

## Contributing

When implementing new features:
1. Check framework documentation using the Context7 MCP server
2. Follow the coding conventions in this README and [CLAUDE.md](CLAUDE.md)
3. Add tests for new functionality
4. Ensure dark mode and responsive design work correctly

## License

MIT
