# Spec for Mobile Navigation Menu

branch: claude/feature/mobile-navigation-menu
instructions: @.claude/instructions/vuejs3.instructions.md

## Summary

Implement a responsive navigation system that works seamlessly on both desktop and mobile devices. Extract navigation links (browse, new recipe, auth) into a reusable component that can be displayed in the desktop navbar and within a mobile slide-out menu. On mobile devices, display a hamburger menu icon on the right side of the navbar that toggles the visibility of a navigation panel.

## Functional Requirements

- Create a reusable navigation links component that displays browse, new recipe, and authentication links
- Add a hamburger menu icon visible only on mobile/small screens (right side of navbar)
- Implement a slide-out/toggle mobile menu that appears on the right side when hamburger icon is clicked
- Close mobile menu when a link is clicked or when clicking outside the menu
- Mobile menu should be dismissible with a close button or by clicking the hamburger icon again
- Navigation links in mobile menu should have the same functionality as desktop navbar links
- Accessible form labels and ARIA attributes where appropriate (WCAG 2.1 Level AA standard)
- Responsive layout suitable for mobile and desktop devices
- Mobile menu should not overlap with important content (consider z-index and positioning)

## Possible Edge Cases

- Menu should close automatically when navigating to a new route
- Handle rapid clicking on hamburger icon gracefully
- Ensure touch targets are large enough on mobile (minimum 44x44px recommended)
- Mobile menu should be responsive to orientation changes (portrait/landscape)
- Keyboard navigation (Escape key to close menu, Tab to navigate through links)
- Screen reader users should properly understand menu structure and state

## Open Questions

- What animation/transition style is preferred for the mobile menu (slide-in, fade, etc.)? slide-in from the right is a common choice for mobile menus, but we can consider alternatives based on design preferences.
- Should the mobile breakpoint match the existing responsive design breakpoints in the project? yes
- Any specific visual styling preferences for the hamburger icon (3-line menu, X close icon)? surprise me with a modern and clean "forge" design for the hamburger icon, and ensure it transforms into a close icon when the menu is open.

## Testing Guidelines

Create a test file(s) in the src/tests folder for the new feature, and create meaningful tests for the following cases:
- Mobile menu opens and closes correctly
- Navigation links function properly in both desktop and mobile views
- Menu closes when a link is clicked
- Menu closes when clicking outside of it
- Hamburger icon is hidden on desktop and visible on mobile
- Keyboard navigation (Escape key closes menu)
- Menu state is properly managed during route changes
