import { describe, it, expect } from 'vitest'
import { useIngredientParser } from '@/features/recipes/composables/useIngredientParser'

describe('useIngredientParser', () => {
  const { parseIngredient } = useIngredientParser()

  it('parses "2 cups flour" into quantity, unit, item', () => {
    expect(parseIngredient('2 cups flour')).toEqual({ quantity: '2', unit: 'cups', item: 'flour' })
  })

  it('parses mixed fraction "1 1/2 tbsp sugar"', () => {
    expect(parseIngredient('1 1/2 tbsp sugar')).toEqual({ quantity: '1 1/2', unit: 'tbsp', item: 'sugar' })
  })

  it('parses simple fraction "1/2 tsp salt"', () => {
    expect(parseIngredient('1/2 tsp salt')).toEqual({ quantity: '1/2', unit: 'tsp', item: 'salt' })
  })

  it('parses "pinch of salt" with no quantity', () => {
    expect(parseIngredient('pinch of salt')).toEqual({ quantity: '', unit: 'pinch', item: 'salt' })
  })

  it('parses "2 eggs" with no unit', () => {
    expect(parseIngredient('2 eggs')).toEqual({ quantity: '2', unit: '', item: 'eggs' })
  })

  it('parses "flour" with no quantity or unit', () => {
    expect(parseIngredient('flour')).toEqual({ quantity: '', unit: '', item: 'flour' })
  })

  it('returns null for empty string', () => {
    expect(parseIngredient('')).toBeNull()
  })

  it('returns null for whitespace-only string', () => {
    expect(parseIngredient('   ')).toBeNull()
  })

  it('does not confuse number inside name as quantity: "Parmesan 24 month aged"', () => {
    expect(parseIngredient('Parmesan 24 month aged')).toEqual({ quantity: '', unit: '', item: 'Parmesan 24 month aged' })
  })

  it('parses decimal quantity "1.5 l water"', () => {
    expect(parseIngredient('1.5 l water')).toEqual({ quantity: '1.5', unit: 'l', item: 'water' })
  })

  it('parses "3 cloves garlic"', () => {
    expect(parseIngredient('3 cloves garlic')).toEqual({ quantity: '3', unit: 'cloves', item: 'garlic' })
  })

  it('parses "100 g butter"', () => {
    expect(parseIngredient('100 g butter')).toEqual({ quantity: '100', unit: 'g', item: 'butter' })
  })

  it('handles case-insensitive unit matching "2 Cups flour"', () => {
    const result = parseIngredient('2 Cups flour')
    expect(result).toEqual({ quantity: '2', unit: 'Cups', item: 'flour' })
  })
})
