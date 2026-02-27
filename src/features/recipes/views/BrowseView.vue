<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Skeleton from "primevue/skeleton";
import Paginator from "primevue/paginator";
import InputText from "primevue/inputtext";
import { useRecipesStore } from "@/features/recipes/store";
import RecipeCard from "@/features/recipes/components/RecipeCard.vue";
import { useRecipeSearch } from "@/features/recipes/composables/useRecipeSearch";
import { usePagination } from "@/features/recipes/composables/usePagination";

const recipesStore = useRecipesStore();
const router = useRouter();

const filtersOpen = ref(false);

const {
  searchQuery,
  activeTagFilters,
  availableTags,
  filteredRecipes,
  toggleTag,
} = useRecipeSearch(() => recipesStore.recipes);

const { currentPage, paginatedItems: paginatedRecipes } = usePagination(
  filteredRecipes,
  { pageSize: 9 },
);

const clearTags = () => {
  activeTagFilters.value = new Set();
};

const handleRecipeClick = (id) => {
  router.push({ name: "recipe-detail", params: { id } });
};

const handleTagClick = (tagName) => {
  toggleTag(tagName);
  filtersOpen.value = true;
};

onMounted(async () => {
  await recipesStore.loadAllRecipes();
});
</script>

<template>
  <div class="browse__container forge__texture-subtle">
    <h1 class="browse__heading">Browse Recipes</h1>

    <div class="browse__filter-bar">
      <InputText
        v-model="searchQuery"
        type="text"
        placeholder="Search recipes..."
        class="browse__search"
        aria-label="Search recipes by name"
      />
      <button
        class="browse__filters-btn"
        :class="{ 'browse__filters-btn--active': activeTagFilters.size > 0 }"
        @click="filtersOpen = !filtersOpen"
        :aria-expanded="filtersOpen"
        aria-controls="browse-filter-panel"
      >
        <span>{{ filtersOpen ? "▲" : "▼" }} Filters</span>
        <span v-if="activeTagFilters.size > 0" class="browse__filters-badge">{{
          activeTagFilters.size
        }}</span>
      </button>
    </div>

    <div
      v-show="filtersOpen"
      id="browse-filter-panel"
      class="browse__filter-panel"
    >
      <div class="browse__filter-chips">
        <button
          v-for="tag in availableTags"
          :key="tag"
          class="browse__filter-chip"
          :class="{ 'browse__filter-chip--active': activeTagFilters.has(tag) }"
          @click="toggleTag(tag)"
          :aria-pressed="activeTagFilters.has(tag)"
        >
          {{ tag }}
        </button>
      </div>
      <button
        v-if="activeTagFilters.size > 0"
        class="browse__filter-clear"
        @click="clearTags"
      >
        Clear all
      </button>
    </div>

    <div aria-live="polite" aria-atomic="true">
      <div
        v-if="recipesStore.loading"
        class="browse__grid"
        aria-label="Loading recipes..."
      >
        <div v-for="i in 9" :key="i" class="browse__skeleton-card">
          <Skeleton
            class="browse__skeleton-card__image"
            :height="i % 3 === 0 ? '10rem' : i % 3 === 1 ? '12rem' : '14rem'"
          />
          <Skeleton
            class="browse__skeleton-card__title"
            :width="i % 3 === 0 ? '75%' : i % 3 === 1 ? '80%' : '85%'"
          />
          <Skeleton
            class="browse__skeleton-card__subtitle"
            :width="i % 3 === 0 ? '50%' : i % 3 === 1 ? '60%' : '70%'"
          />
        </div>
      </div>
    </div>

    <template v-if="!recipesStore.loading">
      <div
        v-if="recipesStore.recipes.length === 0"
        class="browse__empty-message"
      >
        No recipes yet.
      </div>

      <div
        v-else-if="filteredRecipes.length === 0"
        class="browse__empty-message"
      >
        No recipes found.
      </div>

      <div v-else class="browse__grid forge__entrance">
        <div
          v-for="recipe in paginatedRecipes"
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

      <Paginator
        v-if="filteredRecipes.length > 9"
        :rows="9"
        :totalRecords="filteredRecipes.length"
        :first="currentPage * 9"
        @page="currentPage = $event.page"
        class="browse__paginator"
      />
    </template>
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.browse__container {
  @apply w-full;
}

.browse__heading {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 1.5rem;
  text-shadow: 0 0 16px rgba(232, 160, 66, 0.4);
}

.browse__filter-bar {
  @apply flex gap-3 mb-3;
}

.browse__search {
  @apply flex-1;
}

.browse__filters-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded border border-surface cursor-pointer transition-all duration-200;
  background-color: transparent;
  color: var(--text-color);
}

.browse__filters-btn:hover {
  border-color: var(--purple-accent);
  color: var(--purple-accent);
}

.browse__filters-btn--active {
  border-color: var(--purple-accent);
  color: var(--purple-accent);
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
}

.browse__filters-badge {
  @apply inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold;
  background-color: var(--purple-accent);
  color: #0a0812;
}

.browse__filter-panel {
  @apply border border-surface rounded p-3 mb-4;
  max-height: 200px;
  overflow-y: auto;
}

.browse__filter-chips {
  @apply flex flex-wrap gap-2 mb-2;
}

.browse__filter-chip {
  @apply inline-flex items-center px-2 py-1 text-xs rounded transition-colors cursor-pointer;
  background-color: transparent;
  color: var(--purple-accent);
  border: 1px solid var(--purple-accent);
}

.browse__filter-chip:hover {
  background-color: rgba(139, 92, 246, 0.1);
}

.browse__filter-chip--active {
  background-color: var(--purple-accent);
  color: #0a0812;
}

.browse__filter-chip--active:hover {
  background-color: var(--purple-light, #a78bfa);
  border-color: var(--purple-light, #a78bfa);
}

.browse__filter-clear {
  @apply text-xs cursor-pointer mt-1 p-0;
  background: none;
  border: none;
  color: var(--text-muted-color);
  text-decoration: underline;
}

.browse__filter-clear:hover {
  color: var(--purple-accent);
}

.browse__empty-message {
  @apply text-muted-color text-center py-12;
}

.browse__grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.browse__skeleton-card {
  @apply border border-surface rounded p-4;
}

.browse__skeleton-card__image {
  @apply mb-3;
}

.browse__skeleton-card__title {
  @apply mb-2;
}

.browse__paginator {
  @apply mt-6;
}
</style>
