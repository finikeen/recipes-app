<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import NavLinks from "./NavLinks.vue";

const route = useRoute();
const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const handleEscapeKey = (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
};

const handleOverlayClick = () => {
  closeMenu();
};

watch(
  () => route.path,
  () => {
    closeMenu();
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscapeKey);
});
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
        <NavLinks @link-clicked="closeMenu" />
      </div>
      <button
        class="navbar__hamburger"
        :class="{ 'navbar__hamburger--open': menuOpen }"
        @click="toggleMenu"
        aria-label="Toggle navigation menu"
      >
        <span></span>
      </button>
    </div>

    <div
      v-show="menuOpen"
      class="navbar__overlay"
      @click="handleOverlayClick"
    ></div>

    <div v-show="menuOpen" class="navbar__mobile-menu">
      <NavLinks orientation="vertical" @link-clicked="closeMenu" />
    </div>
  </nav>
</template>

<style scoped>
@reference "../assets/main.css";

.navbar {
  background-color: var(--surface-0);
  position: relative;
  z-index: 100;
  overflow: visible;
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
  @apply text-xs pt-1 text-muted-color hidden md:block;
}

.navbar__links {
  @apply flex gap-6 ml-auto items-center hidden md:flex;
}

.navbar__hamburger {
  @apply flex md:hidden ml-auto relative cursor-pointer bg-transparent border-0 p-0 w-8 h-8 items-center justify-center;
  transition: all 200ms ease;
}

.navbar__hamburger:focus {
  outline: 2px solid var(--purple-accent);
  outline-offset: 4px;
  border-radius: 2px;
}

.navbar__hamburger > span,
.navbar__hamburger > span::before,
.navbar__hamburger > span::after {
  display: block;
  width: 24px;
  height: 2px;
  background-color: var(--primary-color);
  transition: all 250ms ease;
  border-radius: 1px;
}

.navbar__hamburger > span {
  position: relative;
}

.navbar__hamburger > span::before {
  content: "";
  position: absolute;
  top: -8px;
  left: 0;
}

.navbar__hamburger > span::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
}

.navbar__hamburger--open > span {
  background-color: transparent;
}

.navbar__hamburger--open > span::before {
  top: 0;
  transform: rotate(45deg);
}

.navbar__hamburger--open > span::after {
  bottom: 0;
  transform: rotate(-45deg);
}

.navbar__overlay {
  @apply fixed inset-0 md:hidden;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 101;
}

.navbar__mobile-menu {
  @apply fixed top-0 right-0 h-screen w-64 md:hidden overflow-y-auto;
  background-color: var(--surface-0);
  border-left: 1px solid var(--surface-border);
  transform: translateX(0);
  transition: transform 250ms ease;
  z-index: 102;
  padding: 1rem 0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
}
</style>
