import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useRecipeForm } from '@/features/recipes/composables/useRecipeForm'

vi.mock('@/features/recipes/store', () => ({
  useRecipesStore: vi.fn(),
}))

vi.mock('@/features/recipes/services/recipeService', () => ({
  recipeService: {
    getIngredients: vi.fn(),
    setIngredients: vi.fn(),
  },
}))

import { useRecipesStore } from '@/features/recipes/store'
import { recipeService } from '@/features/recipes/services/recipeService'

function makeStore(overrides = {}) {
  return {
    addRecipe: vi.fn().mockResolvedValue({ id: 'new-id' }),
    updateRecipe: vi.fn().mockResolvedValue({}),
    getRecipeById: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

function fillValidForm(form) {
  form.name.value = 'Spaghetti Bolognese'
  form.description.value = 'A rich Italian meat sauce over pasta'
  form.addIngredient()
  form.updateIngredient(0, { item: 'spaghetti', quantity: '200', unit: 'g' })
  form.addDirection()
  form.updateDirection(0, { text: 'Boil the pasta' })
}

describe('useRecipeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    recipeService.setIngredients.mockResolvedValue(undefined)
  })

  describe('validation', () => {
    it('returns false and sets name error when name is empty', () => {
      useRecipesStore.mockReturnValue(makeStore())
      const form = useRecipeForm()
      const result = form.validate()
      expect(result).toBe(false)
      expect(form.errors.value.name).toBeTruthy()
    })

    it('returns false when name exceeds 200 characters', () => {
      useRecipesStore.mockReturnValue(makeStore())
      const form = useRecipeForm()
      form.name.value = 'A'.repeat(201)
      form.description.value = 'Valid description'
      const result = form.validate()
      expect(result).toBe(false)
      expect(form.errors.value.name).toContain('200')
    })

    it('returns false when description exceeds 2000 characters', () => {
      useRecipesStore.mockReturnValue(makeStore())
      const form = useRecipeForm()
      form.name.value = 'Valid Name'
      form.description.value = 'A'.repeat(2001)
      const result = form.validate()
      expect(result).toBe(false)
      expect(form.errors.value.description).toContain('2000')
    })

    it('returns true when all fields are valid', () => {
      useRecipesStore.mockReturnValue(makeStore())
      const form = useRecipeForm()
      fillValidForm(form)
      expect(form.validate()).toBe(true)
      expect(form.errors.value.name).toBe('')
    })
  })

  describe('derivedTags', () => {
    it('extracts meaningful words from name and description', () => {
      useRecipesStore.mockReturnValue(makeStore())
      const form = useRecipeForm()
      form.name.value = 'Chocolate Cake'
      form.description.value = 'Rich dessert recipe'
      const tags = form.derivedTags.value
      expect(tags).toContain('chocolate')
      expect(tags).toContain('cake')
      expect(tags).toContain('rich')
    })

    it('excludes stopwords', () => {
      useRecipesStore.mockReturnValue(makeStore())
      const form = useRecipeForm()
      form.name.value = 'The Best Pasta'
      form.description.value = 'This is a great dish'
      const tags = form.derivedTags.value
      expect(tags).not.toContain('the')
      expect(tags).not.toContain('is')
      expect(tags).not.toContain('a')
    })
  })

  describe('submitForm', () => {
    it('calls addRecipe in create mode', async () => {
      const store = makeStore()
      useRecipesStore.mockReturnValue(store)
      const form = useRecipeForm()
      fillValidForm(form)
      await form.submitForm()
      expect(store.addRecipe).toHaveBeenCalledOnce()
      expect(store.updateRecipe).not.toHaveBeenCalled()
    })

    it('calls updateRecipe in edit mode when recipeId is provided', async () => {
      const store = makeStore()
      useRecipesStore.mockReturnValue(store)
      const recipeId = ref('existing-id')
      const form = useRecipeForm({ recipeId })
      fillValidForm(form)
      await form.submitForm()
      expect(store.updateRecipe).toHaveBeenCalledWith('existing-id', expect.any(Object))
      expect(store.addRecipe).not.toHaveBeenCalled()
    })

    it('calls onSuccess callback with the recipe id after successful submit', async () => {
      const store = makeStore()
      useRecipesStore.mockReturnValue(store)
      const onSuccess = vi.fn()
      const form = useRecipeForm({ onSuccess })
      fillValidForm(form)
      await form.submitForm()
      expect(onSuccess).toHaveBeenCalledWith('new-id')
    })

    it('does not submit when validation fails', async () => {
      const store = makeStore()
      useRecipesStore.mockReturnValue(store)
      const form = useRecipeForm()
      // name left empty — validation will fail
      await form.submitForm()
      expect(store.addRecipe).not.toHaveBeenCalled()
    })
  })
})
