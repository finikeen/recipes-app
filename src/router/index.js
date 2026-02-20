import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/features/recipes/views/HomeView.vue'
import RecipeDetailView from '@/features/recipes/views/RecipeDetailView.vue'
import RecipeFormView from '@/features/recipes/views/RecipeFormView.vue'

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
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
