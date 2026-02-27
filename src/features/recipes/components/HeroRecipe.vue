<script setup>
import { ref, computed } from "vue";
import Skeleton from "primevue/skeleton";
import { useRecipeIngredients } from "@/features/recipes/composables/useRecipeIngredients";

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["load-another", "view-recipe"]);

// Tab state: 'ingredients' | 'directions'
const activeTab = ref("ingredients");

const { ingredients: subcollectionIngredients, loading: ingredientsLoading } =
  useRecipeIngredients(() => props.recipe?.id);

// Resolved ingredient lines: subcollection preferred, fallback to recipe.ingredients array
const ingredientLines = computed(() => {
  if (subcollectionIngredients.value.length > 0) {
    return subcollectionIngredients.value.map(({ quantity, unit, item }) =>
      [quantity, unit, item].filter(Boolean).join(" "),
    );
  }
  if (
    Array.isArray(props.recipe.ingredients) &&
    props.recipe.ingredients.length > 0
  ) {
    return props.recipe.ingredients;
  }
  return null; // null means "no ingredients"
});

const directionLines = computed(() => {
  if (
    Array.isArray(props.recipe.directions) &&
    props.recipe.directions.length > 0
  ) {
    return props.recipe.directions;
  }
  return null; // null means "no directions"
});

const displayTags = computed(() => {
  const tags = props.recipe.tags ?? [];
  return tags.slice(0, 5);
});
</script>

<template>
  <article
    class="hero forge__card forge__runic-border forge__entrance"
    :aria-label="recipe.name"
  >
    <!-- Left panel: identity -->
    <div class="hero__identity">
      <h2 class="hero__title">{{ recipe.name ?? "Untitled Recipe" }}</h2>

      <p class="hero__description">
        {{ recipe.description?.trim() || "No description provided." }}
      </p>

      <div v-if="displayTags.length" class="hero__tags" aria-label="Tags">
        <button
          v-for="(tag, i) in displayTags"
          :key="`${tag}-${i}`"
          class="forge__tag"
        >
          {{ tag }}
        </button>
      </div>

      <div class="hero__actions">
        <button class="forge__button" @click="emit('load-another')">
          Load another
        </button>
        <button
          class="forge__button forge__button-primary"
          @click="emit('view-recipe', recipe.id)"
        >
          View full recipe →
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="hero__divider" aria-hidden="true"></div>

    <!-- Right panel: tabbed content -->
    <div class="hero__content">
      <!-- Tab bar -->
      <div class="hero__tabs" role="tablist" aria-label="Recipe details">
        <button
          role="tab"
          :aria-selected="activeTab === 'ingredients'"
          :class="[
            'hero__tab',
            { 'hero__tab--active': activeTab === 'ingredients' },
          ]"
          @click="activeTab = 'ingredients'"
        >
          Ingredients
        </button>
        <button
          role="tab"
          :aria-selected="activeTab === 'directions'"
          :class="[
            'hero__tab',
            { 'hero__tab--active': activeTab === 'directions' },
          ]"
          @click="activeTab = 'directions'"
        >
          Directions
        </button>
      </div>

      <!-- Tab panels -->
      <div class="hero__panel" role="tabpanel">
        <!-- Ingredients tab -->
        <template v-if="activeTab === 'ingredients'">
          <template v-if="ingredientsLoading">
            <Skeleton
              v-for="n in 5"
              :key="n"
              class="hero__skeleton-row"
              height="1.25rem"
            />
          </template>
          <ul v-else-if="ingredientLines" class="hero__list">
            <li
              v-for="(line, i) in ingredientLines"
              :key="i"
              class="hero__list-item"
            >
              {{ line }}
            </li>
          </ul>
          <p v-else class="hero__empty">No ingredients listed.</p>
        </template>

        <!-- Directions tab -->
        <template v-if="activeTab === 'directions'">
          <ol v-if="directionLines" class="hero__list hero__list--ordered">
            <li
              v-for="(step, i) in directionLines"
              :key="i"
              class="hero__list-item"
            >
              {{ step }}
            </li>
          </ol>
          <p v-else class="hero__empty">No directions listed.</p>
        </template>
      </div>
    </div>
  </article>
</template>

<style scoped>
@reference "../../../assets/main.css";

/* Layout */
.hero {
  @apply w-full flex flex-col;
  padding: 0;
  overflow: hidden;
}

@media (min-width: 768px) {
  .hero {
    @apply flex-row;
    min-height: 360px;
  }
}

/* Left: identity panel */
.hero__identity {
  @apply flex flex-col gap-4 p-6;
  flex: 0 0 40%;
}

/* Title */
.hero__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
  text-shadow:
    0 0 16px rgba(232, 160, 66, 0.5),
    0 0 32px rgba(232, 160, 66, 0.2);
  margin: 0;
}

/* Description */
.hero__description {
  color: var(--text-color-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Tags */
.hero__tags {
  @apply flex flex-wrap gap-2;
}

/* CTAs */
.hero__actions {
  @apply flex flex-col gap-3 mt-auto pt-4;
}

@media (min-width: 480px) {
  .hero__actions {
    @apply flex-row;
  }
}

/* Divider */
.hero__divider {
  width: 1px;
  background-color: var(--surface-200);
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.2);
  flex-shrink: 0;
  display: none;
}

@media (min-width: 768px) {
  .hero__divider {
    display: block;
  }
}

/* Right: content panel */
.hero__content {
  @apply flex flex-col;
  flex: 1;
  min-width: 0;
}

/* Tab bar */
.hero__tabs {
  @apply flex;
  border-bottom: 1px solid var(--surface-200);
  padding: 0 1.5rem;
  flex-shrink: 0;
}

.hero__tab {
  background: transparent;
  border: none;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.875rem 1rem;
  cursor: pointer;
  position: relative;
  transition: color 150ms ease;
  letter-spacing: 0.04em;
  font-variant: small-caps;
}

.hero__tab::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--purple-accent),
    var(--primary-color)
  );
  opacity: 0;
  transition: opacity 150ms ease;
}

.hero__tab--active {
  color: var(--text-color);
}

.hero__tab--active::after {
  opacity: 1;
}

.hero__tab:hover:not(.hero__tab--active) {
  color: var(--text-color);
}

.hero__tab:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: -2px;
}

/* Tab panel */
.hero__panel {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  max-height: 280px;
  box-shadow: inset 0 8px 12px rgba(0, 0, 0, 0.2);
}

/* List */
.hero__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hero__list--ordered {
  list-style: none;
  counter-reset: direction-counter;
}

.hero__list-item {
  color: var(--text-color);
  font-size: 0.9375rem;
  line-height: 1.5;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-100);
}

.hero__list-item:last-child {
  border-bottom: none;
}

.hero__list--ordered .hero__list-item {
  counter-increment: direction-counter;
  padding-left: 2rem;
  position: relative;
}

.hero__list--ordered .hero__list-item::before {
  content: counter(direction-counter) ".";
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.8125rem;
}

/* Empty state */
.hero__empty {
  color: var(--text-color-secondary);
  font-style: italic;
  font-size: 0.9375rem;
  margin: 0;
  padding: 1rem 0;
}

/* Skeleton rows */
.hero__skeleton-row {
  @apply mb-3;
  display: block;
}
</style>
