# Keywords Search and Filter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the auto-derived `tags` system with AI-generated `keywords` across recipe search, ingredient search, recipe cards, and filter UI — with a graceful `keywords ?? tags` fallback for un-enriched recipes.

**Architecture:** All keyword logic lives in the two composables (`useRecipeSearch`, `useIngredientSearch`) — swap `r.tags` for `r.keywords ?? r.tags` in every tag-reading expression. Text search in `useRecipeSearch` is extended to also match against keywords. UI components only need label text changes (no structural changes).

**Tech Stack:** Vue 3 Composition API, Vitest (jsdom), PrimeVue Dialog/InputText

---

### Task 1: Add failing keyword tests to `useRecipeSearch.spec.js`

**Files:**
- Modify: `src/__tests__/composables/useRecipeSearch.spec.js`

**Step 1: Add a second fixture block with keywords recipes, then add four new `it` blocks at the bottom of the existing `describe`**

Add after the existing `recipes` const and before the `describe` block:

```js
const keywordRecipes = [
  { id: 1, name: 'Pasta Carbonara', keywords: ['italian', 'pasta', 'weeknight'] },
  { id: 2, name: 'Chicken Soup',    keywords: ['soup', 'chicken', 'comfort food'] },
  { id: 3, name: 'Caesar Salad',    keywords: ['salad', 'italian'] },
  { id: 4, name: 'Unnamed Dish',    /* no keywords, no tags */ },
  { id: 5, name: 'Old Recipe',      tags: ['legacy', 'soup'] /* no keywords */ },
]
```

Add inside the `describe('useRecipeSearch')` block at the bottom:

```js
describe('keywords support', () => {
  it('uses keywords for topTags when present', () => {
    const source = ref(keywordRecipes)
    const { topTags } = useRecipeSearch(source)
    expect(topTags.value).toContain('italian')
    expect(topTags.value).toContain('soup')
  })

  it('falls back to tags when keywords is absent', () => {
    const source = ref(keywordRecipes)
    const { topTags } = useRecipeSearch(source)
    // id:5 has tags but no keywords — 'legacy' comes from tags fallback
    expect(topTags.value).toContain('legacy')
  })

  it('filters recipes by keyword via toggleTag', () => {
    const source = ref(keywordRecipes)
    const { filteredRecipes, toggleTag } = useRecipeSearch(source)
    toggleTag('italian')
    expect(filteredRecipes.value.map(r => r.id)).toEqual(expect.arrayContaining([1, 3]))
    expect(filteredRecipes.value.map(r => r.id)).not.toContain(2)
  })

  it('text search matches against keywords as well as name', () => {
    const source = ref(keywordRecipes)
    const { filteredRecipes, searchQuery } = useRecipeSearch(source)
    // 'weeknight' is a keyword on id:1 but not in its name
    searchQuery.value = 'weeknight'
    expect(filteredRecipes.value).toHaveLength(1)
    expect(filteredRecipes.value[0].id).toBe(1)
  })

  it('recipe with no keywords and no tags does not break composable', () => {
    const source = ref(keywordRecipes)
    const { filteredRecipes } = useRecipeSearch(source)
    expect(() => filteredRecipes.value).not.toThrow()
  })
})
```

**Step 2: Run the new tests to confirm they fail**

```bash
npx vitest run src/__tests__/composables/useRecipeSearch.spec.js
```

Expected: the 5 new tests FAIL (keywords not yet implemented).

---

### Task 2: Update `useRecipeSearch.js` to make keyword tests pass

**Files:**
- Modify: `src/features/recipes/composables/useRecipeSearch.js`

**Step 1: Add a helper at the top of the function body to read keywords with tag fallback**

After the `const activeTagFilters = ref(new Set())` line, add:

```js
const getKeywords = (r) => r.keywords ?? r.tags ?? []
```

**Step 2: Replace all `r.tags ?? []` usages with `getKeywords(r)`**

In `topTags`: change `(r.tags ?? []).forEach(...)` → `getKeywords(r).forEach(...)`

In `availableTags`: change `(r.tags ?? []).forEach(...)` → `getKeywords(r).forEach(...)`

In `filteredRecipes`: change `(r.tags ?? []).some(...)` → `getKeywords(r).some(...)`

**Step 3: Extend `nameFilteredRecipes` to also match against keywords**

Replace the current filter:
```js
return recipes.filter((r) => r.name?.toLowerCase().includes(q))
```
With:
```js
return recipes.filter((r) =>
  r.name?.toLowerCase().includes(q) ||
  getKeywords(r).some((k) => k.toLowerCase().includes(q))
)
```

**Step 4: Run tests to confirm all pass**

```bash
npx vitest run src/__tests__/composables/useRecipeSearch.spec.js
```

Expected: all tests PASS including the 5 new keyword tests.

**Step 5: Commit**

```bash
git add src/__tests__/composables/useRecipeSearch.spec.js src/features/recipes/composables/useRecipeSearch.js
git commit -m "feat: use keywords with tags fallback in useRecipeSearch"
```

---

### Task 3: Add failing keyword tests to `useIngredientSearch.spec.js`

**Files:**
- Modify: `src/__tests__/composables/useIngredientSearch.spec.js`

**Step 1: Add a keyword fixture and new test group**

At the top of the file, add alongside the existing `recipes` const:

```js
const keywordRecipes = [
  { id: '1', name: 'Pasta Carbonara', keywords: ['italian', 'pasta'], ingredientNames: ['pasta', 'egg'] },
  { id: '2', name: 'Chicken Soup',    keywords: ['soup', 'chicken'],  ingredientNames: ['chicken', 'broth'] },
  { id: '3', name: 'Old Stew',        tags: ['legacy', 'stew'],       ingredientNames: ['beef', 'potato'] },
]
```

Add inside the `describe('useIngredientSearch')` block:

```js
describe('keywords support', () => {
  it('uses keywords for topTags when present', () => {
    const source = ref(keywordRecipes)
    const { topTags } = useIngredientSearch(source)
    expect(topTags.value).toContain('italian')
    expect(topTags.value).toContain('soup')
  })

  it('falls back to tags when keywords is absent', () => {
    const source = ref(keywordRecipes)
    const { topTags } = useIngredientSearch(source)
    expect(topTags.value).toContain('legacy')
  })

  it('keyword filter excludes non-matching recipes', () => {
    const source = ref(keywordRecipes)
    const { filteredRecipes, addIngredient, brew, toggleTag } = useIngredientSearch(source)
    addIngredient('pasta')
    brew()
    toggleTag('italian')
    expect(filteredRecipes.value.map(r => r.id)).toContain('1')
    expect(filteredRecipes.value.map(r => r.id)).not.toContain('2')
  })
})
```

**Step 2: Run to confirm they fail**

```bash
npx vitest run src/__tests__/composables/useIngredientSearch.spec.js
```

Expected: the 3 new tests FAIL.

---

### Task 4: Update `useIngredientSearch.js` to make keyword tests pass

**Files:**
- Modify: `src/features/recipes/composables/useIngredientSearch.js`

**Step 1: Add the same helper at the top of the function body**

After `const ingredientQuery = ref('')`, add:

```js
const getKeywords = (r) => r.keywords ?? r.tags ?? []
```

**Step 2: Replace all `recipe.tags ?? []` with `getKeywords(recipe)`**

In `availableTags`: `(recipe.tags ?? []).forEach(...)` → `getKeywords(recipe).forEach(...)`

In `topTags`: `(recipe.tags ?? []).forEach(...)` → `getKeywords(recipe).forEach(...)`

In `filteredRecipes`: `(recipe.tags ?? []).includes(tag)` → `getKeywords(recipe).includes(tag)`

**Step 3: Run tests to confirm all pass**

```bash
npx vitest run src/__tests__/composables/useIngredientSearch.spec.js
```

Expected: all tests PASS.

**Step 4: Commit**

```bash
git add src/__tests__/composables/useIngredientSearch.spec.js src/features/recipes/composables/useIngredientSearch.js
git commit -m "feat: use keywords with tags fallback in useIngredientSearch"
```

---

### Task 5: Update `RecipeCard.vue` to display keywords

**Files:**
- Modify: `src/features/recipes/components/RecipeCard.vue`

**Step 1: Update the `displayTags` computed to use `keywords ?? tags`**

Change:
```js
const displayTags = computed(() => {
  const tags = props.recipe.tags ?? []
  return tags.slice(0, 5).map((tag) => truncateTag(tag))
})
```
To:
```js
const displayTags = computed(() => {
  const keywords = props.recipe.keywords ?? props.recipe.tags ?? []
  return keywords.slice(0, 5).map((kw) => truncateTag(kw))
})
```

**Step 2: Add a `sourceKeywords` computed for the full list (used in template click handlers)**

Add after `displayTags`:
```js
const sourceKeywords = computed(() => props.recipe.keywords ?? props.recipe.tags ?? [])
```

**Step 3: Update the template to use `sourceKeywords` instead of `recipe.tags`**

Change the two references in the template from `recipe.tags[index]` to `sourceKeywords[index]`:

```html
:title="sourceKeywords[index]"
@click.stop="handleTagClick(sourceKeywords[index])"
```

**Step 4: Run full test suite to confirm no regressions**

```bash
npx vitest run
```

Expected: all tests PASS.

**Step 5: Commit**

```bash
git add src/features/recipes/components/RecipeCard.vue
git commit -m "feat: display keywords (with tags fallback) on recipe cards"
```

---

### Task 6: Update label text in `TagFilterModal.vue`

**Files:**
- Modify: `src/features/recipes/components/TagFilterModal.vue`

**Step 1: Update all user-visible "tag" strings to "keyword"**

| Current | Replace with |
|---|---|
| `header="Filter by Tag"` | `header="Filter by Keyword"` |
| `placeholder="Search tags..."` | `placeholder="Search keywords..."` |
| `aria-label="Search tags"` | `aria-label="Search keywords"` |
| `No tags match your search.` | `No keywords match your search.` |

No structural or style changes needed.

**Step 2: Run full test suite**

```bash
npx vitest run
```

Expected: all tests PASS.

**Step 3: Commit**

```bash
git add src/features/recipes/components/TagFilterModal.vue
git commit -m "chore: rename tag labels to keyword in filter modal"
```

---

### Task 7: Update label text in `BrowseView.vue`

**Files:**
- Modify: `src/features/recipes/views/BrowseView.vue`

**Step 1: Update any visible "tag" aria/title labels to "keyword"**

Check and update these patterns (search for "tag" case-insensitively in the file):
- `aria-label` attributes referencing "tag" → replace "tag" with "keyword"
- Any visible button/tooltip text like "Remove tag" → "Remove keyword"
- Comment lines like `<!-- Active tag pills -->` → `<!-- Active keyword pills -->` and `<!-- Top tags shortcut row -->` → `<!-- Top keywords row -->`

Leave variable names (`tagModalOpen`, `handleTagClick`, `toggleTag`) unchanged — these are internal JS and don't affect the user-facing UI.

**Step 2: Commit**

```bash
git add src/features/recipes/views/BrowseView.vue
git commit -m "chore: rename tag labels to keyword in browse view"
```

---

### Task 8: Update label text in `IngredientSearchView.vue`

**Files:**
- Modify: `src/features/recipes/views/IngredientSearchView.vue`

**Step 1: Update user-facing "tag" strings to "keyword"**

Key changes to make:
- Line ~145 comment `<!-- Column 2: Tags -->` → `<!-- Column 2: Keywords -->`
- `aria-label="\`Remove tag ${tag}\`"` → `aria-label="\`Remove keyword ${tag}\`"`
- Any heading/label text "Tags" → "Keywords"

Leave JS variable names (`tagModalOpen`, `toggleTag`, `activeTagFilters`, etc.) unchanged.

**Step 2: Run full test suite one last time**

```bash
npx vitest run
```

Expected: all tests PASS.

**Step 3: Commit**

```bash
git add src/features/recipes/views/IngredientSearchView.vue
git commit -m "chore: rename tag labels to keyword in ingredient search view"
```

---

### Task 9: Clean up and delete temporary `docs/plans` folder if created

**Step 1: Remove the empty docs/plans directory if it was accidentally created**

```bash
rmdir docs/plans 2>/dev/null; rmdir docs 2>/dev/null; echo "done"
```

Only removes if empty — safe to run regardless.

**Step 2: Run the full test suite as final verification**

```bash
npx vitest run
```

Expected: all tests PASS with no failures.
