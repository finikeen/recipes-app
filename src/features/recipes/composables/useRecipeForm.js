import { ref, computed, onMounted, toValue } from 'vue'
import { useRecipesStore } from '@/features/recipes/store'
import { recipeService } from '@/features/recipes/services/recipeService'
import { useIngredients } from './useIngredients'
import { useDirections } from './useDirections'

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'with', 'of', 'to', 'in', 'for', 'on', 'at',
  'is', 'it', 'this', 'that', 'are', 'was', 'be', 'as', 'by', 'from', 'but',
  'not', 'so', 'if', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
])

export function useRecipeForm({ recipeId, onSuccess } = {}) {
  const store = useRecipesStore()

  const name = ref('')
  const description = ref('')
  const errors = ref({ name: '', description: '', ingredients: '', directions: '' })
  const submitting = ref(false)
  const loading = ref(false)
  const notFound = ref(false)
  const submitError = ref('')

  // Reactive sources fed by onMounted in edit mode
  const initIngredients = ref([])
  const initDirections = ref([])

  const { ingredients, addIngredient, removeIngredient, updateIngredient } =
    useIngredients(initIngredients)
  const { directions, addDirection, removeDirection, updateDirection, moveDirection } =
    useDirections(initDirections)

  const derivedTags = computed(() => {
    const text = [
      name.value,
      description.value,
      ...ingredients.value.map((i) => i.item),
    ].join(' ')

    const words = text.toLowerCase().split(/\W+/)
    const seen = new Set()
    const tags = []

    for (const word of words) {
      if (word.length >= 3 && !STOPWORDS.has(word) && !seen.has(word)) {
        seen.add(word)
        tags.push(word)
        if (tags.length >= 10) break
      }
    }

    return tags
  })

  const validate = () => {
    errors.value = { name: '', description: '', ingredients: '', directions: '' }
    let valid = true

    if (!name.value.trim()) {
      errors.value.name = 'Name is required'
      valid = false
    }
    if (!description.value.trim()) {
      errors.value.description = 'Description is required'
      valid = false
    }
    if (
      ingredients.value.length === 0 ||
      ingredients.value.every((i) => !i.item.trim())
    ) {
      errors.value.ingredients = 'At least one ingredient is required'
      valid = false
    }
    if (
      directions.value.length === 0 ||
      directions.value.every((d) => !d.text.trim())
    ) {
      errors.value.directions = 'At least one direction step is required'
      valid = false
    }

    return valid
  }

  const submitForm = async () => {
    submitError.value = ''
    if (!validate()) return

    submitting.value = true
    try {
      const formattedIngredients = ingredients.value.map((i) =>
        [i.quantity, i.unit, i.item].filter(Boolean).join(' '),
      )
      const payload = {
        name: name.value.trim(),
        description: description.value.trim(),
        tags: derivedTags.value,
        ingredients: formattedIngredients,
        directions: directions.value.map((d) => d.text),
      }

      const currentRecipeId = toValue(recipeId)
      let id
      if (currentRecipeId) {
        await store.updateRecipe(currentRecipeId, payload)
        id = currentRecipeId
      } else {
        const result = await store.addRecipe(payload)
        id = result.id
      }

      await recipeService.setIngredients(
        id,
        ingredients.value.map(({ quantity, unit, item }) => ({ quantity, unit, item })),
      )

      onSuccess?.(id)
    } catch (err) {
      submitError.value = err.message || 'An error occurred while saving the recipe.'
    } finally {
      submitting.value = false
    }
  }

  onMounted(async () => {
    const currentRecipeId = toValue(recipeId)
    if (!currentRecipeId) return

    loading.value = true
    try {
      const [recipe, fetchedIngredients] = await Promise.all([
        store.getRecipeById(currentRecipeId),
        recipeService.getIngredients(currentRecipeId),
      ])

      if (!recipe) {
        notFound.value = true
        return
      }

      name.value = recipe.name ?? ''
      description.value = recipe.description ?? ''

      initIngredients.value = fetchedIngredients.map(
        ({ id: ingId, quantity, unit, item }) => ({
          _key: ingId,
          quantity: quantity ?? '',
          unit: unit ?? '',
          item: item ?? '',
        }),
      )

      if (Array.isArray(recipe.directions)) {
        initDirections.value = recipe.directions.map((text, index) => ({
          _key: index,
          text,
        }))
      }
    } catch {
      notFound.value = true
    } finally {
      loading.value = false
    }
  })

  return {
    name,
    description,
    errors,
    submitError,
    derivedTags,
    ingredients,
    addIngredient,
    removeIngredient,
    updateIngredient,
    directions,
    addDirection,
    removeDirection,
    updateDirection,
    moveDirection,
    validate,
    submitForm,
    loading,
    submitting,
    notFound,
  }
}
