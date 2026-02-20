# Authentication Form Spec

## Overview
Create a reusable authentication component that supports both login and signup modes with an easy toggle between them.

## Feature Title
Authentication Form with Login and Signup Modes

## User Stories

### Story 1: Toggle Between Login and Signup
As a user, I want to easily switch between login and signup forms so that I can manage my account access efficiently.

**Acceptance Criteria:**
- A toggle or link is clearly visible to switch between login and signup modes
- The form content updates when switching modes
- Current form state is preserved when toggling (or cleared, depending on UX preference)

### Story 2: Login Form
As a user, I want to enter my email and password to log in so that I can access my account.

**Acceptance Criteria:**
- Email input field is present and accepts valid email format
- Password input field is present with a hide/show password toggle
- Submit button is labeled "Login"
- Form submission logs the email and password to the browser console
- Form is functional (no actual authentication backend required)

### Story 3: Signup Form
As a new user, I want to create an account with email and password so that I can start using the application.

**Acceptance Criteria:**
- Email input field is present and accepts valid email format
- Password input field is present with a hide/show password toggle
- Submit button is labeled "Sign Up"
- Form submission logs the email and password to the browser console
- Form is functional (no actual authentication backend required)

### Story 4: Password Visibility Toggle
As a user, I want to toggle password visibility so that I can verify what I've typed.

**Acceptance Criteria:**
- An eye icon or similar visual indicator is visible on the password field
- Clicking the icon toggles between showing and hiding the password
- The icon state clearly indicates the current visibility status
- Works identically in both login and signup modes

## Component Structure
- Single authentication component that manages both modes internally
- Props to control initial mode (login/signup) and potentially callback functions
- Emits events when form is submitted (not required for this phase, console logging is sufficient)
- use @.claude/instructions/vuejs3.instructions.md for reference

## Styling Requirements
- Use PrimeVue components for form inputs and buttons
- Respect PrimeVue semantic color tokens for theme compatibility
- Accessible form labels and ARIA attributes where appropriate (WCAG 2.1 Level AA standard)
- Responsive layout suitable for mobile and desktop
- Consistent with existing Recipe Forge styling

## Out of Scope
- Actual authentication backend integration
- Form validation beyond email format
- Password requirements/strength checking
- Remember me functionality
- Forgot password flows
- Social login options
