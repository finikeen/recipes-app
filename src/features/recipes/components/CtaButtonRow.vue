<script setup>
import { useRouter } from "vue-router";

const emit = defineEmits(["reforge"]);
const router = useRouter();

const MEAL_BUTTONS = [
  {
    label: "Breakfast",
    icon: "🌅",
    tags: ["breakfast"],
    ariaLabel: "Browse Breakfast",
  },
  { label: "Lunch", icon: "☀️", tags: ["lunch"], ariaLabel: "Browse Lunch" },
  { label: "Dinner", icon: "🌙", tags: ["dinner"], ariaLabel: "Browse Dinner" },
  {
    label: "Special",
    icon: "✨",
    tags: ["vegan", "dairy-free", "vegetarian", "seafood"],
    ariaLabel: "Browse Special recipes",
  },
];

function browse(tags) {
  router.push({ name: "browse", query: { tags: tags.join(",") } });
}
</script>

<template>
  <nav class="cta-row" aria-label="Browse by meal type">
    <div class="cta-row__meal-group">
      <button
        v-for="btn in MEAL_BUTTONS"
        :key="btn.label"
        class="cta-row__btn"
        :aria-label="btn.ariaLabel"
        @click="browse(btn.tags)"
      >
        <span class="cta-row__icon" aria-hidden="true">{{ btn.icon }}</span>
        <span class="cta-row__label">{{ btn.label }}</span>
      </button>
    </div>
    <div class="cta-row__reforge-group">
      <button
        class="cta-row__btn cta-row__btn--reforge"
        aria-label="Reforge recipe"
        @click="emit('reforge')"
      >
        <span class="cta-row__icon" aria-hidden="true">🔥</span>
        <span class="cta-row__label">Reforge</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
@reference "../../../assets/main.css";

.cta-row {
  @apply flex flex-wrap justify-between gap-3 pb-6;
}

.cta-row__meal-group {
  @apply flex gap-4;
}

.cta-row__reforge-group {
  @apply flex justify-end;
}

.cta-row__btn {
  @apply inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold cursor-pointer transition-all;
  @apply w-11 h-11 p-0 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5;
  background-color: var(--surface-100);
  color: var(--text-color);
  border: 1px solid var(--surface-200);
}

.cta-row__btn:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 10px rgba(232, 160, 66, 0.25);
  color: var(--primary-color);
}

.cta-row__btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.cta-row__btn--reforge {
  border-color: rgba(232, 160, 66, 0.4);
  color: var(--primary-color);
}

.cta-row__btn--reforge:hover {
  background-color: rgba(232, 160, 66, 0.1);
  box-shadow: 0 0 14px rgba(232, 160, 66, 0.35);
}

.cta-row__icon {
  font-size: 1.125rem;
  line-height: 1;
}

.cta-row__label {
  @apply hidden sm:inline;
}
</style>
