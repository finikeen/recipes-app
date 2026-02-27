import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import RecipeDetailView from '@/features/recipes/views/RecipeDetailView.vue'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: { id: 'recipe-123' } })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('@/features/recipes/services/recipeService', () => ({
  recipeService: {
    getRecipeById: vi.fn(),
    getIngredients: vi.fn(),
  },
}))

vi.mock('primevue/useconfirm', () => ({
  useConfirm: vi.fn(() => ({ require: vi.fn() })),
}))

import { recipeService } from '@/features/recipes/services/recipeService'
import { useRecipesStore } from '@/features/recipes/store'
import { useAuthStore } from '@/features/auth/store'

vi.mock('@/services/firebase', () => ({ auth: {}, db: {}, storage: {} }))
vi.mock('firebase/firestore', () => ({}))
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
}))

const sampleRecipe = {
  id: 'recipe-123',
  name: 'Pasta Carbonara',
  description: 'Classic Italian pasta',
  tags: ['italian', 'pasta'],
  userId: 'user-1',
  directions: ['Boil pasta', 'Mix eggs'],
}

const mountDetailView = () => {
  return shallowMount(RecipeDetailView, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            recipes: { loading: false, recipes: [] },
            auth: { user: null },
          },
          stubActions: true,
        }),
      ],
      stubs: {
        ConfirmDialog: true,
        Skeleton: true,
        RouterLink: { template: '<a><slot /></a>' },
      },
    },
  })
}

describe('RecipeDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    recipeService.getIngredients.mockResolvedValue([])
  })

  it('renders recipe name and description after loading', async () => {
    recipeService.getRecipeById.mockResolvedValue(sampleRecipe)
    const wrapper = mountDetailView()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Pasta Carbonara')
    expect(wrapper.text()).toContain('Classic Italian pasta')
  })

  it('shows edit and delete buttons when user is owner', async () => {
    recipeService.getRecipeById.mockResolvedValue(sampleRecipe)
    const wrapper = mountDetailView()
    const authStore = useAuthStore()
    authStore.user = { uid: 'user-1' }
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    // isOwner computed depends on authStore.user?.uid === recipe.userId
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    // Should have Edit and Delete buttons
    expect(buttonTexts.some((t) => t.includes('Edit'))).toBe(true)
    expect(buttonTexts.some((t) => t.includes('Delete'))).toBe(true)
  })

  it('hides edit and delete buttons for non-owner', async () => {
    recipeService.getRecipeById.mockResolvedValue(sampleRecipe)
    const wrapper = mountDetailView()
    const authStore = useAuthStore()
    authStore.user = { uid: 'different-user' }
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    expect(buttonTexts.every((t) => !t.includes('Edit') && !t.includes('Delete'))).toBe(true)
  })

  it('shows not found message when recipe does not exist', async () => {
    recipeService.getRecipeById.mockResolvedValue(null)
    const wrapper = mountDetailView()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Recipe not found.')
  })

  it('calls getIngredients with the recipe id', async () => {
    recipeService.getRecipeById.mockResolvedValue(sampleRecipe)
    const wrapper = mountDetailView()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(recipeService.getIngredients).toHaveBeenCalledWith('recipe-123')
  })
})
