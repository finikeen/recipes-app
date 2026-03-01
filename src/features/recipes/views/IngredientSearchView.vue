<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useRecipesStore } from "@/features/recipes/store";
import { recipeService } from "@/features/recipes/services/recipeService";
import { useIngredientSearch } from "@/features/recipes/composables/useIngredientSearch";
import { TOP_TAG_COUNT } from "@/features/recipes/composables/useRecipeSearch";
import RecipeCard from "@/features/recipes/components/RecipeCard.vue";
import TagFilterModal from "@/features/recipes/components/TagFilterModal.vue";

const recipesStore = useRecipesStore();
const router = useRouter();

const ingredientsLoading = ref(false);
const tagModalOpen = ref(false);

const {
  selectedIngredients,
  hasBrewed,
  matchThreshold,
  activeTagFilters,
  ingredientQuery,
  filteredSuggestions,
  availableTags,
  topTags,
  filteredRecipes,
  addIngredient,
  removeIngredient,
  brew,
  toggleTag,
  clearTagFilters,
  clearAll,
} = useIngredientSearch(() => recipesStore.recipes);

const hasFilters = () =>
  selectedIngredients.value.length > 0 || activeTagFilters.value.size > 0;

onMounted(async () => {
  await recipesStore.loadAllRecipes();
  ingredientsLoading.value = true;
  try {
    await recipeService.populateIngredientNames(recipesStore.recipes);
  } finally {
    ingredientsLoading.value = false;
  }
});

const handleRecipeClick = (id) => {
  router.push({ name: "recipe-detail", params: { id } });
};

const handleTagClick = (tagName) => {
  toggleTag(tagName);
};

const handleAutocompleteComplete = (event) => {
  ingredientQuery.value = event.query;
};

const handleIngredientSelect = (event) => {
  addIngredient(event.value);
};

const handleAutocompleteKeydown = (event) => {
  if (event.key === "Enter") {
    const value = ingredientQuery.value.trim();
    if (value) {
      event.preventDefault();
      addIngredient(value);
    }
  }
};
</script>

<template>
  <div class="ingredient-search forge__texture-subtle">
    <h1 class="ingredient-search__heading">Search by Ingredient</h1>

    <div class="ingredient-search__controls">
      <!-- Column 1: Ingredients + Brew -->
      <div class="ingredient-search__col-ingredients">
        <!-- Ingredient input -->
        <div class="ingredient-search__input-row">
          <AutoComplete
            v-model="ingredientQuery"
            :suggestions="filteredSuggestions"
            placeholder="Type an ingredient and press Enter…"
            class="ingredient-search__autocomplete"
            input-id="ingredient-input"
            :force-selection="false"
            @complete="handleAutocompleteComplete"
            @item-select="handleIngredientSelect"
            @keydown="handleAutocompleteKeydown"
            aria-label="Search for an ingredient to add"
          />
        </div>

        <!-- Selected ingredient chips -->
        <div
          v-if="selectedIngredients.length > 0"
          class="ingredient-search__chips"
          aria-label="Selected ingredients"
        >
          <button
            v-for="ingredient in selectedIngredients"
            :key="ingredient"
            class="ingredient-search__chip"
            :aria-label="`Remove ${ingredient}`"
            @click="removeIngredient(ingredient)"
          >
            {{ ingredient }} ✕
          </button>
        </div>

        <!-- Match threshold slider (only show when 2+ ingredients selected) -->
        <div
          v-if="selectedIngredients.length >= 2"
          class="ingredient-search__slider-row"
        >
          <label for="match-slider" class="ingredient-search__slider-label">
            Match at least <strong>{{ matchThreshold }}</strong> of
            {{ selectedIngredients.length }} ingredients
          </label>
          <Slider
            id="match-slider"
            v-model="matchThreshold"
            :min="1"
            :max="selectedIngredients.length"
            class="ingredient-search__slider"
            aria-label="Minimum ingredient match count"
          />
        </div>

        <!-- Brew button -->
        <div
          v-if="selectedIngredients.length > 0"
          class="ingredient-search__brew-row"
        >
          <button class="ingredient-search__brew-btn" @click="brew">
            Brew
          </button>
        </div>
      </div>

      <!-- Column 2: Keywords -->
      <div class="ingredient-search__col-tags">
        <!-- Active keyword pills -->
        <div
          v-if="activeTagFilters.size > 0"
          class="ingredient-search__active-tags"
        >
          <button
            v-for="tag in [...activeTagFilters]"
            :key="tag"
            class="ingredient-search__tag-pill"
            :aria-label="`Remove keyword ${tag}`"
            @click="toggleTag(tag)"
          >
            {{ tag }} ✕
          </button>
        </div>

        <!-- Top keywords row -->
        <div
          v-if="availableTags.length > 0"
          class="ingredient-search__top-tags"
        >
          <button
            v-for="tag in topTags"
            :key="tag"
            class="ingredient-search__tag-chip"
            :class="{
              'ingredient-search__tag-chip--active': activeTagFilters.has(tag),
            }"
            :aria-pressed="activeTagFilters.has(tag)"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
          <button
            v-if="availableTags.length > TOP_TAG_COUNT"
            class="ingredient-search__more-tags-btn"
            @click="tagModalOpen = true"
          >
            + {{ availableTags.length - topTags.length }} more…
          </button>
        </div>
      </div>
    </div>

    <TagFilterModal
      v-model:visible="tagModalOpen"
      :tags="availableTags"
      :active-tag-filters="activeTagFilters"
      @toggle-tag="toggleTag"
      @clear-all="clearTagFilters"
    />

    <!-- Clear all -->
    <div v-if="hasFilters()" class="ingredient-search__clear-row">
      <button class="ingredient-search__clear-btn" @click="clearAll">
        Clear all
      </button>
    </div>

    <!-- Divider: open book above / scroll below -->
    <div class="ingredient-search__divider" aria-hidden="true">
      <div class="ingredient-search__divider-book">
        <span class="ingredient-search__divider-line"></span>
        <svg
          class="ingredient-search__divider-icon"
          viewBox="0 0 48 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 8C20 6 10 5 2 7L2 28C10 26 20 27 24 29Z"
            stroke="currentColor"
            stroke-width="1.5"
            fill="rgba(232,160,66,0.1)"
            stroke-linejoin="round"
          />
          <path
            d="M24 8C28 6 38 5 46 7L46 28C38 26 28 27 24 29Z"
            stroke="currentColor"
            stroke-width="1.5"
            fill="rgba(232,160,66,0.1)"
            stroke-linejoin="round"
          />
          <line
            x1="24"
            y1="8"
            x2="24"
            y2="29"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <line
            x1="7"
            y1="13"
            x2="21"
            y2="12"
            stroke="currentColor"
            stroke-width="0.8"
            opacity="0.5"
          />
          <line
            x1="7"
            y1="17"
            x2="21"
            y2="16"
            stroke="currentColor"
            stroke-width="0.8"
            opacity="0.5"
          />
          <line
            x1="7"
            y1="21"
            x2="21"
            y2="20"
            stroke="currentColor"
            stroke-width="0.8"
            opacity="0.5"
          />
          <line
            x1="27"
            y1="12"
            x2="41"
            y2="13"
            stroke="currentColor"
            stroke-width="0.8"
            opacity="0.5"
          />
          <line
            x1="27"
            y1="16"
            x2="41"
            y2="17"
            stroke="currentColor"
            stroke-width="0.8"
            opacity="0.5"
          />
          <line
            x1="27"
            y1="20"
            x2="41"
            y2="21"
            stroke="currentColor"
            stroke-width="0.8"
            opacity="0.5"
          />
        </svg>
        <span class="ingredient-search__divider-line"></span>
      </div>
      <div class="ingredient-search__divider-scroll"></div>
    </div>

    <!-- Loading state -->
    <div
      v-if="recipesStore.loading || ingredientsLoading"
      class="ingredient-search__grid"
      aria-label="Loading recipes…"
      aria-busy="true"
    >
      <div v-for="i in 9" :key="i" class="ingredient-search__skeleton-card">
        <Skeleton
          class="ingredient-search__skeleton-img"
          :height="i % 3 === 0 ? '10rem' : i % 3 === 1 ? '12rem' : '14rem'"
        />
        <Skeleton
          class="ingredient-search__skeleton-title"
          :width="i % 3 === 0 ? '75%' : '80%'"
        />
        <Skeleton class="ingredient-search__skeleton-subtitle" width="55%" />
      </div>
    </div>

    <template v-else>
      <!-- No ingredients selected yet -->
      <div
        v-if="selectedIngredients.length === 0"
        class="ingredient-search__empty"
      >
        Add ingredients above to find matching recipes.
      </div>

      <!-- Ingredients selected but Brew not clicked yet -->
      <div v-else-if="!hasBrewed" class="ingredient-search__empty">
        Click <strong>Brew</strong> to search for recipes.
      </div>

      <!-- Brewed but no matches -->
      <div
        v-else-if="filteredRecipes.length === 0"
        class="ingredient-search__empty"
      >
        No recipes match your selection. Try reducing the match threshold or
        removing an ingredient.
      </div>

      <!-- Results -->
      <template v-else>
        <p class="ingredient-search__result-count" aria-live="polite">
          {{ filteredRecipes.length }}
          {{ filteredRecipes.length === 1 ? "recipe" : "recipes" }} found
        </p>
        <div class="ingredient-search__grid forge__entrance">
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            class="forge__card forge__texture-stone forge__runic-border"
          >
            <RecipeCard
              :recipe="recipe"
              @click="handleRecipeClick(recipe.id)"
              @tag-click="handleTagClick($event.tagName)"
            />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.ingredient-search {
  @apply w-full;
}

.ingredient-search__heading {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 1.5rem;
  text-shadow: 0 0 16px rgba(232, 160, 66, 0.4);
}

.ingredient-search__controls {
  @apply grid grid-cols-1 gap-6 mb-2 md:grid-cols-2;
}

.ingredient-search__col-ingredients {
  @apply flex flex-col;
}

.ingredient-search__col-tags {
  @apply flex flex-col;
}

.ingredient-search__input-row {
  @apply mb-3;
}

.ingredient-search__autocomplete {
  @apply w-full;
}

.ingredient-search__chips {
  @apply flex flex-wrap gap-2 mb-3;
}

.ingredient-search__chip {
  @apply inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full cursor-pointer transition-colors;
  background-color: rgba(232, 160, 66, 0.15);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.ingredient-search__chip:hover {
  background-color: rgba(232, 160, 66, 0.3);
}

.ingredient-search__slider-row {
  @apply mb-4;
}

.ingredient-search__slider-label {
  @apply block text-sm mb-3;
  color: var(--text-muted-color);
}

.ingredient-search__slider-label strong {
  color: var(--primary-color);
}

.ingredient-search__slider {
  @apply w-full;
}

.ingredient-search__brew-row {
  @apply mb-5;
}

.ingredient-search__brew-btn {
  @apply px-6 py-2 rounded font-semibold cursor-pointer transition-all;
  background-color: var(--primary-color);
  color: #0a0812;
  border: none;
  letter-spacing: 0.04em;
  box-shadow: 0 0 12px rgba(232, 160, 66, 0.4);
}

.ingredient-search__brew-btn:hover {
  background-color: var(--primary-400, #f0b84a);
  box-shadow: 0 0 20px rgba(232, 160, 66, 0.6);
}

.ingredient-search__brew-btn:active {
  transform: scale(0.97);
}

.ingredient-search__active-tags {
  @apply flex flex-wrap gap-2 mb-3;
}

.ingredient-search__tag-pill {
  @apply inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full cursor-pointer transition-colors;
  background-color: rgba(139, 92, 246, 0.15);
  color: var(--purple-accent);
  border: 1px solid var(--purple-accent);
}

.ingredient-search__tag-pill:hover {
  background-color: rgba(139, 92, 246, 0.3);
}

.ingredient-search__top-tags {
  @apply flex flex-wrap gap-2;
}

.ingredient-search__tag-chip {
  @apply inline-flex items-center px-2 py-1 text-xs rounded cursor-pointer transition-colors;
  background-color: transparent;
  color: var(--purple-accent);
  border: 1px solid var(--purple-accent);
}

.ingredient-search__tag-chip:hover {
  background-color: rgba(139, 92, 246, 0.1);
}

.ingredient-search__tag-chip--active {
  background-color: var(--purple-accent);
  color: #0a0812;
}

.ingredient-search__tag-chip--active:hover {
  background-color: var(--purple-light, #a78bfa);
  border-color: var(--purple-light, #a78bfa);
}

.ingredient-search__more-tags-btn {
  @apply inline-flex items-center px-2 py-1 text-xs rounded cursor-pointer transition-colors;
  background: none;
  border: none;
  color: var(--text-muted-color);
}

.ingredient-search__more-tags-btn:hover {
  color: var(--purple-accent);
}

.ingredient-search__clear-row {
  @apply mb-4;
}

.ingredient-search__clear-btn {
  @apply text-xs cursor-pointer;
  background: none;
  border: none;
  color: var(--text-muted-color);
  padding: 0;
  text-decoration: underline;
}

.ingredient-search__clear-btn:hover {
  color: var(--primary-color);
}

.ingredient-search__empty {
  @apply text-muted-color text-center py-12;
}

.ingredient-search__result-count {
  @apply text-sm mb-3;
  color: var(--text-muted-color);
}

.ingredient-search__grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.ingredient-search__skeleton-card {
  @apply border border-surface rounded p-4;
}

.ingredient-search__skeleton-img {
  @apply mb-3;
}

.ingredient-search__skeleton-title {
  @apply mb-2;
}

/* ── Divider ── */

.ingredient-search__divider {
  @apply my-6;
}

.ingredient-search__divider-book {
  @apply flex items-center gap-4 mb-4;
}

.ingredient-search__divider-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(139, 92, 246, 0.25),
    var(--primary-color)
  );
}

.ingredient-search__divider-line:last-child {
  background: linear-gradient(
    90deg,
    var(--primary-color),
    rgba(139, 92, 246, 0.25)
  );
}

@keyframes icon-pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 4px rgba(232, 160, 66, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 10px rgba(232, 160, 66, 0.75))
      drop-shadow(0 0 18px rgba(139, 92, 246, 0.35));
  }
}

.ingredient-search__divider-icon {
  width: 44px;
  height: 33px;
  flex-shrink: 0;
  color: var(--primary-color);
  animation: icon-pulse 2.8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .ingredient-search__divider-icon {
    animation: none;
    filter: drop-shadow(0 0 4px rgba(232, 160, 66, 0.4));
  }
}

.ingredient-search__divider-scroll {
  position: relative;
  height: 24px;
  width: 88%;
  margin: 0 auto;
  border-top: 2px solid var(--purple-accent);
  border-left: 2px solid var(--purple-accent);
  border-right: 2px solid var(--purple-accent);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  background: linear-gradient(
    180deg,
    rgba(139, 92, 246, 0.07) 0%,
    transparent 100%
  );
  box-shadow: 0 -4px 14px rgba(139, 92, 246, 0.1);
}

.ingredient-search__divider-scroll::before,
.ingredient-search__divider-scroll::after {
  content: "";
  position: absolute;
  top: -7px;
  width: 12px;
  height: 12px;
  border: 2px solid var(--purple-accent);
  border-radius: 50%;
  background: var(--surface-0);
}

.ingredient-search__divider-scroll::before {
  left: -7px;
}

.ingredient-search__divider-scroll::after {
  right: -7px;
}
</style>
