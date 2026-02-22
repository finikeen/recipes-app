# Forge Theme Design

**Date:** 2026-02-22
**Status:** Approved
**Scope:** Dark forge-inspired theme with amber accents, worn textures, industrial aesthetic

## Vision

Create a dark, industrial forge aesthetic for Recipe Forge that evokes rough metal, worn materials, and glowing fire. The theme should feel grounded and authentic while maintaining accessibility and usability.

## Color Palette

### Base Colors
- **Background:** `#1a1a1a` (medium dark charcoal)
- **Surface 0 (cards):** `#242424` (slightly lighter)
- **Text:** `#e0e0e0` (light gray, accessible contrast)
- **Text Muted:** `#888888` (secondary text)
- **Primary Accent (Amber):** `#d4a574` (warm, glowing amber)
- **Accent Hover/Glow:** `#e8b88f` (lighter amber for glow effects)
- **Border/Divider:** `#333333` (subtle dark)

### Strategy
Override PrimeVue CSS variables (`--primary-color`, `--surface-0`, `--text-color`, etc.) with forge colors. Amber becomes the primary interaction color throughout the interface.

## Textures & Distressed Patterns

### Cards & Buttons (Heavy Texture)
- Rough paper/metal texture overlay via SVG noise filter or CSS background
- Slightly distressed edges using CSS `box-shadow` with irregular shapes
- Worn corner effect: darker shading at card corners suggesting age
- Amber accent border stroke (1-2px) with subtle irregularity

### Backgrounds (Subtle Texture)
- Very light grain overlay (5-10% opacity) — barely visible but adds depth
- No distressing on main background (keep clean for accessibility)

### Implementation
- Reusable CSS classes: `.forge__card`, `.forge__button`, `.forge__accent-border`
- CSS filters (`grayscale`, `contrast`) on texture overlays for blending
- Texture overlays as pseudo-elements (::before/::after) to avoid extra DOM

## Interactive States & Glow Effects

### Hover States
- Amber glow on buttons/links: `box-shadow: 0 0 12px rgba(212, 165, 116, 0.6)`
- Text links: amber color with underline
- Cards: subtle lift (1-2px) + slight glow on border

### Focus States (Accessibility Critical)
- Amber ring: `outline: 2px solid #d4a574` with `outline-offset: 2px`
- Visible against dark background, keyboard accessible
- Meets WCAG 2.1 Level AA contrast requirements

### Active/Selected States
- Amber background tint (5-10% opacity) on selected items
- Stronger glow: `box-shadow: 0 0 20px rgba(212, 165, 116, 0.8)`

### Fire Breathing Animation
- Subtle pulsing glow on interactive elements (2s cycle, infinite)
- Keyframe: glow intensity 0% → 100% → 0%
- Respects `prefers-reduced-motion` for accessibility
- Effect: "coals warming up" feeling, not jarring

## Component Styling

### Recipe Cards
- Dark surface with amber accent border (left or top)
- Distressed texture overlay on card face
- Image with vignette (darker edges) for depth
- Title/description in light gray
- Tags: small badges with amber borders, dark fill
- Hover: glow + lift + intensified vignette

### Buttons
- Primary: amber border, transparent background, amber text
- Hover: amber glow, dark amber background tint (5% opacity)
- Disabled: desaturated amber, no glow
- Small distressed texture on surface
- Bold typography, larger line-height

### Forms & Inputs
- Input background: `#2a2a2a` (slightly lighter than base)
- Input borders: subtle dark with amber on focus
- Labels: light gray, bold
- Error states: warm red/orange (forge-appropriate, not bright red)
- Textareas: distressed border, same texture as cards

### Navigation
- Navbar background: `#1a1a1a` (blend with page)
- Brand "Recipe Forge": amber text with subtle glow
- Links: light gray, amber underline on hover
- Active route: amber accent

### Views
- Featured recipe (HomeView): larger card, prominent glow, heavier texture
- Grid cards (BrowseView): consistent texture, responsive
- Paginator: amber text/borders

## File Structure

### New Files
```
src/styles/
  forge-theme.css          # CSS variables override (colors)
  forge-textures.css       # Texture overlays, noise patterns
  forge-components.css     # Component-specific styling
  forge-animations.css     # Glow effects, pulsing keyframes

src/assets/textures/
  metal-grain.svg          # Reusable SVG noise pattern
  paper-texture.svg        # Alternative texture
```

### Modified Files
- `src/assets/main.css` - Import forge files in order:
  1. forge-theme.css (variables)
  2. forge-textures.css
  3. forge-components.css
  4. forge-animations.css

### Import Order (Critical)
Order ensures CSS variables are available to all downstream files, textures are applied before components use them, and animations load last.

## Implementation Strategy

1. **Create CSS files** with forge variables and base styling
2. **Add texture SVG patterns** for metal/paper grain
3. **Build component classes** (cards, buttons, forms)
4. **Add animations** (glow, pulse effects)
5. **Test accessibility** (focus states, contrast, motion)
6. **Light mode prep** (structure supports future light theme)

## Accessibility Considerations

- **Color Contrast:** All text meets WCAG 2.1 Level AA (4.5:1 minimum)
- **Focus Indicators:** Amber rings clearly visible against dark background
- **Motion:** Glow animations respect `prefers-reduced-motion`
- **Textures:** Subtle overlays don't interfere with text readability
- **Form States:** Error/warning colors distinct from success (warm vs. cool)

## Future: Light Mode

File structure allows easy light mode by creating parallel variables:
- Create `light-theme.css` with light palette
- Toggle via `.dark` class on ancestor element
- Same component classes work for both themes

## Success Criteria

- ✅ Dark theme fully implemented with forge aesthetic
- ✅ Amber accents provide clear interactive feedback
- ✅ Textures visible on cards/buttons, subtle on backgrounds
- ✅ Glow effects on hover/focus without being distracting
- ✅ All interactive elements keyboard accessible
- ✅ WCAG 2.1 Level AA contrast compliance
- ✅ No accessibility regressions from existing RecipeCard tests
