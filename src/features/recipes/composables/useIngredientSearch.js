import { ref, computed, toValue } from 'vue'
import { TOP_TAG_COUNT } from './useRecipeSearch'

export function useIngredientSearch(recipesSource) {
  const selectedIngredients = ref([])
  const matchThreshold = ref(1)
  const activeTagFilters = ref(new Set())
  const ingredientQuery = ref('')

  const clampThreshold = () => {
    const max = selectedIngredients.value.length
    if (max === 0) {
      matchThreshold.value = 1
    } else {
      matchThreshold.value = Math.min(matchThreshold.value, max)
    }
  }

  const allIngredientSuggestions = computed(() => {
    const names = new Set()
    toValue(recipesSource).forEach(recipe => {
      ;(recipe.ingredientNames ?? []).forEach(name => names.add(name))
    })
    return [...names].sort((a, b) => a.localeCompare(b))
  })

  const filteredSuggestions = computed(() => {
    const q = ingredientQuery.value.trim().toLowerCase()
    const selected = new Set(selectedIngredients.value.map(i => i.toLowerCase()))
    return allIngredientSuggestions.value.filter(
      name => !selected.has(name) && (q === '' || name.includes(q))
    )
  })

  const availableTags = computed(() => {
    const tags = new Set()
    toValue(recipesSource).forEach(recipe => {
      ;(recipe.tags ?? []).forEach(tag => tags.add(tag))
    })
    return [...tags].sort((a, b) => a.localeCompare(b))
  })

  const topTags = computed(() => {
    const freq = {}
    toValue(recipesSource).forEach(recipe => {
      ;(recipe.tags ?? []).forEach(tag => {
        freq[tag] = (freq[tag] ?? 0) + 1
      })
    })
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_TAG_COUNT)
      .map(([tag]) => tag)
  })

  const filteredRecipes = computed(() => {
    if (selectedIngredients.value.length === 0) return []
    const lowerSelected = selectedIngredients.value.map(i => i.toLowerCase())
    return toValue(recipesSource).filter(recipe => {
      const recipeIngredients = new Set(recipe.ingredientNames ?? [])
      const matchCount = lowerSelected.filter(i => recipeIngredients.has(i)).length
      if (matchCount < matchThreshold.value) return false
      if (activeTagFilters.value.size === 0) return true
      return [...activeTagFilters.value].every(tag => (recipe.tags ?? []).includes(tag))
    })
  })

  const addIngredient = (name) => {
    const lower = name.toLowerCase()
    if (!selectedIngredients.value.includes(lower)) {
      selectedIngredients.value = [...selectedIngredients.value, lower]
    }
    ingredientQuery.value = ''
    clampThreshold()
  }

  const removeIngredient = (name) => {
    const lower = name.toLowerCase()
    selectedIngredients.value = selectedIngredients.value.filter(i => i !== lower)
    clampThreshold()
  }

  const toggleTag = (tag) => {
    const next = new Set(activeTagFilters.value)
    next.has(tag) ? next.delete(tag) : next.add(tag)
    activeTagFilters.value = next
  }

  const clearTagFilters = () => {
    activeTagFilters.value = new Set()
  }

  const clearAll = () => {
    selectedIngredients.value = []
    matchThreshold.value = 1
    activeTagFilters.value = new Set()
    ingredientQuery.value = ''
  }

  return {
    selectedIngredients,
    matchThreshold,
    activeTagFilters,
    ingredientQuery,
    allIngredientSuggestions,
    filteredSuggestions,
    availableTags,
    topTags,
    filteredRecipes,
    addIngredient,
    removeIngredient,
    toggleTag,
    clearTagFilters,
    clearAll,
  }
}
