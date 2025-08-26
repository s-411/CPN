# Spec Requirements Document

> Spec: Dashboard Overview Page
> Created: 2025-08-24

## Overview

Implement a comprehensive dashboard overview page that displays all girl statistics in a sortable table format, allowing users to compare performance metrics across all tracked relationships. This central analytics hub will provide data-driven men with the competitive comparison tools they need to optimize their dating ROI through systematic analysis.

## User Stories

### Statistics Comparison Dashboard

As a CPN user, I want to view all my tracked girls in a single comparison table, so that I can quickly identify my best and worst performing relationships based on key metrics like cost per nut and cost per hour.

The user navigates to the Overview page and sees a clean, sortable table displaying all their girl entries with comprehensive statistics including rating, nuts, total spent, cost per nut, total time, time per nut, and cost per hour. Each row has quick action buttons for adding data or editing/deleting entries, making it easy to maintain accurate records.

### Quick Data Entry Access

As a CPN user, I want to quickly add new data entries for any girl directly from the overview table, so that I can maintain up-to-date statistics without navigating through multiple pages.

From the overview table, each girl row contains an "Add Data" button that allows immediate data entry, streamlining the workflow for maintaining accurate relationship analytics and reducing friction in the tracking process.

### Sortable Analytics Interface

As a data-driven user, I want to sort the statistics table by any column, so that I can analyze my dating performance from different perspectives and identify optimization opportunities.

The table headers are clickable with sort indicators, allowing users to sort by metrics like cost per nut (to find most efficient relationships), total spent (to identify high-investment relationships), or any other tracked metric for comprehensive analysis.

## Spec Scope

1. **Overview Page Layout** - Implement sidebar with highlighted "Overview" section and main content area with proper headers
2. **Girl Statistics Table** - Create sortable table with all required columns: Name, Rating, Nuts, Total Spent, Cost Per Nut, Total Time, Time Per Nut, Cost Per Hour
3. **Table Actions** - Add "Add Data" buttons and edit/delete action icons for each table row
4. **Sorting Functionality** - Implement clickable column headers with sort indicators and proper sorting logic
5. **Responsive Styling** - Apply white card styling with rounded corners, shadows, and mobile-optimized layout

## Out of Scope

- Individual girl detail pages (separate from overview)
- Data visualization charts or graphs
- Export functionality
- Advanced filtering options
- Bulk actions for multiple girls

## Expected Deliverable

1. Functional overview page at `/dashboard/overview` with sortable statistics table displaying all girl data
2. Working "Add Data" buttons that navigate to data entry forms for each specific girl
3. Operational edit and delete functionality for each table row with proper confirmation flows