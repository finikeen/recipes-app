import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/features/recipes/views/HomeView.vue'
import RecipeDetailView from '@/features/recipes/views/RecipeDetailView.vue'
import RecipeFormView from '@/features/recipes/views/RecipeFormView.vue'
import AuthView from '@/features/auth/views/AuthView.vue'
import { useAuthStore } from '@/features/auth/store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const protectedRoutes = ['recipe-detail', 'recipe-create', 'recipe-edit']

  if (protectedRoutes.includes(to.name) && !authStore.isAuthenticated) {
    next({ name: 'auth' })
  } else {
    next()
  }
})

export default router
