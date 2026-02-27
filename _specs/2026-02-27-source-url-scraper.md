# Spec for Source URL Scraper

branch: claude/feature/source-url-scraper
instructions: @.claude/instructions/vuejs3.instructions.md

## Summary

Add a `RecipeSourceUrl` component to the recipe form that lets users provide a URL for the original source of a recipe. If the URL is new, a "Scrape" button triggers a scraping process that auto-fills the recipe form fields. If the recipe already has a `sourceUrl` saved, the field is read-only and the button is disabled (the data has already been imported).

## Functional Requirements

- Accessible form labels and ARIA attributes where appropriate (WCAG 2.1 Level AA standard)
- Responsive layout suitable for mobile and desktop
- The component receives a `sourceUrl` prop (string or null) and emits a `scraped` event with the structured recipe data returned by the scraper
- When `sourceUrl` is null/empty:
  - Show an editable text input for the user to enter a URL
  - Show an active "Scrape" button beside it
  - On button click, call the scraping service and emit `scraped` with the result
  - Show a loading state on the button while the request is in flight
  - Show an error message if scraping fails
- When `sourceUrl` is already set (recipe has been previously saved with a source):
  - The text input is `readonly` and shows the existing URL
  - The "Scrape" button is `disabled`
  - A small helper text explains that the source has already been imported
- The scraping logic lives in `@/server` (existing) — the component calls that service; it does not implement the scraping itself
- Place the component at the top of the form in `RecipeFormView`, above the name field

## Possible Edge Cases

- User enters a malformed or non-recipe URL — scraper returns an error or empty fields
- Scraper returns partial data (e.g. name but no ingredients) — form fields should be pre-filled with whatever was returned, leaving the rest blank for the user to complete
- Network timeout or server error during scraping — show a user-friendly error and allow retry
- User edits the URL field and clicks Scrape again before the first request resolves — cancel or ignore the in-flight request

## Open Questions

- Should users be able to clear a saved `sourceUrl` and re-scrape from a different URL, or is it permanently locked once saved? LLocked once saved.
- What fields does the scraper return? (name, description, ingredients, directions, tags?) Clarify the shape of the scraped payload so the `scraped` event can be typed correctly. Let's discuss more.
- Is the scraping endpoint already deployed, or does it need to be wired up as part of this feature? Let's discuss more

## Testing Guidelines

Create test file(s) in `src/__tests__/components/RecipeSourceUrl.spec.js`:

- Renders an enabled input and active Scrape button when `sourceUrl` prop is null
- Renders a readonly input and disabled Scrape button when `sourceUrl` prop is set
- Shows a loading state on the button while scraping is in progress
- Emits `scraped` event with the returned payload on successful scrape
- Shows an error message when the scraping service rejects
- Does not emit `scraped` if the input is empty when Scrape is clicked
