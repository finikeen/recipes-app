import { describe, it, expect } from 'vitest'
import { ref, isReadonly } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useIngredients } from '@/features/recipes/composables/useIngredients'

describe('useIngredients', () => {
  it('initializes with empty array by default', () => {
    const { ingredients } = useIngredients()
    expect(ingredients.value).toEqual([])
  })

  it('initializes with provided static array', () => {
    const initial = [{ _key: '1', quantity: '2', unit: 'cups', item: 'flour' }]
    const { ingredients } = useIngredients(initial)
    expect(ingredients.value).toHaveLength(1)
    expect(ingredients.value[0].item).toBe('flour')
    expect(ingredients.value[0].quantity).toBe('2')
    expect(ingredients.value[0].unit).toBe('cups')
  })

  it('addIngredient appends blank entry', () => {
    const { ingredients, addIngredient } = useIngredients()
    addIngredient()
    expect(ingredients.value).toHaveLength(1)
    expect(ingredients.value[0].item).toBe('')
    expect(ingredients.value[0].quantity).toBe('')
    expect(ingredients.value[0].unit).toBe('')
  })

  it('removeIngredient removes by index', () => {
    const initial = [
      { _key: 'a', quantity: '', unit: '', item: 'salt' },
      { _key: 'b', quantity: '', unit: '', item: 'pepper' },
    ]
    const { ingredients, removeIngredient } = useIngredients(initial)
    removeIngredient(0)
    expect(ingredients.value).toHaveLength(1)
    expect(ingredients.value[0].item).toBe('pepper')
  })

  it('updateIngredient replaces fields by index', () => {
    const initial = [{ _key: 'a', quantity: '1', unit: 'cup', item: 'water' }]
    const { ingredients, updateIngredient } = useIngredients(initial)
    updateIngredient(0, { item: 'milk', quantity: '2' })
    expect(ingredients.value[0].item).toBe('milk')
    expect(ingredients.value[0].quantity).toBe('2')
    expect(ingredients.value[0].unit).toBe('cup')
  })

  it('returns readonly ingredients array', () => {
    const { ingredients } = useIngredients()
    expect(isReadonly(ingredients)).toBe(true)
  })

  it('populates from reactive ref initialValue when data arrives', async () => {
    const source = ref([])
    const { ingredients } = useIngredients(source)
    expect(ingredients.value).toHaveLength(0)

    source.value = [{ _key: '1', quantity: '', unit: '', item: 'onion' }]
    await flushPromises()
    expect(ingredients.value).toHaveLength(1)
    expect(ingredients.value[0].item).toBe('onion')
  })
})
