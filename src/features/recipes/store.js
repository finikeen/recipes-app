import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recipeService } from './services/recipeService'

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const addRecipe = async (recipeData) => {
    loading.value = true
    error.value = null
    try {
      const newRecipe = await recipeService.addRecipe(recipeData)
      recipes.value.push(newRecipe)
      return newRecipe
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRecipe = async (recipeId, updates) => {
    loading.value = true
    error.value = null
    try {
      const updated = await recipeService.updateRecipe(recipeId, updates)
      const index = recipes.value.findIndex(r => r.id === recipeId)
      if (index !== -1) {
        recipes.value[index] = { ...recipes.value[index], ...updated }
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRecipe = async (recipeId) => {
    loading.value = true
    error.value = null
    try {
      await recipeService.deleteRecipe(recipeId)
      recipes.value = recipes.value.filter(r => r.id !== recipeId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadUserRecipes = async () => {
    loading.value = true
    error.value = null
    try {
      recipes.value = await recipeService.getUserRecipes()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadAllRecipes = async () => {
    loading.value = true
    error.value = null
    try {
      recipes.value = await recipeService.getAllRecipes()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getRecipeById = async (recipeId) => {
    loading.value = true
    error.value = null
    try {
      return await recipeService.getRecipeById(recipeId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    loadUserRecipes,
    loadAllRecipes,
    getRecipeById
  }
})
