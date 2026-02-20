<template>
  <nav class="navbar">
    <RouterLink :to="{ name: 'home' }" class="navbar__brand">
      Recipes
    </RouterLink>
    <div class="navbar__links">
      <RouterLink :to="{ name: 'home' }" class="navbar__link">
        Browse
      </RouterLink>
      <RouterLink :to="{ name: 'recipe-create' }" class="navbar__link">
        New Recipe
      </RouterLink>
      <RouterLink :to="{ name: 'auth' }" class="navbar__link">
        Sign In
      </RouterLink>
    </div>
  </nav>
</template>

<script setup></script>

<style scoped>
@reference "../assets/main.css";

.navbar {
  @apply bg-surface-0 border-b border-surface px-6 py-3 flex items-center gap-6;
}

.navbar__brand {
  @apply text-xl font-bold text-color no-underline;
}

.navbar__links {
  @apply flex gap-4 ml-auto;
}

.navbar__link {
  @apply text-muted-color hover:text-color transition-colors no-underline;
}
</style>
