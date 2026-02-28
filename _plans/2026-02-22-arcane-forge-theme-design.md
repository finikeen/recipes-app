# The Arcane Forge — Theme Design

A magical forge hidden in a stone dungeon. Ancient stone walls, runic engravings, purple magical fire alongside classic amber flames. Part blacksmith, part sorcerer's workshop.

## Inspiration

Three reference images drive the aesthetic:

1. **Hooded armored figure** (Genesis logo) — metallic surfaces, ember particles, gold/amber on deep black
2. **Fire wizard in stone dungeon** — rich purples, fiery oranges, magical flame effects, stone textures
3. **Stone-carved demon furnace** — carved stone frame, glowing amber eyes, flames, runic/ancient feel

Common threads: fire, darkness, stone, glowing amber, mystical craftsmanship.

## Color Palette

### Backgrounds (dungeon darkness with purple undertone)

| Token                | Value     | Role                          |
|----------------------|-----------|-------------------------------|
| `--surface-ground`   | `#0a0812` | Deep indigo-black base        |
| `--surface-0`        | `#1a1722` | Card/panel background         |
| `--surface-50`       | `#24202e` | Input backgrounds, hover fill |
| `--surface-100`      | `#2e2a3a` | Elevated surfaces             |
| `--surface-200`      | `#383245` | Active/pressed states         |

### Text

| Token                      | Value     | Role             |
|----------------------------|-----------|------------------|
| `--text-color`             | `#c8c4d4` | Cool silver body  |
| `--text-color-secondary`   | `#8a849a` | Muted/secondary   |

### Accent Colors

| Token              | Value     | Role                                        |
|--------------------|-----------|---------------------------------------------|
| `--primary-color`  | `#e8a042` | Arcane amber — primary CTA, forge flame      |
| `--primary-light`  | `#ffd580` | White-hot amber — intense hover states       |
| `--purple-accent`  | `#8b5cf6` | Mystic purple — secondary actions, magic glow |
| `--purple-light`   | `#a78bfa` | Light purple — hover/focus secondary         |
| `--ember-color`    | `#e85d2a` | Flame red-orange — ember particles, warnings |

### Semantic Colors

| Token          | Value     | Role                     |
|----------------|-----------|--------------------------|
| `--red-500`    | `#d97757` | Error / destructive      |
| `--green-500`  | `#66b3a3` | Success                  |
| `--orange-500` | `#e8a042` | Warning (matches amber)  |

### Borders

| Token              | Value     |
|--------------------|-----------|
| `--surface-border` | `#2e2a3a` |
| `--surface-section`| `#1a1722` |

## Body Background

Diagonal gradient from pure dungeon dark to a faint purple undertone:

```css
background: linear-gradient(135deg, #0a0812 0%, rgba(20, 12, 30, 0.6) 100%);
```

## Textures

### Stone Texture (background)

A new repeating SVG (`stone-blocks.svg`) that mimics rough-hewn dungeon wall blocks. Applied at low opacity (0.05–0.08) on the page-level `::before` pseudo-element. Replaces the current `forge__texture-subtle` metal grain with stone.

### Stone Texture (cards)

Cards use the stone texture at slightly higher opacity (0.10–0.14) via `forge__texture-stone`. Gives the feel of individual stone tablets.

### Runic Border Pattern

A thin repeating SVG strip (`runic-border.svg`) of abstract angular shapes rendered in amber. Used as `border-image` or `background-image` on card top edges and section dividers.

### Keep existing metal grain

The metal grain SVG stays available as `forge__texture-metal` for specific accents (e.g., the navbar) where an iron feel is desired alongside stone.

## Particle System (CSS-only)

Two layers of animated particles floating upward across the full viewport:

### Layer 1 — Amber Embers

- 15–20 small dots (2–4px) using `box-shadow` on a single `::after` pseudo-element on `.app`
- Colors: `#e8a042` and `#e85d2a` mixed
- Animation: float upward over 8–12s, staggered with different delays, gentle horizontal drift
- Opacity fades from 0.8 to 0 as they rise

### Layer 2 — Purple Sparks

- 8–12 tiny dots (1–3px) using `box-shadow` on a second `::before` pseudo-element
- Color: `#8b5cf6` at varying opacity
- Animation: float upward over 10–15s, slightly different drift pattern
- Less numerous and more subtle than the amber layer

### Reduced motion

Both layers disabled entirely under `prefers-reduced-motion: reduce`.

## Component Styles

### Navbar — Stone Lintel

- Background: `--surface-0` with subtle stone texture
- Bottom border: a runic pattern SVG strip in amber (3–4px tall)
- Brand text: animated text-shadow that alternates between amber glow and purple glow on a slow cycle (4–6s)
- Links: default `--text-color-secondary`, hover glows purple (`--purple-accent`), active/current glows amber

### Cards — Stone Tablets

- Background: `--surface-0` with stone texture overlay
- Border-radius: 6px (slightly weathered feel)
- Top accent: 3px solid using a gradient from `--purple-accent` to `--primary-color` (left to right)
- Box-shadow: `0 2px 12px rgba(0, 0, 0, 0.6)` (deep dungeon shadow)
- Hover: dual-glow emanating from edges — amber inner shadow + purple outer shadow. Card lifts 3px.

```css
/* Hover state */
box-shadow:
  0 0 12px rgba(232, 160, 66, 0.3),
  0 0 24px rgba(139, 92, 246, 0.15),
  0 6px 20px rgba(0, 0, 0, 0.5);
transform: translateY(-3px);
```

### Tags — Rune Chips

- Border: 1px solid `--purple-accent`
- Text: `--purple-accent`
- Background: transparent
- Hover: faint purple fill `rgba(139, 92, 246, 0.1)`, border brightens to `--purple-light`

### Buttons

**Default (secondary)**:
- Border: 2px solid `--purple-accent`
- Text: `--purple-accent`
- Hover: purple glow shadow, faint purple fill

**Primary**:
- Background: `--primary-color` (amber)
- Text: `#0a0812` (dark)
- Border: `--primary-color`
- Hover: background brightens to `--primary-light`, purple halo glow around the button

```css
/* Primary hover */
box-shadow:
  0 0 16px rgba(232, 160, 66, 0.5),
  0 0 32px rgba(139, 92, 246, 0.2);
```

**Click ripple**: A brief radial burst animation (200ms) from click point, using purple gradient. CSS-only via `:active` pseudo-class with a radial-gradient background transition.

### Forms — Carved Stone

- Input background: `--surface-50` (darker than card surface — carved into stone)
- Border: 1px solid `--surface-200`
- Inset shadow: `inset 0 2px 4px rgba(0, 0, 0, 0.3)` (depth effect)
- Focus: border changes to `--purple-accent`, inner glow `0 0 8px rgba(139, 92, 246, 0.3)`, plus amber outer ring `0 0 4px rgba(232, 160, 66, 0.2)`
- Labels: slightly tracked (`letter-spacing: 0.05em`), `font-variant: small-caps`, color `--text-color`

### Skeleton Loading

- Base: `--surface-50`
- Shimmer animation: gradient sweep using purple and amber tones instead of the default grey. Creates a "magical energy gathering" effect.

### Paginator

- Styled to match stone tablet theme
- Active page: amber background with dark text
- Hover: purple glow
- Inactive: stone surface colors

## Animations

### `arcane-glow` — Interactive hover glow

```css
@keyframes arcane-glow {
  0%   { box-shadow: 0 0 8px rgba(232, 160, 66, 0.3), 0 0 16px rgba(139, 92, 246, 0.1); }
  50%  { box-shadow: 0 0 16px rgba(232, 160, 66, 0.5), 0 0 24px rgba(139, 92, 246, 0.2); }
  100% { box-shadow: 0 0 8px rgba(232, 160, 66, 0.3), 0 0 16px rgba(139, 92, 246, 0.1); }
}
```

### `brand-flicker` — Navbar brand text

```css
@keyframes brand-flicker {
  0%   { text-shadow: 0 0 8px rgba(232, 160, 66, 0.6), 0 0 20px rgba(232, 160, 66, 0.2); }
  50%  { text-shadow: 0 0 12px rgba(139, 92, 246, 0.5), 0 0 24px rgba(139, 92, 246, 0.15); }
  100% { text-shadow: 0 0 8px rgba(232, 160, 66, 0.6), 0 0 20px rgba(232, 160, 66, 0.2); }
}
```

### `ember-rise` — Particle float upward

Moves particles from bottom to top with horizontal wobble using `translateY` and `translateX` with sine-like easing.

### `spark-drift` — Purple spark float

Similar to `ember-rise` but with different timing, smaller range, and slight rotation.

### `shimmer-arcane` — Skeleton loading

Gradient sweep from left to right using `rgba(139, 92, 246, 0.08)` and `rgba(232, 160, 66, 0.06)`.

### Reduced Motion

All animations disabled. Hover states use static shadows only.

## New SVG Assets Needed

| File | Description |
|------|-------------|
| `src/assets/textures/stone-blocks.svg` | Repeating stone wall block pattern, abstract lines |
| `src/assets/textures/runic-border.svg` | Thin horizontal strip of angular runic shapes |

Existing assets to keep:
- `src/assets/textures/metal-grain.svg` (used for navbar accent)
- `src/assets/textures/paper-texture.svg` (available but likely unused)

## File Changes

### Modified files

| File | Change |
|------|--------|
| `src/styles/forge-theme.css` | Replace all CSS variables with new Arcane Forge palette |
| `src/styles/forge-textures.css` | Add stone texture classes, keep metal as option |
| `src/styles/forge-components.css` | Restyle all components (cards, buttons, forms, tags, links, brand) with dual amber+purple system |
| `src/styles/forge-animations.css` | Replace animations with arcane-glow, brand-flicker, ember-rise, spark-drift, shimmer-arcane |
| `src/App.vue` | Add particle pseudo-element markup/classes |
| `src/components/AppNavbar.vue` | Apply stone lintel styling, runic border, brand-flicker |
| `src/features/recipes/components/RecipeCard.vue` | Update tag styling to rune chips |
| `src/features/recipes/views/HomeView.vue` | Update card wrapper classes for stone tablet |
| `src/features/recipes/views/BrowseView.vue` | Update grid card classes for stone tablet |

### New files

| File | Purpose |
|------|---------|
| `src/assets/textures/stone-blocks.svg` | Stone wall repeating pattern |
| `src/assets/textures/runic-border.svg` | Runic accent border strip |

## Accessibility

- All text maintains WCAG 2.1 AA contrast (4.5:1 minimum) against their backgrounds
- `--text-color` (#c8c4d4) on `--surface-0` (#1a1722) = ~8.5:1 contrast
- `--primary-color` (#e8a042) on `--surface-ground` (#0a0812) = ~7.2:1 contrast
- `--purple-accent` (#8b5cf6) on `--surface-0` (#1a1722) = ~4.8:1 contrast
- All particle animations and glows respect `prefers-reduced-motion: reduce`
- Focus indicators use visible glow rings (purple + amber) meeting 3:1 contrast against adjacent colors
