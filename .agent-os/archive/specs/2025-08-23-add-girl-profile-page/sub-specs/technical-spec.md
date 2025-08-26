# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-23-add-girl-profile-page/spec.md

## Technical Requirements

### Page Structure & Routing
- Create `/add-girl` route as the main entry point from marketing/landing pages
- Implement as Next.js App Router page with proper metadata and SEO optimization
- Mobile-first responsive design with minimum 44px touch targets for all interactive elements
- Progressive Web App compatibility with proper viewport settings

### Form Implementation
- React Hook Form for form state management and validation
- Zod schema validation for type-safe form data handling
- Real-time validation with debounced field checking to minimize API calls
- Form persistence in localStorage to prevent data loss on page refresh
- Accessible form labels and ARIA attributes for screen reader compatibility

### Field Specifications
- **First Name**: Text input with 2-50 character validation, trim whitespace, title case formatting
- **Age**: Number input with range validation (18-99), numeric keyboard on mobile devices  
- **Ethnicity**: Custom dropdown with predefined options, optional field with "Prefer not to say" option
- **Rating**: Custom slider/picker component with 0.5 increment steps from 5.0-10.0, large touch-friendly interface

### UI Components & Styling
- Leverage CPN design system with `btn-cpn` primary button styling and `rounded-cpn` border radius
- Form inputs using CPN dark theme with yellow focus states (`ring-cpn-yellow`)
- Custom dropdown component with proper keyboard navigation and ARIA support
- Loading states and submission feedback using CPN brand colors
- Error states with inline validation messages in red with proper contrast ratios

### State Management
- Session storage for temporary profile data before account creation
- React Context or Zustand for sharing profile data across onboarding flow
- Form state persistence across page navigation within onboarding sequence
- Clear session data on successful account creation or explicit user cancellation

### Navigation & Flow Control
- Smooth transition to `/data-entry` page with profile context maintained
- Back button functionality to return to landing page
- Progress indicator showing current step in onboarding flow (step 1 of 4)
- Prevent form submission until all required fields are valid

### Performance Optimization
- Lazy loading for dropdown options and non-critical components
- Optimistic UI updates for improved perceived performance
- Minimal JavaScript bundle size with proper code splitting
- Image optimization for any icons or decorative elements

### Analytics & Tracking
- Form field interaction tracking for conversion optimization
- Abandonment point tracking to identify friction areas
- Time-to-completion metrics for form optimization
- Error rate tracking by field for usability improvements

### Error Handling & Validation
- Comprehensive client-side validation with user-friendly error messages
- Network error handling with retry functionality for API calls
- Form submission error recovery with data preservation
- Graceful degradation for JavaScript-disabled environments

### Accessibility Features
- WCAG 2.1 AA compliance with proper color contrast ratios
- Keyboard navigation support for all interactive elements
- Screen reader optimization with semantic HTML structure
- Focus management and visible focus indicators using CPN yellow (`ring-cpn-yellow`)

## External Dependencies

**React Hook Form** - Form state management and validation
- **Justification**: Industry standard for complex form handling with excellent TypeScript support and minimal re-renders
- **Version**: ^7.45.0 or latest stable

**Zod** - Schema validation and type inference
- **Justification**: Already in use in codebase, provides type-safe validation with excellent TypeScript integration
- **Version**: ^3.24.4 (matches existing package.json)

**React Select** (Optional) - Enhanced dropdown component
- **Justification**: Provides accessible dropdown with keyboard navigation, search, and mobile optimization
- **Version**: ^5.7.0 or latest stable
- **Alternative**: Custom dropdown using headless UI components if React Select adds too much bundle size