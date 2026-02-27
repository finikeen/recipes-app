import { ref, computed, toValue } from 'vue'

export function useRecipeSearch(recipesSource) {
  const searchQuery = ref('')
  const activeTagFilters = ref(new Set())

  const nameFilteredRecipes = computed(() => {
    const recipes = toValue(recipesSource)
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter((r) => r.name?.toLowerCase().includes(q))
  })

  const availableTags = computed(() => {
    const tags = new Set()
    nameFilteredRecipes.value.forEach((r) => {
      ;(r.tags ?? []).forEach((t) => tags.add(t))
    })
    return [...tags].sort((a, b) => a.localeCompare(b))
  })

  const filteredRecipes = computed(() => {
    if (activeTagFilters.value.size === 0) return nameFilteredRecipes.value
    return nameFilteredRecipes.value.filter((r) =>
      (r.tags ?? []).some((t) => activeTagFilters.value.has(t)),
    )
  })

  const toggleTag = (tag) => {
    const next = new Set(activeTagFilters.value)
    next.has(tag) ? next.delete(tag) : next.add(tag)
    activeTagFilters.value = next
  }

  const clearFilters = () => {
    searchQuery.value = ''
    activeTagFilters.value = new Set()
  }

  return {
    searchQuery,
    activeTagFilters,
    availableTags,
    filteredRecipes,
    toggleTag,
    clearFilters,
  }
}
