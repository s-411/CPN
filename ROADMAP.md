

# **CPN Complete Roadmap - MVP to Viral Growth**

*Last Updated: January 2025 | Version: 1.0*


## **Executive Summary**

The CPN app requires completion of core MVP functionality followed by viral growth features to achieve market success. This roadmap progresses from fixing critical backend gaps through implementing comprehensive growth mechanics.

**IMPORTANT**
The app should remian accessable at http://localhost:3000/ I can test and check your work as we go by doing a hard refresh of the browser on localhost. There should be no sign-in required. The default user at local when looking at localhost should not need to sign in and should be able to access all areas of the app regardless of any changes and updates you may make. 

The app will eventually be deployed on DigitalOcean's app hosting platform, so keep that in mind for easy deployment. In production, the sign-in will, of course, be required. 

**Current Completion Status: ~60%**

- ✅ **Frontend & UI**: 95% Complete (excellent design system, forms, components)

- ✅ **Database Schema**: 100% Complete (all tables and relations defined)

- ✅ **Authentication**: 90% Complete (Clerk integration working)

- ❌ **Backend Integration**: 15% Complete (missing core server actions)

- ❌ **CPN Calculation Engine**: 5% Complete (only mock data)

- ❌ **Results & Analytics**: 20% Complete (display exists, no real data)

## What's Working (Strengths)

- **Outstanding UI/UX**: Professional dark theme design with CPN branding

- **Sophisticated Forms**: ProfileForm, DataEntryForm, and CreateGirlModal with full validation

- **Robust Session Management**: OnboardingContext with auto-save and cleanup

- **Complete Database Schema**: All required tables with proper relations and constraints

- **Dual Authentication**: Clerk + custom JWT system properly configured

- **Comprehensive Validation**: Zod schemas for all data types with proper error handling

- **Mobile-First Design**: PWA-ready with manifest and offline capabilities

- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, Drizzle ORM

## What's Partially Complete

- **API Routes**: Some endpoints exist but missing core onboarding flow

- **Dashboard**: UI exists but displays mock data

- **CPN Results Display**: Beautiful component but no real calculation

- **Achievement System**: Database tables exist, partial implementation in components

- **Stripe Integration**: Setup exists but missing subscription logic

## What's Broken/Missing (Critical Gaps)

- **Server Actions**: No database persistence for onboarding flow

- **CPN Calculation Logic**: Only returns mock scores

- **Data Flow**: Forms save to sessionStorage only, never reach database

- **Results Generation**: No actual results page after onboarding

- **Error Handling**: Limited server-side error handling

- **Data Migration**: Session data not migrated to user accounts after signup

- **Add girl and add data methods**: The onboarding flow to add girl and add data is specific to onboarding only. We need a separate way of collecting that data once the user is already logged into the app

- **Socail Feature**: Social features that allow admins to create a group and then invite their friends via email or sign up link to join their group. Within each group, there's a leaderboard system that allows competition between users and ideally has social interactions. 

- **Viral Growth Engine**: That allows users to share graphics to social media or screenshot them onto their phone. They can choose between certain templates and certain metrics that they might want to share. 

- **Affiliate System**: Built-in affiliate system through Rewardful.com such that whenever someone becomes a user, they automatically have for them an affiliate code generated in an affiliate area that can be accessed from the dashboard. They can easily copy that URL and share it with others for a yet-to-be-decided discount. There's also an effect kickback to the affiliate itself. This should all happen automatically when someone becomes a user of the app, so there's no requirement for them to sign up to third-party platforms or affiliate software. Their link and the link should be included with any viral graphics or shareable graphics that are put out there, such that there is an added incentive for people to share. This is critical to the app's virality. 

- **Gamification and retention**:  Gamification and retention mechanics that allow people to have achievements within the app go on streaks and have a which encourages regular usage of the app. Reward people for:



1. Signing in every day
2. Adding new data
3. Sharing and inviting people

So there should be rewards associated with that within the app. Potentially even unlocking discounts for the next month by doing so. I'm quite happy for people to get like a free week or three free weeks or whatever if they do certain things, such as invite other people and share it on social media. Strong focus on using other people's audiences and the current users I do get to actually promote this themselves.  

- **Analytics **:  A page that can be accessed from within the dashboard that takes them to an analytics page or dashboard where they're able to select tabs and see visually using pie graphs and line graphs all the statistics that we can possibly crunch about their dating efficiency and performance with relation to the amount of money they're spending. The metrics include:



* Per nut:
* Amount of money they're spending on each girl
* Each girl's cost per nut
* Their average cost per nut

And then all the same type of metrics for time, and cross-analytics like time per nut per girl and on average and so on. Secondary to that would be a data vault where these kind of analytics for all users across the platform are pulled into an anonymous data vault where people are able to see other people's numbers which can be broken down by location, ethnicity, how hot the girl is, what age the girl is and so on. This would be a highly detailed analytical analysis of all the back-end data across user profiles and should of course be completely anonymized and have strict privacy controls.  

- **Optimization and mobile optimization. **: It's of extreme importance that it is built in such a way that further down the track we can optimize this progressive web app for mobile users. 99% of users are going to be coming to the app on their mobile phones, and as such it needs to have extremely high mobile page speed and loading times. Slow loading times will simply not be tolerated. At this stage of the project, we'll focus on page speed, device responsiveness, and mobile usage (touch icons, etc.) that make for easy mobile phone usage.  \
 \
- **PWA**: This is a progressive web app and should be built with that in mind first and foremost at all times. Desktop is obviously useful, but the majority of users will be viewing this on mobile, so progressive web app is a focus. 


---


## **Phase Overview**


<table>
  <tr>
   <td><strong>Phase</strong>
   </td>
   <td><strong>Duration</strong>
   </td>
   <td><strong>Objective</strong>
   </td>
   <td><strong>Key Deliverables</strong>
   </td>
  </tr>
  <tr>
   <td><strong>Phase 0</strong>
   </td>
   <td>3 days
   </td>
   <td>Database Foundation
   </td>
   <td>Working data persistence
   </td>
  </tr>
  <tr>
   <td><strong>Phase 1</strong>
   </td>
   <td>1 week
   </td>
   <td>Core MVP
   </td>
   <td>Complete user flow
   </td>
  </tr>
  <tr>
   <td><strong>Phase 2</strong>
   </td>
   <td>1 week
   </td>
   <td>Monetization
   </td>
   <td>Multi-tier subscriptions
   </td>
  </tr>
  <tr>
   <td><strong>Phase 3</strong>
   </td>
   <td>1 week
   </td>
   <td>Social Features
   </td>
   <td>Groups & leaderboards
   </td>
  </tr>
  <tr>
   <td><strong>Phase 4</strong>
   </td>
   <td>2 weeks
   </td>
   <td>Viral Engine
   </td>
   <td>Shareable content system
   </td>
  </tr>
  <tr>
   <td><strong>Phase 5</strong>
   </td>
   <td>1 week
   </td>
   <td>Gamification
   </td>
   <td>Achievements & challenges
   </td>
  </tr>
  <tr>
   <td><strong>Phase 6</strong>
   </td>
   <td>1 week
   </td>
   <td>Intelligence
   </td>
   <td>Analytics & insights
   </td>
  </tr>
  <tr>
   <td><strong>Phase 7</strong>
   </td>
   <td>1 week
   </td>
   <td>Optimization
   </td>
   <td>Performance & retention
   </td>
  </tr>
</table>



---


## **Phase 0: Database Foundation & Core Logic**

 \
**Priority**: CRITICAL - Blocks everything else


### **Objectives**

Establish working data persistence layer and calculation engine that all other features depend on.


### **Requirements**

**Database Setup & Verification**
* Verify all tables exist and are accessible (users, profiles, interactions, scores)
* Test database connectivity and error handling
* Run seed scripts to populate test data
* Verify indexes exist for query performance
* Set up automated backup strategy

**CPN Calculation Engine** Build the core calculation system that:
* Processes interaction data to calculate cost per nut
* Generates efficiency scores across multiple categories
* Calculates peer percentile rankings within teams
* Handles edge cases (zero nuts, missing data, outliers)

**Data Persistence Functions** Create server actions that:
* Save user profiles with validation
* Store interaction data with proper relationships
* Retrieve user history efficiently
* Migrate session data to permanent storage after signup
* Handle concurrent updates safely


### **Success Criteria**
* [ ] Database operations complete without errors
* [ ] CPN calculations match expected formulas
* [ ] Session data successfully migrates on signup
* [ ] Data retrieval performs under 100ms
* [ ] Error handling prevents data loss


---


## **Phase 1: Core MVP Functionality** \
 **Priority**: HIGH - Required for launch


### **Objectives**

Complete the user journey from landing through results display with full data persistence.


### **Requirements**

**Onboarding Flow Integration**
* Connect profile form to database (currently saves to sessionStorage only)
* Wire up data entry form to persist interactions
* Create results page showing calculated $ CPN 
* Implement smooth navigation between screens

**Dashboard Functionality**
* Replace all mock data with real user statistics
* Display actual CPN calculations from database
* Show complete interaction history
* Add data visualization for trends

**User Experience Polish**
* Add loading states for all async operations
* Implement comprehensive error handling
* Create success confirmations for actions
* Add helpful empty states

**Mobile Experience**
* Optimize forms for touch input
* Ensure proper keyboard behavior
* Test on actual iOS/Android devices
* Fix viewport and scaling issues
* Implement swipe gestures where appropriate


### **Success Criteria**
* [ ] New users complete entire flow successfully
* [ ] Returning users see their historical data
* [ ] All forms validate and handle errors gracefully
* [ ] Mobile experience rated "smooth" by testers
* [ ] Zero data loss during normal operations


---


## **Phase 2: Monetization & Payment Integration** \
 **Priority**: HIGH - Revenue generation


### **Objectives**

Implement multi-tier subscription system optimized for conversion and revenue.


### **Tier Structure**

**Boyfriend Mode** (Free)
* 1 profile maximum
* Basic $ CPN tracking
* No advanced features
* Aggressive upgrade prompts

**Player Mode** ($1.99/week)
* 50 profiles maximum
* Access to ALL features

**Lifetime Access** ($27 lifetime)
* Everything in Player
* Lifetime access for one payment $27


### **Payment Requirements**

**Stripe Integration**



* Set up products and prices for each tier
* Create checkout sessions with proper metadata
* Handle subscription lifecycle webhooks
* Process upgrades/downgrades smoothly
* Manage failed payment recovery

**Subscription Management**



* Build subscription portal in-app
* Show current plan and benefits
* Display billing history
* Enable plan changes instantly
* Handle cancellations gracefully
* If a person attempts to downgrade or cancel, they are offered continued access for half of the current price of their plan (which would be $0.99).
* If they still continue to cancel, have a pop-up form that they must complete to choose from several common reasons why someone would cancel by selecting a radio button. This must be completed in order to complete the cancellation. 

**Feature Gating**
* Lock features based on subscription tier
* Create compelling upgrade moments
* Show what users are missing
* Preserve data on downgrade
* A/B test pricing display


### **Success Criteria**
* [ ] All payment flows work without errors
* [ ] Subscriptions activate features immediately
* [ ] Users can self-manage subscriptions
* [ ] Payment failures handle gracefully
* [ ] 20%+ free-to-paid conversion in testing


---


## **Phase 3: Social & Competitive Features** \
 **Priority**: HIGH - Engagement driver


### **Objectives**
Build multiplayer features that create social accountability and competition.


### **Requirements**

**Group System**
* Create group creation flow with admin rights
* Build invitation system via email
* Implement member approval/rejection
* Support multiple group membership
* Add group settings and customization

**Leaderboards**
* Display efficiency rankings within groups
* Show only privacy-safe metrics (averages)
* Create time-based leaderboards (weekly/monthly)
* Add filters and sorting options
* Implement fair matching algorithms

**Privacy Controls**
* Anonymous participation options
* Granular sharing toggles
* Custom display names
* Data visibility settings
* Export personal data option

**Social Interactions**
* Like/react to achievements
* Comment on milestones
* Share accomplishments
* Challenge other users
* Create group goals


### **Success Criteria**
* [ ] Groups form and function properly
* [ ] Leaderboards update in real-time
* [ ] Privacy settings respected throughout
* [ ] 30%+ users join or create groups
* [ ] Social features drive daily returns


---


## **Phase 4: Viral Growth Engine**

 \
 **Priority**: CRITICAL - Growth driver


### **Objectives**

Build comprehensive shareable content system that turns users into growth vectors.


### **Shareable Graphics System**

**Template Engine**
* Create dynamic template system
* Auto-populate with user data
* Support multiple aspect ratios (9:16, 1:1, 16:9)
* Add professional styling and animations
* Include watermark and branding
* Include the user's affiliate code And a text-based comment such as "Use this code at checkout for 50% off forever." 

**Template Categories**

*Personal Achievement*
* Efficiency milestones
* Streak celebrations
* Monthly reports
* Goal completions

*Geographic Conquest*
* Country maps
* City rankings
* Travel efficiency
* Destination unlocks

*Demographic Analysis*
* Category breakdowns
* Comparative analysis
* Trend identification
* Insight revelations

*Competition Results*
* Challenge victories
* Leaderboard positions
* Head-to-head results
* Tournament brackets


### **Referral & Attribution**

**Referral System**
* Generate unique codes per user using Rewardful integration
* Embed in all shared content
* Track attribution properly
* Calculate rewards automatically
* Create ambassador tiers

**Viral Mechanics**
* Trigger sharing at peak moments
* Add share buttons strategically
* Create re-sharing incentives
* Build viral loops
* Optimize for platform algorithms

**Reward Structure**
* 1 referral = 1 week free
* 3 referrals = 1 month free
* 10 referrals = 3 months free
* 25 referrals = Lifetime access


### **Success Criteria**
* [ ] 15%+ users create shareable content
* [ ] Templates generate platform engagement
* [ ] Referral tracking works accurately
* [ ] Viral coefficient approaches 1.0
* [ ] Organic growth becomes primary channel


---


## **Phase 5: Gamification & Retention Mechanics**

 \
 **Priority**: HIGH - Retention driver


### **Objectives**

Implement game mechanics that drive daily engagement and long-term retention.


### **Achievement System**

**Categories & Badges**

*Efficiency Achievements*
* Bargain Hunter (sub-$30 CPN)
* Value Master (top 10%)
* Economic Genius (sub-$20)
* Optimization God (sub-$15)

*Geographic Achievements*
* World Traveler (50+ countries)
* Continental Master (all continents)
* City Specialist (25+ cities)
* Island Hopper (10+ islands)

*Engagement Achievements*
* Streak Legend (10+ days)
* Data Scientist (10+ entries)
* Early Adopter (first 1000 users)
* Community Leader (10+ referrals)


### **Streak System**
* Track consecutive daily logins
* Implement freeze mechanics (miss without losing)
* Create milestone rewards
* Add streak recovery options
* Show streak prominently


### **Challenge Framework**

**Challenge Types**
* Head-to-head efficiency battles
* Time-limited community goals
* Seasonal special events
* Progressive difficulty chains
* Group competitions

**Competition Pods**



* Match similar skill levels
* Create 30-day cycles
* Track rankings live
* Award victory badges
* Enable rematches


### **Success Criteria**
* [ ] Achievements unlock properly
* [ ] Streaks drive daily usage
* [ ] 25%+ participate in challenges
* [ ] Gamification increases retention 30%+
* [ ] Users pursue multiple achievements


---


## **Phase 6: Analytics & Intelligence Platform**

 \
 **Priority**: MEDIUM - Value enhancement


### **Objectives**

Build data intelligence system providing insights to users and fueling viral content.


### **Personal Analytics**

**Dashboard Metrics**
* CPN trend analysis over time
* Category performance breakdown
* Spending pattern identification
* Success rate optimization
* Peer comparison tools

**Visualization Suite**
* Interactive charts and graphs
* Heat maps for geographic data
* Trend lines with projections
* Comparative overlays
* Custom date ranges


### **Global Intelligence System**

**"The Data Vault" Page**

*Live Statistics*
* Active user counter
* Global CPN averages
* Trending locations
* Popular categories
* Record achievements

*Demographic Intelligence*



* Efficiency by ethnicity
* Age bracket analysis
* Geographic patterns
* Time-based trends
* Cultural insights

*Content Generation*
* Monthly trend reports
* Shareable statistics
* Viral data points
* Community highlights
* Record breakers


---


## **Phase 7: Optimization & Scale**

 \
 **Priority**: HIGH - Launch preparation


### **Objectives**

Optimize performance, maximize retention, and prepare for scale.


### **Performance Optimization**

**Technical Improvements**
* Reduce load times below 1 seconds
* Optimize database queries
* Implement caching layers
* Minimize bundle sizes
* Add CDN distribution

**User Experience**
* Progressive loading strategies
* Smooth animations
* Instant interactions
* Background sync


### **Retention Optimization**

**Engagement Features**
* Push notification system
* Email campaign automation
* Re-engagement flows
* Win-back campaigns
* Loyalty rewards

**Habit Formation**
* Daily check-in rewards
* Morning report emails
* Progress celebrations
* Milestone recognition
* Social accountability


### **Launch Readiness**

**Quality Assurance**
* Security audit completion
* Cross-platform testing
* Load testing at scale
* Accessibility compliance
* Legal/privacy review

**Infrastructure**
* Auto-scaling configuration
* Monitoring and alerts
* Backup strategies
* Disaster recovery
* Support systems


### **Success Criteria**
* [ ] Page loads under 1 seconds
* [ ] Handles 10,000+ concurrent users
* [ ] 30%+ free-to-paid conversion
* [ ] 60%+ month-2 retention
* [ ] Zero critical bugs in production


---


## **Implementation Guidelines**


### **Development Principles**

**User-First Approach**
* Every feature must provide clear user value
* Complexity should be hidden from users
* Defaults should work for 80% of cases
* Progressive disclosure of advanced features

**Data-Driven Decisions**
* Instrument everything for measurement
* A/B test significant changes
* Monitor key metrics daily
* Iterate based on user behavior

**Technical Excellence**
* Write maintainable, documented code
* Build for scale from day one
* Automate testing and deployment
* Monitor performance constantly


---


## **Risk Management**


### **Technical Risks**


<table>
  <tr>
   <td><strong>Risk</strong>
   </td>
   <td><strong>Impact</strong>
   </td>
   <td><strong>Mitigation</strong>
   </td>
  </tr>
  <tr>
   <td>Database scaling issues
   </td>
   <td>High
   </td>
   <td>Implement caching, optimize queries
   </td>
  </tr>
  <tr>
   <td>Payment processing failures
   </td>
   <td>High
   </td>
   <td>Multiple payment providers, retry logic
   </td>
  </tr>
  <tr>
   <td>Poor mobile performance
   </td>
   <td>Medium
   </td>
   <td>Progressive enhancement, testing
   </td>
  </tr>
  <tr>
   <td>Third-party service outages
   </td>
   <td>Medium
   </td>
   <td>Abstract integrations, fallbacks
   </td>
  </tr>
</table>



### **Business Risks**


<table>
  <tr>
   <td><strong>Risk</strong>
   </td>
   <td><strong>Impact</strong>
   </td>
   <td><strong>Mitigation</strong>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>High user churn
   </td>
   <td>High
   </td>
   <td>Focus on retention early
   </td>
  </tr>
  <tr>
   <td>Slow viral growth
   </td>
   <td>Medium
   </td>
   <td>Optimize sharing mechanics
   </td>
  </tr>
  <tr>
   <td>Platform policy violations
   </td>
   <td>Low
   </td>
   <td>Review guidelines, moderate content
   </td>
  </tr>
</table>




---
 \
 \
General Guidelines  \
When working on a feature, make sure that you work only on that feature and that it integrates nicely with other features without breaking core functionality or the design of unrelated pages. 
