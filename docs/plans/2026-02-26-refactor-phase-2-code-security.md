# Phase 2 — Code Security Audit

**Date**: 2026-02-26
**Branch**: `feature/src-refactor`
**Skill**: `code-security`
**Depends on**: Phase 1 complete

## Context

Surface-level security audit using the `code-security` skill. The codebase already follows most secure patterns (no SQL, Firebase handles queries, env vars for config), but these specific vectors need explicit verification after Phase 1 refactoring.

## Pre-flight

Load the `code-security` skill before starting. Reference `rules/xss.md` and `rules/_sections.md` as needed.

---

## Step 9 — Security Audit Checklist

Work through each item. Fix any violations found.

### 9.1 — XSS via `v-html`

**Files to check**: All `.vue` files

Search for any `v-html` directive. If found:
- If the value comes from user-submitted data (recipe description, name, etc.), it **must** be sanitized with `DOMPurify` before rendering
- If it's static/trusted content (hard-coded HTML from the app itself), it is acceptable

Expected result: No `v-html` found, or any that exists is safe.

### 9.2 — Prototype Pollution in recipe data handling

**Files to check**:
- `src/features/recipes/services/recipeService.js`
- New composables from Phase 1 (especially `useRecipeForm.js`)

Look for patterns like:
```js
// UNSAFE: user object keys could include __proto__
Object.assign(target, userInput)

// SAFE: spread creates new object, doesn't walk prototype
const safe = { ...userInput }
```

Verify that when recipe data from the form is passed to Firestore, it's spread into a clean object rather than directly assigned. Check `addRecipe` and `updateRecipe` in `recipeService.js`.

### 9.3 — userId injection

**File**: `src/features/recipes/services/recipeService.js` — `addRecipe(recipeData)`

Verify the `userId` field is always sourced from `auth.currentUser.uid` (server-trusted identity), never from the `recipeData` argument passed in from the form.

Expected pattern:
```js
// GOOD: userId comes from authenticated session, not user input
const recipeDoc = {
  ...recipeData,
  userId: auth.currentUser.uid,  // ← always overwrite, never trust input
  createdAt: serverTimestamp(),
}
```

If `recipeData` could contain a `userId` field that gets spread before the override, reorder so the auth uid wins.

### 9.4 — Input validation completeness

**File**: `src/features/recipes/composables/useRecipeForm.js` (after Phase 1)

Verify the `validate()` function checks:
- `name` is non-empty and has a reasonable length cap (e.g., 200 chars)
- `description` has a reasonable length cap if populated
- `ingredients` array items are non-empty strings before submit

These aren't security vulnerabilities per se, but they prevent malformed data from reaching Firestore.

### 9.5 — Auth guard completeness

**File**: `src/router/index.js`

Verify the `protectedRoutes` array in `beforeEach` includes **all** routes that write data:
- `recipe-create` ✓ (already listed)
- `recipe-edit` ✓ (already listed)

No new routes added in this refactor, so this should still be complete.

### 9.6 — Hardcoded secrets

**All files**: Confirm no Firebase API keys, storage bucket names, or project IDs appear hardcoded. All should reference `import.meta.env.VITE_FIREBASE_*`.

---

## Files Changed

Only change files where violations are found. Expected changes are minimal — primarily `recipeService.js` if the userId ordering needs fixing.

| File | Expected Action |
|------|----------------|
| `src/features/recipes/services/recipeService.js` | Minor fix if userId not overwriting correctly |
| `src/features/recipes/composables/useRecipeForm.js` | Add length caps to validation |

## Verification

```bash
npm run test   # All tests still pass
npm run build  # No build errors
```

Manual check: Submit a recipe form with an extremely long name (500+ chars) — should be rejected by client-side validation.
