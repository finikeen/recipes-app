# Plan: Ingredient Text Parser Quick Fix

## Context

Ingredients scraped from URLs often arrive as a single combined string in the `item` field (e.g., `"2 cups flour"`) with `quantity` and `unit` left empty. The fix button provides a one-click way to parse that raw text and populate the separate fields automatically.

---

## Files to Create

### 1. `src/features/recipes/composables/useIngredientParser.js` (NEW)

A pure composable exposing a single `parseIngredient(text)` function.

**Parsing algorithm (in order):**
1. Trim input; return `null` if empty
2. Match quantity at the start using regex priority:
   - Mixed fraction: `1 1/2`
   - Simple fraction: `1/2`
   - Decimal/integer: `2`, `1.5`
3. Skip whitespace; try to match a known unit from the list (case-insensitive, word-boundary matched)
4. Skip optional connector word `"of"`
5. Remaining trimmed text = `item`
6. Return `null` if `item` is empty after parsing
7. Return `{ quantity, unit, item }`

**Known units list** (add more over time):
- Volume: `tsp`, `teaspoon(s)`, `tbsp`, `tablespoon(s)`, `cup(s)`, `fl oz`, `ml`, `milliliter(s)`, `l`, `liter(s)`
- Weight: `oz`, `ounce(s)`, `lb`, `lbs`, `pound(s)`, `g`, `gram(s)`, `kg`, `kilogram(s)`
- Descriptive: `pinch`, `pinches`, `dash`, `dashes`, `handful`, `handfuls`, `can`, `cans`, `bunch`, `bunches`, `clove`, `cloves`, `sprig`, `sprigs`, `slice`, `slices`, `piece`, `pieces`, `stalk`, `stalks`, `head`, `heads`, `package`, `packages`, `pkg`

---

## Files to Modify

### 2. `src/features/recipes/views/RecipeFormView.vue`

**Script changes:**
- Import and call `useIngredientParser()`
- Add `parseErrors` ref (`ref({})`) — keyed by `ing._key`, stores error string or `null`
- Add `fixIngredient(index)` function:
  1. `result = parseIngredient(ingredients[index].item)`
  2. If result: call `updateIngredient(index, result)`, delete `parseErrors.value[ing._key]`
  3. If null: set `parseErrors.value[ing._key]` to the error message

**Template changes** — inside the `v-for` ingredient row, add the fix button **before** the `×` delete button:
```html
<button
  type="button"
  class="forge__button rform__fix-btn"
  :disabled="!ing.item.trim()"
  :aria-label="`Auto-parse ingredient ${ing.item || ''}`"
  @click="fixIngredient(i)"
>
  <i class="pi pi-wrench" aria-hidden="true"></i>
</button>
```

Add a per-row error span **after** the row `<div>` (not inside it, so it spans full width):
```html
<span v-if="parseErrors[ing._key]" class="rform__parse-error" role="alert">
  {{ parseErrors[ing._key] }}
</span>
```

**Style changes:**
- `.rform__fix-btn`: same compact sizing as `.rform__remove-btn` (`padding: 0.375rem 0.625rem`)
- `.rform__parse-error`: same color/size as `.rform__error` (orange, `0.875rem`)

---

## Files to Create

### 3. `src/__tests__/composables/useIngredientParser.spec.js` (NEW)

Key test cases:
- `"2 cups flour"` → `{ quantity: "2", unit: "cups", item: "flour" }`
- `"1 1/2 tbsp sugar"` → `{ quantity: "1 1/2", unit: "tbsp", item: "sugar" }`
- `"1/2 tsp salt"` → `{ quantity: "1/2", unit: "tsp", item: "salt" }`
- `"pinch of salt"` → `{ quantity: "", unit: "pinch", item: "salt" }`
- `"2 eggs"` (no unit) → `{ quantity: "2", unit: "", item: "eggs" }`
- `"flour"` (no qty/unit) → `{ quantity: "", unit: "", item: "flour" }`
- `""` → `null`
- `"Parmesan 24 month aged"` (number in name, not qty) → `{ quantity: "", unit: "", item: "Parmesan 24 month aged" }`

---

## Verification

1. Run `npm test` — all new and existing tests pass
2. Start dev server `npm run dev`, open the recipe form
3. Type `"2 cups flour"` into the Item field, click the wrench → fields split into Qty=2, Unit=cups, Item=flour
4. Clear the item field → fix button should be disabled
5. Type unparseable text like `"???"` → error message appears below the row
