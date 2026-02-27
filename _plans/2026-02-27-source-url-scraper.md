# Plan: Source URL Scraper Component

## Context
The recipe form has a TODO comment for a `RecipeSourceUrl` component that lets users paste a URL, scrape it to auto-fill the form, and lock the field once a recipe has been saved with a source URL. The Express scraping server (`server/index.js`, `server/scraper.js`) is already built and working — this plan wires it to the Vue frontend.

## Key facts
- Vite dev server runs on **port 3000** (user confirmed)
- Express server currently listens on **port 3000** → must move to **3001**
- `package.json` uses `"type": "module"` — ES module syntax works in server files
- `useIngredients` and `useDirections` return `readonly` refs with no bulk-reset — need `reset()` added
- `recipeService` uses spread (`...data`) on Firestore calls — `sourceUrl` flows through automatically with no structural change needed
- Scraper response shape: `{ success, recipe: { name, description, ingredients: string[], directions: string[], parsedIngredients: [{quantity, unit, item, ...}] } }`

---

## Step 1 — Fix port conflict
**File:** `server/index.js` line 53

Change `app.listen(3000, ...)` → `app.listen(3001, ...)`. Update the console.log message to match.

---

## Step 2 — Vite proxy + concurrent dev script
**File:** `vite.config.js`

Add inside the existing `server` config object:
```
proxy: {
  '/api': 'http://localhost:3001'
}
```

**File:** `package.json`

Install `concurrently` as a devDependency. Update scripts:
```
"server": "node server/index.js",
"dev": "concurrently \"vite\" \"node server/index.js\""
```

---

## Step 3 — Add `reset()` to `useIngredients`
**File:** `src/features/recipes/composables/useIngredients.js`

Add inside the function body (writes directly to internal `_ingredients` ref, bypassing `readonly`):
```
const reset = (items = []) => {
  _ingredients.value = items.map(mapIngredient)
}
```
Add `reset` to return object.

---

## Step 4 — Add `reset()` to `useDirections`
**File:** `src/features/recipes/composables/useDirections.js`

Same pattern — add `reset(items)` that maps through `mapDirection` and assigns to the internal `_directions` ref. Add to return object.

---

## Step 5 — Extend `useRecipeForm`
**File:** `src/features/recipes/composables/useRecipeForm.js`

**5a.** Destructure `reset` (aliased as `resetIngredients` / `resetDirections`) from both composable calls.

**5b.** Add `const sourceUrl = ref('')`.

**5c.** In `onMounted` fetch block, after recipe loads: `sourceUrl.value = recipe.sourceUrl ?? ''`

**5d.** Add `applyScrapedData({ name: n, description: d, parsedIngredients, ingredients: rawIngs, directions: dirs })`:
- Set `name.value` and `description.value` if the scraped values are non-empty strings
- Prefer `parsedIngredients` (already `{quantity, unit, item}` shaped); fall back to raw `ingredients` strings mapped to `{ quantity: '', unit: '', item: raw }`
- Call `resetIngredients(mappedIngs)` and `resetDirections(dirs.map(text => ({ text })))`

**5e.** In `submitForm` payload object, add `sourceUrl: sourceUrl.value`.

**5f.** Expose `sourceUrl` and `applyScrapedData` in return object.

---

## Step 6 — Create `RecipeSourceUrl.vue`
**File to create:** `src/features/recipes/components/RecipeSourceUrl.vue`

**Props:** `modelValue` (String, default `null`)
**Emits:** `update:modelValue`, `scraped`

**Script logic:**
- `isLocked = computed(() => !!props.modelValue)`
- `localUrl = ref('')` — the editable input value
- `watch(() => props.modelValue, val => { if (val) localUrl.value = val })` — sync on save
- `loading = ref(false)`, `scrapeError = ref('')`
- `handleScrape()`: guard on `isLocked` or empty `localUrl`; POST `fetch('/api/scrape', { body: JSON.stringify({ url: localUrl.value }) })`; on success emit `update:modelValue` + `scraped`; on failure set `scrapeError`

**Template structure:**
```
<div class="rsource">
  <label for="source-url" class="rsource__label">Recipe Source URL</label>
  <div class="rsource__group">
    <InputText id="source-url" v-model="localUrl" :readonly="isLocked"
      placeholder="https://..." fluid
      :aria-describedby="scrapeError ? 'source-error' : undefined"
      :aria-invalid="!!scrapeError || undefined" />
    <Button type="button" label="Scrape" @click="handleScrape"
      :disabled="isLocked || loading" :aria-busy="loading" />
  </div>
  <span v-if="scrapeError" id="source-error" class="rsource__error"
    aria-live="polite">{{ scrapeError }}</span>
  <p v-if="isLocked" class="rsource__hint">
    Source already imported. Field is locked.
  </p>
</div>
```

**Scoped styles:** `@reference "../../../assets/main.css"` at top. BEM classes matching `rform__field` spacing and label style from `RecipeFormView.vue`.

---

## Step 7 — Wire into `RecipeFormView`
**File:** `src/features/recipes/views/RecipeFormView.vue`

- Remove TODO comment block (lines 1–8 of `<script setup>`)
- Add `import RecipeSourceUrl from '@/features/recipes/components/RecipeSourceUrl.vue'`
- Add to `useRecipeForm` destructuring: `sourceUrl`, `applyScrapedData`
- In template, place `<RecipeSourceUrl v-model="sourceUrl" @scraped="applyScrapedData" />` immediately after the `<h1>` + submit-error `<p>`, before the Name `<div class="rform__field">`

---

## Step 8 — Tests

**`src/__tests__/composables/useIngredients.spec.js`** — add cases for `reset()`:
- replaces all existing ingredients
- `reset([])` clears all

**`src/__tests__/composables/useDirections.spec.js`** — same for `reset()`

**`src/__tests__/composables/useRecipeForm.spec.js`** — add `applyScrapedData` cases:
- sets name/description from payload
- prefers `parsedIngredients` over raw strings
- falls back to raw strings mapped with empty quantity/unit
- `sourceUrl` included in `addRecipe` payload

**`src/__tests__/components/RecipeSourceUrl.spec.js`** (new file):
- Unlocked state: input not readonly, button not disabled
- Locked state (`modelValue` set): input readonly, button disabled
- `handleScrape` no-ops when `localUrl` is empty
- Calls `fetch('/api/scrape')` with correct body
- On success: emits `update:modelValue` and `scraped`
- On `success: false`: displays `failureReason` in error span
- On network error: displays generic error
- Loading: button has `aria-busy="true"` during fetch
- Error span has `aria-live="polite"`
- `aria-describedby` points to error element when error exists

---

## Verification
```bash
npm run dev          # starts both Vite (3000) and Express (3001)
npm run test -- --run  # all tests pass (aim: 102+ passing)
```

Manual smoke test:
1. Open RecipeFormView (create mode) — RecipeSourceUrl shows editable input + active Scrape button
2. Paste a valid recipe URL, click Scrape — form name/description/ingredients/directions pre-fill
3. Save the recipe — reload in edit mode — field shows saved URL as readonly, button disabled
4. Paste invalid URL — error message appears in `aria-live` region
