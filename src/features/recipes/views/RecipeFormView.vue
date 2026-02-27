<script setup>
/*
 * TODO: a new component w/ 2 items:
 *  1. an optional textfield for sourceUrl
 *  2. a button
 *  if sourceUrl exists in Recipe, the textfield is readonly and the button is disabled
 *  if not, see @/server for scraping process, scrape sourceUrl and fill in form fields
 */
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Skeleton from 'primevue/skeleton';
import { useRecipesStore } from '@/features/recipes/store';
import { recipeService } from '@/features/recipes/services/recipeService';

const route = useRoute();
const router = useRouter();
const store = useRecipesStore();

const name = ref('');
const description = ref('');
const ingredients = ref([]);
const directions = ref([]);
const errors = ref({
  name: '',
  description: '',
  ingredients: '',
  directions: '',
});
const submitting = ref(false);
const loading = ref(false);
const notFound = ref(false);
const submitError = ref('');

const isEdit = computed(() => route.name === 'recipe-edit');

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'with',
  'of',
  'to',
  'in',
  'for',
  'on',
  'at',
  'is',
  'it',
  'this',
  'that',
  'are',
  'was',
  'be',
  'as',
  'by',
  'from',
  'but',
  'not',
  'so',
  'if',
  'my',
  'your',
  'his',
  'her',
  'its',
  'our',
  'their',
]);

const derivedTags = computed(() => {
  const text = [name.value, description.value, ...ingredients.value.map((i) => i.item)].join(' ');

  const words = text.toLowerCase().split(/\W+/);
  const seen = new Set();
  const tags = [];

  for (const word of words) {
    if (word.length >= 3 && !STOPWORDS.has(word) && !seen.has(word)) {
      seen.add(word);
      tags.push(word);
      if (tags.length >= 10) break;
    }
  }

  return tags;
});

const addIngredient = () => {
  ingredients.value.push({
    _key: Date.now(),
    quantity: '',
    unit: '',
    item: '',
  });
};

const removeIngredient = (key) => {
  ingredients.value = ingredients.value.filter((i) => i._key !== key);
};

const addDirection = () => {
  directions.value.push({ _key: Date.now(), text: '' });
};

const removeDirection = (key) => {
  directions.value = directions.value.filter((d) => d._key !== key);
};

const moveDirection = (index, delta) => {
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex >= directions.value.length) return;
  const arr = [...directions.value];
  [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
  directions.value = arr;
};

const validate = () => {
  errors.value = { name: '', description: '', ingredients: '', directions: '' };
  let valid = true;

  if (!name.value.trim()) {
    errors.value.name = 'Name is required';
    valid = false;
  }
  if (!description.value.trim()) {
    errors.value.description = 'Description is required';
    valid = false;
  }
  if (ingredients.value.length === 0 || ingredients.value.every((i) => !i.item.trim())) {
    errors.value.ingredients = 'At least one ingredient is required';
    valid = false;
  }
  if (directions.value.length === 0 || directions.value.every((d) => !d.text.trim())) {
    errors.value.directions = 'At least one direction step is required';
    valid = false;
  }

  return valid;
};

const handleSubmit = async () => {
  submitError.value = '';
  if (!validate()) return;

  submitting.value = true;
  try {
    const formattedIngredients = ingredients.value.map((i) => [i.quantity, i.unit, i.item].filter(Boolean).join(' '));
    const payload = {
      name: name.value.trim(),
      description: description.value.trim(),
      tags: derivedTags.value,
      ingredients: formattedIngredients,
      directions: directions.value.map((d) => d.text),
    };

    let id;
    if (isEdit.value) {
      await store.updateRecipe(route.params.id, payload);
      id = route.params.id;
    } else {
      const result = await store.addRecipe(payload);
      id = result.id;
    }

    await recipeService.setIngredients(
      id,
      ingredients.value.map(({ quantity, unit, item }) => ({
        quantity,
        unit,
        item,
      })),
    );

    router.push({ name: 'recipe-detail', params: { id } });
  } catch (err) {
    submitError.value = err.message || 'An error occurred while saving the recipe.';
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  if (isEdit.value) {
    router.push({ name: 'recipe-detail', params: { id: route.params.id } });
  } else {
    router.push({ name: 'home' });
  }
};

onMounted(async () => {
  if (!isEdit.value) return;

  loading.value = true;
  try {
    const id = route.params.id;
    const [recipe, fetchedIngredients] = await Promise.all([store.getRecipeById(id), recipeService.getIngredients(id)]);

    if (!recipe) {
      notFound.value = true;
      return;
    }

    name.value = recipe.name ?? '';
    description.value = recipe.description ?? '';

    ingredients.value = fetchedIngredients.map(({ id: ingId, quantity, unit, item }) => ({
      _key: ingId,
      quantity: quantity ?? '',
      unit: unit ?? '',
      item: item ?? '',
    }));

    if (Array.isArray(recipe.directions)) {
      directions.value = recipe.directions.map((text, index) => ({
        _key: index,
        text,
      }));
    }
  } catch {
    notFound.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="rform">
    <RouterLink :to="isEdit ? { name: 'recipe-detail', params: { id: route.params.id } } : { name: 'home' }" class="rform__back forge__link">
      ← Back
    </RouterLink>

    <!-- Not found (edit mode only) -->
    <div v-if="notFound" class="rform__not-found">
      <p class="rform__not-found-msg">Recipe not found.</p>
      <RouterLink :to="{ name: 'home' }" class="forge__link">← Back to Home</RouterLink>
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="loading" class="rform__card forge__card forge__runic-border forge__texture-stone">
      <Skeleton width="40%" height="2rem" class="rform__skeleton-row" />
      <Skeleton width="100%" height="1rem" class="rform__skeleton-row" />
      <Skeleton width="100%" height="5rem" class="rform__skeleton-row" />
      <Skeleton width="60%" height="1rem" class="rform__skeleton-row" />
      <Skeleton width="80%" height="1rem" class="rform__skeleton-row" />
      <Skeleton width="70%" height="1rem" class="rform__skeleton-row" />
    </div>

    <!-- Form -->
    <form v-else class="rform__card forge__card forge__runic-border forge__texture-stone" @submit.prevent="handleSubmit" novalidate>
      <h1 class="rform__title">{{ isEdit ? 'Edit Recipe' : 'New Recipe' }}</h1>

      <p v-if="submitError" class="rform__submit-error" role="alert">
        {{ submitError }}
      </p>

      <!-- Name -->
      <div class="rform__field">
        <label class="rform__label" for="recipe-name">Name *</label>
        <InputText
          id="recipe-name"
          v-model="name"
          fluid
          placeholder="Recipe name"
          :aria-describedby="errors.name ? 'name-error' : undefined"
          :aria-invalid="!!errors.name"
        />
        <span v-if="errors.name" id="name-error" class="rform__error" role="alert">{{ errors.name }}</span>
      </div>

      <!-- Description -->
      <div class="rform__field">
        <label class="rform__label" for="recipe-desc">Description *</label>
        <Textarea
          id="recipe-desc"
          v-model="description"
          rows="3"
          fluid
          placeholder="A short description of the recipe"
          :aria-describedby="errors.description ? 'desc-error' : undefined"
          :aria-invalid="!!errors.description"
        />
        <span v-if="errors.description" id="desc-error" class="rform__error" role="alert">{{ errors.description }}</span>
      </div>

      <!-- Ingredients builder -->
      <fieldset class="rform__section" aria-label="Ingredients">
        <legend class="rform__section-title">Ingredients</legend>
        <div v-for="ing in ingredients" :key="ing._key" class="rform__ingredient-row">
          <InputText v-model="ing.quantity" placeholder="Qty" aria-label="Quantity" />
          <InputText v-model="ing.unit" placeholder="Unit" aria-label="Unit" />
          <InputText v-model="ing.item" placeholder="Ingredient *" aria-label="Item" class="rform__ingredient-item" />
          <button type="button" class="forge__button rform__remove-btn" @click="removeIngredient(ing._key)" :aria-label="`Remove ingredient ${ing.item || ''}`">
            ×
          </button>
        </div>
        <button type="button" class="forge__button rform__add-btn" @click="addIngredient">+ Add ingredient</button>
        <span v-if="errors.ingredients" class="rform__error" role="alert">{{ errors.ingredients }}</span>
      </fieldset>

      <!-- Directions builder -->
      <fieldset class="rform__section" aria-label="Directions">
        <legend class="rform__section-title">Directions</legend>
        <div v-for="(dir, index) in directions" :key="dir._key" class="rform__direction-row">
          <span class="rform__step-num" aria-hidden="true">{{ index + 1 }}.</span>
          <InputText v-model="dir.text" placeholder="Describe this step…" class="rform__direction-input" :aria-label="`Step ${index + 1}`" />
          <div class="rform__direction-controls">
            <button type="button" class="forge__button rform__remove-btn" @click="moveDirection(index, -1)" :disabled="index === 0" aria-label="Move step up">
              ↑
            </button>
            <button
              type="button"
              class="forge__button rform__remove-btn"
              @click="moveDirection(index, 1)"
              :disabled="index === directions.length - 1"
              aria-label="Move step down"
            >
              ↓
            </button>
            <button type="button" class="forge__button rform__remove-btn" @click="removeDirection(dir._key)" :aria-label="`Remove step ${index + 1}`">×</button>
          </div>
        </div>
        <button type="button" class="forge__button rform__add-btn" @click="addDirection">+ Add step</button>
        <span v-if="errors.directions" class="rform__error" role="alert">{{ errors.directions }}</span>
      </fieldset>

      <!-- Tags preview -->
      <div v-if="derivedTags.length" class="rform__section rform__tags-section">
        <p class="rform__section-title">Derived Tags</p>
        <div class="rform__tags">
          <span v-for="tag in derivedTags" :key="tag" class="forge__tag">{{ tag }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="rform__actions">
        <button type="submit" class="forge__button forge__button-primary" :disabled="submitting">
          {{ submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Recipe' }}
        </button>
        <button type="button" class="forge__button" @click="handleCancel" :disabled="submitting">Cancel</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.rform {
  @apply w-full;
}

.rform__back {
  @apply inline-block mb-4 text-sm;
}

.rform__not-found {
  @apply text-center py-12;
}

.rform__not-found-msg {
  @apply text-muted-color mb-4;
}

.rform__skeleton-row {
  @apply block mb-3;
}

/* Suppress forge__card hover lift on a full-page form card */
.rform__card:hover {
  transform: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

.rform__card {
  @apply w-full;
  padding: 1.5rem;
}

.rform__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
  text-shadow:
    0 0 16px rgba(232, 160, 66, 0.5),
    0 0 32px rgba(232, 160, 66, 0.2);
  margin: 0 0 1.5rem;
}

.rform__submit-error {
  color: #d97757;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.rform__field {
  @apply flex flex-col gap-1 mb-5;
}

.rform__label {
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  font-variant: small-caps;
}

.rform__error {
  color: #d97757;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.rform__section {
  border: none;
  padding: 0;
  margin: 0 0 1.5rem;
}

.rform__section-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: 0.06em;
  font-variant: small-caps;
  margin: 0 0 0.75rem;
  border-bottom: 1px solid var(--surface-100);
  padding-bottom: 0.5rem;
}

/* Ingredient row */
.rform__ingredient-row {
  @apply flex items-center gap-2 mb-2 flex-wrap;
}

@media (min-width: 640px) {
  .rform__ingredient-row {
    flex-wrap: nowrap;
  }
}

.rform__ingredient-item {
  flex: 1;
  min-width: 0;
}

/* Direction row */
.rform__direction-row {
  @apply flex items-center gap-2 mb-2;
}

.rform__direction-input {
  flex: 1;
  min-width: 0;
}

.rform__step-num {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 1.5rem;
  flex-shrink: 0;
}

.rform__direction-controls {
  @apply flex gap-1 shrink-0;
}

/* Compact remove/reorder buttons */
.rform__remove-btn {
  padding: 0.375rem 0.625rem;
  font-size: 1rem;
  line-height: 1;
}

/* Add buttons */
.rform__add-btn {
  @apply mt-2;
  width: 100%;
}

@media (min-width: 640px) {
  .rform__add-btn {
    width: auto;
  }
}

/* Tags */
.rform__tags {
  @apply flex flex-wrap gap-2;
}

/* Actions */
.rform__actions {
  @apply flex gap-3 mt-2 justify-end;
}

@media (max-width: 639px) {
  .rform__actions {
    @apply flex-col;
  }
}
</style>
