import { ref, readonly } from 'vue'

function resolveInitialDark() {
  const stored = localStorage.getItem('forge-color-mode')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
}

const isDark = ref(resolveInitialDark())
document.documentElement.classList.toggle('dark', isDark.value)

export function useColorMode() {
  const toggle = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('forge-color-mode', isDark.value ? 'dark' : 'light')
  }
  return { isDark: readonly(isDark), toggle }
}
