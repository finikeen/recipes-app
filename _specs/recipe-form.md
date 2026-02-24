# Spec for Recipe Form (New & Edit)

branch: claude/feature/recipe-form
instructions: @.claude/instructions/vuejs3.instructions.md

## Summary

A shared form view used for both creating a new recipe and editing an existing one. The form collects all recipe data: name, description, a dynamically-managed ingredient list, a dynamically-managed directions list, and auto-derived tags. The mode (create vs edit) is determined by the presence of the `:id` route param (already wired in the router).

## Functional Requirements

- Accessible form labels and ARIA attributes where appropriate (WCAG 2.1 Level AA standard)
- Responsive layout suitable for mobile and desktop
- **Name field**: Required text input for the recipe title.
- **Description field**: Required multi-line textarea for a short description of the recipe.
- **Ingredients list**: Users can incrementally add ingredients one at a time. Each ingredient entry has fields for quantity, unit, and item name. Users can remove any ingredient entry. There must be at least one ingredient to submit.
- **Directions list**: Users can incrementally add direction steps one at a time. Each step is a single text field. Users can reorder steps (move up / move down) and remove any step. There must be at least one direction step to submit.
- **Tags**: Tags are derived automatically from the entered data (name, description, ingredients) — the user does not type tags manually. The derived tags are displayed as a read-only preview before submission so the user can see what will be saved.
- **Edit mode**: When an `:id` param is present, the form pre-fills with the existing recipe data fetched from the store/service. The page title and submit button label reflect "Edit Recipe".
- **Create mode**: When no `:id` param is present, the form starts empty. The page title and submit button label reflect "New Recipe".
- **Submit**: On valid submission, the recipe is saved (created or updated) and the user is navigated to the recipe detail page.
- **Cancel**: A cancel button discards changes and navigates back (to detail page in edit mode, to home/browse in create mode).
- **Validation**: Required fields (name, description, at least one ingredient, at least one direction step) must be filled before submission. Show inline validation errors on attempt to submit.
- **Loading state**: While fetching existing data (edit mode) or submitting, the form shows appropriate loading/disabled states to prevent double submission.

## Possible Edge Cases

- Navigating to edit mode with a non-existent recipe ID should show a "not found" message and not render the form.
- Removing all ingredients or all direction steps should re-enable the "add" affordance and block form submission with a clear error.
- Image preview should be cleared if the user removes the selected file.
- Tag derivation should handle empty/whitespace-only inputs gracefully (produce no tags rather than blank tags).
- Long ingredient or direction lists should scroll without breaking the layout.
- On mobile, the ingredient and direction builders should be fully usable with touch.

## Open Questions

- What is the tag derivation algorithm? keyword extraction from name + description + ingredient items
- Should ingredients support a defined unit vocabulary (dropdown) or a free-text unit field? free form
- Is there a maximum number of ingredients or direction steps? no
- Should direction steps support rich text or plain text only? plain text only

## Testing Guidelines

No test suite is configured in this project — skip automated tests. Verify manually in the browser:
- Create mode: fill all fields, add ingredients and steps, confirm tags appear, submit and verify navigation to detail page.
- Edit mode: navigate to an existing recipe's edit URL, confirm pre-filled data, make a change, submit and verify the update.
- Validation: attempt to submit with missing required fields and confirm inline errors appear.
- Cancel: confirm navigation goes to the correct destination in both modes.
- Responsive: verify the form is usable on a narrow mobile viewport.
