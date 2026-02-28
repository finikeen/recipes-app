# Spec for ingredient-search

branch: claude/feature/ingredient-search
instructions: @.claude/instructions/vuejs3.instructions.md

## Summary

Add an "Ingredient Search" view (or panel) that lets users build a list of ingredients they have on hand and a list of tags, then see which recipes match. A numeric slider controls the minimum number of selected ingredients that must appear in a recipe (e.g. "at least 2 of 4"). This feature is separate from the existing Browse page's name/tag search.

## Functional Requirements

- Accessible form labels and ARIA attributes where appropriate (WCAG 2.1 Level AA standard)
- Responsive layout suitable for mobile and desktop
- **Ingredient input:** A text input with typeahead/autocomplete that suggests ingredient names from the known set of ingredients across all recipes. Selecting a suggestion adds the ingredient to the active search list.
- **Ingredient chips list:** Display the currently selected ingredients as removable chips/pills below the input. Each chip has an × button to remove it.
- **Match threshold slider:** A numeric slider (PrimeVue Slider) with a label such as "Match at least N of M ingredients". The minimum is 1 and the maximum equals the number of currently selected ingredients. Defaults to 1 when any ingredient is added, and auto-clamps if ingredients are removed.
- **Tag filter:** Allow the user to also filter by one or more tags (reuse the existing tag chip UI pattern from BrowseView). Tag filtering is additive with ingredient filtering (a recipe must satisfy both).
- **Results list:** Show matching recipe cards (reuse `RecipeCard` component) in a responsive grid. Show a count of results, e.g. "4 recipes found". Show an empty-state message if no recipes match.
- **Clear all button:** A single button that resets the ingredient list, tag filters, and slider back to defaults.
- **Loading state:** Show skeleton cards while ingredient data is being fetched.
- The feature is accessible from the main navigation (add a "Ingredient Search" nav link or route).

## Data / Architecture Notes

- Ingredient item names are stored in the Firestore subcollection `recipes/{recipeId}/ingredients` as the `item` field (lowercase strings).
- Firestore does not support cross-collection array queries, so ingredient matching must happen client-side.
- To avoid N+1 Firestore reads at search time, denormalize ingredient names onto each recipe document as an `ingredientNames` array (lowercase, deduplicated) when recipes are loaded or saved. The implementation plan should decide the best approach (e.g. add `ingredientNames` to the recipe document vs. fetching all ingredient subcollections once on page load).
- Tag data is already available on recipe documents as the `tags` array — no additional fetching required for tag filtering.
- Ingredient autocomplete suggestions should be derived from the union of all `ingredientNames` across all loaded recipes, sorted alphabetically.

## Possible Edge Cases

- User selects more ingredients than any recipe has — show a helpful empty state rather than an error.
- Slider max changes when the user removes an ingredient — auto-clamp the slider value to the new max.
- Ingredient names may have slight spelling variations between recipes (e.g. "chicken breast" vs "chicken breasts") — matching should be case-insensitive; do not attempt fuzzy matching for now.
- Zero recipes loaded (e.g. network error or empty database) — handle gracefully with an error or empty state.
- A recipe with no `ingredientNames` field (not yet denormalized) — treat it as having zero matching ingredients.

## Open Questions

- Should the Ingredient Search be a new dedicated route (e.g. `/search`) or a panel/tab within the existing Browse view?
- Should ingredient autocomplete suggestions include partial matching (substring) or only prefix matching?
- Should the match threshold apply before or after the tag filter? (Proposed: both conditions must pass — ingredient match AND all selected tags present.)

## Testing Guidelines

Create a test file in `src/tests/` for the new composable(s). Create meaningful tests for:
- Filtering recipes by a single ingredient
- Filtering recipes by multiple ingredients with a threshold of 1
- Filtering recipes by multiple ingredients with a threshold equal to the full selection (all must match)
- Slider auto-clamping when an ingredient is removed
- Combined ingredient + tag filtering
- Empty state when no recipe matches the selected ingredients
