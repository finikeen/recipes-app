import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import RecipeSourceUrl from '@/features/recipes/components/RecipeSourceUrl.vue'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    name: 'recipe-create',
    path: '/recipe/create',
  })),
  RouterLink: {
    template: '<a><slot /></a>',
  },
}))

global.fetch = vi.fn()

describe('RecipeSourceUrl', () => {
  const createWrapper = (props = {}) => {
    return shallowMount(RecipeSourceUrl, {
      props,
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          InputText: {
            template: '<input />',
            props: ['modelValue', 'readonly', 'fluid', 'placeholder'],
            emits: ['update:modelValue'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input field and button', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.recipe-source-url__field').exists()).toBe(true)
    expect(wrapper.find('.recipe-source-url__button').exists()).toBe(true)
  })

  it('renders label for source URL input', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Recipe Source URL')
  })

  it('disables button when no URL is entered', () => {
    const wrapper = createWrapper()
    const button = wrapper.find('.recipe-source-url__button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('enables button when URL is entered', async () => {
    const wrapper = createWrapper()
    wrapper.vm.localUrl = 'https://example.com/recipe'
    await wrapper.vm.$nextTick()
    const button = wrapper.find('.recipe-source-url__button')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('disables button while loading', async () => {
    const wrapper = createWrapper()
    wrapper.vm.localUrl = 'https://example.com/recipe'
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    const button = wrapper.find('.recipe-source-url__button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('makes readonly when editing existing recipe with source', async () => {
    const wrapper = createWrapper({
      sourceUrl: 'https://original-source.com/recipe',
      isEditing: true,
    })
    expect(wrapper.vm.isReadonly).toBe(true)
  })

  it('disables button when readonly', async () => {
    const wrapper = createWrapper({
      sourceUrl: 'https://original-source.com/recipe',
      isEditing: true,
    })
    const button = wrapper.find('.recipe-source-url__button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('shows readonly hint when editing with source', async () => {
    const wrapper = createWrapper({
      sourceUrl: 'https://original-source.com/recipe',
      isEditing: true,
    })
    expect(wrapper.text()).toContain('This recipe was imported from a source')
  })

  it('displays error when URL is empty on scrape', async () => {
    const wrapper = createWrapper()
    wrapper.vm.localUrl = ''
    await wrapper.vm.scrapeRecipe()
    expect(wrapper.vm.scrapeError).toBe('Please enter a URL')
  })

  it('calls fetch with correct URL on scrape', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({
        success: true,
        recipe: { name: 'Test Recipe', ingredients: [], directions: [] },
      }),
    })

    const wrapper = createWrapper()
    wrapper.vm.localUrl = 'https://example.com/recipe'
    await wrapper.vm.scrapeRecipe()

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/scrape',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/recipe' }),
      }),
    )
  })

  it('emits data-scraped on successful scrape', async () => {
    const testRecipe = { name: 'Test Recipe', ingredients: [], directions: [] }
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({
        success: true,
        recipe: testRecipe,
      }),
    })

    const wrapper = createWrapper()
    wrapper.vm.localUrl = 'https://example.com/recipe'
    await wrapper.vm.scrapeRecipe()

    expect(wrapper.emitted('data-scraped')).toBeTruthy()
    expect(wrapper.emitted('data-scraped')[0]).toEqual([testRecipe])
  })

  it('clears URL after successful scrape', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({
        success: true,
        recipe: { name: 'Test' },
      }),
    })

    const wrapper = createWrapper()
    wrapper.vm.localUrl = 'https://example.com/recipe'
    await wrapper.vm.scrapeRecipe()

    expect(wrapper.vm.localUrl).toBe('')
  })

  it('displays error on failed scrape', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({
        success: false,
        failureReason: 'No recipe data found',
      }),
    })

    const wrapper = createWrapper()
    wrapper.vm.localUrl = 'https://example.com'
    await wrapper.vm.scrapeRecipe()

    expect(wrapper.vm.scrapeError).toBe('No recipe data found')
  })

  it('displays error on network failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = createWrapper()
    wrapper.vm.localUrl = 'https://example.com'
    await wrapper.vm.scrapeRecipe()

    expect(wrapper.vm.scrapeError).toContain('Network error')
  })

  it('handles Enter key to trigger scrape', async () => {
    const wrapper = createWrapper()
    wrapper.vm.localUrl = 'https://example.com/recipe'
    await wrapper.vm.$nextTick()

    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({
        success: true,
        recipe: { name: 'Test' },
      }),
    })

    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    await wrapper.vm.handleKeydown(event)

    expect(global.fetch).toHaveBeenCalled()
  })

  it('does not trigger scrape with Enter key when button disabled', async () => {
    const wrapper = createWrapper()
    wrapper.vm.localUrl = ''
    await wrapper.vm.$nextTick()

    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    await wrapper.vm.handleKeydown(event)

    expect(global.fetch).not.toHaveBeenCalled()
  })
})
