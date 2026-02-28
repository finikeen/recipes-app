import { ref, watch, readonly, isRef, toValue } from 'vue'

const isFunction = (v) => typeof v === 'function'

function mapDirection(dir, i) {
  return {
    _key: dir._key ?? i,
    text: dir.text ?? '',
  }
}

export function useDirections(initialValue = []) {
  const isStaticArray = !isRef(initialValue) && !isFunction(initialValue) && Array.isArray(initialValue)

  const directions = ref(isStaticArray ? toValue(initialValue).map(mapDirection) : [])

  // If initialValue is reactive (ref or getter), populate once when data arrives
  if (!isStaticArray) {
    const stop = watch(
      () => toValue(initialValue),
      (items) => {
        if (items?.length > 0) {
          directions.value = items.map(mapDirection)
          stop()
        }
      },
      { immediate: true },
    )
  }

  const addDirection = () => {
    directions.value = [
      ...directions.value,
      { _key: String(Date.now()), text: '' },
    ]
  }

  const removeDirection = (index) => {
    directions.value = directions.value.filter((_, i) => i !== index)
  }

  const updateDirection = (index, value) => {
    const arr = [...directions.value]
    arr[index] = { ...arr[index], ...value }
    directions.value = arr
  }

  const moveDirection = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= directions.value.length) return
    const arr = [...directions.value]
    ;[arr[fromIndex], arr[toIndex]] = [arr[toIndex], arr[fromIndex]]
    directions.value = arr
  }

  const reset = (items = []) => {
    directions.value = items.length > 0 ? items.map(mapDirection) : []
  }

  return {
    directions: readonly(directions),
    addDirection,
    removeDirection,
    updateDirection,
    moveDirection,
    reset,
  }
}
