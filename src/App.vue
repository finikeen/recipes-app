<script setup>
import AppNavbar from "@/components/AppNavbar.vue";
</script>

<template>
  <div class="app forge__texture-subtle forge__embers forge__sparks">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <AppNavbar />
    <main id="main-content" class="app__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
@reference "./assets/main.css";

.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  z-index: 99999;
  padding: 0.5rem 1rem;
  background-color: var(--surface-0);
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  border: 2px solid var(--primary-color);
  border-radius: 4px;
}

.skip-link:focus {
  left: 1rem;
  top: 1rem;
}

.app {
  min-height: 100vh;
  background-color: var(--surface-ground);
  color: var(--text-color);
  position: relative;
}

.app__main {
  @apply container mx-auto px-4 py-8;
  min-height: calc(100vh - 60px);
  background-color: var(--surface-0);
  position: relative;
  z-index: 10000;
}
</style>
