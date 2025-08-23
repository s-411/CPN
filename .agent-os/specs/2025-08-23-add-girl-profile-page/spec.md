# Spec Requirements Document

> Spec: Add Girl Profile Creation Page
> Created: 2025-08-23

## Overview

Create the "Add Girl" profile creation page as the critical entry point in the CPN onboarding funnel. This page captures essential profile information (name, age, ethnicity, rating) with a streamlined, conversion-optimized form that leads users directly into the data entry flow, building momentum toward account creation and premium conversion.

## User Stories

### First-Time User Onboarding
As a potential CPN user visiting the landing page, I want to immediately start tracking a profile without creating an account, so that I can experience the app's value before committing to registration.

The user clicks the main CTA from marketing materials and lands directly on this form. The page should feel welcoming and simple, not overwhelming, with clear value proposition messaging that reinforces why they're here. After completion, users flow directly to data entry to maintain engagement momentum.

### Quick Profile Setup
As a user ready to track dating efficiency, I want to quickly input basic profile information in an intuitive form, so that I can move on to entering actual data that will generate my first CPN calculation.

The form should be mobile-optimized with large touch targets, smart field validation, and clear progress indication. Each field should feel necessary and valuable, not like busy work. The rating system should be engaging and easy to use.

### Conversion Funnel Optimization
As a business stakeholder, I want this page to maximize conversion to the next step (data entry), so that more visitors progress through the onboarding funnel toward account creation and premium subscription.

The page design should minimize friction while collecting essential data needed for personalized CPN calculations. Clear messaging should set expectations for what comes next and reinforce the value proposition throughout the form.

## Spec Scope

1. **Profile Creation Form** - Clean, branded form with first name, age, ethnicity (dropdown), and rating (0.5 increments from 5.0-10.0)
2. **Field Validation** - Real-time validation with helpful error messages and visual feedback using CPN brand colors
3. **Responsive Design** - Mobile-first layout optimized for touch interactions with proper spacing and accessibility
4. **Progress Flow Integration** - Smooth transition to data entry page while storing profile data in session/localStorage
5. **Value Proposition Messaging** - Strategic copy that reinforces benefits and sets expectations for next steps

## Out of Scope

- User authentication or account creation (happens later in flow)
- Profile photo upload or advanced customization options
- Multiple profile creation (single profile for onboarding)
- Data persistence beyond session storage (permanent storage happens after account creation)
- Complex profile editing features (basic editing only)

## Expected Deliverable

1. **Functional Profile Form** - All form fields work properly with validation and submit to next step in onboarding flow
2. **Brand-Consistent Design** - Page uses CPN design system (colors, fonts, button styling) with professional appearance
3. **Mobile-Optimized UX** - Form works seamlessly on mobile devices with proper touch targets and responsive layout
4. **Session Data Storage** - Profile information is temporarily stored and accessible for data entry and CPN calculation steps
5. **Smooth Flow Transition** - Clicking submit/continue moves user to data entry page with profile context maintained