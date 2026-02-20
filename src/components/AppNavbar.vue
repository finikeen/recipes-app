<template>
  <nav class="bg-surface-0 border-b border-surface px-6 py-3 flex items-center gap-6">
    <RouterLink :to="{ name: 'home' }" class="text-xl font-bold text-color no-underline">
      Recipes
    </RouterLink>
    <div class="flex gap-4 ml-auto">
      <RouterLink
        :to="{ name: 'home' }"
        class="text-muted-color hover:text-color transition-colors no-underline"
      >
        Browse
      </RouterLink>
      <RouterLink
        :to="{ name: 'recipe-create' }"
        class="text-muted-color hover:text-color transition-colors no-underline"
      >
        New Recipe
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
</script>
