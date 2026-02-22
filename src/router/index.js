import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import HomeView from '@/features/recipes/views/HomeView.vue'
import RecipeDetailView from '@/features/recipes/views/RecipeDetailView.vue'
import RecipeFormView from '@/features/recipes/views/RecipeFormView.vue'
import BrowseView from '@/features/recipes/views/BrowseView.vue'
import AuthView from '@/features/auth/views/AuthView.vue'
import { useAuthStore } from '@/features/auth/store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/browse',
    name: 'browse',
    component: BrowseView
  },
  {
    path: '/recipes/:id',
    name: 'recipe-detail',
    component: RecipeDetailView
  },
  {
    path: '/recipes/new',
    name: 'recipe-create',
    component: RecipeFormView
  },
  {
    path: '/recipes/:id/edit',
    name: 'recipe-edit',
    component: RecipeFormView
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const protectedRoutes = ['recipe-create', 'recipe-edit']

  // Wait for Firebase to restore auth state before checking
  if (!authStore.authReady) {
    await new Promise(resolve => {
      const unwatch = watch(
        () => authStore.authReady,
        (ready) => { if (ready) { unwatch(); resolve() } }
      )
    })
  }

  if (protectedRoutes.includes(to.name) && !authStore.isAuthenticated) {
    next({ name: 'auth' })
  } else {
    next()
  }
})

export default router
