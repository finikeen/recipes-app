<script setup>
import { useAuthStore } from "@/features/auth/store";
import { useRouter } from "vue-router";

defineProps({
  orientation: {
    type: String,
    default: "horizontal",
    validator: (value) => ["horizontal", "vertical"].includes(value),
  },
});

const emit = defineEmits(["link-clicked"]);

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "auth" });
  emit("link-clicked");
};
</script>

<template>
  <div
    class="nav-links"
    :class="{ 'nav-links--vertical': orientation === 'vertical' }"
  >
    <RouterLink
      :to="{ name: 'browse' }"
      class="nav-links__item forge__link"
      @click="$emit('link-clicked')"
    >
      Browse
    </RouterLink>
    <RouterLink
      :to="{ name: 'recipe-create' }"
      class="nav-links__item forge__link"
      @click="$emit('link-clicked')"
    >
      New Recipe
    </RouterLink>
    <button
      v-if="authStore.isAuthenticated"
      class="nav-links__item nav-links__item--button forge__link"
      @click="handleLogout"
    >
      Sign Out
    </button>
    <RouterLink
      v-else
      :to="{ name: 'auth' }"
      class="nav-links__item forge__link"
      @click="$emit('link-clicked')"
    >
      Sign In
    </RouterLink>
  </div>
</template>

<style scoped>
@reference "../assets/main.css";

.nav-links {
  @apply flex gap-6 items-center;
}

.nav-links--vertical {
  @apply flex flex-col gap-4 w-full;
}

.nav-links__item {
  @apply text-color no-underline cursor-pointer transition-all duration-200;
}

.nav-links__item:hover {
  color: var(--primary-color);
}

.nav-links__item:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: 4px;
  border-radius: 2px;
}

.nav-links__item--button {
  @apply bg-transparent border-0 p-0;
  font-family: inherit;
}

.nav-links--vertical .nav-links__item {
  @apply w-full py-3 px-4 justify-start;
}
</style>
