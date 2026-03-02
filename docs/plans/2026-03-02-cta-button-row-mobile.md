# CTA Button Row Mobile Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make CtaButtonRow display icon-only compact square buttons on mobile (< 640px) with labels hidden visually but accessible to screen readers.

**Architecture:** Single-file change to `CtaButtonRow.vue`. Add `aria-label` to each button, wrap label text in a `cta-row__label` span, then use responsive Tailwind classes (`hidden sm:inline`) to hide labels on mobile. The button itself becomes a compact square at small breakpoints via scoped CSS.

**Tech Stack:** Vue 3 `<script setup>`, PrimeVue tokens, Tailwind v4, Vitest + Vue Test Utils

---

### Task 1: Write failing tests for CtaButtonRow

**Files:**
- Create: `src/features/recipes/components/CtaButtonRow.spec.js`

**Step 1: Create the spec file**

```js
import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import CtaButtonRow from '@/features/recipes/components/CtaButtonRow.vue'

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

describe('CtaButtonRow', () => {
  const createWrapper = () => shallowMount(CtaButtonRow)

  it('renders 5 buttons', () => {
    const wrapper = createWrapper()
    expect(wrapper.findAll('button')).toHaveLength(5)
  })

  it('each meal button has an aria-label', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    // First 4 are meal buttons
    const mealButtons = buttons.slice(0, 4)
    mealButtons.forEach(btn => {
      expect(btn.attributes('aria-label')).toBeTruthy()
    })
  })

  it('reforge button has an aria-label', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    const reforgeBtn = buttons[buttons.length - 1]
    expect(reforgeBtn.attributes('aria-label')).toBe('Reforge recipe')
  })

  it('each button has a cta-row__label span', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    buttons.forEach(btn => {
      expect(btn.find('.cta-row__label').exists()).toBe(true)
    })
  })
})
```

**Step 2: Run the tests to confirm they fail**

```bash
npx vitest run src/features/recipes/components/CtaButtonRow.spec.js
```

Expected: FAIL — "renders 5 buttons" may pass but aria-label and `.cta-row__label` tests will fail since those don't exist yet.

---

### Task 2: Update CtaButtonRow.vue — script and template

**Files:**
- Modify: `src/features/recipes/components/CtaButtonRow.vue`

**Step 1: Update `MEAL_BUTTONS` to include `ariaLabel`**

In `<script setup>`, change the array to:

```js
const MEAL_BUTTONS = [
  { label: "Breakfast", icon: "🌅", tags: ["breakfast"], ariaLabel: "Browse Breakfast" },
  { label: "Lunch", icon: "☀️", tags: ["lunch"], ariaLabel: "Browse Lunch" },
  { label: "Dinner", icon: "🌙", tags: ["dinner"], ariaLabel: "Browse Dinner" },
  {
    label: "Special",
    icon: "✨",
    tags: ["vegan", "dairy-free", "vegetarian", "seafood"],
    ariaLabel: "Browse Special recipes",
  },
]
```

**Step 2: Update the template**

Replace the existing `<template>` with:

```html
<template>
  <nav class="cta-row" aria-label="Browse by meal type">
    <div class="flex gap-4">
      <button
        v-for="btn in MEAL_BUTTONS"
        :key="btn.label"
        class="cta-row__btn"
        :aria-label="btn.ariaLabel"
        @click="browse(btn.tags)"
      >
        <span class="cta-row__icon" aria-hidden="true">{{ btn.icon }}</span>
        <span class="cta-row__label">{{ btn.label }}</span>
      </button>
    </div>
    <div class="justify-end">
      <button
        class="cta-row__btn cta-row__btn--reforge"
        aria-label="Reforge recipe"
        @click="emit('reforge')"
      >
        <span class="cta-row__icon" aria-hidden="true">🔥</span>
        <span class="cta-row__label">Reforge</span>
      </button>
    </div>
  </nav>
</template>
```

**Step 3: Run the tests — they should now pass**

```bash
npx vitest run src/features/recipes/components/CtaButtonRow.spec.js
```

Expected: PASS all 4 tests.

---

### Task 3: Update scoped styles for mobile

**Files:**
- Modify: `src/features/recipes/components/CtaButtonRow.vue` (style block only)

**Step 1: Update the `<style scoped>` block**

Replace the full `<style scoped>` block with:

```css
<style scoped>
@reference "../../../assets/main.css";

.cta-row {
  @apply flex flex-wrap justify-between gap-3 pb-6;
}

.cta-row__btn {
  @apply inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold cursor-pointer transition-all;
  /* Mobile: compact square touch target */
  @apply w-11 h-11 p-0;
  background-color: var(--surface-100);
  color: var(--text-color);
  border: 1px solid var(--surface-200);
}

@media (min-width: 640px) {
  .cta-row__btn {
    @apply w-auto h-auto px-5 py-2.5;
  }
}

.cta-row__btn:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 10px rgba(232, 160, 66, 0.25);
  color: var(--primary-color);
}

.cta-row__btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.cta-row__btn--reforge {
  border-color: rgba(232, 160, 66, 0.4);
  color: var(--primary-color);
}

.cta-row__btn--reforge:hover {
  background-color: rgba(232, 160, 66, 0.1);
  box-shadow: 0 0 14px rgba(232, 160, 66, 0.35);
}

.cta-row__icon {
  font-size: 1.125rem;
  line-height: 1;
}

.cta-row__label {
  @apply hidden sm:inline;
}
</style>
```

**Step 2: Verify the dev server renders correctly**

```bash
npm run dev
```

Open `http://localhost:3000` and:
- At viewport width < 640px (Chrome DevTools mobile emulation): confirm 5 compact square buttons in a single row, only emoji visible
- At viewport width ≥ 640px: confirm full pill buttons with emoji + label

**Step 3: Run all tests one final time**

```bash
npx vitest run src/features/recipes/components/CtaButtonRow.spec.js
```

Expected: PASS all 4 tests.

**Step 4: Commit**

```bash
git add src/features/recipes/components/CtaButtonRow.vue src/features/recipes/components/CtaButtonRow.spec.js
git commit -m "✨ feat: icon-only CTA buttons on mobile with accessible labels"
```
