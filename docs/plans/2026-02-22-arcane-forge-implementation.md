# Arcane Forge Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current dark-iron forge theme with the "Arcane Forge" theme — a magical dungeon aesthetic with dual amber+purple accents, stone textures, runic borders, and CSS-only particle effects.

**Architecture:** The theme is implemented entirely through CSS custom properties, utility classes in 4 style files (`forge-theme.css`, `forge-textures.css`, `forge-components.css`, `forge-animations.css`), two new SVG texture assets, and minor class changes in Vue SFCs. No JS logic changes are needed.

**Tech Stack:** CSS custom properties, SVG textures, CSS keyframe animations, Vue 3 scoped styles with `@reference`, Tailwind CSS v4, PrimeVue Aura theme overrides.

**Design doc:** `docs/plans/2026-02-22-arcane-forge-theme-design.md`

---

### Task 1: Create SVG Texture Assets

Create the two new SVG files that the theme depends on. All subsequent tasks reference these.

**Files:**
- Create: `src/assets/textures/stone-blocks.svg`
- Create: `src/assets/textures/runic-border.svg`

**Step 1: Create stone-blocks.svg**

This is a repeating tile (256x256) that creates the illusion of rough-hewn dungeon stone blocks using subtle lines and noise.

Write to `src/assets/textures/stone-blocks.svg`:

```svg
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="stone-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="5" seed="7" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="256" height="256" fill="#1a1722"/>
  <rect width="256" height="256" fill="#0a0812" opacity="0.2" filter="url(#stone-noise)"/>
  <!-- Horizontal mortar lines -->
  <line x1="0" y1="64" x2="256" y2="64" stroke="#0a0812" stroke-width="2" opacity="0.3"/>
  <line x1="0" y1="128" x2="256" y2="128" stroke="#0a0812" stroke-width="2" opacity="0.3"/>
  <line x1="0" y1="192" x2="256" y2="192" stroke="#0a0812" stroke-width="2" opacity="0.3"/>
  <!-- Vertical mortar lines (staggered like brickwork) -->
  <line x1="128" y1="0" x2="128" y2="64" stroke="#0a0812" stroke-width="2" opacity="0.25"/>
  <line x1="64" y1="64" x2="64" y2="128" stroke="#0a0812" stroke-width="2" opacity="0.25"/>
  <line x1="192" y1="64" x2="192" y2="128" stroke="#0a0812" stroke-width="2" opacity="0.25"/>
  <line x1="128" y1="128" x2="128" y2="192" stroke="#0a0812" stroke-width="2" opacity="0.25"/>
  <line x1="64" y1="192" x2="64" y2="256" stroke="#0a0812" stroke-width="2" opacity="0.25"/>
  <line x1="192" y1="192" x2="192" y2="256" stroke="#0a0812" stroke-width="2" opacity="0.25"/>
</svg>
```

**Step 2: Create runic-border.svg**

A thin horizontal strip (256x8) of angular runic shapes in amber. Used as a repeating border image.

Write to `src/assets/textures/runic-border.svg`:

```svg
<svg width="256" height="8" xmlns="http://www.w3.org/2000/svg">
  <!-- Abstract angular runic glyphs in amber -->
  <g fill="none" stroke="#e8a042" stroke-width="1.5" opacity="0.6">
    <!-- Glyph 1: angular V -->
    <polyline points="4,2 10,6 16,2"/>
    <!-- Glyph 2: diamond -->
    <polyline points="28,1 32,4 28,7 24,4 28,1"/>
    <!-- Glyph 3: zigzag -->
    <polyline points="44,6 48,2 52,6 56,2"/>
    <!-- Glyph 4: cross-hatch -->
    <line x1="68" y1="1" x2="76" y2="7"/>
    <line x1="76" y1="1" x2="68" y2="7"/>
    <!-- Glyph 5: arrow up -->
    <polyline points="88,7 92,1 96,7"/>
    <line x1="92" y1="1" x2="92" y2="7"/>
    <!-- Glyph 6: bracket pair -->
    <polyline points="110,1 106,4 110,7"/>
    <polyline points="114,1 118,4 114,7"/>
    <!-- Glyph 7: triple line -->
    <line x1="128" y1="1" x2="128" y2="7"/>
    <line x1="132" y1="1" x2="132" y2="7"/>
    <line x1="136" y1="1" x2="136" y2="7"/>
    <!-- Glyph 8: angular S -->
    <polyline points="148,1 156,1 148,7 156,7"/>
    <!-- Glyph 9: dot-line-dot -->
    <circle cx="168" cy="4" r="1.5"/>
    <line x1="172" y1="4" x2="180" y2="4"/>
    <circle cx="184" cy="4" r="1.5"/>
    <!-- Glyph 10: inverted V -->
    <polyline points="196,6 202,2 208,6"/>
    <!-- Glyph 11: box -->
    <rect x="220" y="1" width="6" height="6"/>
    <!-- Glyph 12: diagonal -->
    <line x1="240" y1="1" x2="252" y2="7"/>
  </g>
</svg>
```

**Step 3: Commit**

```bash
git add src/assets/textures/stone-blocks.svg src/assets/textures/runic-border.svg
git commit -m "feat: add stone-blocks and runic-border SVG textures for arcane forge theme"
```

---

### Task 2: Update Color Palette (`forge-theme.css`)

Replace all CSS custom properties with the Arcane Forge palette. This is the foundation — everything else references these variables.

**Files:**
- Modify: `src/styles/forge-theme.css` (replace entire contents)

**Step 1: Replace forge-theme.css**

Write the full file:

```css
/* Arcane Forge Theme - Color Palette
   Dungeon darkness with purple undertones, dual amber+purple accents.
   Overrides PrimeVue CSS variables.
*/

:root {
  /* Backgrounds - Dungeon darkness with purple undertone */
  --surface-ground: #0a0812;
  --surface-0: #1a1722;
  --surface-50: #24202e;
  --surface-100: #2e2a3a;
  --surface-200: #383245;

  /* Text - Cool silver */
  --text-color: #c8c4d4;
  --text-color-secondary: #8a849a;

  /* Primary - Arcane amber (forge flame) */
  --primary-color: #e8a042;
  --primary-light: #ffd580;

  /* Purple accent - Mystic energy */
  --purple-accent: #8b5cf6;
  --purple-light: #a78bfa;

  /* Ember - Flame red-orange */
  --ember-color: #e85d2a;

  /* Borders */
  --surface-border: #2e2a3a;
  --surface-section: #1a1722;

  /* Semantic colors */
  --red-500: #d97757;
  --orange-500: #e8a042;
  --yellow-500: #e8a042;
  --green-500: #66b3a3;
}

:root.dark {
  /* Same variables for explicit dark mode toggle */
}

body {
  background-color: var(--surface-ground);
  color: var(--text-color);
  background: linear-gradient(135deg, #0a0812 0%, rgba(20, 12, 30, 0.6) 100%);
}

a {
  color: var(--primary-color);
}

a:hover {
  color: var(--primary-light);
}
```

**Step 2: Verify dev server**

Run: `npm run dev` — open browser, confirm the background is now deep indigo-black and text is cool silver. Cards and components will look off until later tasks restyle them — that's expected.

**Step 3: Commit**

```bash
git add src/styles/forge-theme.css
git commit -m "feat: replace forge color palette with arcane dungeon tones (indigo-black, cool silver, amber+purple)"
```

---

### Task 3: Update Textures (`forge-textures.css`)

Add stone texture classes alongside existing metal grain. Update the subtle background texture to use stone blocks.

**Files:**
- Modify: `src/styles/forge-textures.css` (replace entire contents)

**Step 1: Replace forge-textures.css**

```css
/* Arcane Forge Textures - Stone, metal, and runic overlays */

/* Stone block texture for cards and panels */
.forge__texture-stone::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../assets/textures/stone-blocks.svg");
  background-size: 256px 256px;
  opacity: 0.12;
  pointer-events: none;
  border-radius: inherit;
  z-index: 0;
}

.forge__texture-stone {
  position: relative;
}

.forge__texture-stone > * {
  position: relative;
  z-index: 1;
}

/* Metal grain texture (kept for navbar accent) */
.forge__texture-metal::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../assets/textures/metal-grain.svg");
  background-size: 256px 256px;
  opacity: 0.10;
  pointer-events: none;
  border-radius: inherit;
  z-index: 0;
}

.forge__texture-metal {
  position: relative;
}

.forge__texture-metal > * {
  position: relative;
  z-index: 1;
}

/* Subtle stone background (page-level) */
.forge__texture-subtle::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../assets/textures/stone-blocks.svg");
  background-size: 512px 512px;
  opacity: 0.05;
  pointer-events: none;
  z-index: -1;
}

/* Runic accent border (top edge of cards/sections) */
.forge__runic-border::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-image: url("../assets/textures/runic-border.svg");
  background-size: 256px 4px;
  background-repeat: repeat-x;
  opacity: 0.7;
  pointer-events: none;
  border-radius: inherit;
  z-index: 2;
}

/* Amber accent border with purple outer glow */
.forge__accent-border {
  border: 2px solid var(--primary-color);
  box-shadow: inset 0 0 4px rgba(139, 92, 246, 0.15);
}

/* Distressed corners - dungeon wear */
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
    rgba(10, 8, 18, 0.4) 0%,
    transparent 50%
  ),
  radial-gradient(
    circle at 100% 100%,
    rgba(10, 8, 18, 0.4) 0%,
    transparent 50%
  );
  pointer-events: none;
  border-radius: inherit;
}
```

**Step 2: Commit**

```bash
git add src/styles/forge-textures.css
git commit -m "feat: add stone-block and runic-border textures, replace metal-grain background with stone"
```

---

### Task 4: Update Animations (`forge-animations.css`)

Replace all keyframe animations with the arcane dual-glow system, brand flicker, ember particles, and purple sparks.

**Files:**
- Modify: `src/styles/forge-animations.css` (replace entire contents)

**Step 1: Replace forge-animations.css**

```css
/* Arcane Forge Animations - Dual-glow effects, particles, brand flicker */

/* Dual amber+purple glow for interactive elements */
@keyframes arcane-glow {
  0% {
    box-shadow:
      0 0 8px rgba(232, 160, 66, 0.3),
      0 0 16px rgba(139, 92, 246, 0.1);
  }
  50% {
    box-shadow:
      0 0 16px rgba(232, 160, 66, 0.5),
      0 0 24px rgba(139, 92, 246, 0.2);
  }
  100% {
    box-shadow:
      0 0 8px rgba(232, 160, 66, 0.3),
      0 0 16px rgba(139, 92, 246, 0.1);
  }
}

/* Brand text flicker between amber and purple */
@keyframes brand-flicker {
  0% {
    text-shadow:
      0 0 8px rgba(232, 160, 66, 0.6),
      0 0 20px rgba(232, 160, 66, 0.2);
  }
  50% {
    text-shadow:
      0 0 12px rgba(139, 92, 246, 0.5),
      0 0 24px rgba(139, 92, 246, 0.15);
  }
  100% {
    text-shadow:
      0 0 8px rgba(232, 160, 66, 0.6),
      0 0 20px rgba(232, 160, 66, 0.2);
  }
}

/* Ember particles rising */
@keyframes ember-rise {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-100vh) translateX(30px);
    opacity: 0;
  }
}

/* Purple spark drift */
@keyframes spark-drift {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 0.6;
  }
  85% {
    opacity: 0.05;
  }
  100% {
    transform: translateY(-100vh) translateX(-20px) rotate(180deg);
    opacity: 0;
  }
}

/* Arcane skeleton shimmer */
@keyframes shimmer-arcane {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Apply arcane glow to interactive elements on hover */
.forge__card:hover,
.forge__button:hover:not(:disabled),
.forge__link:hover {
  animation: arcane-glow 2.5s ease-in-out infinite;
}

/* Brand flicker on the navbar brand */
.forge__brand {
  animation: brand-flicker 5s ease-in-out infinite;
}

/* Ember particle layer (applied to .app::after) */
.forge__embers::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  box-shadow:
    20px 90vh 3px 0 rgba(232, 160, 66, 0.7),
    80px 85vh 2px 0 rgba(232, 92, 42, 0.6),
    150px 92vh 3px 0 rgba(232, 160, 66, 0.5),
    230px 88vh 2px 0 rgba(232, 92, 42, 0.7),
    320px 95vh 3px 0 rgba(232, 160, 66, 0.6),
    410px 87vh 2px 0 rgba(232, 92, 42, 0.5),
    500px 91vh 3px 0 rgba(232, 160, 66, 0.7),
    600px 86vh 2px 0 rgba(232, 92, 42, 0.6),
    700px 93vh 3px 0 rgba(232, 160, 66, 0.5),
    780px 89vh 2px 0 rgba(232, 92, 42, 0.7),
    870px 94vh 3px 0 rgba(232, 160, 66, 0.6),
    950px 88vh 2px 0 rgba(232, 92, 42, 0.5),
    1050px 91vh 2px 0 rgba(232, 160, 66, 0.7),
    1150px 86vh 3px 0 rgba(232, 92, 42, 0.6),
    1250px 95vh 2px 0 rgba(232, 160, 66, 0.5);
  animation: ember-rise 10s linear infinite;
}

/* Purple spark layer (applied to .app::before — repurposed from texture) */
.forge__sparks::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  box-shadow:
    60px 88vh 2px 0 rgba(139, 92, 246, 0.5),
    200px 93vh 1px 0 rgba(139, 92, 246, 0.4),
    350px 90vh 2px 0 rgba(167, 139, 250, 0.5),
    520px 95vh 1px 0 rgba(139, 92, 246, 0.4),
    680px 87vh 2px 0 rgba(167, 139, 250, 0.5),
    830px 92vh 1px 0 rgba(139, 92, 246, 0.4),
    1000px 89vh 2px 0 rgba(167, 139, 250, 0.5),
    1180px 94vh 1px 0 rgba(139, 92, 246, 0.4);
  animation: spark-drift 13s linear infinite;
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .forge__card:hover,
  .forge__button:hover:not(:disabled),
  .forge__link:hover,
  .forge__brand {
    animation: none;
  }

  .forge__embers::after,
  .forge__sparks::before {
    animation: none;
    opacity: 0;
  }

  .forge__card:hover {
    box-shadow:
      0 0 12px rgba(232, 160, 66, 0.3),
      0 0 24px rgba(139, 92, 246, 0.15);
  }

  .forge__brand {
    text-shadow:
      0 0 8px rgba(232, 160, 66, 0.6),
      0 0 20px rgba(232, 160, 66, 0.2);
  }
}
```

**Step 2: Commit**

```bash
git add src/styles/forge-animations.css
git commit -m "feat: add arcane dual-glow animations, ember particles, purple sparks, and brand flicker"
```

---

### Task 5: Update Component Styles (`forge-components.css`)

Restyle all forge utility classes: cards become stone tablets, tags become rune chips, buttons get dual-glow, forms feel carved into stone.

**Files:**
- Modify: `src/styles/forge-components.css` (replace entire contents)

**Step 1: Replace forge-components.css**

```css
/* Arcane Forge Components - Stone tablets, rune chips, carved forms */

/* --- Cards: Stone Tablets --- */

.forge__card {
  background-color: var(--surface-0);
  border-radius: 6px;
  padding: 1rem;
  position: relative;
  transition: all 250ms ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

/* Gradient top accent: purple to amber */
.forge__card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--purple-accent), var(--primary-color));
  border-radius: 6px 6px 0 0;
  z-index: 2;
}

.forge__card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 0 12px rgba(232, 160, 66, 0.3),
    0 0 24px rgba(139, 92, 246, 0.15),
    0 6px 20px rgba(0, 0, 0, 0.5);
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

/* --- Tags: Rune Chips --- */

.forge__tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--purple-accent);
  border-radius: 3px;
  background-color: transparent;
  color: var(--purple-accent);
  transition: all 150ms ease;
  cursor: pointer;
}

.forge__tag:hover {
  background-color: rgba(139, 92, 246, 0.1);
  border-color: var(--purple-light);
  color: var(--purple-light);
}

/* --- Buttons --- */

.forge__button {
  background-color: transparent;
  border: 2px solid var(--purple-accent);
  color: var(--purple-accent);
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
  box-shadow:
    0 0 12px rgba(139, 92, 246, 0.4),
    0 0 24px rgba(139, 92, 246, 0.15);
  background-color: rgba(139, 92, 246, 0.05);
  border-color: var(--purple-light);
  color: var(--purple-light);
}

.forge__button:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: 2px;
}

.forge__button:active:not(:disabled) {
  background-color: rgba(139, 92, 246, 0.15);
}

.forge__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: var(--surface-100);
  color: var(--surface-100);
}

/* Primary button: amber with purple halo on hover */
.forge__button-primary {
  background-color: var(--primary-color);
  color: #0a0812;
  border-color: var(--primary-color);
}

.forge__button-primary:hover:not(:disabled) {
  background-color: var(--primary-light);
  border-color: var(--primary-light);
  box-shadow:
    0 0 16px rgba(232, 160, 66, 0.5),
    0 0 32px rgba(139, 92, 246, 0.2);
}

/* --- Forms: Carved Stone --- */

.forge__input {
  background-color: var(--surface-50);
  border: 1px solid var(--surface-200);
  color: var(--text-color);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 200ms ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.forge__input:focus {
  outline: none;
  border-color: var(--purple-accent);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 8px rgba(139, 92, 246, 0.3),
    0 0 4px rgba(232, 160, 66, 0.2);
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
  letter-spacing: 0.05em;
  font-variant: small-caps;
}

.forge__textarea {
  background-color: var(--surface-50);
  border: 1px solid var(--surface-200);
  color: var(--text-color);
  padding: 0.75rem;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 200ms ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.forge__textarea:focus {
  outline: none;
  border-color: var(--purple-accent);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 8px rgba(139, 92, 246, 0.4),
    0 0 4px rgba(232, 160, 66, 0.2);
}

.forge__form-group {
  margin-bottom: 1.5rem;
}

.forge__error {
  color: #d97757;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

/* --- Links --- */

.forge__link {
  color: var(--text-color-secondary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 150ms ease;
}

.forge__link:hover {
  color: var(--purple-accent);
  border-bottom-color: var(--purple-accent);
}

.forge__link:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Active/current link: amber */
.forge__link.router-link-active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

/* --- Navbar Brand --- */

.forge__brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  letter-spacing: 0.5px;
  transition: all 200ms ease;
}

.forge__brand:hover {
  text-shadow:
    0 0 12px rgba(232, 160, 66, 0.7),
    0 0 24px rgba(139, 92, 246, 0.3);
}

/* --- Disabled state --- */

.forge__disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

**Step 2: Commit**

```bash
git add src/styles/forge-components.css
git commit -m "feat: restyle forge components as stone tablets, rune chips, and carved forms with dual-glow"
```

---

### Task 6: Update App.vue — Particles and Stone Background

Add the particle classes to the root element and ensure the stone texture replaces metal grain.

**Files:**
- Modify: `src/App.vue`

**Step 1: Update App.vue template and styles**

The template changes from:
```html
<div class="app forge__texture-subtle">
```
to:
```html
<div class="app forge__texture-subtle forge__embers forge__sparks">
```

No other changes needed — the `.app` styles already use `var(--surface-ground)` which now resolves to the new indigo-black, and `forge__texture-subtle` now uses stone-blocks.svg (from Task 3).

**Step 2: Commit**

```bash
git add src/App.vue
git commit -m "feat: add ember and spark particle layers to app root"
```

---

### Task 7: Update AppNavbar — Stone Lintel with Runic Border

Restyle the navbar as a stone lintel with a runic pattern bottom edge. Update link hover to use purple.

**Files:**
- Modify: `src/components/AppNavbar.vue`

**Step 1: Update the template**

Add `forge__texture-metal` to the `<nav>` for a metallic overlay on the navbar:

```html
<nav class="navbar forge__texture-metal">
```

**Step 2: Update scoped styles**

Replace the `.navbar` bottom border with the runic border. The key changes:

- `.navbar` gets `overflow: hidden` so the runic pseudo-element stays within bounds, and the bottom border becomes the runic SVG.
- Add a `.navbar::after` for the runic border strip at the bottom.
- Links hover purple, active links glow amber (already handled by `forge__link` from Task 5).

Replace the `<style scoped>` block:

```css
@reference "../assets/main.css";

.navbar {
  background-color: var(--surface-0);
  position: relative;
  z-index: 10;
  overflow: hidden;
}

.navbar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-image: url("../assets/textures/runic-border.svg");
  background-size: 256px 4px;
  background-repeat: repeat-x;
  opacity: 0.7;
  z-index: 3;
}

.navbar__inner {
  @apply px-6 py-4 flex items-center gap-6 relative z-2;
}

.navbar__brand {
  @apply text-xl font-bold no-underline;
  color: var(--primary-color);
  letter-spacing: 0.5px;
}

.navbar__links {
  @apply flex gap-6 ml-auto items-center;
}

.navbar__link {
  color: var(--text-color-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 200ms ease;
}

.navbar__link:hover {
  color: var(--purple-accent);
  border-bottom-color: var(--purple-accent);
}

.navbar__link.router-link-active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.navbar__link:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: 4px;
  border-radius: 2px;
}

.navbar__link--button {
  @apply bg-transparent border-0 cursor-pointer p-0;
  font-family: inherit;
}
```

Also update the template to wrap content in `.navbar__inner` so layout classes are separate from the textured container:

```html
<nav class="navbar forge__texture-metal">
  <div class="navbar__inner">
    <RouterLink :to="{ name: 'home' }" class="navbar__brand forge__brand">
      Recipe Forge
    </RouterLink>
    <div class="navbar__links">
      <!-- ... links unchanged ... -->
    </div>
  </div>
</nav>
```

**Step 3: Commit**

```bash
git add src/components/AppNavbar.vue
git commit -m "feat: restyle navbar as stone lintel with runic border and purple hover links"
```

---

### Task 8: Update RecipeCard — Rune Chip Tags

Update the tag styling in RecipeCard to use the purple rune-chip palette.

**Files:**
- Modify: `src/features/recipes/components/RecipeCard.vue`

**Step 1: Update scoped styles**

Replace the tag-related styles to use purple accents. The card itself is wrapped in a `forge__card` in the parent views, so it doesn't need card-level styling here.

Update `.recipe-card__tag`:

```css
.recipe-card__tag {
  @apply inline-flex items-center px-2 py-1 text-xs rounded transition-colors cursor-pointer;
  background-color: transparent;
  color: var(--purple-accent);
  border: 1px solid var(--purple-accent);
}

.recipe-card__tag:hover {
  background-color: rgba(139, 92, 246, 0.1);
  border-color: var(--purple-light);
  color: var(--purple-light);
}

.recipe-card__tag:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: 1px;
}

.recipe-card__tag:active {
  background-color: rgba(139, 92, 246, 0.15);
}
```

**Step 2: Commit**

```bash
git add src/features/recipes/components/RecipeCard.vue
git commit -m "feat: restyle recipe tags as purple rune chips"
```

---

### Task 9: Update HomeView — Stone Tablet Featured Card

Switch the featured card wrapper from `forge__texture-metal forge__distressed` to `forge__texture-stone`.

**Files:**
- Modify: `src/features/recipes/views/HomeView.vue`

**Step 1: Update card wrapper classes**

Change:
```html
<div class="featured__card-wrapper forge__card forge__texture-metal forge__distressed">
```
To:
```html
<div class="featured__card-wrapper forge__card forge__texture-stone forge__runic-border">
```

This gives the featured card a stone texture with a runic accent line at the top.

**Step 2: Commit**

```bash
git add src/features/recipes/views/HomeView.vue
git commit -m "feat: apply stone tablet styling to featured recipe card"
```

---

### Task 10: Update BrowseView — Stone Tablet Grid Cards

Same treatment as HomeView: swap metal texture for stone on the grid cards.

**Files:**
- Modify: `src/features/recipes/views/BrowseView.vue`

**Step 1: Update grid card classes**

Change:
```html
<div class="forge__card forge__texture-metal forge__distressed">
```
To:
```html
<div class="forge__card forge__texture-stone forge__runic-border">
```

**Step 2: Commit**

```bash
git add src/features/recipes/views/BrowseView.vue
git commit -m "feat: apply stone tablet styling to browse grid cards"
```

---

### Task 11: Visual QA and Final Commit

Run the dev server and do a visual pass of every page.

**Files:** None (QA only)

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Check each page visually**

Open browser and navigate through:
- `/` (HomeView) — verify: indigo-black background, stone texture, ember particles floating, purple sparks, featured card with stone texture + runic top border + gradient accent, button with purple border
- `/browse` (BrowseView) — verify: grid of stone tablet cards, purple rune chip tags, dual-glow on card hover
- `/auth` (AuthView) — verify: form is legible on dark background, PrimeVue inputs inherit theme colors
- `/recipes/new` (RecipeFormView) — verify: heading text uses cool silver
- `/recipes/1` (RecipeDetailView) — verify: same
- `/not-a-real-page` (NotFoundView) — verify: 404 text legible, "Go home" link is amber
- Navbar on every page — verify: metallic texture, runic border at bottom, brand flickers amber/purple, links hover purple, active link is amber

**Step 3: Fix any issues found**

Adjust CSS variables, opacities, or shadow values as needed.

**Step 4: Build check**

Run: `npm run build` — confirm no errors.

**Step 5: Final commit (if fixes were made)**

```bash
git add -A
git commit -m "fix: visual QA adjustments for arcane forge theme"
```
