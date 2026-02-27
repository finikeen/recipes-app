import { ref, watch, readonly, toValue } from 'vue'
import { recipeService } from '@/features/recipes/services/recipeService'

export function useRecipeIngredients(recipeIdSource) {
  const ingredients = ref([])
  const loading = ref(false)

  watch(
    () => toValue(recipeIdSource),
    async (id) => {
      if (!id) {
        ingredients.value = []
        loading.value = false
        return
      }
      loading.value = true
      ingredients.value = []
      try {
        const results = await recipeService.getIngredients(id)
        ingredients.value = results
      } catch {
        ingredients.value = []
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )

  return {
    ingredients: readonly(ingredients),
    loading,
  }
}
