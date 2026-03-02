# Plan: Enriched Step Cards in Recipe Detail View

## Context

The enricher service now generates `enrichedSteps` — an array of step objects with timing, technique, and criticality metadata — stored alongside the plain `directions` array on recipe documents. This plan replaces the flat ordered-list rendering in the recipe detail view with richer step cards that surface this metadata. Recipes without `enrichedSteps` fall back to plain direction strings rendered in the same card format (but without a metadata footer).

## Critical File

- `src/features/recipes/views/RecipeDetailView.vue` — only file that changes

## Step 1: Replace `directionLines` computed with `stepData`

**Location:** lines 44–52 (script setup)

Replace the existing `directionLines` computed with:
```js
const stepData = computed(() => {
  if (
    Array.isArray(recipe.value?.enrichedSteps) &&
    recipe.value.enrichedSteps.length > 0
  ) {
    return recipe.value.enrichedSteps
  }
  if (
    Array.isArray(recipe.value?.directions) &&
    recipe.value.directions.length > 0
  ) {
    return recipe.value.directions.map((text, i) => ({ text, order: i }))
  }
  return null
})
```

## Step 2: Replace directions template

**Location:** lines 226–242 (template)

Replace the `<ol>` block with step cards:
```html
<!-- Directions -->
<section
  class="detail__col detail__col--directions"
  aria-label="Directions"
>
  <h2 class="detail__col-heading">Directions</h2>
  <ol v-if="stepData" class="detail__steps">
    <li
      v-for="step in stepData"
      :key="step.order"
      class="detail__step"
      :class="{ 'detail__step--critical': step.isCritical }"
    >
      <div class="detail__step__header">
        <span class="detail__step__number" aria-hidden="true">{{ step.order + 1 }}</span>
        <p class="detail__step__body">{{ step.text }}</p>
      </div>
      <div
        v-if="step.estimatedMinutes || step.techniqueType || step.isCritical"
        class="detail__step__meta"
        aria-label="Step details"
      >
        <span v-if="step.estimatedMinutes" class="detail__step__chip">
          <i class="pi pi-clock" aria-hidden="true"></i>
          ~{{ step.estimatedMinutes }} min
        </span>
        <span v-if="step.techniqueType" class="detail__step__chip">
          {{ step.techniqueType }}
        </span>
        <span v-if="step.isCritical" class="detail__step__chip detail__step__chip--key">
          <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
          Key step
        </span>
      </div>
    </li>
  </ol>
  <p v-else class="detail__empty">No directions listed.</p>
</section>
```

## Step 3: Replace/add CSS

**Location:** `<style scoped>` block

Remove old list styles:
- `.detail__list`, `.detail__list--ordered`, `.detail__list-item` blocks
- `.detail__list--ordered .detail__list-item` (padding + counter-increment)
- `.detail__list--ordered .detail__list-item::before` pseudo-element

Add new step card styles:
```css
/* Step cards */
.detail__steps {
  @apply list-none m-0 p-0 flex flex-col gap-3 mt-4;
}

.detail__step {
  @apply rounded-md p-3;
  background: var(--surface-100);
  border: 1px solid var(--surface-200);
  border-left: 3px solid transparent;
}

.detail__step--critical {
  border-left-color: var(--primary-color);
}

.detail__step__header {
  @apply flex gap-3 items-start;
}

.detail__step__number {
  @apply flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold;
  background: var(--primary-color);
  color: var(--primary-color-text);
}

.detail__step__body {
  @apply m-0 text-sm leading-relaxed;
  color: var(--text-color);
}

.detail__step__meta {
  @apply flex flex-wrap gap-2 mt-2 pl-9;
}

.detail__step__chip {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs;
  background: var(--surface-200);
  color: var(--text-color-secondary);
}

.detail__step__chip--key {
  background: color-mix(in srgb, var(--primary-color) 15%, transparent);
  color: var(--primary-color);
}
```

## Verification

1. `npm run dev` — open an enriched recipe, confirm step cards render with time, technique, and "Key step" badge
2. Open a recipe without `enrichedSteps` — confirm it renders in card format with step text only (no meta footer)
3. Check a critical step — confirm amber left border AND "Key step" chip are both present
4. Confirm no regressions in responsive layout (mobile + desktop)
5. `npm run build` — confirm no build errors
