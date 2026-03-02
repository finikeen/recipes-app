# Logo & Favicon Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dual-flame SVG logo component to the navbar and a matching favicon to Recipe Forge.

**Architecture:** `ForgeFlame.vue` is an inline SVG component using CSS variables for theme-aware colors. The favicon is a separate standalone SVG with hardcoded colors (CSS vars don't resolve outside the DOM). The navbar brand becomes a flex lockup: icon + text.

**Tech Stack:** Vue 3 `<script setup>`, SVG, CSS custom properties (`--primary-color`, `--purple-accent`), Vite static assets (`public/`)

---

### Task 1: Create the ForgeFlame SVG component

**Files:**
- Create: `src/components/ForgeFlame.vue`

No test framework is configured. Verify visually via dev server after each task.

**Step 1: Create the component**

Create `src/components/ForgeFlame.vue` with this exact content:

```vue
<script setup>
defineProps({
  size: {
    type: Number,
    default: 24,
  },
})
</script>

<template>
  <svg
    :height="size"
    :width="size * (20 / 24)"
    viewBox="0 0 20 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <filter id="forge-flame-glow" x="-40%" y="-20%" width="180%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#forge-flame-glow)">
      <!-- Purple flame (back layer, wider, left-oriented) -->
      <path
        d="M 9,22 C 2,20 1,12 5,7 C 6,4 8,2 9,2 C 10,2 12,4 13,7 C 17,12 16,20 9,22 Z"
        fill="var(--purple-accent)"
        opacity="0.9"
      />
      <!-- Amber flame (front layer, taller, right-oriented) -->
      <path
        d="M 11,22 C 6,20 5,15 8,10 C 9,7 10,4 11,1 C 12,4 13,7 16,10 C 19,15 16,20 11,22 Z"
        fill="var(--primary-color)"
      />
    </g>
  </svg>
</template>
```

**Step 2: Verify dev server renders it**

Add `<ForgeFlame />` temporarily anywhere in `App.vue`, run `npm run dev`, confirm a dual amber+purple flame appears. Remove it after checking.

**Step 3: Commit**

```bash
git add src/components/ForgeFlame.vue
git commit -m "✨ feat: add ForgeFlame SVG icon component"
```

---

### Task 2: Create the favicon

**Files:**
- Create: `public/favicon.svg`
- Modify: `index.html` (line 6)

**Step 1: Create `public/favicon.svg`**

Create the file with this content. Colors are hardcoded (CSS variables don't resolve in external SVG resources):

```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background circle -->
  <circle cx="16" cy="16" r="16" fill="#0a0812"/>
  <!-- Purple flame (back) -->
  <path
    d="M 15,26 C 8,24 7,16 11,11 C 12,8 14,6 15,6 C 16,6 18,8 19,11 C 23,16 22,24 15,26 Z"
    fill="#8b5cf6"
    opacity="0.9"
  />
  <!-- Amber flame (front) -->
  <path
    d="M 17,26 C 12,24 11,19 14,14 C 15,11 16,8 17,5 C 18,8 19,11 22,14 C 25,19 22,24 17,26 Z"
    fill="#e8a042"
  />
</svg>
```

**Step 2: Update `index.html`**

In `index.html` line 6, replace:
```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```
with:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

**Step 3: Verify favicon**

Run `npm run dev`, check the browser tab — should show the dual-flame icon on the dark circle background.

**Step 4: Commit**

```bash
git add public/favicon.svg index.html
git commit -m "✨ feat: add Recipe Forge favicon"
```

---

### Task 3: Integrate ForgeFlame into the navbar

**Files:**
- Modify: `src/components/AppNavbar.vue`

**Step 1: Import the component**

In `AppNavbar.vue`, add the import at the top of `<script setup>` (after the existing imports):

```js
import ForgeFlame from './ForgeFlame.vue'
```

**Step 2: Update the brand template**

Find the `RouterLink` with class `navbar__brand forge__brand` (line 49). Replace its content:

Before:
```html
<RouterLink :to="{ name: 'home' }" class="navbar__brand forge__brand">
  Recipe Forge
</RouterLink>
```

After:
```html
<RouterLink :to="{ name: 'home' }" class="navbar__brand forge__brand">
  <ForgeFlame :size="22" />
  Recipe Forge
</RouterLink>
```

**Step 3: Update `.navbar__brand` CSS**

In the `<style scoped>` block, find `.navbar__brand` and add flex alignment:

Before:
```css
.navbar__brand {
  @apply text-xl font-bold no-underline;
  color: var(--primary-color);
  letter-spacing: 0.5px;
}
```

After:
```css
.navbar__brand {
  @apply flex items-center gap-2 text-xl font-bold no-underline;
  color: var(--primary-color);
  letter-spacing: 0.5px;
}
```

**Step 4: Verify visually**

Run `npm run dev`. Check:
- [ ] Flame icon appears left of "Recipe Forge" text, vertically centered
- [ ] Amber + purple dual flame is visible
- [ ] Clicking the brand link still navigates to home
- [ ] Works on mobile (hamburger view) — brand still visible in collapsed state
- [ ] Toggle dark/light mode — confirm icon colors shift with theme (amber/purple CSS vars)

**Step 5: Commit**

```bash
git add src/components/AppNavbar.vue
git commit -m "✨ feat: integrate ForgeFlame icon into navbar brand lockup"
```
