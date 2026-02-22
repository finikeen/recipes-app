# Firebase Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Firebase Authentication and Firestore to provide cloud-based user accounts and real-time recipe persistence.

**Architecture:**
Firebase will be initialized in a dedicated composable that handles auth state and Firestore listeners. Auth state feeds into a new Pinia auth store. Recipe operations (CRUD) will be abstracted into service functions that interface with Firestore, allowing Pinia and UI components to remain decoupled from Firebase. Offline persistence will be enabled automatically via Firebase SDK settings.

**Tech Stack:**
Firebase SDK (firebase ^11.0.0), Vue 3 Composition API, Pinia, Firestore, Firebase Authentication

---

## Task 1: Install Firebase SDK and Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Firebase SDK**

Run: `npm install firebase`

Expected output: Firebase SDK added to package.json and node_modules.

**Step 2: Verify installation**

Run: `npm list firebase`

Expected: Package listed with version ^11.0.0 or later.

---

## Task 2: Create Environment Configuration Setup

**Files:**
- Create: `.env.example`
- Create: `.env.local` (not committed)
- Modify: `.gitignore`

**Step 1: Create .env.example with Firebase credentials template**

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Step 2: Create .env.local with actual credentials (developer fills this in locally)**

Copy `.env.example` to `.env.local` and populate with real Firebase project credentials.

**Step 3: Update .gitignore to exclude .env.local**

Add to `.gitignore`:
```
.env.local
.env.*.local
```

**Step 4: Verify Vite will read environment variables**

Confirm that `import.meta.env.VITE_*` will be available in code (Vite default behavior).

---

## Task 3: Create Firebase Initialization Module

**Files:**
- Create: `src/services/firebase.js`

**Step 1: Write the Firebase initialization module**

```javascript
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Enable offline persistence for Firestore
import { enableIndexedDbPersistence } from 'firebase/firestore'
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence failed: multiple tabs open')
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser')
  }
})

export { auth, db, storage }
```

**Step 2: Verify exports are correct**

Confirm that `auth`, `db`, and `storage` are exported as named exports.

---

## Task 4: Create Authentication Store (Pinia)

**Files:**
- Create: `src/features/auth/store.js`

**Step 1: Create the auth store with composition API**

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/services/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  const signUp = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    error.value = null
    try {
      await signOut(auth)
      user.value = null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const initializeAuthListener = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser
        resolve()
      })
    })
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signUp,
    signIn,
    logout,
    initializeAuthListener
  }
})
```

**Step 2: Verify store structure**

Confirm all actions (signUp, signIn, logout) are async and handle errors.

---

## Task 5: Initialize Auth Listener in App Startup

**Files:**
- Modify: `src/main.js`

**Step 1: Update main.js to initialize auth listener before mounting app**

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import router from './router/index.js'
import App from './App.vue'
import './assets/main.css'
import { useAuthStore } from './features/auth/store.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark'
    }
  }
})

// Initialize Firebase auth listener before mounting
const authStore = useAuthStore()
authStore.initializeAuthListener().then(() => {
  app.mount('#app')
})
```

**Step 2: Verify app waits for auth initialization**

Confirm the app only mounts after `initializeAuthListener()` resolves.

---

## Task 6: Create Recipe Service for Firestore Operations

**Files:**
- Create: `src/features/recipes/services/recipeService.js`

**Step 1: Create recipe service with CRUD operations**

```javascript
import { db } from '@/services/firebase'
import { auth } from '@/services/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  timestamp
} from 'firebase/firestore'

const recipesCollection = 'recipes'

export const recipeService = {
  async addRecipe(recipeData) {
    if (!auth.currentUser) throw new Error('User not authenticated')

    try {
      const docRef = await addDoc(collection(db, recipesCollection), {
        ...recipeData,
        userId: auth.currentUser.uid,
        createdAt: timestamp.now(),
        updatedAt: timestamp.now()
      })
      return { id: docRef.id, ...recipeData }
    } catch (err) {
      throw new Error(`Failed to add recipe: ${err.message}`)
    }
  },

  async updateRecipe(recipeId, updates) {
    if (!auth.currentUser) throw new Error('User not authenticated')

    try {
      const recipeRef = doc(db, recipesCollection, recipeId)
      await updateDoc(recipeRef, {
        ...updates,
        updatedAt: timestamp.now()
      })
      return { id: recipeId, ...updates }
    } catch (err) {
      throw new Error(`Failed to update recipe: ${err.message}`)
    }
  },

  async deleteRecipe(recipeId) {
    if (!auth.currentUser) throw new Error('User not authenticated')

    try {
      await deleteDoc(doc(db, recipesCollection, recipeId))
    } catch (err) {
      throw new Error(`Failed to delete recipe: ${err.message}`)
    }
  },

  async getRecipeById(recipeId) {
    try {
      const docRef = doc(db, recipesCollection, recipeId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
    } catch (err) {
      throw new Error(`Failed to fetch recipe: ${err.message}`)
    }
  },

  async getUserRecipes() {
    if (!auth.currentUser) throw new Error('User not authenticated')

    try {
      const q = query(
        collection(db, recipesCollection),
        where('userId', '==', auth.currentUser.uid)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err) {
      throw new Error(`Failed to fetch recipes: ${err.message}`)
    }
  }
}
```

**Step 2: Verify all CRUD operations handle errors**

Confirm each function throws descriptive errors on failure.

---

## Task 7: Update Recipes Store to Use Firestore Service

**Files:**
- Modify: `src/features/recipes/store.js`

**Step 1: Enhance recipes store with Firestore integration**

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recipeService } from './services/recipeService'

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const addRecipe = async (recipeData) => {
    loading.value = true
    error.value = null
    try {
      const newRecipe = await recipeService.addRecipe(recipeData)
      recipes.value.push(newRecipe)
      return newRecipe
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRecipe = async (recipeId, updates) => {
    loading.value = true
    error.value = null
    try {
      const updated = await recipeService.updateRecipe(recipeId, updates)
      const index = recipes.value.findIndex(r => r.id === recipeId)
      if (index !== -1) {
        recipes.value[index] = { ...recipes.value[index], ...updated }
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRecipe = async (recipeId) => {
    loading.value = true
    error.value = null
    try {
      await recipeService.deleteRecipe(recipeId)
      recipes.value = recipes.value.filter(r => r.id !== recipeId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadUserRecipes = async () => {
    loading.value = true
    error.value = null
    try {
      recipes.value = await recipeService.getUserRecipes()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getRecipeById = async (recipeId) => {
    loading.value = true
    error.value = null
    try {
      return await recipeService.getRecipeById(recipeId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    loadUserRecipes,
    getRecipeById
  }
})
```

**Step 2: Verify store methods handle loading and error states**

Confirm `loading` and `error` refs are properly managed.

---

## Task 8: Update HomeView to Load User Recipes on Auth

**Files:**
- Modify: `src/features/recipes/views/HomeView.vue`

**Step 1: Check current HomeView implementation**

Read the file to understand current structure.

**Step 2: Update HomeView to load recipes when authenticated**

```vue
<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/features/auth/store'
import { useRecipesStore } from '@/features/recipes/store'

const authStore = useAuthStore()
const recipesStore = useRecipesStore()

const isLoading = computed(() => recipesStore.loading)
const recipes = computed(() => recipesStore.recipes)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await recipesStore.loadUserRecipes()
  }
})
</script>

<template>
  <div>
    <p v-if="!authStore.isAuthenticated">Please sign in to view recipes</p>
    <div v-else-if="isLoading">Loading recipes...</div>
    <div v-else>
      <!-- Render recipes here -->
      <p v-if="recipes.length === 0">No recipes yet</p>
      <!-- List recipes -->
    </div>
  </div>
</template>
```

**Step 3: Test that recipes load on mount when authenticated**

Verify recipes load from Firestore when user is signed in.

---

## Task 9: Add Protected Route Guards

**Files:**
- Modify: `src/router/index.js`

**Step 1: Add navigation guards to protect authenticated routes**

```javascript
import { useAuthStore } from '@/features/auth/store'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Routes that require authentication
  const protectedRoutes = ['recipe-detail', 'recipe-create', 'recipe-edit']

  if (protectedRoutes.includes(to.name) && !authStore.isAuthenticated) {
    next({ name: 'auth' })
  } else {
    next()
  }
})
```

**Step 2: Verify guards prevent navigation to protected routes without auth**

Test that unauthenticated users are redirected to auth page.

---

## Task 10: Update AuthView to Use Firebase Auth Store

**Files:**
- Modify: `src/features/auth/views/AuthView.vue`

**Step 1: Check current AuthView implementation**

Read the file to understand current structure.

**Step 2: Update AuthView to integrate with auth store**

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/store'
import AuthenticationForm from '@/features/auth/components/AuthenticationForm.vue'

const router = useRouter()
const authStore = useAuthStore()
const mode = ref('signin') // 'signin' or 'signup'

const handleSubmit = async (credentials) => {
  try {
    if (mode.value === 'signin') {
      await authStore.signIn(credentials.email, credentials.password)
    } else {
      await authStore.signUp(credentials.email, credentials.password)
    }
    router.push({ name: 'home' })
  } catch (err) {
    // Error handled in store
  }
}

const toggleMode = () => {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin'
}
</script>

<template>
  <div>
    <AuthenticationForm
      :mode="mode"
      :loading="authStore.loading"
      :error="authStore.error"
      @submit="handleSubmit"
    />
    <button @click="toggleMode">
      {{ mode === 'signin' ? 'Need an account?' : 'Already have an account?' }}
    </button>
  </div>
</template>
```

**Step 3: Verify form submission calls correct auth method**

Test sign in and sign up flows with valid and invalid credentials.

---

## Task 11: Add Logout Action to AppNavbar

**Files:**
- Modify: `src/components/AppNavbar.vue`

**Step 1: Check current AppNavbar implementation**

Read the file to understand current structure.

**Step 2: Add logout button and handler**

```vue
<script setup>
import { useAuthStore } from '@/features/auth/store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push({ name: 'auth' })
  } catch (err) {
    console.error('Logout failed:', err)
  }
}
</script>

<template>
  <!-- NavBar content -->
  <button v-if="authStore.isAuthenticated" @click="handleLogout">
    Logout
  </button>
  <a v-else href="/auth">Sign In</a>
</template>
```

**Step 3: Test logout flow**

Verify user is logged out and redirected to auth page.

---

## Task 12: Add Firestore Security Rules Documentation

**Files:**
- Create: `docs/firestore-security-rules.md`

**Step 1: Document recommended Firestore rules**

```markdown
# Firestore Security Rules

## Collection: recipes

- Users can only read/write their own recipes
- Only authenticated users can create recipes
- Recipes must have a valid userId field

### Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /recipes/{document=**} {
      allow read: if request.auth.uid != null && resource.data.userId == request.auth.uid
      allow create: if request.auth.uid != null && request.resource.data.userId == request.auth.uid
      allow update: if request.auth.uid != null && resource.data.userId == request.auth.uid
      allow delete: if request.auth.uid != null && resource.data.userId == request.auth.uid
    }
  }
}
```

**Step 2: Provide deployment instructions**

Document how to copy these rules to Firebase Console.

---

## Task 13: Create Basic Firebase Integration Tests

**Files:**
- Create: `src/__tests__/services/recipeService.test.js`
- Create: `src/__tests__/stores/auth.test.js`

**Step 1: Write recipe service tests**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { recipeService } from '@/features/recipes/services/recipeService'

describe('recipeService', () => {
  beforeEach(() => {
    // Mock Firebase functions
    vi.mock('@/services/firebase')
  })

  it('should throw error if user not authenticated when adding recipe', async () => {
    const recipeData = { name: 'Test Recipe', ingredients: [] }
    await expect(recipeService.addRecipe(recipeData)).rejects.toThrow('User not authenticated')
  })

  it('should handle Firestore errors gracefully', async () => {
    // Test error handling
  })
})
```

**Step 2: Write auth store tests**

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/features/auth/store'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with no user', () => {
    const authStore = useAuthStore()
    expect(authStore.user).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('should handle sign in errors', async () => {
    const authStore = useAuthStore()
    await expect(authStore.signIn('invalid', 'creds')).rejects.toThrow()
    expect(authStore.error).toBeTruthy()
  })
})
```

**Step 3: Verify tests can run**

Run: `npm run test` (after test setup)

Expected: Tests run and pass with mocked Firebase calls.

---

## Task 14: Document Firebase Setup Instructions

**Files:**
- Create: `docs/firebase-setup.md`

**Step 1: Create Firebase setup guide**

```markdown
# Firebase Setup Guide

## Prerequisites
- Firebase account (free tier available)
- Node.js and npm installed

## Steps

1. Create a Firebase Project
   - Go to https://console.firebase.google.com
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create a Firestore Database
   - Create Cloud Storage bucket

2. Get Your Credentials
   - In Firebase Console, go to Project Settings
   - Copy your Web App credentials
   - Create `.env.local` in project root with values from `.env.example`

3. Apply Security Rules
   - Go to Firestore > Rules tab
   - Copy rules from `docs/firestore-security-rules.md`
   - Publish rules

4. Run the app
   - `npm install`
   - `npm run dev`
   - Visit http://localhost:3000
```

**Step 2: Verify instructions are clear and complete**

Ensure a developer can follow steps independently.

---

## Summary

This plan integrates Firebase authentication and Firestore into the Vue 3 recipe app following TDD principles. Key deliverables:

✅ Firebase SDK installation and environment setup
✅ Auth store for user management
✅ Recipe service for Firestore operations
✅ Protected routes and auth guards
✅ Updated UI components for sign in/sign up/logout
✅ Security rules and documentation
✅ Basic tests for services and stores

After implementation, users can create accounts, store recipes in Firestore, and access them across sessions with full offline support.
