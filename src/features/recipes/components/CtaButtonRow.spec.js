import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import CtaButtonRow from '@/features/recipes/components/CtaButtonRow.vue'

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

describe('CtaButtonRow', () => {
  const createWrapper = () => shallowMount(CtaButtonRow)

  it('renders 5 buttons', () => {
    const wrapper = createWrapper()
    expect(wrapper.findAll('button')).toHaveLength(5)
  })

  it('each meal button has an aria-label', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    const mealButtons = buttons.slice(0, 4)
    mealButtons.forEach(btn => {
      expect(btn.attributes('aria-label')).toBeTruthy()
    })
  })

  it('reforge button has an aria-label', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    const reforgeBtn = buttons[buttons.length - 1]
    expect(reforgeBtn.attributes('aria-label')).toBe('Reforge recipe')
  })

  it('each button has a cta-row__label span', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    buttons.forEach(btn => {
      expect(btn.find('.cta-row__label').exists()).toBe(true)
    })
  })
})
