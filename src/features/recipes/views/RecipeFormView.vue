<template>
  <div>
    <h1 class="text-3xl font-bold text-color mb-6">
      {{ isEdit ? 'Edit Recipe' : 'New Recipe' }}
    </h1>
    <p class="text-muted-color">Recipe form coming soon.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isEdit = computed(() => route.name === 'recipe-edit')
</script>
