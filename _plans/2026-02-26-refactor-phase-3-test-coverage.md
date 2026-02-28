# Phase 3 — Test Coverage

**Date**: 2026-02-26
**Branch**: `feature/src-refactor`
**Skill**: `superpowers:test-driven-development`
**Depends on**: Phase 1 and Phase 2 complete

## Context

Currently 3 test files cover 21 source files. This phase adds ~12 new test files targeting all views and the new composables created in Phase 1.

**Stack**: Vitest + `@vue/test-utils` (already configured in `vite.config.js`)
**Firebase mocking**: `vi.mock('firebase/firestore')` pattern — follow `src/__tests__/stores/auth.test.js`
**Component mounting**: `mount()` / `shallowMount()` pattern — follow `src/__tests__/components/RecipeCard.spec.js`

---

## Step 10 — Composable Tests

### `src/__tests__/composables/useRecipeIngredients.spec.js`

```
describe('useRecipeIngredients', () => {
  it('starts with empty ingredients and loading false')
  it('sets loading true while fetching')
  it('populates ingredients after fetch resolves')
  it('clears ingredients when recipeId becomes falsy')
  it('refetches when recipeId changes')
  it('returns readonly ingredients (mutation throws in dev)')
})
```

Mock: `vi.mock('../../features/recipes/services/recipeService')`

### `src/__tests__/composables/useIngredients.spec.js`

```
describe('useIngredients', () => {
  it('initializes with empty array by default')
  it('initializes with provided value')
  it('addIngredient appends blank entry')
  it('removeIngredient removes by index')
  it('updateIngredient replaces by index')
  it('returns readonly ingredients array')
})
```

No mocks needed — pure state logic.

### `src/__tests__/composables/useDirections.spec.js`

```
describe('useDirections', () => {
  it('initializes with empty array by default')
  it('addDirection appends blank entry')
  it('removeDirection removes by index')
  it('moveDirection swaps items correctly')
  it('moveDirection handles out-of-bounds gracefully')
})
```

### `src/__tests__/composables/useRecipeForm.spec.js`

```
describe('useRecipeForm', () => {
  describe('validation', () => {
    it('returns false and sets errors when name is empty')
    it('returns false when name exceeds max length')
    it('returns true when form is valid')
  })
  describe('derivedTags', () => {
    it('extracts meaningful words from name and description')
    it('excludes stopwords')
  })
  describe('submitForm', () => {
    it('calls addRecipe in create mode')
    it('calls updateRecipe in edit mode when recipeId provided')
    it('calls onSuccess callback after successful submit')
    it('does not submit when validation fails')
  })
})
```

Mock: `vi.mock('../../features/recipes/store')`, `vi.mock('../../features/recipes/services/recipeService')`

### `src/__tests__/composables/useRecipeSearch.spec.js`

```
describe('useRecipeSearch', () => {
  it('returns all recipes when query is empty and no tags active')
  it('filters by name when searchQuery is set')
  it('filters by description when searchQuery is set')
  it('filters by active tag')
  it('combines search and tag filter (AND logic)')
  it('toggleTag adds tag to active filters')
  it('toggleTag removes tag when already active')
  it('clearFilters resets query and tags')
})
```

No mocks needed — pure computed logic with a provided ref.

### `src/__tests__/composables/usePagination.spec.js`

```
describe('usePagination', () => {
  it('returns first page slice by default')
  it('returns correct slice for page 2')
  it('calculates totalPages correctly')
  it('totalPages rounds up for partial last page')
  it('resets to page 1 when items change')
  it('handles empty items array')
})
```

---

## Step 11 — View Tests

### `src/__tests__/views/HomeView.spec.js`

```
describe('HomeView', () => {
  it('shows skeleton loader while recipes are loading')
  it('renders HeroRecipe when recipes are loaded')
  it('renders RecipeCard list')
  it('selects a random featured recipe index on mount')
})
```

Mock: Pinia store with `createTestingPinia()` from `@pinia/testing`

### `src/__tests__/views/BrowseView.spec.js`

```
describe('BrowseView', () => {
  it('renders recipe grid')
  it('filters recipes when search query changes')
  it('filters by tag when tag button is clicked')
  it('resets to page 1 when filter changes')
  it('shows empty state when no results match')
  it('shows skeleton loaders while loading')
})
```

### `src/__tests__/views/RecipeDetailView.spec.js`

```
describe('RecipeDetailView', () => {
  it('renders recipe name and description')
  it('shows edit and delete buttons for recipe owner')
  it('hides edit and delete buttons for non-owner')
  it('shows delete confirmation dialog on delete button click')
  it('calls deleteRecipe and navigates away after confirm')
  it('loads ingredients from subcollection')
})
```

Mock: `useRoute` returning a `recipeId` param; auth store with `user.uid`

### `src/__tests__/views/RecipeFormView.spec.js`

```
describe('RecipeFormView', () => {
  describe('create mode', () => {
    it('renders empty form')
    it('shows validation errors when submitted empty')
    it('submits and navigates on valid submit')
  })
  describe('edit mode (recipeId in route)', () => {
    it('pre-populates form fields from store')
    it('calls updateRecipe on submit')
  })
  it('adds and removes ingredient rows')
  it('adds and removes direction rows')
})
```

---

## Step 12 — Component Tests

### `src/__tests__/components/HeroRecipe.spec.js`

```
describe('HeroRecipe', () => {
  it('renders recipe name and description')
  it('renders ingredients tab by default')
  it('switches to directions tab on click')
  it('shows loading state while ingredients are fetching')
  it('renders ingredients list when loaded')
})
```

### `src/__tests__/components/AuthenticationForm.spec.js`

```
describe('AuthenticationForm', () => {
  it('renders sign in form by default')
  it('switches to sign up mode')
  it('emits submit event with email and password')
  it('shows error message when passed as prop')
  it('disables submit button while loading')
  it('error message has aria-describedby connection to input')
})
```

---

## Conventions

- All test files use `describe/it` naming
- Group related tests in nested `describe` blocks
- Use `@pinia/testing`'s `createTestingPinia()` for store isolation
- Firebase calls are always mocked — no real network calls in tests
- Each test is independent — no shared mutable state between `it` blocks
- Prefer `userEvent` from `@testing-library/user-event` over manual `trigger()` for interactions

## Files Created

```
src/__tests__/composables/useRecipeIngredients.spec.js
src/__tests__/composables/useIngredients.spec.js
src/__tests__/composables/useDirections.spec.js
src/__tests__/composables/useRecipeForm.spec.js
src/__tests__/composables/useRecipeSearch.spec.js
src/__tests__/composables/usePagination.spec.js
src/__tests__/views/HomeView.spec.js
src/__tests__/views/BrowseView.spec.js
src/__tests__/views/RecipeDetailView.spec.js
src/__tests__/views/RecipeFormView.spec.js
src/__tests__/components/HeroRecipe.spec.js
src/__tests__/components/AuthenticationForm.spec.js
```

## Verification

```bash
npm run test          # All ~12 new test files pass
npm run test --coverage  # View coverage report
```

All new composables should reach >80% line coverage. Views can be lower (~60%) given complex async/Firebase interactions.
