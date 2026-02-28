# Spec for Ingredient Text Parser Quick Fix

branch: claude/feature/ingredient-text-parser

## Summary

Add a "fix" icon button to ingredient list rows (in edit mode) that automatically parses raw ingredient text and intelligently splits it into separate quantity, unit, and ingredient name fields. This provides a quick way for users to correct ingredients that were imported or scraped in malformed formats (e.g., "2 cups flour" combined as a single string).

## Functional Requirements

- Display a "fix" icon button on each ingredient row in edit mode, positioned next to the delete button
- Icon should be visually distinct but not overwhelming (e.g., a wrench or similar)
- When clicked, the button parses the current ingredient text value and attempts to extract:
  - Quantity (numeric value)
  - Unit (e.g., cups, tsp, grams, etc.)
  - Ingredient name (remaining text)
- If parsing is successful, update the current row's quantity, unit, and ingredient fields with the parsed values
- If parsing fails (unparseable format), show a brief, friendly error message to the user
- Button should be disabled if the ingredient field is empty
- Maintain accessibility with proper ARIA labels and keyboard support
- Responsive layout suitable for mobile and desktop views

## Possible Edge Cases

- Empty ingredient field (button disabled)
- Text with no clear quantity (e.g., "flour") → quantity field remains empty or gets default value
- Ambiguous units (e.g., "oz" for ounce or ounces) → choose most common interpretation
- Fractional quantities (e.g., "1 1/2 cups") → parse and preserve correctly
- Ingredient names with numbers (e.g., "Parmesan 24 month aged") → don't confuse as quantity
- Very long ingredient names → ensure UI doesn't break
- Non-English units or formats → graceful fallback

## Open Questions

- Should the parser support fractional formats like "1/2" or "1 1/2"? yes
- What is the list of recognized units (cups, tbsp, tsp, grams, ml, oz, etc.)? start with common cooking units and expand as needed
- Should parsing overwrite existing quantity/unit/ingredient fields or only fill empty ones? overwrite for simplicity, but consider an "undo" option if this becomes a common user need
- What should the error message say if parsing fails? "Sorry, we couldn't parse that ingredient. Please check the format and try again."
- Should there be an undo button or confirmation if the user wants to revert the parsed values? no yet, but consider if user feedback indicates a need for this

## Testing Guidelines

Create test file(s) in `src/__tests__/composables` or `src/__tests__/components` for the new feature:

- Test parsing "2 cups flour" correctly splits into quantity=2, unit=cups, ingredient=flour
- Test parsing "1 1/2 tbsp sugar" handles fractions correctly
- Test parsing "pinch of salt" with no quantity
- Test parsing ingredient names containing numbers (e.g., "Parmesan 24 month aged")
- Test button is disabled when ingredient field is empty
- Test parsing with unrecognized units shows appropriate error
- Test parsing preserves or overwrites existing values (per design decision)
