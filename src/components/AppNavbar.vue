<script setup>
import { useAuthStore } from "@/features/auth/store";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "auth" });
};
</script>

<template>
  <nav class="navbar">
    <RouterLink :to="{ name: 'home' }" class="navbar__brand forge__brand">
      Recipe Forge
    </RouterLink>
    <div class="navbar__links">
      <RouterLink :to="{ name: 'browse' }" class="navbar__link forge__link">
        Browse
      </RouterLink>
      <RouterLink
        :to="{ name: 'recipe-create' }"
        class="navbar__link forge__link"
      >
        New Recipe
      </RouterLink>
      <button
        v-if="authStore.isAuthenticated"
        class="navbar__link navbar__link--button forge__link"
        @click="handleLogout"
      >
        Sign Out
      </button>
      <RouterLink
        v-else
        :to="{ name: 'auth' }"
        class="navbar__link forge__link"
      >
        Sign In
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
@reference "../assets/main.css";

.navbar {
  background-color: var(--surface-0);
  border-bottom: 1px solid var(--surface-border);
  @apply px-6 py-4 flex items-center gap-6 relative z-10;
}

.navbar__brand {
  @apply text-xl font-bold no-underline;
  color: var(--primary-color);
  letter-spacing: 0.5px;
  transition: all 200ms ease;
}

.navbar__brand:hover {
  text-shadow: 0 0 12px rgba(232, 160, 66, 0.6);
}

.navbar__links {
  @apply flex gap-6 ml-auto items-center;
}

.navbar__link {
  color: var(--text-color-secondary);
  @apply no-underline transition-all duration-200 ease;
  border-bottom: 2px solid transparent;
}

.navbar__link:hover {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.navbar__link:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 4px;
  border-radius: 2px;
}

.navbar__link--button {
  @apply bg-transparent border-0 cursor-pointer p-0 font-inherit;
}
</style>
