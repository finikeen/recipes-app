# Spec for Recipe Card Component

branch: claude/feature/recipe-card-component
instructions: @.claude/instructions/vuejs3.instructions.md

## Summary

A reusable recipe card component that displays essential recipe information in a compact, list-friendly format. The card presents the recipe title, a truncated description, and up to 3 tags. Designed for use in recipe listing views with potential for expansion to additional data and interaction patterns in the future.

## Functional Requirements

- Display recipe title as the primary heading
- Display a truncated description (2-3 lines maximum) with ellipsis if text exceeds limit
- Display up to 5 recipe tags (e.g., cuisine type, dietary restrictions, cooking method)
- Accept a recipe object from the recipes collection with standard structure (id, name, description, tags)
- Be fully responsive for mobile and desktop viewports
- Support hover/focus states for interactive feedback
- Maintain theme-aware styling using PrimeVue semantic tokens
- Accessible form labels and ARIA attributes where appropriate (WCAG 2.1 Level AA standard)
- Be reusable across multiple list contexts (home view, search results, category filters, etc.)

## Component API

- **Props:**
  - `recipe` (Object): A recipe object with at minimum { id, name, description, tags }
  - `clickable` (Boolean, optional): Whether the card responds to click events (default: true)

- **Emits:**
  - `click`: Fired when card is clicked (if clickable is true)

## Design Considerations

- The card layout should prioritize readability and visual hierarchy
- Tags should be visually distinct but not overwhelming
- Future extensibility: component structure should allow easy addition of fields like image, rating, cook time, difficulty level, or action buttons
- Consider mobile-first responsive design
- Use consistent spacing and typography from the app design system

## Possible Edge Cases

- Recipe with no description (empty string)
- Recipe with very long title (should wrap appropriately)
- Recipe with no tags or more than 5 tags (show only first 5)
- Recipe with very long tag names (truncate to 15chars plus ...)
- Mobile viewport with limited horizontal space

## Open Questions

- Should the card display a recipe image/thumbnail placeholder in the future? possible, placeholder for now
- Should tags be clickable for filtering? yes
- What is the target card size/dimensions for the list layout? unknown yet. circle back
- Should the card show any additional metadata (cook time, servings, etc.)? not yet. circle back

## Testing Guidelines

Create a test file in the `src/tests` folder for the new component, with meaningful tests for:
- Rendering recipe title, description, and tags correctly
- Truncating description to expected line limit
- Displaying maximum of 3 tags
- Handling edge cases (no description, no tags, long text)
- Responsive behavior on different viewport sizes
