import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroRecipe from '@/features/recipes/components/HeroRecipe.vue'

vi.mock('@/features/recipes/composables/useRecipeIngredients', () => ({
  useRecipeIngredients: vi.fn(),
}))

import { useRecipeIngredients } from '@/features/recipes/composables/useRecipeIngredients'
import { ref, readonly } from 'vue'

const sampleRecipe = {
  id: 'r1',
  name: 'Pasta Carbonara',
  description: 'Classic Italian pasta with eggs and bacon',
  tags: ['italian', 'pasta'],
  directions: ['Boil pasta', 'Fry bacon', 'Mix eggs'],
  ingredients: [],
}

const mountHero = (recipe = sampleRecipe, ingredientsState = {}) => {
  const ingredients = ref(ingredientsState.ingredients ?? [])
  const loading = ref(ingredientsState.loading ?? false)
  useRecipeIngredients.mockReturnValue({
    ingredients: readonly(ingredients),
    loading,
  })
  return mount(HeroRecipe, {
    props: { recipe },
    global: {
      stubs: { Skeleton: true },
    },
  })
}

describe('HeroRecipe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders recipe name and description', () => {
    const wrapper = mountHero()
    expect(wrapper.text()).toContain('Pasta Carbonara')
    expect(wrapper.text()).toContain('Classic Italian pasta with eggs and bacon')
  })

  it('renders ingredients tab by default', () => {
    const wrapper = mountHero()
    const ingredientsTab = wrapper.find('[role="tab"][aria-selected="true"]')
    expect(ingredientsTab.text()).toContain('Ingredients')
  })

  it('switches to directions tab on click', async () => {
    const wrapper = mountHero()
    const tabs = wrapper.findAll('[role="tab"]')
    const directionsTab = tabs.find((t) => t.text().includes('Directions'))
    await directionsTab.trigger('click')
    expect(directionsTab.attributes('aria-selected')).toBe('true')
    expect(wrapper.text()).toContain('Boil pasta')
  })

  it('shows skeleton loaders while ingredients are fetching', () => {
    const wrapper = mountHero(sampleRecipe, { loading: true })
    // Skeleton components are rendered while loading
    expect(wrapper.findAllComponents({ name: 'Skeleton' }).length).toBeGreaterThan(0)
  })

  it('renders ingredients list when loaded from subcollection', async () => {
    const wrapper = mountHero(sampleRecipe, {
      ingredients: [
        { quantity: '200', unit: 'g', item: 'spaghetti' },
        { quantity: '2', unit: '', item: 'eggs' },
      ],
      loading: false,
    })
    expect(wrapper.text()).toContain('spaghetti')
    expect(wrapper.text()).toContain('eggs')
  })

  it('emits load-another when Load Another button is clicked', async () => {
    const wrapper = mountHero()
    await wrapper.find('button.forge__button:not(.forge__button-primary)').trigger('click')
    expect(wrapper.emitted('load-another')).toBeTruthy()
  })

  it('emits view-recipe with recipe id when View Full Recipe is clicked', async () => {
    const wrapper = mountHero()
    await wrapper.find('button.forge__button-primary').trigger('click')
    const emitted = wrapper.emitted('view-recipe')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toBe('r1')
  })
})
