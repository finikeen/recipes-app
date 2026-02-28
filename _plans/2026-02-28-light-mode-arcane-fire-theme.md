# Plan: Light Mode "Arcane Fire" Theme + Toggle

## Context

The app currently has a dark-only "dungeon arcane" theme. All CSS variables are hardcoded at `:root` (always dark), and PrimeVue's `darkModeSelector: '.dark'` is configured but never used. The user wants a warm "parchment lit by torchlight" light mode that preserves the amber/purple arcane fire identity, plus a navbar toggle to switch between modes.

---

## Light Mode Color Palette

Warm parchment surfaces, deeper amber/purple for contrast on light backgrounds, dark warm-brown text.

| Variable | Dark | Light |
|---|---|---|
| `--surface-ground` | `#0a0812` | `#f5efe0` |
| `--surface-0` | `#1a1722` | `#fdf8f0` |
| `--surface-50` | `#24202e` | `#f0e8d8` |
| `--surface-100` | `#2e2a3a` | `#e8dcc8` |
| `--surface-200` | `#383245` | `#d8ccb4` |
| `--text-color` | `#c8c4d4` | `#2c2018` |
| `--text-color-secondary` | `#8a849a` | `#7a6a50` |
| `--primary-color` | `#e8a042` | `#c07820` (darkened for contrast) |
| `--primary-light` | `#ffd580` | `#e8a042` |
| `--purple-accent` | `#8b5cf6` | `#6d3fcf` (darkened for contrast) |
| `--purple-light` | `#a78bfa` | `#8b5cf6` |
| `--ember-color` | `#e85d2a` | `#c44a18` |
| `--surface-border` | `#2e2a3a` | `#d8ccb4` |
| `--red-500` | `#d97757` | `#b84040` |
| `--green-500` | `#66b3a3` | `#3d7a6c` |

New semantic variables (added to both `:root` and `:root.dark`) to replace hardcoded rgba values in `forge-components.css`:

| Variable | Dark | Light |
|---|---|---|
| `--card-shadow` | `0 2px 12px rgba(0,0,0,0.6)` | `0 2px 12px rgba(60,40,10,0.15)` |
| `--card-hover-shadow` | `0 0 12px rgba(232,160,66,0.3), 0 0 24px rgba(139,92,246,0.15), 0 6px 20px rgba(0,0,0,0.5)` | `0 0 12px rgba(192,120,32,0.25), 0 0 24px rgba(109,63,207,0.12), 0 6px 20px rgba(60,40,10,0.12)` |
| `--card-border` | `none` | `1px solid var(--surface-100)` |
| `--input-shadow` | `inset 0 2px 4px rgba(0,0,0,0.3)` | `inset 0 2px 4px rgba(100,70,20,0.08)` |
| `--input-focus-shadow` | `inset 0 2px 4px rgba(0,0,0,0.3), 0 0 8px rgba(139,92,246,0.3), 0 0 4px rgba(232,160,66,0.2)` | `inset 0 2px 4px rgba(100,70,20,0.08), 0 0 8px rgba(109,63,207,0.25), 0 0 4px rgba(192,120,32,0.15)` |
| `--primary-btn-color` | `#0a0812` | `#fdf8f0` |
| `--mobile-menu-shadow` | `-2px 0 8px rgba(0,0,0,0.3)` | `-2px 0 8px rgba(60,40,10,0.15)` |

---

## Files to Change

### 1. `src/styles/forge-theme.css`

**Restructure:** Move all current `:root` dark values into `:root.dark`. Populate `:root` with the light values from the table above plus all new semantic variables. Update `body` gradient to parchment by default; override with dungeon gradient in `.dark body`.

```css
/* LIGHT MODE default */
:root { /* light values + new semantic vars */ }

/* DARK MODE */
:root.dark { /* existing dark values + dark variants of new semantic vars */ }

body {
  background-color: var(--surface-ground);
  color: var(--text-color);
  background: linear-gradient(135deg, #f5efe0 0%, rgba(240, 230, 210, 0.6) 100%);
}

.dark body {
  background: linear-gradient(135deg, #0a0812 0%, rgba(20, 12, 30, 0.6) 100%);
}
```

### 2. `src/styles/forge-components.css`

Replace 5 hardcoded dark rgba values with CSS variables:

- Line 11: `box-shadow: 0 2px 12px rgba(0,0,0,0.6)` → `box-shadow: var(--card-shadow)`
- Lines 29-33: card `:hover` box-shadow → `box-shadow: var(--card-hover-shadow)`
- After card base styles, add: `border: var(--card-border)`
- Line 131: `.forge__button-primary { color: #0a0812 }` → `color: var(--primary-btn-color)`
- Lines 172 & 209: `.forge__input` / `.forge__textarea` inset shadow → `box-shadow: var(--input-shadow)`
- Lines 178-182 & 215-219: input/textarea `:focus` shadow → `box-shadow: var(--input-focus-shadow)`

### 3. `src/theme.js`

Add `light` colorScheme alongside the existing `dark` block inside `colorScheme`:

```js
light: {
  primary: {
    color: '{primary.600}',      // #d97706
    contrastColor: '#fdf8f0',
    hoverColor: '{primary.500}',
    activeColor: '{primary.400}',
  },
  formField: {
    background: '#f0e8d8',
    color: '#2c2018',
    borderColor: '#d8ccb4',
    hoverBorderColor: '#6d3fcf',
    focusBorderColor: '#6d3fcf',
    placeholderColor: '#7a6a50',
    shadow: 'inset 0 2px 4px rgba(100, 70, 20, 0.08)',
  },
},
```

### 4. `src/composables/useColorMode.js` (NEW)

Singleton composable — the ref and initialization live at module scope to prevent FOUC (runs before first render).

```js
import { ref, readonly } from 'vue'

function resolveInitialDark() {
  const stored = localStorage.getItem('forge-color-mode')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
}

const isDark = ref(resolveInitialDark())
document.documentElement.classList.toggle('dark', isDark.value)

export function useColorMode() {
  const toggle = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('forge-color-mode', isDark.value ? 'dark' : 'light')
  }
  return { isDark: readonly(isDark), toggle }
}
```

**Initialization priority:** localStorage → `prefers-color-scheme` → dark (the current app default).

### 5. `src/components/AppNavbar.vue`

**Script:** import `useColorMode`, destructure `isDark` and `toggle`.

**Template:** Wrap the theme toggle button and hamburger in a new `.navbar__controls` div:

```html
<div class="navbar__controls">
  <button
    class="navbar__theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true" />
  </button>
  <button
    class="navbar__hamburger"
    ...
  >...</button>
</div>
```

**Styles:**
- `.navbar__controls`: `@apply flex items-center gap-2 ml-auto md:ml-0;` — `ml-auto` handles mobile push-right; on desktop, `ml-0` since `.navbar__links` already has `ml-auto`
- Remove `ml-auto` from `.navbar__hamburger` (moved to `.navbar__controls`)
- Add `.navbar__theme-toggle` styles: transparent bg, `color: var(--text-color-secondary)`, hover uses `var(--primary-color)`, focus outline uses `var(--purple-accent)`

Also replace the hardcoded `.navbar__mobile-menu` shadow on line 199:
`box-shadow: -2px 0 8px rgba(0,0,0,0.3)` → `box-shadow: var(--mobile-menu-shadow)`

---

## Implementation Order

1. `src/styles/forge-theme.css` — Light `:root`, dark `:root.dark`, new semantic variables, body gradient
2. `src/styles/forge-components.css` — Swap hardcoded rgba values for CSS variables
3. `src/theme.js` — Add `light` colorScheme
4. `src/composables/useColorMode.js` — Create composable (new file, new `src/composables/` directory)
5. `src/components/AppNavbar.vue` — Add toggle button, controls wrapper, styles, mobile menu shadow fix

---

## Verification

1. `npm run dev` — open app, confirm it loads in dark mode (existing behavior preserved)
2. Click toggle → app switches to parchment light mode; all surfaces, text, and PrimeVue form fields adapt
3. Refresh page → light mode persists (localStorage)
4. Open browser DevTools → toggle `prefers-color-scheme: dark` → verify it's used on first visit with no localStorage entry
5. Check PrimeVue inputs (New Recipe form) render correctly in both modes — parchment background / warm border in light, dark carved-stone in dark
6. Check RecipeCard hover glow in both modes
7. Check mobile navbar: toggle + hamburger grouped on the right; mobile menu particles still animate in both modes
8. `npm test` — all existing tests still pass
