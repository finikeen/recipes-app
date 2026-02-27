import { ref, watch, readonly, isRef, toValue } from 'vue'

const isFunction = (v) => typeof v === 'function'

function mapIngredient(ing) {
  return {
    _key: ing._key ?? String(Date.now() + Math.random()),
    quantity: ing.quantity ?? '',
    unit: ing.unit ?? '',
    item: ing.item ?? '',
  }
}

export function useIngredients(initialValue = []) {
  const isStaticArray = !isRef(initialValue) && !isFunction(initialValue) && Array.isArray(initialValue)

  const ingredients = ref(isStaticArray ? toValue(initialValue).map(mapIngredient) : [])

  // If initialValue is reactive (ref or getter), populate once when data arrives
  if (!isStaticArray) {
    const stop = watch(
      () => toValue(initialValue),
      (items) => {
        if (items?.length > 0) {
          ingredients.value = items.map(mapIngredient)
          stop()
        }
      },
      { immediate: true },
    )
  }

  const addIngredient = () => {
    ingredients.value = [
      ...ingredients.value,
      { _key: String(Date.now()), quantity: '', unit: '', item: '' },
    ]
  }

  const removeIngredient = (index) => {
    ingredients.value = ingredients.value.filter((_, i) => i !== index)
  }

  const updateIngredient = (index, value) => {
    const arr = [...ingredients.value]
    arr[index] = { ...arr[index], ...value }
    ingredients.value = arr
  }

  return {
    ingredients: readonly(ingredients),
    addIngredient,
    removeIngredient,
    updateIngredient,
  }
}
