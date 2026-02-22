import { db, auth } from '@/services/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'

export const recipeService = {
  async addRecipe(recipeData) {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('User not authenticated')

    try {
      const docRef = await addDoc(collection(db, 'recipes'), {
        ...recipeData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { id: docRef.id, ...recipeData }
    } catch (err) {
      throw new Error(`Failed to add recipe: ${err.message}`)
    }
  },

  async updateRecipe(recipeId, updates) {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('User not authenticated')

    try {
      const docRef = doc(db, 'recipes', recipeId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { id: recipeId, ...updates }
    } catch (err) {
      throw new Error(`Failed to update recipe: ${err.message}`)
    }
  },

  async deleteRecipe(recipeId) {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('User not authenticated')

    try {
      const docRef = doc(db, 'recipes', recipeId)
      await deleteDoc(docRef)
    } catch (err) {
      throw new Error(`Failed to delete recipe: ${err.message}`)
    }
  },

  async getRecipeById(recipeId) {
    try {
      const docRef = doc(db, 'recipes', recipeId)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) return null
      return { id: docSnap.id, ...docSnap.data() }
    } catch (err) {
      throw new Error(`Failed to get recipe: ${err.message}`)
    }
  },

  async getUserRecipes() {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('User not authenticated')

    try {
      const q = query(
        collection(db, 'recipes'),
        where('userId', '==', currentUser.uid)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
    } catch (err) {
      throw new Error(`Failed to get user recipes: ${err.message}`)
    }
  },

  async getAllRecipes() {
    try {
      const querySnapshot = await getDocs(collection(db, 'recipes'))
      return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
    } catch (err) {
      throw new Error(`Failed to get recipes: ${err.message}`)
    }
  }
}
