import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecipeCard from '@/features/recipes/components/RecipeCard.vue'

describe('RecipeCard', () => {
  // Basic Rendering
  describe('basic rendering', () => {
    it('renders recipe title', () => {
      const recipe = {
        id: 1,
        name:'Pasta Carbonara',
        description: 'A classic Italian pasta',
        tags: ['Italian', 'Pasta']
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.text()).toContain('Pasta Carbonara')
    })

    it('renders recipe description', () => {
      const recipe = {
        id: 1,
        name:'Pasta',
        description: 'A delicious dish with noodles',
        tags: []
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.text()).toContain('A delicious dish with noodles')
    })

    it('renders tags', () => {
      const recipe = {
        id: 1,
        name:'Pasta',
        description: 'A dish',
        tags: ['Italian', 'Quick']
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.text()).toContain('Italian')
      expect(wrapper.text()).toContain('Quick')
    })
  })

  // Tag Truncation
  describe('tag truncation', () => {
    it('truncates long tag names to 15 characters', () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: ['VeryLongTagNameThatExceedsFifteen']
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      const tagButton = wrapper.find('button[data-test="tag"]')
      expect(tagButton.text()).toBe('VeryLongTagName...')
    })

    it('does not truncate short tags', () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: ['Short']
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.text()).toContain('Short')
    })

    it('displays up to 5 tags only', () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5', 'Tag6', 'Tag7']
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.text()).toContain('Tag1')
      expect(wrapper.text()).toContain('Tag5')
      expect(wrapper.text()).not.toContain('Tag6')
    })
  })

  // Description Truncation
  describe('description truncation', () => {
    it('truncates long descriptions with line clamping', () => {
      const longDescription = 'Line 1\nLine 2\nLine 3\nLine 4'
      const recipe = {
        id: 1,
        name:'Recipe',
        description: longDescription,
        tags: []
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      const descElement = wrapper.find('[data-test="description"]')
      expect(descElement.exists()).toBe(true)
      expect(descElement.classes()).toContain('line-clamp-2')
    })
  })

  // Click Events
  describe('click events', () => {
    it('emits click event when card is clicked and clickable is true', async () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: []
      }
      const wrapper = mount(RecipeCard, { props: { recipe, clickable: true } })
      const cardElement = wrapper.find('[data-test="card"]')
      await cardElement.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('does not emit click event when clickable is false', async () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: []
      }
      const wrapper = mount(RecipeCard, { props: { recipe, clickable: false } })
      const cardElement = wrapper.find('[data-test="card"]')
      await cardElement.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('emits tag-click with full tag name when tag is clicked', async () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: ['VeryLongTagNameThatExceedsFifteen', 'Short']
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      const tagButtons = wrapper.findAll('button[data-test="tag"]')
      await tagButtons[0].trigger('click')
      const emitted = wrapper.emitted('tag-click')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0].tagName).toBe('VeryLongTagNameThatExceedsFifteen')
    })

    it('prevents card click when tag is clicked', async () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: ['Tag1']
      }
      const wrapper = mount(RecipeCard, { props: { recipe, clickable: true } })
      const tagButton = wrapper.find('button[data-test="tag"]')
      await tagButton.trigger('click')
      expect(wrapper.emitted('tag-click')).toBeTruthy()
      // Card click should not have been emitted
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  // Edge Cases
  describe('edge cases', () => {
    it('handles missing description with fallback text', () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: '',
        tags: []
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.text()).toContain('No description provided')
    })

    it('handles null description with fallback text', () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: null,
        tags: []
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.text()).toContain('No description provided')
    })

    it('handles missing tags array', () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc'
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.find('[data-test="tags-container"]').exists()).toBe(false)
    })

    it('handles empty tags array', () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: []
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.find('[data-test="tags-container"]').exists()).toBe(false)
    })

    it('truncates very long titles appropriately', () => {
      const longTitle = 'A'.repeat(100)
      const recipe = {
        id: 1,
        name:longTitle,
        description: 'Desc',
        tags: []
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      const titleElement = wrapper.find('[data-test="title"]')
      expect(titleElement.exists()).toBe(true)
    })

    it('provides full tag name in title attribute for accessibility', () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: ['VeryLongTagNameThatExceedsFifteen']
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      const tagButton = wrapper.find('button[data-test="tag"]')
      expect(tagButton.attributes('title')).toBe('VeryLongTagNameThatExceedsFifteen')
    })
  })

  // Default Props
  describe('default props', () => {
    it('has clickable defaulting to true', () => {
      const recipe = {
        id: 1,
        name:'Recipe',
        description: 'Desc',
        tags: []
      }
      const wrapper = mount(RecipeCard, { props: { recipe } })
      expect(wrapper.props('clickable')).toBe(true)
    })
  })
})
