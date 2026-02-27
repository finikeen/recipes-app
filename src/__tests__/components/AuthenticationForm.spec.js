import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthenticationForm from '@/features/auth/components/AuthenticationForm.vue'

const mountForm = (props = {}) => {
  return mount(AuthenticationForm, {
    props,
    global: {
      stubs: {
        InputText: {
          props: ['modelValue', 'id'],
          template: '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" type="email" />',
          emits: ['update:modelValue'],
        },
        Password: {
          props: ['modelValue', 'inputId'],
          template: '<input :id="inputId" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" type="password" />',
          emits: ['update:modelValue'],
        },
        Button: {
          template: '<button type="submit">{{ label }}</button>',
          props: ['label'],
        },
      },
    },
  })
}

describe('AuthenticationForm', () => {
  it('renders sign in form by default', () => {
    const wrapper = mountForm()
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.find('h2').text()).toBe('Login')
  })

  it('switches to sign up mode when toggle button is clicked', async () => {
    const wrapper = mountForm()
    await wrapper.find('.auth-form__toggle-btn').trigger('click')
    expect(wrapper.find('h2').text()).toBe('Sign Up')
    expect(wrapper.find('.auth-form__toggle-btn').text()).toBe('Login')
  })

  it('emits submit event with email and password on form submit', async () => {
    const wrapper = mountForm()
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await emailInput.setValue('user@example.com')
    await passwordInput.setValue('secret123')
    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toMatchObject({
      email: 'user@example.com',
      password: 'secret123',
      mode: 'login',
    })
  })

  it('shows error message when error prop is passed', () => {
    const wrapper = mountForm({ error: 'Invalid credentials' })
    expect(wrapper.text()).toContain('Invalid credentials')
    expect(wrapper.find('.auth-form__error').exists()).toBe(true)
  })

  it('does not show error message when error prop is null', () => {
    const wrapper = mountForm({ error: null })
    expect(wrapper.find('.auth-form__error').exists()).toBe(false)
  })

  it('emits submit with mode "signup" in sign up mode', async () => {
    const wrapper = mountForm({ initialMode: 'signup' })
    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('submit')
    expect(emitted[0][0].mode).toBe('signup')
  })
})
