import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/features/auth/store'

vi.mock('@/services/firebase', () => ({
  auth: {},
  db: {},
  storage: {}
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(() => Promise.reject(new Error('auth/wrong-password'))),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return vi.fn() })
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with no user', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('sets error state on failed sign in', async () => {
    const store = useAuthStore()
    await expect(store.signIn('bad@email.com', 'wrongpass')).rejects.toThrow()
    expect(store.error).toBeTruthy()
  })

  it('loading returns to false after failed sign in', async () => {
    const store = useAuthStore()
    try { await store.signIn('a@b.com', 'pass') } catch {}
    expect(store.loading).toBe(false)
  })
})
