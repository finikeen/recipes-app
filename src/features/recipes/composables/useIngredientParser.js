const UNITS = [
  // Volume
  'tablespoons', 'tablespoon', 'tbsps', 'tbsp',
  'teaspoons', 'teaspoon', 'tsps', 'tsp',
  'cups', 'cup',
  'fl oz',
  'milliliters', 'milliliter', 'ml',
  'liters', 'liter', 'l',
  // Weight
  'ounces', 'ounce', 'oz',
  'pounds', 'pound', 'lbs', 'lb',
  'kilograms', 'kilogram', 'kg',
  'grams', 'gram', 'g',
  // Descriptive
  'pinches', 'pinch',
  'dashes', 'dash',
  'handfuls', 'handful',
  'cans', 'can',
  'bunches', 'bunch',
  'cloves', 'clove',
  'sprigs', 'sprig',
  'slices', 'slice',
  'pieces', 'piece',
  'stalks', 'stalk',
  'heads', 'head',
  'packages', 'package', 'pkg',
]

// Sort longest first so multi-word units like "fl oz" match before "oz"
const UNITS_SORTED = [...UNITS].sort((a, b) => b.length - a.length)

const QTY_RE = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/

export function useIngredientParser() {
  function parseIngredient(text) {
    if (!text || !text.trim()) return null

    let remaining = text.trim()
    let quantity = ''
    let unit = ''

    // 1. Match quantity at start
    const qtyMatch = remaining.match(QTY_RE)
    if (qtyMatch) {
      quantity = qtyMatch[0].trim()
      remaining = remaining.slice(qtyMatch[0].length).trimStart()
    }

    // 2. Try to match a known unit (case-insensitive, whole word)
    for (const u of UNITS_SORTED) {
      const escaped = u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const unitRe = new RegExp(`^${escaped}(?=\\s|$)`, 'i')
      if (unitRe.test(remaining)) {
        unit = remaining.slice(0, u.length)
        remaining = remaining.slice(u.length).trimStart()
        break
      }
    }

    // 3. Skip optional connector "of"
    if (/^of\s/i.test(remaining)) {
      remaining = remaining.slice(2).trimStart()
    } else if (/^of$/i.test(remaining)) {
      remaining = ''
    }

    const item = remaining.trim()

    if (!item) return null

    return { quantity, unit, item }
  }

  return { parseIngredient }
}
