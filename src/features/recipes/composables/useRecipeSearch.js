import { ref, computed, toValue } from 'vue'

export const TOP_TAG_COUNT = 12

export function useRecipeSearch(recipesSource) {
  const searchQuery = ref('')
  const activeTagFilters = ref(new Set())

  const topTags = computed(() => {
    const freq = {}
    toValue(recipesSource).forEach((r) =>
      (r.tags ?? []).forEach((t) => {
        freq[t] = (freq[t] ?? 0) + 1
      }),
    )
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_TAG_COUNT)
      .map(([tag]) => tag)
  })

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
    topTags,
    filteredRecipes,
    toggleTag,
    clearFilters,
  }
}
