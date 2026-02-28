import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useIngredientSearch } from '@/features/recipes/composables/useIngredientSearch'

const recipes = [
  {
    id: '1',
    name: 'Pasta Carbonara',
    tags: ['italian', 'pasta'],
    ingredientNames: ['pasta', 'egg', 'bacon', 'parmesan'],
  },
  {
    id: '2',
    name: 'Chicken Soup',
    tags: ['soup', 'chicken'],
    ingredientNames: ['chicken', 'carrot', 'celery', 'onion'],
  },
  {
    id: '3',
    name: 'Egg Fried Rice',
    tags: ['asian', 'rice'],
    ingredientNames: ['rice', 'egg', 'soy sauce', 'onion'],
  },
  {
    id: '4',
    name: 'Caesar Salad',
    tags: ['salad', 'italian'],
    ingredientNames: ['romaine', 'parmesan', 'croutons', 'caesar dressing'],
  },
]

describe('useIngredientSearch', () => {
  it('returns empty array when no ingredients are selected', () => {
    const source = ref(recipes)
    const { filteredRecipes } = useIngredientSearch(source)
    expect(filteredRecipes.value).toHaveLength(0)
  })

  it('filters by a single ingredient with threshold 1', () => {
    const source = ref(recipes)
    const { filteredRecipes, addIngredient } = useIngredientSearch(source)
    addIngredient('egg')
    expect(filteredRecipes.value).toHaveLength(2)
    expect(filteredRecipes.value.map((r) => r.name)).toContain('Pasta Carbonara')
    expect(filteredRecipes.value.map((r) => r.name)).toContain('Egg Fried Rice')
  })

  it('filters by multiple ingredients with threshold 1 (any match)', () => {
    const source = ref(recipes)
    const { filteredRecipes, addIngredient } = useIngredientSearch(source)
    addIngredient('egg')
    addIngredient('chicken')
    // threshold stays at 1 — any recipe containing egg OR chicken
    expect(filteredRecipes.value).toHaveLength(3)
  })

  it('filters by multiple ingredients with threshold equal to count (all must match)', () => {
    const source = ref(recipes)
    const { filteredRecipes, matchThreshold, addIngredient } = useIngredientSearch(source)
    addIngredient('egg')
    addIngredient('onion')
    matchThreshold.value = 2
    // Only Egg Fried Rice has both egg and onion
    expect(filteredRecipes.value).toHaveLength(1)
    expect(filteredRecipes.value[0].name).toBe('Egg Fried Rice')
  })

  it('auto-clamps threshold when an ingredient is removed', () => {
    const source = ref(recipes)
    const { matchThreshold, addIngredient, removeIngredient } = useIngredientSearch(source)
    addIngredient('egg')
    addIngredient('onion')
    addIngredient('bacon')
    matchThreshold.value = 3
    removeIngredient('bacon')
    // selectedIngredients.length is now 2, threshold must be clamped to 2
    expect(matchThreshold.value).toBe(2)
  })

  it('combines ingredient filter and tag filter (AND logic)', () => {
    const source = ref(recipes)
    const { filteredRecipes, addIngredient, toggleTag } = useIngredientSearch(source)
    addIngredient('parmesan')
    toggleTag('italian')
    // Both Pasta Carbonara and Caesar Salad have parmesan, but only Italian-tagged ones remain
    expect(filteredRecipes.value.every((r) => r.tags.includes('italian'))).toBe(true)
    expect(filteredRecipes.value).toHaveLength(2)
  })

  it('returns empty array when no recipes match selected ingredients', () => {
    const source = ref(recipes)
    const { filteredRecipes, addIngredient } = useIngredientSearch(source)
    addIngredient('truffle oil')
    expect(filteredRecipes.value).toHaveLength(0)
  })

  it('clearAll resets all state', () => {
    const source = ref(recipes)
    const {
      filteredRecipes,
      selectedIngredients,
      matchThreshold,
      activeTagFilters,
      addIngredient,
      toggleTag,
      clearAll,
    } = useIngredientSearch(source)
    addIngredient('egg')
    addIngredient('bacon')
    matchThreshold.value = 2
    toggleTag('italian')
    clearAll()
    expect(selectedIngredients.value).toHaveLength(0)
    expect(matchThreshold.value).toBe(1)
    expect(activeTagFilters.value.size).toBe(0)
    expect(filteredRecipes.value).toHaveLength(0)
  })
})
