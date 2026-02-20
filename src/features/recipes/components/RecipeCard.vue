<template>
  <Card class="w-full">
    <template #title>{{ recipe.title ?? 'Untitled Recipe' }}</template>
    <template #content>
      <p class="text-muted-color">{{ recipe.description ?? 'No description.' }}</p>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card'

defineProps({
  recipe: {
    type: Object,
    required: true
  }
})
</script>
