import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { usePagination } from '@/features/recipes/composables/usePagination'

describe('usePagination', () => {
  const makeItems = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }))

  it('returns first page slice by default', () => {
    const items = ref(makeItems(25))
    const { paginatedItems } = usePagination(items, { pageSize: 10 })
    expect(paginatedItems.value).toHaveLength(10)
    expect(paginatedItems.value[0].id).toBe(1)
  })

  it('returns correct slice for page 2', () => {
    const items = ref(makeItems(25))
    const { paginatedItems, currentPage } = usePagination(items, { pageSize: 10 })
    currentPage.value = 1
    expect(paginatedItems.value).toHaveLength(10)
    expect(paginatedItems.value[0].id).toBe(11)
  })

  it('calculates totalPages correctly for evenly divisible count', () => {
    const items = ref(makeItems(20))
    const { totalPages } = usePagination(items, { pageSize: 10 })
    expect(totalPages.value).toBe(2)
  })

  it('totalPages rounds up for partial last page', () => {
    const items = ref(makeItems(21))
    const { totalPages } = usePagination(items, { pageSize: 10 })
    expect(totalPages.value).toBe(3)
  })

  it('resets to page 0 when items change', async () => {
    const items = ref(makeItems(25))
    const { currentPage } = usePagination(items, { pageSize: 10 })
    currentPage.value = 2
    items.value = makeItems(5)
    await flushPromises()
    expect(currentPage.value).toBe(0)
  })

  it('handles empty items array', () => {
    const items = ref([])
    const { paginatedItems, totalPages } = usePagination(items, { pageSize: 10 })
    expect(paginatedItems.value).toEqual([])
    expect(totalPages.value).toBe(0)
  })
})
