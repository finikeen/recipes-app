<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useRecipesStore } from "@/features/recipes/store";
import RecipeCard from "@/features/recipes/components/RecipeCard.vue";
import TagFilterModal from "@/features/recipes/components/TagFilterModal.vue";
import {
  useRecipeSearch,
  TOP_TAG_COUNT,
} from "@/features/recipes/composables/useRecipeSearch";
import { usePagination } from "@/features/recipes/composables/usePagination";

const recipesStore = useRecipesStore();
const router = useRouter();

const tagModalOpen = ref(false);

const {
  searchQuery,
  activeTagFilters,
  availableTags,
  topTags,
  filteredRecipes,
  toggleTag,
  clearFilters,
} = useRecipeSearch(() => recipesStore.recipes);

const { currentPage, paginatedItems: paginatedRecipes } = usePagination(
  filteredRecipes,
  { pageSize: 9 },
);

const handleRecipeClick = (id) => {
  router.push({ name: "recipe-detail", params: { id } });
};

const handleTagClick = (tagName) => {
  toggleTag(tagName);
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
    </div>

    <!-- Active tag pills -->
    <div v-if="activeTagFilters.size > 0" class="browse__active-tags">
      <button
        v-for="tag in [...activeTagFilters]"
        :key="tag"
        class="browse__tag-pill"
        @click="toggleTag(tag)"
      >
        {{ tag }} ✕
      </button>
    </div>

    <!-- Top tags shortcut row -->
    <div class="browse__top-tags">
      <button
        v-for="tag in topTags"
        :key="tag"
        class="browse__filter-chip"
        :class="{ 'browse__filter-chip--active': activeTagFilters.has(tag) }"
        :aria-pressed="activeTagFilters.has(tag)"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </button>
      <button
        v-if="availableTags.length > TOP_TAG_COUNT"
        class="browse__more-tags-btn"
        @click="tagModalOpen = true"
      >
        + {{ availableTags.length - topTags.length }} more…
      </button>
    </div>

    <TagFilterModal
      v-model:visible="tagModalOpen"
      :tags="availableTags"
      :active-tag-filters="activeTagFilters"
      @toggle-tag="toggleTag"
      @clear-all="clearFilters"
    />

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

.browse__active-tags {
  @apply flex flex-wrap gap-2 mb-3;
}

.browse__tag-pill {
  @apply inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-colors cursor-pointer;
  background-color: rgba(232, 160, 66, 0.15);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.browse__tag-pill:hover {
  background-color: rgba(232, 160, 66, 0.3);
}

.browse__top-tags {
  @apply flex flex-wrap gap-2 mb-4;
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

.browse__more-tags-btn {
  @apply inline-flex items-center px-2 py-1 text-xs rounded transition-colors cursor-pointer;
  background: none;
  border: none;
  color: var(--text-muted-color);
}

.browse__more-tags-btn:hover {
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
