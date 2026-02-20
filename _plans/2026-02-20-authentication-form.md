# Authentication Form Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single `AuthenticationForm` component that toggles between login and signup modes, using PrimeVue inputs and accessible markup, and wire it to a `/auth` route.

**Architecture:** A self-contained `AuthenticationForm.vue` component inside `src/features/auth/components/` manages its own mode state (`login` | `signup`) and form field refs. It accepts an `initialMode` prop. A thin `AuthView.vue` wraps it and is registered at `/auth`. The navbar gets a "Sign In" link pointing to that route.

**Tech Stack:** Vue 3 Composition API (`<script setup>`), PrimeVue (`InputText`, `Password`, `Button`), Tailwind CSS v4 via `@apply`, PrimeVue semantic color tokens.

---

### Task 1: Create the AuthenticationForm component

**Files:**
- Create: `src/features/auth/components/AuthenticationForm.vue`

**Step 1: Create the file with the template skeleton**

```vue
<template>
  <div class="auth-form">
    <h2 class="auth-form__title">{{ isLogin ? 'Login' : 'Sign Up' }}</h2>

    <form @submit.prevent="handleSubmit" class="auth-form__fields" novalidate>
      <div class="auth-form__field">
        <label for="auth-email" class="auth-form__label">Email</label>
        <InputText
          id="auth-email"
          v-model="email"
          type="email"
          autocomplete="email"
          fluid
          aria-required="true"
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
          aria-required="true"
        />
      </div>

      <Button
        type="submit"
        :label="isLogin ? 'Login' : 'Sign Up'"
        fluid
      />
    </form>

    <p class="auth-form__toggle">
      {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
      <button type="button" class="auth-form__toggle-btn" @click="toggleMode">
        {{ isLogin ? 'Sign Up' : 'Login' }}
      </button>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const props = defineProps({
  initialMode: {
    type: String,
    default: 'login',
    validator: (v) => ['login', 'signup'].includes(v)
  }
})

const mode = ref(props.initialMode)
const email = ref('')
const password = ref('')

const isLogin = computed(() => mode.value === 'login')

function toggleMode() {
  mode.value = isLogin.value ? 'signup' : 'login'
  email.value = ''
  password.value = ''
}

function handleSubmit() {
  console.log(`[Auth] mode=${mode.value}`, { email: email.value, password: password.value })
}
</script>

<style scoped>
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
</style>
```

**Step 2: Verify the file was created**

Check `src/features/auth/components/AuthenticationForm.vue` exists.

**Step 3: Commit**

```bash
git add src/features/auth/components/AuthenticationForm.vue
git commit -m "feat: add AuthenticationForm component with login/signup toggle"
```

---

### Task 2: Create the AuthView wrapper

**Files:**
- Create: `src/features/auth/views/AuthView.vue`

**Step 1: Create the view**

```vue
<template>
  <div class="auth-view">
    <AuthenticationForm />
  </div>
</template>

<script setup>
import AuthenticationForm from '@/features/auth/components/AuthenticationForm.vue'
</script>

<style scoped>
.auth-view {
  @apply flex items-center justify-center min-h-[60vh] px-4;
}
</style>
```

**Step 2: Commit**

```bash
git add src/features/auth/views/AuthView.vue
git commit -m "feat: add AuthView wrapping AuthenticationForm"
```

---

### Task 3: Register the /auth route

**Files:**
- Modify: `src/router/index.js`

**Step 1: Add the import and route entry**

Add this import after the existing imports at the top:

```js
import AuthView from '@/features/auth/views/AuthView.vue'
```

Add this route entry inside the `routes` array, before the catch-all:

```js
{
  path: '/auth',
  name: 'auth',
  component: AuthView
},
```

**Step 2: Verify the full routes array looks like this**

```js
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/recipes/:id', name: 'recipe-detail', component: RecipeDetailView },
  { path: '/recipes/new', name: 'recipe-create', component: RecipeFormView },
  { path: '/recipes/:id/edit', name: 'recipe-edit', component: RecipeFormView },
  { path: '/auth', name: 'auth', component: AuthView },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') }
]
```

**Step 3: Commit**

```bash
git add src/router/index.js
git commit -m "feat: add /auth route for authentication view"
```

---

### Task 4: Add Sign In link to AppNavbar

**Files:**
- Modify: `src/components/AppNavbar.vue`

**Step 1: Add the RouterLink to the nav's right-side flex group**

Inside the `<div class="flex gap-4 ml-auto">`, add after the "New Recipe" link:

```html
<RouterLink
  :to="{ name: 'auth' }"
  class="text-muted-color hover:text-color transition-colors no-underline"
>
  Sign In
</RouterLink>
```

**Step 2: Verify the nav links section looks like this**

```html
<div class="flex gap-4 ml-auto">
  <RouterLink
    :to="{ name: 'home' }"
    class="text-muted-color hover:text-color transition-colors no-underline"
  >
    Browse
  </RouterLink>
  <RouterLink
    :to="{ name: 'recipe-create' }"
    class="text-muted-color hover:text-color transition-colors no-underline"
  >
    New Recipe
  </RouterLink>
  <RouterLink
    :to="{ name: 'auth' }"
    class="text-muted-color hover:text-color transition-colors no-underline"
  >
    Sign In
  </RouterLink>
</div>
```

**Step 3: Commit**

```bash
git add src/components/AppNavbar.vue
git commit -m "feat: add Sign In link to AppNavbar"
```

---

### Task 5: Manual smoke test

**Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser.

**Step 2: Verify Sign In link appears in navbar**

The navbar should show: Browse | New Recipe | Sign In

**Step 3: Navigate to /auth**

Click "Sign In" — should land on a centered form with title "Login", email field, password field with eye toggle, a "Login" submit button, and a "Don't have an account? Sign Up" toggle link.

**Step 4: Test password visibility toggle**

Click the eye icon on the password field — password text should become readable, icon changes state.

**Step 5: Test mode toggle**

Click "Sign Up" link — title changes to "Sign Up", button label changes to "Sign Up", fields clear, toggle text flips to "Already have an account? Login".

**Step 6: Test form submission (login mode)**

Type `test@example.com` in email, `secret123` in password, click "Login". Open browser devtools Console. Verify output:

```
[Auth] mode=login {email: 'test@example.com', password: 'secret123'}
```

**Step 7: Test form submission (signup mode)**

Toggle to signup, fill in the same values, click "Sign Up". Verify console:

```
[Auth] mode=signup {email: 'test@example.com', password: 'secret123'}
```

**Step 8: Test on narrow viewport**

Resize browser to 375px width. Form should remain readable, inputs full-width, no horizontal overflow.

---

> **Note:** No test framework is configured in this project yet. Once Vitest + Vue Test Utils are set up, add unit tests for `AuthenticationForm.vue` covering: mode toggle clears fields, `isLogin` computed, `handleSubmit` console output, and password visibility (via PrimeVue Password `toggleMask` behavior).
