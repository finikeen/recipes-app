<script setup>
import { onMounted, ref, computed } from "vue";
import Skeleton from "primevue/skeleton";
import { useRouter } from "vue-router";
import { useRecipesStore } from "@/features/recipes/store";
import HeroRecipe from "@/features/recipes/components/HeroRecipe.vue";

const recipesStore = useRecipesStore();
const router = useRouter();

const featuredIndex = ref(null);

const featuredRecipe = computed(() => {
  if (!recipesStore.recipes.length || featuredIndex.value === null) return null;
  return recipesStore.recipes[featuredIndex.value];
});

const pickRandom = () => {
  const len = recipesStore.recipes.length;
  if (!len) return;
  featuredIndex.value = Math.floor(Math.random() * len);
};

const goToRecipe = (recipeId) => {
  router.push({ name: "recipe-detail", params: { id: recipeId } });
};

onMounted(async () => {
  await recipesStore.loadAllRecipes();
  pickRandom();
});
</script>

<template>
  <div class="featured__container forge__texture-subtle">
    <h1 class="featured__title sr-only">Recipe Forge</h1>

    <div aria-live="polite" aria-atomic="true">
      <div
        v-if="recipesStore.loading"
        class="featured__skeleton"
        aria-label="Loading recipes..."
      >
        <div class="featured__skeleton-left">
          <Skeleton width="60%" height="2rem" class="featured__skeleton-row" />
          <Skeleton width="90%" height="1rem" class="featured__skeleton-row" />
          <Skeleton width="80%" height="1rem" class="featured__skeleton-row" />
          <Skeleton width="40%" height="1rem" class="featured__skeleton-row" />
          <div class="featured__skeleton-tags">
            <Skeleton width="60px" height="1.5rem" />
            <Skeleton width="80px" height="1.5rem" />
            <Skeleton width="50px" height="1.5rem" />
          </div>
        </div>
        <div class="featured__skeleton-right">
          <Skeleton width="100%" height="2rem" class="featured__skeleton-row" />
          <Skeleton
            v-for="n in 5"
            :key="n"
            width="100%"
            height="1.25rem"
            class="featured__skeleton-row"
          />
        </div>
      </div>
    </div>

    <template v-if="!recipesStore.loading">
      <div v-if="!featuredRecipe" class="featured__empty-message">
        No recipes yet.
      </div>

      <template v-else>
        <HeroRecipe
          :recipe="featuredRecipe"
          @load-another="pickRandom"
          @view-recipe="goToRecipe"
        />
      </template>
    </template>
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.featured__container {
  @apply w-full;
}

.featured__title {
  @apply text-3xl font-bold text-color mb-6;
}

.featured__empty-message {
  @apply text-muted-color text-center py-12;
}

/* Skeleton: two-column layout mirrors the hero */
.featured__skeleton {
  @apply flex gap-6 p-6;
  background-color: var(--surface-0);
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  min-height: 320px;
}

.featured__skeleton-left {
  @apply flex flex-col gap-3;
  flex: 0 0 40%;
}

.featured__skeleton-right {
  @apply flex flex-col gap-3;
  flex: 1;
}

.featured__skeleton-row {
  display: block;
}

.featured__skeleton-tags {
  @apply flex gap-2 mt-2;
}
</style>
