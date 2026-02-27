import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import BrowseView from '@/features/recipes/views/BrowseView.vue'
import { useRecipesStore } from '@/features/recipes/store'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  RouterLink: { template: '<a><slot /></a>' },
}))

const sampleRecipes = [
  { id: '1', name: 'Pasta Carbonara', description: 'Classic Italian', tags: ['italian', 'pasta'] },
  { id: '2', name: 'Chicken Soup', description: 'Warm broth', tags: ['soup', 'chicken'] },
  { id: '3', name: 'Caesar Salad', description: 'Crispy salad', tags: ['salad', 'italian'] },
]

const mountBrowseView = (storeOverrides = {}) => {
  return shallowMount(BrowseView, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: { recipes: { loading: false, recipes: [], ...storeOverrides } },
          stubActions: true,
        }),
      ],
      stubs: { RecipeCard: true, Skeleton: true, Paginator: true, InputText: true },
    },
  })
}

describe('BrowseView', () => {
  it('shows skeleton loaders while loading', () => {
    const wrapper = mountBrowseView({ loading: true })
    expect(wrapper.find('.browse__grid').exists()).toBe(true)
    // Loading skeletons present
    expect(wrapper.findAllComponents({ name: 'Skeleton' }).length > 0 ||
      wrapper.find('.browse__skeleton-card').exists()).toBe(true)
  })

  it('shows empty state when store has no recipes', () => {
    const wrapper = mountBrowseView({ loading: false, recipes: [] })
    expect(wrapper.text()).toContain('No recipes yet.')
  })

  it('renders recipe grid when recipes are loaded', () => {
    const wrapper = mountBrowseView({ recipes: sampleRecipes })
    expect(wrapper.find('.browse__grid').exists()).toBe(true)
  })

  it('shows no recipes found when search matches nothing', async () => {
    const wrapper = mountBrowseView({ recipes: sampleRecipes })
    // Access the searchQuery ref via component instance
    // Use the InputText stub trigger or directly set internal state
    await wrapper.vm.$nextTick()
    // The browse__empty-message appears when filteredRecipes.length === 0
    // Simulate by triggering search through the exposed vm
    wrapper.vm.searchQuery = 'zzznomatch'
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No recipes found.')
  })

  it('calls loadAllRecipes on mount', () => {
    const wrapper = mountBrowseView()
    const store = useRecipesStore()
    expect(store.loadAllRecipes).toHaveBeenCalledOnce()
  })

  it('shows filter chip buttons for available tags', async () => {
    const wrapper = mountBrowseView({ recipes: sampleRecipes })
    // Open filters
    const filtersBtn = wrapper.find('.browse__filters-btn')
    await filtersBtn.trigger('click')
    await wrapper.vm.$nextTick()
    // Should have tag filter chips
    const chips = wrapper.findAll('.browse__filter-chip')
    expect(chips.length).toBeGreaterThan(0)
  })
})
