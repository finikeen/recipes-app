# Forge Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement dark forge-inspired theme with amber accents, worn textures, and glow effects while maintaining accessibility.

**Architecture:** Layer CSS files on top of PrimeVue's Aura theme by overriding CSS variables, adding texture overlays, component-specific styles, and animations. This approach leverages PrimeVue's existing component styling while allowing complete visual customization.

**Tech Stack:** Vue 3, PrimeVue (Aura theme), Tailwind v4, CSS custom properties, SVG patterns

---

## Task 1: Create forge-theme.css with PrimeVue Variable Overrides

**Files:**
- Create: `src/styles/forge-theme.css`

**Description:**
Override PrimeVue's CSS variables to set the forge color palette. This is the foundation — all components will inherit these colors.

**Step 1: Create the file**

Create `src/styles/forge-theme.css`:

```css
/* Forge Theme - Color Palette
   Overrides PrimeVue CSS variables for dark forge aesthetic
*/

:root {
  /* Base Colors */
  --surface-ground: #1a1a1a;
  --surface-0: #242424;
  --surface-50: #2a2a2a;
  --surface-100: #333333;
  --surface-200: #3a3a3a;

  /* Text Colors */
  --text-color: #e0e0e0;
  --text-color-secondary: #888888;

  /* Primary Accent - Amber */
  --primary-color: #d4a574;
  --primary-light: #e8b88f;

  /* Borders & Dividers */
  --surface-border: #333333;
  --surface-section: #242424;

  /* Error/Warning (warm colors, not bright) */
  --red-500: #d97757;
  --orange-500: #d4a574;
  --yellow-500: #c9a566;

  /* Success (cool to match forge palette) */
  --green-500: #66b3a3;
}

/* Dark mode selector support (for future light mode) */
:root.dark {
  /* When explicitly marked as dark, use same variables */
  /* This allows consistent behavior */
}

/* Ensure PrimeVue components use these variables */
body {
  background-color: var(--surface-ground);
  color: var(--text-color);
}

/* Link colors */
a {
  color: var(--primary-color);
}

a:hover {
  color: var(--primary-light);
}
```

**Step 2: Verify file is created**

Check that `src/styles/forge-theme.css` exists and is readable.

**Step 3: Commit**

```bash
git add src/styles/forge-theme.css
git commit -m "style: create forge theme CSS variables (colors)"
```

---

## Task 2: Create SVG Texture Assets

**Files:**
- Create: `src/assets/textures/metal-grain.svg`
- Create: `src/assets/textures/paper-texture.svg`

**Description:**
Create reusable SVG noise patterns that will be layered as texture overlays on cards and buttons.

**Step 1: Create metal-grain.svg**

Create `src/assets/textures/metal-grain.svg`:

```xml
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" seed="2" />
      <feColorMatrix in="noise" type="saturate" values="0.3" />
    </filter>
  </defs>
  <rect width="512" height="512" fill="#1a1a1a" />
  <rect width="512" height="512" fill="#000000" opacity="0.15" filter="url(#noise)" />
</svg>
```

**Step 2: Create paper-texture.svg**

Create `src/assets/textures/paper-texture.svg`:

```xml
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="6" result="noise" seed="3" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <rect width="512" height="512" fill="#242424" />
  <rect width="512" height="512" fill="#ffffff" opacity="0.08" filter="url(#paper)" />
</svg>
```

**Step 3: Verify files are created**

Check that both SVG files exist in `src/assets/textures/`.

**Step 4: Commit**

```bash
git add src/assets/textures/metal-grain.svg src/assets/textures/paper-texture.svg
git commit -m "style: add metal-grain and paper-texture SVG assets"
```

---

## Task 3: Create forge-textures.css

**Files:**
- Create: `src/styles/forge-textures.css`

**Description:**
Define texture overlay classes and distressed edge effects. These will be mixed into component classes.

**Step 1: Create the file**

Create `src/styles/forge-textures.css`:

```css
/* Forge Textures - Distressed patterns and overlays */

/* Metal grain texture for heavy use (cards, buttons) */
.forge__texture-metal::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../assets/textures/metal-grain.svg");
  background-size: 256px 256px;
  opacity: 0.12;
  pointer-events: none;
  border-radius: inherit;
  z-index: 0;
}

/* Paper texture for alternative surfaces */
.forge__texture-paper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../assets/textures/paper-texture.svg");
  background-size: 256px 256px;
  opacity: 0.1;
  pointer-events: none;
  border-radius: inherit;
  z-index: 0;
}

/* Subtle background grain (very light) */
.forge__texture-subtle::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../assets/textures/metal-grain.svg");
  background-size: 512px 512px;
  opacity: 0.06;
  pointer-events: none;
  z-index: -1;
}

/* Distressed corners - worn effect */
.forge__distressed {
  position: relative;
}

.forge__distressed::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at 0% 0%,
    rgba(0, 0, 0, 0.3) 0%,
    transparent 50%
  ),
  radial-gradient(
    circle at 100% 100%,
    rgba(0, 0, 0, 0.3) 0%,
    transparent 50%
  );
  pointer-events: none;
  border-radius: inherit;
}

/* Amber accent border with slight irregularity */
.forge__accent-border {
  border: 2px solid var(--primary-color);
  box-shadow: inset 0 0 4px rgba(212, 165, 116, 0.2);
}

/* Content positioning for texture elements */
.forge__texture-metal,
.forge__texture-paper {
  position: relative;
}

.forge__texture-metal > *,
.forge__texture-paper > * {
  position: relative;
  z-index: 1;
}
```

**Step 2: Verify file is created**

Check that `src/styles/forge-textures.css` exists.

**Step 3: Commit**

```bash
git add src/styles/forge-textures.css
git commit -m "style: add forge texture overlays and patterns"
```

---

## Task 4: Create forge-components.css

**Files:**
- Create: `src/styles/forge-components.css`

**Description:**
Component-specific styling for cards, buttons, forms, and other UI elements. This is where cards and buttons get their distressed look.

**Step 1: Create the file**

Create `src/styles/forge-components.css`:

```css
/* Forge Components - Card, button, form, and UI element styling */

/* Recipe Cards */
.forge__card {
  background-color: var(--surface-0);
  border-radius: 6px;
  padding: 1rem;
  position: relative;
  transition: all 200ms ease;
}

.forge__card.forge__texture-metal {
  border-left: 3px solid var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.forge__card:hover {
  box-shadow: 0 4px 16px rgba(212, 165, 116, 0.2);
  transform: translateY(-2px);
}

.forge__card img {
  border-radius: 4px;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.forge__card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0.5rem 0;
  position: relative;
  z-index: 2;
}

.forge__card-description {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin: 0.5rem 0;
  position: relative;
  z-index: 2;
}

.forge__card-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

.forge__tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--primary-color);
  border-radius: 3px;
  background-color: transparent;
  color: var(--primary-color);
  transition: all 150ms ease;
}

.forge__tag:hover {
  background-color: rgba(212, 165, 116, 0.1);
}

/* Buttons */
.forge__button {
  background-color: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  z-index: 1;
}

.forge__button:hover:not(:disabled) {
  box-shadow: 0 0 12px rgba(212, 165, 116, 0.6);
  background-color: rgba(212, 165, 116, 0.05);
}

.forge__button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.forge__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: var(--surface-100);
  color: var(--surface-100);
}

.forge__button-primary {
  background-color: var(--primary-color);
  color: #1a1a1a;
  border-color: var(--primary-color);
}

.forge__button-primary:hover:not(:disabled) {
  background-color: var(--primary-light);
  border-color: var(--primary-light);
  box-shadow: 0 0 20px rgba(212, 165, 116, 0.7);
}

/* Forms & Inputs */
.forge__input {
  background-color: var(--surface-50);
  border: 1px solid var(--surface-100);
  color: var(--text-color);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 200ms ease;
}

.forge__input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 8px rgba(212, 165, 116, 0.3);
}

.forge__input::placeholder {
  color: var(--text-color-secondary);
}

.forge__label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.875rem;
}

.forge__textarea {
  background-color: var(--surface-50);
  border: 1px solid var(--primary-color);
  color: var(--text-color);
  padding: 0.75rem;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 200ms ease;
}

.forge__textarea:focus {
  outline: none;
  box-shadow: 0 0 8px rgba(212, 165, 116, 0.4);
}

/* Form groups */
.forge__form-group {
  margin-bottom: 1.5rem;
}

.forge__error {
  color: #d97757;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

/* Links */
.forge__link {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 150ms ease;
}

.forge__link:hover {
  border-bottom-color: var(--primary-color);
}

.forge__link:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Navbar brand */
.forge__brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  letter-spacing: 0.5px;
  transition: all 200ms ease;
}

.forge__brand:hover {
  text-shadow: 0 0 8px rgba(212, 165, 116, 0.6);
}

/* Disabled state */
.forge__disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

**Step 2: Verify file is created**

Check that `src/styles/forge-components.css` exists.

**Step 3: Commit**

```bash
git add src/styles/forge-components.css
git commit -m "style: add forge component styling (cards, buttons, forms)"
```

---

## Task 5: Create forge-animations.css

**Files:**
- Create: `src/styles/forge-animations.css`

**Description:**
Keyframes and animation classes for glow effects and subtle pulsing (fire breathing).

**Step 1: Create the file**

Create `src/styles/forge-animations.css`:

```css
/* Forge Animations - Glow effects and fire breathing */

/* Glow effect for interactive elements */
@keyframes forge-glow {
  0% {
    box-shadow: 0 0 8px rgba(212, 165, 116, 0.4);
  }
  50% {
    box-shadow: 0 0 16px rgba(212, 165, 116, 0.6);
  }
  100% {
    box-shadow: 0 0 8px rgba(212, 165, 116, 0.4);
  }
}

/* Fire breathing pulse */
@keyframes forge-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
  100% {
    opacity: 1;
  }
}

/* Apply glow animation to interactive elements on hover */
.forge__button:hover:not(:disabled),
.forge__card:hover,
.forge__link:hover {
  animation: forge-glow 2s ease-in-out infinite;
}

/* Gentle pulse animation */
.forge__pulse {
  animation: forge-pulse 3s ease-in-out infinite;
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .forge__button:hover:not(:disabled),
  .forge__card:hover,
  .forge__link:hover,
  .forge__pulse {
    animation: none;
  }

  .forge__button:hover:not(:disabled),
  .forge__card:hover {
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.2);
  }
}
```

**Step 2: Verify file is created**

Check that `src/styles/forge-animations.css` exists.

**Step 3: Commit**

```bash
git add src/styles/forge-animations.css
git commit -m "style: add forge animation effects (glow, pulse)"
```

---

## Task 6: Update src/assets/main.css to Import Forge Files

**Files:**
- Modify: `src/assets/main.css` (add imports at top)

**Description:**
Import all forge CSS files in the correct order: variables first, then textures, components, animations. This ensures CSS variables are available to all dependent files.

**Step 1: Read the current main.css**

Check what's currently in `src/assets/main.css` to understand the structure.

**Step 2: Add forge imports**

Add these imports at the TOP of `src/assets/main.css` (before any existing imports):

```css
/* Forge Theme - Dark Mode with Amber Accents */
@import "./styles/forge-theme.css";
@import "./styles/forge-textures.css";
@import "./styles/forge-components.css";
@import "./styles/forge-animations.css";

/* Existing imports follow below */
```

(Keep all existing imports that follow)

**Step 3: Verify imports are correct**

Check that the file paths are correct relative to `src/assets/main.css`. If `src/assets/main.css` is in `src/assets/` and styles are in `src/styles/`, the paths should be `./styles/` (or `../styles/` depending on actual structure).

**Step 4: Build and check for errors**

Run:
```bash
npm run build
```

Expected: Build completes without errors. If there are CSS import errors, adjust paths.

**Step 5: Commit**

```bash
git add src/assets/main.css
git commit -m "style: import forge theme CSS files into main.css"
```

---

## Task 7: Update AppNavbar.vue to Use Forge Styles

**Files:**
- Modify: `src/components/AppNavbar.vue`

**Description:**
Add forge styling classes to navbar links and brand to give them the amber color and glow effects.

**Step 1: Read the current AppNavbar.vue**

Check the current navbar structure.

**Step 2: Update the brand link**

Change the brand RouterLink to add the `.forge__brand` class:

```html
<RouterLink :to="{ name: 'home' }" class="navbar__brand forge__brand">
  Recipe Forge
</RouterLink>
```

**Step 3: Update regular links**

Add `.forge__link` class to the "Browse" and "New Recipe" links:

```html
<RouterLink :to="{ name: 'browse' }" class="navbar__link forge__link">
  Browse
</RouterLink>

<RouterLink :to="{ name: 'recipe-create' }" class="navbar__link forge__link">
  New Recipe
</RouterLink>
```

**Step 4: Update Sign In link (if exists)**

```html
<RouterLink :to="{ name: 'auth' }" class="navbar__link forge__link">
  Sign In
</RouterLink>
```

**Step 5: Verify changes**

Check that the navbar structure is intact and classes are added correctly.

**Step 6: Commit**

```bash
git add src/components/AppNavbar.vue
git commit -m "style: add forge styling to navbar (brand, links)"
```

---

## Task 8: Update HomeView.vue to Use Forge Styles

**Files:**
- Modify: `src/features/recipes/views/HomeView.vue`

**Description:**
Style the featured recipe card with heavy textures and prominent amber accents.

**Step 1: Read HomeView.vue**

Check the current structure (the featured recipe card component).

**Step 2: Update the container**

Add `.forge__texture-subtle` to the main container:

```html
<div class="featured__container forge__texture-subtle">
```

**Step 3: Update the featured card wrapper**

Update the RecipeCard wrapper to use forge card styling:

```html
<div class="featured__card-wrapper forge__card forge__texture-metal forge__distressed">
  <RecipeCard :recipe="featuredRecipe" />
</div>
```

**Step 4: Update the button**

Update the "Load another" button to use forge button styling:

```html
<button
  v-if="recipesStore.recipes.length > 1"
  class="featured__button forge__button"
  @click="pickRandom"
>
  Load another
</button>
```

**Step 5: Verify structure**

Check that all elements are properly nested and classes are applied.

**Step 6: Commit**

```bash
git add src/features/recipes/views/HomeView.vue
git commit -m "style: apply forge styling to featured recipe card (home view)"
```

---

## Task 9: Update BrowseView.vue to Use Forge Styles

**Files:**
- Modify: `src/features/recipes/views/BrowseView.vue`

**Description:**
Style the recipe grid cards with consistent forge textures and accents.

**Step 1: Read BrowseView.vue**

Check the current grid structure and RecipeCard usage.

**Step 2: Update the container**

Add `.forge__texture-subtle` to the main container:

```html
<div class="browse__container forge__texture-subtle">
```

Or if there's a wrapper div, apply it there. Check the actual structure.

**Step 3: Update the grid**

The grid likely iterates through recipes with RecipeCard components. We need to wrap these to add forge styling. If RecipeCard is used directly, we may need to update the wrapper or add styling around it.

Check the current template structure. If it's like:
```html
<div class="browse__grid">
  <RecipeCard v-for="recipe in paginatedRecipes" :key="recipe.id" :recipe="recipe" />
</div>
```

Update to:
```html
<div class="browse__grid">
  <div v-for="recipe in paginatedRecipes" :key="recipe.id" class="forge__card forge__texture-metal forge__distressed">
    <RecipeCard :recipe="recipe" />
  </div>
</div>
```

**Step 4: Verify the grid looks correct**

Check that cards are still laid out in 3 columns and the texture is visible.

**Step 5: Commit**

```bash
git add src/features/recipes/views/BrowseView.vue
git commit -m "style: apply forge styling to recipe grid cards (browse view)"
```

---

## Task 10: Test Accessibility (Focus States, Keyboard Navigation, Contrast)

**Files:**
- No files modified, testing only

**Description:**
Verify that the forge theme meets WCAG 2.1 Level AA accessibility requirements.

**Step 1: Test keyboard navigation**

- Open the app in browser (`npm run dev`)
- Press `Tab` to navigate through interactive elements (navbar links, buttons, form inputs)
- Verify that focus indicators (amber rings) are clearly visible against the dark background
- Ensure all interactive elements are reachable via keyboard

Expected: All buttons, links, and form inputs show clear amber focus indicators.

**Step 2: Test focus state contrast**

Check that the amber focus indicator has sufficient contrast against the dark background. The amber `#d4a574` on dark `#1a1a1a` should meet 4.5:1 contrast ratio.

You can verify using a contrast checker tool (WAVE, Lighthouse, etc.)

Expected: Focus indicators meet WCAG AA contrast requirements.

**Step 3: Test motion preferences**

- Open DevTools (F12) → Rendering → Emulate CSS media feature prefers-reduced-motion
- Select "prefers-reduced-motion: reduce"
- Hover over interactive elements
- Verify animations are disabled but hover effects remain visible

Expected: No animations play, but hover states (like glow) are still visible as static effects.

**Step 4: Test in high contrast mode**

On Windows: Settings → Ease of Access → High Contrast
- Load the app and verify UI is still readable
- Verify buttons and links are distinguishable

Expected: UI remains usable in high contrast mode.

**Step 5: Test with screen reader (optional)**

Use a screen reader to navigate:
- Links should be announced as "link"
- Buttons should be announced as "button"
- Form labels should be properly associated

Expected: No accessibility violations reported by screen reader.

**Step 6: No commit needed**

This is a verification step, not a code change.

---

## Task 11: Build, Visual Verification, and Final Commit

**Files:**
- No files modified, verification only

**Description:**
Final verification that the forge theme is complete and working.

**Step 1: Build for production**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors or warnings related to CSS.

**Step 2: Run tests**

Run:
```bash
npm test
```

Expected: All 24 tests pass. No new test failures introduced.

**Step 3: Visual verification in dev mode**

Run:
```bash
npm run dev
```

Open browser at http://localhost:3000 and verify:
- Navigation bar has amber brand and link colors
- Featured recipe card (HomeView) has visible texture and amber border
- "Load another" button has amber color and glows on hover
- Recipe grid (BrowseView) shows cards with texture and amber accents
- All text is readable (good contrast)
- Hover effects and glow animations work smoothly
- Focus indicators (amber rings) appear on Tab navigation

**Step 4: Check specific visual elements**

- [ ] Background is medium dark (#1a1a1a)
- [ ] Cards are slightly lighter (#242424)
- [ ] Amber accents are visible (#d4a574)
- [ ] Textures are visible on cards but subtle on backgrounds
- [ ] Glow effect appears on hover
- [ ] Buttons have amber borders and text
- [ ] Form inputs have dark background and amber focus border

**Step 5: Verify no regressions**

- [ ] Recipe card information displays correctly
- [ ] Tags are visible and styled
- [ ] Images in cards display properly
- [ ] Pagination still works (BrowseView)
- [ ] Navigation links work
- [ ] All colors are readable

**Step 6: Final commit**

```bash
git add .
git commit -m "style: complete forge theme implementation (dark, amber, textures, animations)"
```

---

## Summary

**Total Tasks:** 11

**Files Created:**
- `src/styles/forge-theme.css`
- `src/styles/forge-textures.css`
- `src/styles/forge-components.css`
- `src/styles/forge-animations.css`
- `src/assets/textures/metal-grain.svg`
- `src/assets/textures/paper-texture.svg`

**Files Modified:**
- `src/assets/main.css`
- `src/components/AppNavbar.vue`
- `src/features/recipes/views/HomeView.vue`
- `src/features/recipes/views/BrowseView.vue`

**Testing:** Accessibility, keyboard navigation, visual verification, build, unit tests

**Git Commits:** ~8 commits total (one per task group)
