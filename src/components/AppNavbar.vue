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
  <nav class="navbar forge__texture-metal">
    <div class="navbar__inner container">
      <RouterLink :to="{ name: 'home' }" class="navbar__brand forge__brand">
        Recipe Forge
      </RouterLink>
      <span class="navbar__tagline">
        Craft and refine your recipes. Build a collection that's completely
        unique to you.
      </span>
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
    </div>
  </nav>
</template>

<style scoped>
@reference "../assets/main.css";

.navbar {
  background-color: var(--surface-0);
  position: relative;
  z-index: 10000;
  overflow: hidden;
  background-image: url("../assets/textures/stone-blocks.svg");
  background-size: 64px 64px;
  background-repeat: repeat-x;
}

.navbar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-image: url("../assets/textures/runic-border.svg");
  background-size: 256px 4px;
  background-repeat: repeat-x;
  opacity: 0.7;
  z-index: 3;
}

.navbar__inner {
  @apply px-6 py-4 flex items-center gap-6 relative z-2 mx-auto;
  background-image: url("../assets/textures/stone-blocks.svg");
  background-size: 64px 64px;
  background-repeat: repeat-x;
}

.navbar__brand {
  @apply text-xl font-bold no-underline;
  color: var(--primary-color);
  letter-spacing: 0.5px;
}

.navbar__tagline {
  @apply text-xs pt-1 text-muted-color;
}

.navbar__links {
  @apply flex gap-6 ml-auto items-center;
}

.navbar__link {
  color: var(--text-color-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 200ms ease;
}

.navbar__link:hover {
  color: var(--purple-accent);
  border-bottom-color: var(--purple-accent);
}

.navbar__link.router-link-active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.navbar__link:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: 4px;
  border-radius: 2px;
}

.navbar__link--button {
  @apply bg-transparent border-0 cursor-pointer p-0;
  font-family: inherit;
}
</style>
