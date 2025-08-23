# Spec Requirements Document

> Spec: CPN Result Display Page for Onboarding Flow
> Created: 2025-08-23

## Overview

Create a mobile-first CPN result display page that shows users their calculated CPN score within the onboarding flow, featuring gamified elements, achievement badges, and viral sharing capabilities. This page will serve as a key conversion point to encourage user engagement and social sharing while providing meaningful analytics to help users understand their dating performance metrics.

## User Stories

### New User Score Reveal

As a new user completing the onboarding flow, I want to see my calculated CPN score presented in an engaging, gamified way, so that I understand my current dating performance level and feel motivated to improve.

The user completes the onboarding questionnaire and is presented with their CPN score through an animated reveal sequence. The page displays their score prominently with contextual explanations, achievement badges earned, and comparison to peer averages. The interface includes clear next steps for improving their score and accessing the full app features.

### Social Sharing Experience

As a user who just received their CPN score, I want to easily share my results on social media, so that I can showcase my performance and potentially refer friends to the app.

The user can tap a share button to generate optimized graphics (9:16 for Stories, 1:1 for posts) with embedded referral codes. The sharing flow uses native mobile sharing APIs with pre-populated captions that encourage viral growth while maintaining user privacy preferences.

### Achievement Recognition

As a user viewing my CPN results, I want to see what achievements I've unlocked and what badges I've earned, so that I feel recognized for my performance and motivated to continue improving.

The results page displays earned achievement badges with smooth animations, explains the criteria for each achievement, and provides hints about upcoming milestones. Users can tap badges for detailed explanations and sharing options.

## Spec Scope

1. **CPN Score Display** - Animated score reveal with visual progress indicators and contextual explanations
2. **Achievement Badge System** - Display earned badges with animations and detailed descriptions
3. **Peer Comparison Module** - Show user's score relative to similar demographics and global averages
4. **Viral Sharing Engine** - Generate optimized social media graphics with embedded referral codes
5. **Next Steps Navigation** - Clear call-to-actions for continuing to main app features

## Out of Scope

- Score calculation logic (handled in previous onboarding steps)
- User profile creation (separate onboarding step)
- Payment integration for premium features
- Historical score tracking (main app feature)
- Detailed analytics breakdowns (main dashboard feature)

## Expected Deliverable

1. Mobile-optimized CPN result page with smooth animations and score reveal sequence
2. Functional achievement badge system with at least 5 different badge types
3. Working social share functionality generating properly formatted graphics for major platforms