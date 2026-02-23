<template>
  <Card
    class="recipe-card"
    :class="{ 'cursor-pointer': clickable }"
    data-test="card"
    @click="handleCardClick"
  >
    <template #title>
      <span data-test="title">{{ recipe.name ?? "Untitled Recipe" }}</span>
    </template>
    <template #content>
      <p
        data-test="description"
        class="recipe-card__description line-clamp-2 text-muted-color"
      >
        {{ displayDescription }}
      </p>
      <div
        v-if="displayTags.length"
        data-test="tags-container"
        class="recipe-card__tags"
      >
        <button
          v-for="(tag, index) in displayTags"
          :key="`${tag}-${index}`"
          data-test="tag"
          class="recipe-card__tag"
          :title="recipe.tags[index]"
          @click.stop="handleTagClick(recipe.tags[index])"
        >
          {{ tag }}
        </button>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from "vue";
import Card from "primevue/card";

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
  clickable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["click", "tag-click"]);

const displayDescription = computed(() => {
  return props.recipe.description?.trim()
    ? props.recipe.description
    : "No description provided";
});

const displayTags = computed(() => {
  const tags = props.recipe.tags ?? [];
  return tags.slice(0, 5).map((tag) => truncateTag(tag));
});

const truncateTag = (tag, maxLength = 15) => {
  return tag.length > maxLength ? tag.substring(0, maxLength) + "..." : tag;
};

const handleCardClick = () => {
  if (props.clickable) {
    emit("click");
  }
};

const handleTagClick = (tag) => {
  emit("tag-click", { tagName: tag });
};
</script>

<style scoped>
@reference "../../../assets/main.css";

.recipe-card {
  @apply transition-shadow duration-200;
}

.recipe-card:hover {
  @apply shadow-md;
}

.recipe-card__description {
  @apply text-sm text-muted-color m-0;
}

.recipe-card__tags {
  @apply flex flex-wrap gap-2 mt-4 pt-3 border-t border-surface;
}

.recipe-card__tag {
  @apply inline-flex items-center px-2 py-1 text-xs rounded transition-colors cursor-pointer;
  background-color: transparent;
  color: var(--purple-accent);
  border: 1px solid var(--purple-accent);
}

.recipe-card__tag:hover {
  background-color: rgba(139, 92, 246, 0.1);
  border-color: var(--purple-light);
  color: var(--purple-light);
}

.recipe-card__tag:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: 1px;
}

.recipe-card__tag:active {
  background-color: rgba(139, 92, 246, 0.15);
}
</style>
