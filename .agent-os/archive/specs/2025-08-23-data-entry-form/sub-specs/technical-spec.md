# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-23-data-entry-form/spec.md

## Technical Requirements

### Page Structure & Routing
- Create `/data-entry` route as step 2 in the onboarding flow after `/add-girl`
- Implement as Next.js App Router page with proper metadata and mobile viewport optimization
- Mobile-first responsive design with minimum 44px touch targets for all interactive elements
- Progressive Web App compatibility with offline form persistence capabilities

### Form Implementation & State Management
- React Hook Form for form state management with optimistic UI updates
- Zod schema validation for type-safe form data handling and real-time validation
- Session storage integration to combine with profile data from previous step
- Form persistence in localStorage to prevent data loss during navigation or refresh
- React Context for sharing combined profile + interaction data across onboarding flow

### Field Specifications & Input Methods
- **Date Field**: Native mobile date picker with fallback to custom calendar component, validation for reasonable date ranges (past 30 days to today)
- **Cost Field**: Currency input with automatic formatting (USD), numeric keyboard on mobile, validation for 0-999.99 range with optional field
- **Time Duration**: Custom time picker with preset options (30min, 1hr, 2hr, 3hr+) and custom input, validation for 15min-8hr range
- **Outcome Field**: Engaging binary choice component (Success/Unsuccessful) with large touch-friendly buttons and visual feedback

### UI Components & Mobile Optimization
- Leverage CPN design system with `btn-cpn` styling and `rounded-cpn` border radius
- Custom date picker component optimized for mobile touch with large calendar interface
- Currency input with proper formatting and mobile numeric keyboard activation
- Time duration selector with preset quick-select options and smooth animations
- Outcome selector with engaging visual design using CPN brand colors and haptic feedback

### Session Data Integration
- Retrieve profile data from previous step using session storage or React Context
- Combine profile and interaction data into unified dataset for CPN calculation
- Validate data completeness before allowing progression to results page
- Maintain data integrity across navigation and potential page refreshes

### Navigation & Flow Control
- Smooth transition from `/add-girl` page with profile context automatically loaded
- Progress indicator showing step 2 of 4 in onboarding flow
- Back button functionality to return to profile creation with data preservation
- Forward navigation to `/cpn-result` page with complete dataset for calculation
- Prevent form submission until all required fields pass validation

### Performance & Mobile Experience
- Lazy loading for non-critical components like custom date picker
- Optimistic UI updates for improved perceived performance
- Touch gesture support for form interactions (swipe, pinch, tap)
- Haptic feedback via Vibration API for form interactions and validation
- Smooth animations with CSS transforms and proper will-change properties

### Validation & Error Handling
- Real-time field validation with debounced checking to prevent excessive re-renders
- User-friendly error messages with clear guidance for correction
- Visual validation feedback using CPN brand colors (red for errors, green for success, yellow for focus)
- Network error handling with automatic retry for session data operations
- Graceful degradation for offline scenarios with proper user messaging

### Data Processing & CPN Preparation
- Calculate preliminary CPN metrics from combined profile and interaction data
- Validate data completeness for meaningful CPN calculation
- Format data for consumption by CPN calculation engine
- Prepare shareable data structure for results page rendering

### Analytics & Conversion Tracking
- Form field interaction tracking for optimization insights
- Abandonment point analysis to identify friction areas in onboarding
- Time-to-completion metrics for mobile usability optimization
- Error rate tracking by field type for continuous improvement
- Conversion rate tracking from data entry to results page viewing

### Accessibility & Standards Compliance
- WCAG 2.1 AA compliance with proper color contrast ratios
- Semantic HTML structure with proper form labeling and ARIA attributes
- Keyboard navigation support for all interactive elements
- Screen reader optimization with descriptive labels and instructions
- Focus management with visible focus indicators using CPN yellow (`ring-cpn-yellow`)

### Security & Data Protection
- Client-side input sanitization and validation before storage
- Secure session storage practices with data encryption for sensitive information
- XSS prevention through proper input handling and output encoding
- Rate limiting considerations for form submission to prevent abuse

## External Dependencies

**React Hook Form** - Advanced form state management
- **Justification**: Essential for complex form handling with mobile-optimized performance and minimal re-renders
- **Version**: ^7.45.0 or latest stable
- **Features**: Field arrays, conditional validation, mobile input optimization

**date-fns** - Date manipulation and formatting
- **Justification**: Lightweight date utility library for mobile performance, tree-shakeable with excellent mobile date picker support
- **Version**: ^2.30.0 or latest stable
- **Alternative**: Day.js if even smaller bundle size is required

**React Number Format** (Optional) - Currency input formatting
- **Justification**: Provides proper currency formatting with mobile numeric keyboard optimization
- **Version**: ^5.3.0 or latest stable
- **Alternative**: Custom currency formatting function if bundle size is a concern

**Framer Motion** (Optional) - Smooth animations for mobile interactions
- **Justification**: Provides smooth, touch-optimized animations for form interactions and transitions
- **Version**: ^10.16.0 or latest stable
- **Usage**: Outcome selector animations, form transition effects, validation feedback

## Integration Points

### Session Data Flow
- **Input**: Profile data from `/add-girl` page (name, age, ethnicity, rating)
- **Processing**: Combine profile + interaction data for CPN calculation preparation
- **Output**: Complete dataset to `/cpn-result` page for efficiency score calculation

### CPN Calculation Preparation
- **Data Structure**: Standardized format for CPN calculation engine consumption
- **Validation**: Ensure all required fields are present and properly formatted
- **Context**: Maintain user flow context for personalized results presentation

### Design System Integration
- **Components**: Utilize existing CPN design system components and utilities
- **Theming**: Consistent brand colors and typography throughout form interface
- **Mobile Patterns**: Follow established mobile-first design patterns from other onboarding steps