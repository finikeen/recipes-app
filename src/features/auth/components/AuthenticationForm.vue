<script setup>
import { ref, computed } from "vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";

const props = defineProps({
  initialMode: {
    type: String,
    default: "login",
    validator: (v) => ["login", "signup"].includes(v),
  },
  error: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["submit"]);

const mode = ref(props.initialMode);
const email = ref("");
const password = ref("");

const isLogin = computed(() => mode.value === "login");

function toggleMode() {
  mode.value = isLogin.value ? "signup" : "login";
  email.value = "";
  password.value = "";
}

function handleSubmit() {
  emit("submit", {
    email: email.value,
    password: password.value,
    mode: mode.value,
  });
}
</script>

<template>
  <div class="auth-form">
    <h2 class="auth-form__title">{{ isLogin ? "Login" : "Sign Up" }}</h2>

    <form @submit.prevent="handleSubmit" class="auth-form__fields">
      <div class="auth-form__field">
        <label for="auth-email" class="auth-form__label">Email</label>
        <InputText
          id="auth-email"
          v-model="email"
          type="email"
          autocomplete="email"
          fluid
          aria-required="true"
          :aria-invalid="!!props.error || undefined"
          :aria-describedby="props.error ? 'auth-form-error' : undefined"
        />
      </div>

      <div class="auth-form__field">
        <label for="auth-password" class="auth-form__label">Password</label>
        <Password
          inputId="auth-password"
          v-model="password"
          :feedback="false"
          toggleMask
          fluid
          :inputProps="{
            'aria-required': 'true',
            'aria-invalid': props.error ? 'true' : undefined,
            'aria-describedby': props.error ? 'auth-form-error' : undefined,
          }"
        />
      </div>

      <p
        v-if="props.error"
        id="auth-form-error"
        class="auth-form__error"
        role="alert"
      >
        {{ props.error }}
      </p>

      <Button type="submit" :label="isLogin ? 'Login' : 'Sign Up'" fluid />
    </form>

    <p class="auth-form__toggle">
      {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
      <button type="button" class="auth-form__toggle-btn" @click="toggleMode">
        {{ isLogin ? "Sign Up" : "Login" }}
      </button>
    </p>
  </div>
</template>

<style scoped>
@reference "../../../assets/main.css";

.auth-form {
  @apply flex flex-col gap-6 w-full max-w-sm mx-auto;
}

.auth-form__title {
  @apply text-2xl font-bold text-color text-center;
}

.auth-form__fields {
  @apply flex flex-col gap-4;
}

.auth-form__field {
  @apply flex flex-col gap-1;
}

.auth-form__label {
  @apply text-sm font-medium text-color;
}

.auth-form__toggle {
  @apply text-sm text-muted-color text-center;
}

.auth-form__toggle-btn {
  @apply text-sm font-semibold text-color underline bg-transparent border-0 cursor-pointer p-0;
}

.auth-form__error {
  @apply text-sm text-red-500;
}
</style>
