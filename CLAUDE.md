# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build to dist/
npm run preview  # Preview the production build

## Coding Conventions

### Vue SFC structure

- Order: `<script setup>` → `<template>` → `<style scoped>`
- Plain JavaScript (no TypeScript)
- No semicolons
- For PrimeVue: import paths use full names (e.g., `primevue/confirmationservice` not `primevue/confirmservice`). PrimeVueResolver handles most auto-imports — only keep explicit imports for services and directives.

### Styling

- Use PrimeVue semantic color tokens (`text-color`, `text-muted-color`, `bg-surface-0`, `border-surface`, etc.) for theme-aware styling rather than raw Tailwind colors. These are provided by `tailwindcss-primeui`.
- Do NOT apply Tailwind classes directly to templates unless essential or just 2 at most. If an element needs more than 2 classes, combine them into a custom class using `@apply`.
- Scoped styles using `@apply` must include this reference directive at the top (use the correct relative path to `src/assets/main.css`):
  ```css
  @reference "../../../assets/main.css";
  ```
- Follow BEM naming for custom CSS classes.
- Only use valid Tailwind utility classes. Do not invent classes like `ease` or `font-inherit`. When unsure, check the Tailwind docs or grep existing usage in the codebase.

### Accessibility

- Accessible form labels and ARIA attributes where appropriate (WCAG 2.1 Level AA).
- Responsive layout suitable for mobile and desktop.

### Git

- Use `git switch -c` to create and switch to new branches (not `git checkout -b`).
- Always commit or stash changes before starting new features or switching branches. Never block progress by refusing to proceed due to uncommitted changes — instead, offer to commit/stash automatically and continue.

### Firebase
- Only use the Firebase web SDK, do not create any backend functions or use the Admin SDK.
- Prefer v9 modular imports (not the older namespaced API).
- When modifying security rules, always ensure subcollections (e.g., ingredients) are covered. When querying recipes, use the `name` field (not `title`) and ensure public/unauthenticated access where specified.

### Code Editing

- When doing bulk find-and-replace across files, always do a second verification pass to catch files missed by the initial regex/search pattern.

### Checking Documentation

- **important:** When implementing any lib/framework-specific features, ALWAYS check the appropriate lib/framework documentation using the Context7 MCP server before writing any code.