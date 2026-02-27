import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useDirections } from '@/features/recipes/composables/useDirections'

describe('useDirections', () => {
  it('initializes with empty array by default', () => {
    const { directions } = useDirections()
    expect(directions.value).toEqual([])
  })

  it('addDirection appends blank entry', () => {
    const { directions, addDirection } = useDirections()
    addDirection()
    expect(directions.value).toHaveLength(1)
    expect(directions.value[0].text).toBe('')
  })

  it('removeDirection removes by index', () => {
    const initial = [
      { _key: 0, text: 'Boil water' },
      { _key: 1, text: 'Add pasta' },
    ]
    const { directions, removeDirection } = useDirections(initial)
    removeDirection(0)
    expect(directions.value).toHaveLength(1)
    expect(directions.value[0].text).toBe('Add pasta')
  })

  it('moveDirection swaps items by absolute index', () => {
    const initial = [
      { _key: 0, text: 'Step A' },
      { _key: 1, text: 'Step B' },
      { _key: 2, text: 'Step C' },
    ]
    const { directions, moveDirection } = useDirections(initial)
    moveDirection(0, 1)
    expect(directions.value[0].text).toBe('Step B')
    expect(directions.value[1].text).toBe('Step A')
    expect(directions.value[2].text).toBe('Step C')
  })

  it('moveDirection does nothing when toIndex is out of bounds', () => {
    const initial = [
      { _key: 0, text: 'Step A' },
      { _key: 1, text: 'Step B' },
    ]
    const { directions, moveDirection } = useDirections(initial)
    moveDirection(0, -1)
    expect(directions.value[0].text).toBe('Step A')

    moveDirection(1, 2)
    expect(directions.value[1].text).toBe('Step B')
  })

  it('populates from reactive ref initialValue when data arrives', async () => {
    const source = ref([])
    const { directions } = useDirections(source)
    expect(directions.value).toHaveLength(0)

    source.value = [{ _key: 0, text: 'Preheat oven' }]
    await flushPromises()
    expect(directions.value).toHaveLength(1)
    expect(directions.value[0].text).toBe('Preheat oven')
  })
})
