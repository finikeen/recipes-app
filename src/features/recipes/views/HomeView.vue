<script setup>
import { onMounted, ref, computed } from "vue"
import Skeleton from "primevue/skeleton"
import { useRecipesStore } from "@/features/recipes/store"
import RecipeCard from "@/features/recipes/components/RecipeCard.vue"

const recipesStore = useRecipesStore()

const featuredIndex = ref(null)

const featuredRecipe = computed(() => {
  if (!recipesStore.recipes.length || featuredIndex.value === null) return null
  return recipesStore.recipes[featuredIndex.value]
})

const pickRandom = () => {
  const len = recipesStore.recipes.length
  if (!len) return
  featuredIndex.value = Math.floor(Math.random() * len)
}

onMounted(async () => {
  await recipesStore.loadAllRecipes()
  pickRandom()
})
</script>

<template>
  <div class="featured__container">
    <h1 class="featured__title">Recipe Forge</h1>
    <p class="featured__subtitle">
      Create and refine your recipes. Build a collection that's completely
      unique to you.
    </p>

    <div v-if="recipesStore.loading" class="featured__skeleton-card">
      <Skeleton class="featured__skeleton-card__image" height="16rem" />
      <Skeleton class="featured__skeleton-card__title" width="80%" />
      <Skeleton class="featured__skeleton-card__subtitle" width="60%" />
    </div>

    <div v-else-if="!featuredRecipe" class="featured__empty-message">
      No recipes yet.
    </div>

    <div v-else>
      <div class="featured__card-wrapper">
        <RecipeCard :recipe="featuredRecipe" />
      </div>
      <button
        v-if="recipesStore.recipes.length > 1"
        class="featured__button"
        @click="pickRandom"
      >
        Load another
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css"

.featured__container {
  @apply w-full;
}

.featured__title {
  @apply text-3xl font-bold text-color mb-6;
}

.featured__subtitle {
  @apply text-lg text-muted-color mb-8;
}

.featured__empty-message {
  @apply text-muted-color text-center py-12;
}

.featured__card-wrapper {
  @apply max-w-md;
}

.featured__button {
  @apply mt-6 px-4 py-2 rounded transition-colors;
  @apply bg-primary text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}

.featured__skeleton-card {
  @apply border border-surface rounded p-4 max-w-md;
}

.featured__skeleton-card__image {
  @apply mb-3;
}

.featured__skeleton-card__title {
  @apply mb-2;
}

.featured__skeleton-card__subtitle {
  @apply mb-0;
}
</style>
