# Implementation Plan: Recipe Card Component

**Branch:** claude/feature/recipe-card-component
**Spec:** _specs/recipe-card-component.md

---

## 1. COMPONENT OVERVIEW

The Recipe Card Component will be an enhanced version of the existing `/src/features/recipes/components/RecipeCard.vue`. It needs to:
- Display recipe metadata (title, description, tags)
- Support tag truncation to 15 characters + ellipsis
- Make tags clickable for filtering
- Use PrimeVue Card component with semantic token styling
- Support responsive layout (mobile-first)
- Handle edge cases gracefully

---

## 2. FILE LOCATION & STRUCTURE

**File:** `/src/features/recipes/components/RecipeCard.vue`

This component will:
- Replace the existing minimal RecipeCard component
- Stay in the same location (already referenced in HomeView.vue)
- Maintain backward compatibility with existing imports

---

## 3. COMPONENT API DESIGN

### Props:
```javascript
{
  recipe: {
    type: Object,
    required: true,
    // Shape: { id, title, description, tags }
  },
  clickable: {
    type: Boolean,
    default: true
  }
}
```

### Emits:
- `click`: Emitted when card is clicked (bubbles from card itself)
- `tag-click`: Emitted when a tag is clicked with payload `{ tagName: string }`

---

## 4. TEMPLATE STRUCTURE

The component will follow this hierarchical structure:

```
<Card>
  Title (using Card's #title slot)
  Content area:
    - Description paragraph (with line-clamp styling)
    - Tags container (flex row, wrappable)
      - Individual tag badges (clickable buttons)
    - Image placeholder (empty div for future expansion)
```

**Key Template Elements:**
- Use PrimeVue Card component wrapping with semantic tokens
- Use native HTML `<button>` elements for tags (better accessibility than divs)
- Use `line-clamp-2` or `line-clamp-3` Tailwind utility for description truncation
- Implement proper ARIA attributes for accessibility

---

## 5. STYLING APPROACH

### Color & Theme Strategy:
- Use PrimeVue semantic tokens throughout:
  - `text-color` for title and primary text
  - `text-muted-color` for descriptions and secondary text
  - `bg-surface-0` for card background (inherits from Card)
  - `bg-surface-50` for tag backgrounds
  - `border-surface` for borders

### Custom Classes (BEM Naming):
Create scoped styles with `@apply` directives:

```css
.recipe-card { }
.recipe-card__title { }
.recipe-card__description { }
.recipe-card__tags { }
.recipe-card__tag { }
.recipe-card__tag--truncated { }
.recipe-card__image-placeholder { }
```

### Responsive Design:
- Mobile (default): Single column, full-width tags
- Tablet (md:): Potentially modified padding/spacing
- Desktop (lg:): Enhanced hover/focus states

### Key Styling Details:
- Use `@reference "../../../assets/main.css"` directive (correct relative path for scoped styles)
- Tags: Use `text-xs` or `text-sm` with `px-2 py-1` padding
- Description: Apply `line-clamp-2` or `line-clamp-3` to limit lines
- Tag truncation: CSS `max-width` + `text-ellipsis` + `overflow-hidden` + `whitespace-nowrap`
- Hover states: Subtle opacity change or bg color shift for interactive elements
- Focus states: Proper focus ring styling for accessibility

---

## 6. TAG TRUNCATION & DISPLAY LOGIC

### Tag Processing:
1. Accept `tags` array from recipe object
2. Slice to first 5 tags: `tags?.slice(0, 5) ?? []`
3. For each tag, truncate to 15 characters:
   ```javascript
   const truncateTag = (tag, maxLength = 15) => {
     return tag.length > maxLength ? tag.substring(0, maxLength) + '...' : tag
   }
   ```

### Computed Properties Needed:
- `displayTags`: Computed array of processed tags with truncation applied
- `truncatedDescription`: Using CSS line-clamp rather than JavaScript

### Template Rendering:
```vue
<div class="recipe-card__tags">
  <button
    v-for="tag in displayTags"
    :key="tag"
    class="recipe-card__tag"
    :title="recipe.tags[index]"
    @click="handleTagClick(recipe.tags[index])"
  >
    {{ truncateTag(tag) }}
  </button>
</div>
```

**Accessibility:** Use `title` attribute to show full tag name on hover

---

## 7. CLICK HANDLERS & EVENTS

### Card Click Handler:
- Check `clickable` prop
- If true, emit `click` event
- Consider using RouterLink for direct recipe navigation (to be determined with parent component)

### Tag Click Handler:
- Prevent event propagation (stopPropagation)
- Emit `tag-click` with full tag name (untrimmed)
- Allow parent component (HomeView) to handle filtering logic

---

## 8. RESPONSIVE BEHAVIOR

### Mobile-First Approach:
- Default: Vertical stacking of tags, full width
- **md breakpoint:** May adjust padding/margins
- **lg breakpoint:** Enhanced visual treatment

### Layout Considerations:
- Ensure Card component width is constrained by parent grid (HomeView uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Description uses line-clamp to prevent excessive height variation
- Tags wrap naturally but don't exceed card width

---

## 9. EDGE CASE HANDLING

**Empty/Missing Description:**
- Recipe without description shows: "No description provided"
- Check: `recipe.description || 'No description provided'`

**Long Title:**
- Let it wrap naturally with `word-wrap: break-word` or Tailwind's default
- Title uses `text-3xl` or `text-2xl` to maintain hierarchy

**No Tags:**
- Check: `recipe.tags?.length ? ... : null`
- Don't render tag container if no tags

**More than 5 Tags:**
- Automatically slice to first 5
- Could add visual indicator "... and more" but spec doesn't require

**Long Tag Names:**
- Implemented via truncateTag function with 15-char limit
- `title` attribute provides full text on hover

---

## 10. COMPONENT COMPOSITION

### Script Setup Structure:
```javascript
<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'

const props = defineProps({
  recipe: { type: Object, required: true },
  clickable: { type: Boolean, default: true }
})

const emit = defineEmits(['click', 'tag-click'])

// Computed properties
const displayTags = computed(() => {
  const tags = props.recipe.tags ?? []
  return tags.slice(0, 5).map(truncateTag)
})

const displayDescription = computed(() => {
  return props.recipe.description || 'No description provided'
})

// Methods
const truncateTag = (tag, maxLength = 15) => {
  return tag.length > maxLength ? tag.substring(0, maxLength) + '...' : tag
}

const handleCardClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

const handleTagClick = (tag, event) => {
  event.stopPropagation()
  emit('tag-click', { tagName: tag })
}
</script>
```

---

## 11. TESTING STRATEGY

**Test File Location:** `/src/__tests__/components/RecipeCard.spec.js`

**Testing Framework:** Vitest + Vue Test Utils (already configured in project)

### Test Categories:

**Basic Rendering:**
- Component renders with required props
- Displays recipe title
- Displays recipe description
- Displays tags

**Description Truncation:**
- Description displays normally if short
- Long description properly truncated via CSS line-clamp
- Missing description shows fallback text

**Tag Handling:**
- Displays up to 5 tags (slice first 5)
- Truncates long tag names to 15 chars + "..."
- Hides tag container if no tags exist
- Tag truncation preserves accessibility via title attribute

**Click Events:**
- Card click emits 'click' event when clickable=true
- Card click does NOT emit when clickable=false
- Tag click emits 'tag-click' with full tag name
- Tag click prevents card click propagation

**Edge Cases:**
- Handles null/undefined tags gracefully
- Handles empty description string
- Handles empty tags array
- Handles recipe object with missing properties

**Accessibility:**
- Tags have proper title attributes for full text
- Card is keyboard accessible if clickable
- Proper semantic HTML (button elements for tags)

---

## 12. INTEGRATION POINTS

### HomeView.vue Integration:
- Already imports and uses `<RecipeCard>` component
- Grid layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Expected to remain unchanged; component enhancement is backward compatible

### Parent Component Responsibilities (HomeView):
- Handle `@click` event to navigate to recipe detail
- Handle `@tag-click` event to implement tag filtering
- Current version doesn't implement these - they're for future expansion

---

## 13. IMPLEMENTATION SEQUENCE

### 1. Define Component Props & Emits (5 min)
- Set up TypeScript-style prop validation
- Define emit events

### 2. Create Template Structure (20 min)
- Card wrapper with proper PrimeVue semantics
- Title, description, tags sections
- Placeholder for future image field
- Proper accessibility attributes

### 3. Implement Tag Truncation Logic (10 min)
- Write truncateTag function
- Create displayTags computed property
- Add click handlers with event stopping

### 4. Add Styling with PrimeVue Tokens (25 min)
- Create BEM-structured classes
- Apply @apply directives with semantic tokens
- Implement hover/focus states
- Add line-clamp for description
- Add tag styling (badges)
- Reference main.css with correct path

### 5. Implement Click Handlers (10 min)
- Card click with clickable prop check
- Tag click with event propagation control
- Emit appropriate events

### 6. Add Responsive Behavior (10 min)
- Verify mobile-first styling
- Test at different breakpoints
- Ensure tag wrapping works

### 7. Write Comprehensive Tests (30 min)
- Set up test file with proper mocking
- Write tests for all requirements
- Test edge cases
- Verify accessibility features

### 8. Verify Integration (10 min)
- Ensure HomeView renders correctly
- Check grid layout
- Verify no breaking changes

---

## 14. DEPENDENCY ANALYSIS

### External Dependencies:
- `primevue/card` - Already imported in RecipeCard.vue
- `vue` - Core framework (Composition API)
- Tailwind CSS - Via @tailwindcss/vite
- PrimeVue Aura theme tokens - Via main.css imports

### Internal Dependencies:
- Recipe data from store (props from parent)
- PrimeVue semantic tokens (from tailwindcss-primeui)

---

## 15. ACCESSIBILITY CONSIDERATIONS

- Use semantic HTML: `<button>` for tags, not divs
- Keyboard navigation: Tab through tags, click with Enter/Space
- ARIA attributes: `aria-label` or proper button text for tags
- Color contrast: Verify with PrimeVue token colors
- Focus states: Visible focus rings (browser default + custom styling)
- Title attributes: Full tag names on hover
- Alt text: Not needed for non-image content
- Screen readers: Proper heading hierarchy (Card title is semantic)

---

## Critical Files for Implementation

1. **`src/features/recipes/components/RecipeCard.vue`** - Core component file; contains template, script setup, and scoped styles. This is the main implementation target.

2. **`src/features/recipes/views/HomeView.vue`** - Parent component that uses RecipeCard; provides context for integration and styling grid layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). Reference for pattern matching on @reference path and BEM class naming.

3. **`src/assets/main.css`** - Contains Tailwind and PrimeVue token imports; must be referenced with correct relative path (`@reference "../../../assets/main.css"`) in scoped styles.

4. **`src/__tests__/components/RecipeCard.spec.js`** - Test file (to be created); follows project's Vitest + Vue Test Utils pattern seen in existing tests.

5. **`src/features/recipes/store.js`** - Recipe data source; defines recipe object shape with `id`, `title`, `description`, `tags` properties.

---

## Next Steps

Review this plan and let me know:
- ✅ Any modifications needed
- ✅ Any concerns or questions
- ✅ Ready to proceed with implementation
