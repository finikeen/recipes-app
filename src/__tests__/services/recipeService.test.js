import { describe, it, expect, beforeEach, vi } from 'vitest'
import { recipeService } from '@/features/recipes/services/recipeService'

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  storage: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}))

describe('recipeService', () => {
  it('throws when adding recipe without authentication', async () => {
    await expect(recipeService.addRecipe({ name: 'Test' })).rejects.toThrow('User not authenticated')
  })

  it('throws when fetching user recipes without authentication', async () => {
    await expect(recipeService.getUserRecipes()).rejects.toThrow('User not authenticated')
  })

  it('throws when deleting recipe without authentication', async () => {
    await expect(recipeService.deleteRecipe('abc')).rejects.toThrow('User not authenticated')
  })
})
