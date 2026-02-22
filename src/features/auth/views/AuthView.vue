<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/store";
import AuthenticationForm from "@/features/auth/components/AuthenticationForm.vue";

const router = useRouter();
const authStore = useAuthStore();

const handleSubmit = async ({ email, password, mode }) => {
  try {
    if (mode === "login") {
      await authStore.signIn(email, password);
    } else {
      await authStore.signUp(email, password);
    }
    router.push({ name: "home" });
  } catch {
    // Error is captured in authStore.error — nothing else needed
  }
};
</script>

<template>
  <div class="auth-view">
    <AuthenticationForm @submit="handleSubmit" />
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.auth-view {
  @apply flex items-center justify-center min-h-[60vh] px-4;
}
</style>
