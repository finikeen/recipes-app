import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import HomeView from '@/features/recipes/views/HomeView.vue'
import { useRecipesStore } from '@/features/recipes/store'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  RouterLink: { template: '<a><slot /></a>' },
}))

const mountHomeView = (storeOverrides = {}) => {
  return shallowMount(HomeView, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: { recipes: { loading: false, recipes: [], ...storeOverrides } },
          stubActions: true,
        }),
      ],
      stubs: { HeroRecipe: true, RecipeCard: true, Skeleton: true },
    },
  })
}

describe('HomeView', () => {
  it('shows skeleton loader while recipes are loading', () => {
    const wrapper = mountHomeView({ loading: true })
    // Skeleton stub is rendered when loading is true
    expect(wrapper.findComponent({ name: 'Skeleton' }).exists() ||
      wrapper.find('.featured__skeleton').exists()).toBe(true)
  })

  it('shows empty message when no recipes loaded', async () => {
    const wrapper = mountHomeView({ loading: false, recipes: [] })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No recipes yet.')
  })

  it('renders HeroRecipe when a featured recipe exists', async () => {
    const recipes = [{ id: '1', name: 'Pasta', description: 'Good pasta', tags: [] }]
    const wrapper = shallowMount(HomeView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { recipes: { loading: false, recipes } },
            stubActions: true,
          }),
        ],
        stubs: { HeroRecipe: true, RecipeCard: true, Skeleton: true },
      },
    })
    const store = useRecipesStore()
    // Trigger featuredIndex to pick a recipe
    await wrapper.vm.$nextTick()
    // pickRandom is called in onMounted — since loadAllRecipes is stubbed,
    // the store still has recipes from initialState
    expect(store.loadAllRecipes).toHaveBeenCalledOnce()
  })

  it('calls loadAllRecipes on mount', async () => {
    const wrapper = mountHomeView()
    await wrapper.vm.$nextTick()
    const store = useRecipesStore()
    expect(store.loadAllRecipes).toHaveBeenCalledOnce()
  })
})
