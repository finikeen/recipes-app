<script setup>
import { onMounted, ref, computed } from "vue"
import Skeleton from "primevue/skeleton"
import Paginator from "primevue/paginator"
import { useRecipesStore } from "@/features/recipes/store"
import RecipeCard from "@/features/recipes/components/RecipeCard.vue"

const recipesStore = useRecipesStore()

const currentPage = ref(0)
const rowsPerPage = 9

const paginatedRecipes = computed(() => {
  const start = currentPage.value * rowsPerPage
  return recipesStore.recipes.slice(start, start + rowsPerPage)
})

onMounted(async () => {
  await recipesStore.loadAllRecipes()
})
</script>

<template>
  <div>
    <p class="browse__subtitle">
      Create and refine your recipes. Build a collection that's completely
      unique to you.
    </p>

    <div v-if="recipesStore.loading" class="browse__grid">
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

    <div
      v-else-if="recipesStore.recipes.length === 0"
      class="browse__empty-message"
    >
      No recipes yet.
    </div>

    <div v-else class="browse__grid">
      <RecipeCard
        v-for="recipe in paginatedRecipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </div>

    <Paginator
      v-if="recipesStore.recipes.length > rowsPerPage"
      :rows="rowsPerPage"
      :totalRecords="recipesStore.recipes.length"
      :first="currentPage * rowsPerPage"
      @page="currentPage = $event.page"
      class="browse__paginator"
    />
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.browse__subtitle {
  @apply text-lg text-muted-color mb-4;
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
