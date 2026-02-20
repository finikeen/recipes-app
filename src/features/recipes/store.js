import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref([])

  return { recipes }
})
