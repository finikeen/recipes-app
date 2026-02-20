<template>
  <div class="min-h-screen bg-surface-50">
    <AppNavbar />
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
</script>
