<template>
  <div class="auth-view">
    <AuthenticationForm />
  </div>
</template>

<script setup>
import AuthenticationForm from "@/features/auth/components/AuthenticationForm.vue";
</script>

<style scoped>
@reference "../../../assets/main.css";

.auth-view {
  @apply flex items-center justify-center min-h-[60vh] px-4;
}
</style>
