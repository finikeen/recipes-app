<template>
  <div>
    <h1 class="text-3xl font-bold text-color mb-6">Recipe #{{ route.params.id }}</h1>
    <p class="text-muted-color">Recipe detail coming soon.</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
