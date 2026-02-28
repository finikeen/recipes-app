<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  sourceUrl: {
    type: String,
    default: "",
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:sourceUrl", "data-scraped"]);

const localUrl = ref(props.sourceUrl);
const loading = ref(false);
const scrapeError = ref("");

const isReadonly = computed(() => !!(props.isEditing && props.sourceUrl));
const isButtonDisabled = computed(
  () => !localUrl.value?.trim() || isReadonly.value || loading.value,
);

const scrapeRecipe = async () => {
  scrapeError.value = "";
  if (!localUrl.value?.trim()) {
    scrapeError.value = "Please enter a URL";
    return;
  }

  loading.value = true;
  try {
    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: localUrl.value.trim() }),
    });

    const data = await response.json();

    if (!data.success) {
      scrapeError.value = data.failureReason || "Failed to scrape recipe";
      return;
    }

    emit("data-scraped", data.recipe);
    emit("update:sourceUrl", "");
    localUrl.value = "";
  } catch (err) {
    scrapeError.value =
      err.message || "An error occurred while scraping the URL";
  } finally {
    loading.value = false;
  }
};

const handleKeydown = (e) => {
  if (e.key === "Enter" && !isButtonDisabled.value) {
    scrapeRecipe();
  }
};
</script>

<template>
  <div class="recipe-source-url">
    <div class="recipe-source-url__field">
      <label class="recipe-source-url__label" for="source-url">
        Recipe Source URL (optional)
      </label>
      <div class="recipe-source-url__input-group">
        <InputText
          id="source-url"
          v-model="localUrl"
          :readonly="isReadonly"
          fluid
          placeholder="Paste a recipe URL to auto-fill form fields"
          :aria-describedby="scrapeError ? 'scrape-error' : undefined"
          :aria-invalid="!!scrapeError"
          @keydown="handleKeydown"
        />
        <button
          type="button"
          class="recipe-source-url__button forge__button"
          :disabled="isButtonDisabled"
          :aria-label="loading ? 'Scraping...' : 'Scrape recipe from URL'"
          @click="scrapeRecipe"
        >
          {{ loading ? "⟳ Scraping…" : "→ Scrape" }}
        </button>
      </div>
      <span
        v-if="scrapeError"
        id="scrape-error"
        class="recipe-source-url__error"
        role="alert"
      >
        {{ scrapeError }}
      </span>
      <p v-if="isReadonly" class="recipe-source-url__readonly-hint">
        This recipe was imported from a source. To change the source, create a
        new recipe.
      </p>
    </div>
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.recipe-source-url {
  @apply mb-5;
}

.recipe-source-url__field {
  @apply flex flex-col gap-1;
}

.recipe-source-url__label {
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  font-variant: small-caps;
}

.recipe-source-url__input-group {
  @apply flex gap-2 items-stretch;
}

.recipe-source-url__button {
  @apply px-4 py-2 shrink-0;
  font-weight: 600;
  white-space: nowrap;
}

.recipe-source-url__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recipe-source-url__error {
  color: #d97757;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.recipe-source-url__readonly-hint {
  color: var(--text-muted-color);
  font-size: 0.8125rem;
  margin-top: 0.5rem;
  font-style: italic;
}
</style>
