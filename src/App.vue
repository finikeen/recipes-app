<template>
  <div class="app forge__texture-subtle">
    <AppNavbar />
    <main class="app__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from "@/components/AppNavbar.vue";
</script>

<style scoped>
@reference "./assets/main.css";

.app {
  min-height: 100vh;
  background-color: var(--surface-ground);
  color: var(--text-color);
  position: relative;
}

.app__main {
  @apply container mx-auto px-4 py-8;
}
</style>
