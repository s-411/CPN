# Spec Requirements Document

> Spec: Girl Management UI
> Created: 2025-08-24

## Overview

Create a comprehensive Girl Management interface that allows users to efficiently track and organize their dating data through an intuitive dashboard with sidebar navigation updates, card-based display, and streamlined girl creation workflow.

## User Stories

### Primary User Story

As a CPN user, I want to manage my tracked girls through an intuitive interface, so that I can efficiently organize and analyze my dating data.

**Detailed Workflow:**
1. User navigates to Girls section via updated sidebar navigation
2. User sees overview of all tracked girls in a responsive card grid layout
3. If no girls exist, user sees encouraging empty state with clear call-to-action
4. User can create new girls via prominent "New Girl" button opening modal form
5. User can quickly access Edit, Delete, and Manage Data actions for each girl
6. All actions provide immediate feedback and maintain data consistency

## Spec Scope

1. **Navigation Updates** - Update sidebar to replace "Profiles" with "Girls" and adjust premium messaging
   - Change "Profiles" menu item to "Girls" with updated icon
   - Apply Yellow highlight when Girls section is active
   - Update any premium messaging to reflect new terminology

2. **Girl Management Page** - Create main page with header, subtitle, and responsive card grid
   - Page title: "Girl Management"
   - Subtitle: "Manage your tracked girls and demographics"
   - Responsive grid layout that adapts to screen sizes
   - Top-right positioned "New Girl" button

3. **Empty State Design** - Show encouraging empty state when no girls exist with clear CTA
   - Central icon with "No girls yet" message
   - Subtext: "Start by creating your first girl"
   - Prominent call-to-action button leading to create modal

4. **Girl Card Display** - Display girl information in organized cards with quick action buttons
   - Card fields: Name, Age, Nationality, Rating (x/10), Status with colored badge
   - Action buttons: Edit (pencil icon), Delete (trash icon), Manage Data (chart icon)
   - Status badges with appropriate color coding
   - Hover states and responsive design

5. **Create Girl Modal** - Implement modal form for adding new girls with validation
   - Form fields: Name (text), Age (number), Rating (1-10 selector), Nationality (text/dropdown)
   - Modal buttons: Use app global colours and styles
   - Form validation with error messages
   - Proper modal focus management and accessibility

## Out of Scope

- Advanced filtering and sorting options
- Bulk operations (delete multiple, import/export)
- Girl profile photo uploads
- Detailed analytics dashboard integration (handled by existing "Manage Data" flow)

## Expected Deliverable

1. Updated sidebar navigation with "Girls" terminology and premium messaging changes
2. Fully functional Girl Management page with responsive card layout and empty states
3. Working Create Girl modal with form validation and data persistence