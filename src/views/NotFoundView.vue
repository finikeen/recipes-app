<script setup></script>

<template>
  <div class="flex flex-col items-center justify-center min-h-64 gap-4">
    <h1 class="text-6xl font-bold text-color">404</h1>
    <p class="text-muted-color text-lg">Page not found.</p>
    <RouterLink
      :to="{ name: 'home' }"
      class="text-primary hover:text-primary-emphasis"
    >
      Go home
    </RouterLink>
  </div>
</template>
