import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useRecipeSearch } from '@/features/recipes/composables/useRecipeSearch'

const recipes = [
  { id: 1, name: 'Pasta Carbonara', description: 'Italian classic', tags: ['italian', 'pasta'] },
  { id: 2, name: 'Chicken Soup', description: 'Comforting broth', tags: ['soup', 'chicken'] },
  { id: 3, name: 'Caesar Salad', description: 'Crispy romaine', tags: ['salad', 'italian'] },
]

const keywordRecipes = [
  { id: 1, name: 'Pasta Carbonara', keywords: ['italian', 'pasta', 'weeknight'] },
  { id: 2, name: 'Chicken Soup',    keywords: ['soup', 'chicken', 'comfort food'] },
  { id: 3, name: 'Caesar Salad',    keywords: ['salad', 'italian'] },
  { id: 4, name: 'Unnamed Dish' },
  { id: 5, name: 'Old Recipe',      tags: ['legacy', 'soup'] },
]

describe('useRecipeSearch', () => {
  it('returns all recipes when query is empty and no tags active', () => {
    const source = ref(recipes)
    const { filteredRecipes } = useRecipeSearch(source)
    expect(filteredRecipes.value).toHaveLength(3)
  })

  it('filters by name when searchQuery is set', () => {
    const source = ref(recipes)
    const { filteredRecipes, searchQuery } = useRecipeSearch(source)
    searchQuery.value = 'pasta'
    expect(filteredRecipes.value).toHaveLength(1)
    expect(filteredRecipes.value[0].name).toBe('Pasta Carbonara')
  })

  it('search is case insensitive', () => {
    const source = ref(recipes)
    const { filteredRecipes, searchQuery } = useRecipeSearch(source)
    searchQuery.value = 'CHICKEN'
    expect(filteredRecipes.value).toHaveLength(1)
    expect(filteredRecipes.value[0].name).toBe('Chicken Soup')
  })

  it('filters by active tag', () => {
    const source = ref(recipes)
    const { filteredRecipes, toggleTag } = useRecipeSearch(source)
    toggleTag('soup')
    expect(filteredRecipes.value).toHaveLength(1)
    expect(filteredRecipes.value[0].name).toBe('Chicken Soup')
  })

  it('combines search and tag filter (AND logic: name AND tag)', () => {
    const source = ref(recipes)
    const { filteredRecipes, searchQuery, toggleTag } = useRecipeSearch(source)
    searchQuery.value = 'a'
    toggleTag('italian')
    // Only recipes matching name search "a" AND tagged "italian"
    // "Pasta Carbonara" matches "a" and "italian", "Caesar Salad" matches "a" and "italian"
    expect(filteredRecipes.value.every((r) => r.tags.includes('italian'))).toBe(true)
    expect(filteredRecipes.value.every((r) => r.name.toLowerCase().includes('a'))).toBe(true)
  })

  it('toggleTag adds tag to active filters', () => {
    const source = ref(recipes)
    const { activeTagFilters, toggleTag } = useRecipeSearch(source)
    toggleTag('pasta')
    expect(activeTagFilters.value.has('pasta')).toBe(true)
  })

  it('toggleTag removes tag when already active', () => {
    const source = ref(recipes)
    const { activeTagFilters, toggleTag } = useRecipeSearch(source)
    toggleTag('pasta')
    toggleTag('pasta')
    expect(activeTagFilters.value.has('pasta')).toBe(false)
  })

  it('clearFilters resets query and tags', () => {
    const source = ref(recipes)
    const { filteredRecipes, searchQuery, toggleTag, clearFilters } = useRecipeSearch(source)
    searchQuery.value = 'pasta'
    toggleTag('italian')
    clearFilters()
    expect(searchQuery.value).toBe('')
    expect(filteredRecipes.value).toHaveLength(3)
  })

  describe('keywords support', () => {
    it('uses keywords for topTags when present', () => {
      const source = ref(keywordRecipes)
      const { topTags } = useRecipeSearch(source)
      expect(topTags.value).toContain('italian')
      expect(topTags.value).toContain('soup')
    })

    it('falls back to tags when keywords is absent', () => {
      const source = ref(keywordRecipes)
      const { topTags } = useRecipeSearch(source)
      expect(topTags.value).toContain('legacy')
    })

    it('filters recipes by keyword via toggleTag', () => {
      const source = ref(keywordRecipes)
      const { filteredRecipes, toggleTag } = useRecipeSearch(source)
      toggleTag('italian')
      expect(filteredRecipes.value.map(r => r.id)).toEqual(expect.arrayContaining([1, 3]))
      expect(filteredRecipes.value.map(r => r.id)).not.toContain(2)
    })

    it('text search matches against keywords as well as name', () => {
      const source = ref(keywordRecipes)
      const { filteredRecipes, searchQuery } = useRecipeSearch(source)
      searchQuery.value = 'weeknight'
      expect(filteredRecipes.value).toHaveLength(1)
      expect(filteredRecipes.value[0].id).toBe(1)
    })

    it('recipe with no keywords and no tags does not break composable', () => {
      const source = ref(keywordRecipes)
      const { filteredRecipes } = useRecipeSearch(source)
      expect(() => filteredRecipes.value).not.toThrow()
    })
  })
})
