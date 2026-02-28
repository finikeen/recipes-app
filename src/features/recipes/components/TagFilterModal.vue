<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  visible: Boolean,
  tags: {
    type: Array,
    default: () => [],
  },
  activeTagFilters: {
    type: Object,
    default: () => new Set(),
  },
});

const emit = defineEmits(["update:visible", "toggle-tag", "clear-all"]);

const searchQuery = ref("");

const filteredTags = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.tags;
  return props.tags.filter((t) => t.toLowerCase().includes(q));
});

const selectedCount = computed(() => props.activeTagFilters.size);
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    header="Filter by Tag"
    :modal="true"
    :dismissableMask="true"
    :draggable="false"
    class="tag-modal"
  >
    <div class="tag-modal__search">
      <InputText
        v-model="searchQuery"
        placeholder="Search tags..."
        aria-label="Search tags"
        class="tag-modal__search-input"
      />
    </div>

    <div class="tag-modal__chips">
      <button
        v-for="tag in filteredTags"
        :key="tag"
        class="browse__filter-chip"
        :class="{ 'browse__filter-chip--active': activeTagFilters.has(tag) }"
        :aria-pressed="activeTagFilters.has(tag)"
        @click="emit('toggle-tag', tag)"
      >
        {{ tag }}
      </button>
      <p v-if="filteredTags.length === 0" class="tag-modal__empty">
        No tags match your search.
      </p>
    </div>

    <template #footer>
      <div class="tag-modal__footer">
        <span class="tag-modal__count">{{ selectedCount }} selected</span>
        <button
          v-if="selectedCount > 0"
          class="tag-modal__clear"
          @click="emit('clear-all')"
        >
          Clear all
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
@reference "../../../assets/main.css";

.tag-modal__search {
  @apply mb-4;
}

.tag-modal__search-input {
  @apply w-full;
}

.tag-modal__chips {
  @apply flex flex-wrap gap-2;
  max-height: 340px;
  overflow-y: auto;
}

.tag-modal__empty {
  @apply text-muted-color text-sm;
}

.browse__filter-chip {
  @apply inline-flex items-center px-2 py-1 text-xs rounded transition-colors cursor-pointer;
  background-color: transparent;
  color: var(--purple-accent);
  border: 1px solid var(--purple-accent);
}

.browse__filter-chip:hover {
  background-color: rgba(139, 92, 246, 0.1);
}

.browse__filter-chip--active {
  background-color: var(--purple-accent);
  color: #0a0812;
}

.browse__filter-chip--active:hover {
  background-color: var(--purple-light, #a78bfa);
  border-color: var(--purple-light, #a78bfa);
}

.tag-modal__footer {
  @apply flex items-center justify-between w-full;
}

.tag-modal__count {
  @apply text-sm;
  color: var(--text-muted-color);
}

.tag-modal__clear {
  @apply text-xs cursor-pointer p-0;
  background: none;
  border: none;
  color: var(--text-muted-color);
  text-decoration: underline;
}

.tag-modal__clear:hover {
  color: var(--purple-accent);
}
</style>
