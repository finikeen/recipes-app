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
  @apply bg-surface-0 border-b border-surface px-6 py-3 flex items-center gap-6;
}

.navbar__brand {
  @apply text-xl font-bold text-color no-underline;
}

.navbar__links {
  @apply flex gap-4 ml-auto;
}

.navbar__link {
  @apply text-muted-color hover:text-color transition-colors no-underline;
}

.navbar__link--button {
  @apply bg-transparent border-0 cursor-pointer p-0;
}
</style>
