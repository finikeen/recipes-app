# Plan: Mobile Navigation Menu

## Context

The `AppNavbar.vue` has two TODOs to implement a mobile-responsive navigation menu. Currently, nav links wrap below 479px but remain visible. The goal is to extract nav links into a reusable component and add a hamburger menu that slides in from the right on mobile screens.

---

## Files to Create

### `src/components/NavLinks.vue`
A reusable component containing the three navigation links (Browse, New Recipe, Sign In/Out). Used by both the desktop navbar and the mobile slide-out panel.

- Uses `useAuthStore` directly (same as AppNavbar)
- Uses `useRouter` for `handleLogout`
- Emits a `link-clicked` event on every navigation/logout action (so the mobile menu can close)
- Styled with BEM: `nav-links__item`, `nav-links__item--button`
- Accepts an optional `orientation` prop (`'horizontal'` | `'vertical'`) to support desktop (horizontal, small gap) vs mobile panel (vertical, larger, full-width) layouts

### `src/__tests__/components/NavLinks.spec.js`
Tests using shallowMount + createTestingPinia + router mock. Covers:
- Renders "Browse" and "New Recipe" links
- Shows "Sign In" when not authenticated
- Shows "Sign Out" when authenticated
- Emits `link-clicked` when a link is clicked
- Emits `link-clicked` on logout

### `src/__tests__/components/AppNavbar.spec.js`
Tests using shallowMount + createTestingPinia + router mock. Covers:
- Hamburger button is in the DOM
- Clicking hamburger opens mobile menu (adds open class or shows panel)
- Clicking hamburger again closes the menu
- Menu closes on route change (watch)
- Menu closes on Escape key press

---

## Files to Modify

### `src/components/AppNavbar.vue`

**Script changes:**
- Import `NavLinks` component
- Import `useRoute` from `vue-router` (for watching route changes)
- Add `menuOpen` ref (`ref(false)`)
- Add `toggleMenu()` method
- Add `watch(route, () => { menuOpen.value = false })` to close on navigation
- Add `onMounted`/`onUnmounted` to listen for `keydown` Escape to close menu

**Template changes:**
- Replace the existing `.navbar__links` content with `<NavLinks @link-clicked="menuOpen = false" />`
- Add a hamburger `<button>` to the right of `.navbar__inner` (visible on mobile, hidden at md+)
- Add a `.navbar__mobile-menu` panel that renders `<NavLinks orientation="vertical" @link-clicked="menuOpen = false" />`. Controlled with `v-show` + CSS slide-in
- Add an overlay/backdrop `<div>` behind the panel to capture outside clicks

**Style changes:**
- Remove existing `@media (max-width: 479px)` navbar overrides (no longer needed)
- Add `.navbar__hamburger` — visible below `md` (768px), hidden at md+
  - Forge-branded animated icon: three horizontal lines that transform to an X using CSS transitions on pseudo-elements. Uses `--primary-color` amber lines on `--surface-200` background
- Add `.navbar__mobile-menu` — fixed position panel, slides in from right (`transform: translateX(100%)` → `translateX(0)`), `transition: transform 250ms ease`, background `--surface-0`, border-left `--surface-border`
- Add `.navbar__overlay` — full-screen transparent backdrop behind the menu for outside-click dismissal
- Desktop (`min-width: 768px`): `.navbar__hamburger { display: none }`, `.navbar__links { display: flex }`
- Mobile (`max-width: 767px`): `.navbar__links { display: none }`, `.navbar__hamburger { display: flex }`

---

## Hamburger Icon Design (Forge Aesthetic)

CSS-only animated icon — no PrimeIcon. Three bars made with `::before`, `::after`, and an inner `<span>` on the button:
- Color: `var(--primary-color)` (amber)
- On `menuOpen = true`: top and bottom bars rotate ±45° to form an X; middle bar fades out
- `transition: transform 250ms ease, opacity 150ms ease`
- Focus style: `outline: 2px solid var(--purple-accent); outline-offset: 4px;` (matches existing)

---

## Key Patterns to Follow

- `@reference "../assets/main.css";` at top of `AppNavbar.vue` scoped styles
- BEM: `navbar__hamburger`, `navbar__hamburger--open`, `navbar__mobile-menu`, `navbar__mobile-menu--open`, `navbar__overlay`
- No TypeScript, no semicolons
- PrimeVue tokens (`text-color`, `text-muted-color`) via `@apply`

---

## Verification

1. Run `npm run dev` and resize browser below 768px — hamburger button appears, desktop links hide
2. Click hamburger — panel slides in from right with animated icon transform
3. Click a nav link — panel closes, route changes
4. Press Escape — panel closes
5. Click outside panel (on overlay) — panel closes
6. Resize above 768px — panel hides, desktop links reappear
7. Run `npm run test` — all new and existing tests pass
