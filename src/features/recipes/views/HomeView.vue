<template>
  <div>
    <h1 class="text-3xl font-bold text-color mb-6">Recipe Forge</h1>
    <p class="text-lg text-muted-color mb-4">
      Create and refine your recipes. Build a collection that's completely
      unique to you.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 9" :key="i" class="border border-surface rounded p-4">
        <Skeleton
          :height="i % 3 === 0 ? '10rem' : i % 3 === 1 ? '12rem' : '14rem'"
          class="mb-3"
        />
        <Skeleton
          :width="i % 3 === 0 ? '75%' : i % 3 === 1 ? '80%' : '85%'"
          class="mb-2"
        />
        <Skeleton :width="i % 3 === 0 ? '50%' : i % 3 === 1 ? '60%' : '70%'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
</script>
