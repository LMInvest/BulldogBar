# BulldogBar Manager - Design Guidelines

## Design Approach
**Selected System**: Material Design 3 with Linear-inspired data tables
**Justification**: Information-dense warehouse management system requiring clarity, efficiency, and consistent data presentation. Users perform repetitive tasks requiring stable, predictable interface patterns.

## Core Design Principles
1. **Clarity First**: Information hierarchy optimized for scanning and quick decision-making
2. **Functional Color**: Colors communicate status and urgency, not decoration
3. **Consistent Patterns**: Repeated interactions use identical UI patterns across modules
4. **Role-Based Visual Language**: Each user role has distinct visual indicators throughout

## Color Palette

### Light Mode
- **Background Primary**: 0 0% 98%
- **Background Secondary**: 0 0% 95%
- **Background Elevated**: 0 0% 100%
- **Text Primary**: 220 15% 20%
- **Text Secondary**: 220 10% 45%
- **Border**: 220 13% 88%

### Dark Mode
- **Background Primary**: 220 18% 12%
- **Background Secondary**: 220 18% 16%
- **Background Elevated**: 220 18% 20%
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 220 10% 65%
- **Border**: 220 15% 25%

### Functional Colors (Same for both modes)
- **Alert Critical (Red)**: 0 70% 50% - Products <50% minimum stock
- **Alert Warning (Orange)**: 30 90% 55% - Products 50-100% minimum
- **Alert Attention (Yellow)**: 45 95% 55% - Products 100-150% minimum
- **Success (Green)**: 140 60% 45% - Active status, positive actions
- **Info (Blue)**: 210 80% 50% - Informational states
- **Primary Brand**: 210 90% 45% - Main CTAs, links, focus states

### Role Badge Colors
- **Administrator**: 0 70% 50% (Red badge)
- **Manager Baru**: 210 80% 50% (Blue badge)
- **Kierownik Magazynu**: 140 60% 45% (Green badge)
- **Barman**: 270 60% 55% (Purple badge)

### Activity Type Colors
- Delivery Receipt: 140 60% 45% (Green)
- Stock Issue: 210 80% 50% (Blue)
- User Addition: 270 60% 55% (Purple)
- Inventory Count: 30 90% 55% (Orange)
- Shift Assignment: 180 70% 50% (Cyan)
- System Alert: 45 95% 55% (Yellow)

## Typography
- **Font Family**: 'Inter' for UI, 'JetBrains Mono' for numerical data
- **Scale**: 
  - Headings: text-2xl (24px) / text-xl (20px) / text-lg (18px)
  - Body: text-base (16px) / text-sm (14px)
  - Captions: text-xs (12px)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Line Heights**: Tight for headings (1.2), normal for body (1.5), relaxed for forms (1.75)

## Layout System
- **Spacing Units**: Consistent use of 4, 8, 16, 24, 32 (p-1, p-2, p-4, p-6, p-8)
- **Container Widths**: Full-width layout with max-w-7xl for main content areas
- **Grid System**: 12-column responsive grid for dashboard cards
- **Card Spacing**: p-6 for card padding, gap-6 between cards
- **Table Spacing**: py-3 px-4 for cells, compact data presentation

## Component Library

### Navigation
- **Sidebar**: Fixed left navigation (w-64) with collapsible state, role-based menu items
- **Top Bar**: Fixed header with user profile (right), notification bell with badge, theme toggle
- **Breadcrumbs**: Secondary navigation showing current location

### Data Display
- **Tables**: Alternating row backgrounds, sticky headers, sortable columns with arrow indicators, hover states on rows
- **Cards**: Elevated surfaces (shadow-sm), rounded-lg corners, distinct sections with dividers
- **Stat Cards**: Large numerical display with icon, label, and trend indicator
- **Progress Bars**: Height h-2, rounded-full, color-coded by status percentage
- **Badges**: Rounded-full, px-2.5 py-0.5, role/status colored backgrounds with contrasting text

### Forms
- **Inputs**: h-10, rounded-md, border focus states with ring-2 in primary color
- **Selects**: Same styling as inputs with chevron indicator
- **Checkboxes/Radio**: w-4 h-4 with primary color when checked
- **Buttons**: 
  - Primary: bg-primary, white text, h-10, px-6, rounded-md
  - Secondary: border, transparent bg, primary text
  - Danger: bg-red, white text for destructive actions
  - Ghost: No background, hover shows subtle bg

### Alerts & Notifications
- **Stock Alerts**: Card-based with product thumbnail (48x48), name, category, progress bar, and action dropdown
- **Toast Notifications**: Fixed top-right, auto-dismiss after 5s, with icon and action buttons
- **Banner Alerts**: Full-width at top of sections for critical system messages

### Modals
- **Standard Modal**: max-w-2xl, centered, backdrop blur, rounded-lg, p-6 content padding
- **Form Modals**: Structured with header, scrollable body, sticky footer with actions
- **Confirmation Dialogs**: Smaller (max-w-md), clear action buttons, destructive actions use danger styling

### Data Visualization
- **Category Progress**: Horizontal bars with percentage labels, color-coded thresholds
- **Warehouse Status**: Donut charts or radial progress for visual capacity indicators
- **Activity Timeline**: Vertical timeline with color-coded dots, timestamp on right, description on left

## Specific Module Patterns

### Dashboard (Panel Główny)
- **Layout**: 3-column grid for stat cards (grid-cols-3), 2-column for alerts + activity (grid-cols-2)
- **Stat Cards**: Icon on left, large number, small label, trend indicator
- **Stock Alerts**: Maximum 4 visible, vertical list with thumbnail images, progress bars below each
- **Activity Log**: Scrollable container (max-h-96), color-coded icons, relative timestamps

### Warehouse (Magazyn Główny)
- **Bar Tabs**: Horizontal tabs with active state (border-b-2 in primary), shift indicator badge
- **Category Breakdown**: Expandable accordion with progress bars, subcategory items indented
- **Quick Actions**: Floating action button group (bottom-right) or prominent button row at top
- **Distribution View**: Grid layout showing 3 bars side-by-side on desktop, stacked on mobile

### Products (Zarządzanie Produktami)
- **Category Tree**: Left sidebar (w-64) with hierarchical indentation, expandable chevrons
- **Product Table**: Full-width with sticky header, 8-10 columns, actions column on right
- **Thumbnail Images**: 40x40 in table, 120x120 in edit form preview
- **Bulk Actions**: Sticky bar appears at bottom when items selected, shows count + action buttons

### Reports (Raporty)
- **Report Cards**: Grid of 7 cards (grid-cols-2 lg:grid-cols-3), icon, title, description, configuration options
- **Date Pickers**: Range selector with from/to inputs side-by-side
- **Generated Reports Table**: Sortable table with download action icons, preview modal

### Users (Zarządzanie Kontami)
- **User List**: Table with avatar column (40x40 rounded-full), role badge column, status indicator dot
- **Permissions Matrix**: Read-only checkboxes grid, auto-checked based on role, grouped by module
- **User Form**: Two-column layout for name fields, full-width for username/password, role as prominent dropdown

## Interaction Patterns
- **Loading States**: Skeleton screens for initial load, spinners for actions
- **Form Validation**: Inline error messages below fields, error border on invalid inputs
- **Confirmation Dialogs**: Always confirm destructive actions (delete, deactivate)
- **Real-time Updates**: Subtle highlight animation on updated rows/cards (flash primary color background briefly)
- **Empty States**: Centered illustrations with helpful text and primary action button

## Responsive Breakpoints
- **Mobile**: < 640px - Single column layouts, collapsed sidebar to hamburger menu
- **Tablet**: 640px - 1024px - Two-column layouts, visible sidebar
- **Desktop**: > 1024px - Full multi-column layouts, expanded sidebar

## Accessibility
- Consistent dark mode across all components including form inputs
- WCAG AA contrast ratios for all text
- Keyboard navigation for all interactive elements
- Screen reader labels for icon-only buttons
- Focus indicators visible on all focusable elements