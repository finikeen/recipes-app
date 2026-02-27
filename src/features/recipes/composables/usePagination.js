import { ref, computed, watch, toValue } from 'vue'

export function usePagination(itemsSource, { pageSize = 10 } = {}) {
  const currentPage = ref(0)

  const totalPages = computed(() =>
    Math.ceil(toValue(itemsSource).length / pageSize),
  )

  const paginatedItems = computed(() => {
    const start = currentPage.value * pageSize
    return toValue(itemsSource).slice(start, start + pageSize)
  })

  watch(
    () => toValue(itemsSource),
    () => {
      currentPage.value = 0
    },
  )

  return {
    currentPage,
    paginatedItems,
    totalPages,
  }
}
