<script setup>
import { onMounted } from "vue";
import Skeleton from "primevue/skeleton";
import { useAuthStore } from "@/features/auth/store";
import { useRecipesStore } from "@/features/recipes/store";
import RecipeCard from "@/features/recipes/components/RecipeCard.vue";

const authStore = useAuthStore();
const recipesStore = useRecipesStore();

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await recipesStore.loadUserRecipes();
  }
});
</script>

<template>
  <div>
    <h1 class="home__title">Recipe Forge</h1>
    <p class="home__subtitle">
      Create and refine your recipes. Build a collection that's completely
      unique to you.
    </p>

    <div v-if="!authStore.isAuthenticated" class="home__sign-in-message">
      Please sign in to view your recipes.
    </div>

    <div v-else-if="recipesStore.loading" class="home__grid">
      <div v-for="i in 9" :key="i" class="home__skeleton-card">
        <Skeleton
          class="home__skeleton-card__image"
          :height="i % 3 === 0 ? '10rem' : i % 3 === 1 ? '12rem' : '14rem'"
        />
        <Skeleton
          class="home__skeleton-card__title"
          :width="i % 3 === 0 ? '75%' : i % 3 === 1 ? '80%' : '85%'"
        />
        <Skeleton
          class="home__skeleton-card__subtitle"
          :width="i % 3 === 0 ? '50%' : i % 3 === 1 ? '60%' : '70%'"
        />
      </div>
    </div>

    <div
      v-else-if="recipesStore.recipes.length === 0"
      class="home__empty-message"
    >
      No recipes yet.
    </div>

    <div v-else class="home__grid">
      <RecipeCard
        v-for="recipe in recipesStore.recipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </div>
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.home__title {
  @apply text-3xl font-bold text-color mb-6;
}

.home__subtitle {
  @apply text-lg text-muted-color mb-4;
}

.home__sign-in-message {
  @apply text-muted-color text-center py-12;
}

.home__empty-message {
  @apply text-muted-color text-center py-12;
}

.home__grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.home__skeleton-card {
  @apply border border-surface rounded p-4;
}

.home__skeleton-card__image {
  @apply mb-3;
}

.home__skeleton-card__title {
  @apply mb-2;
}
</style>
