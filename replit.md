# BulldogBar Manager

## Overview
BulldogBar Manager is a comprehensive warehouse management system for bar operations, providing real-time inventory tracking, role-based access control, stock alerts, delivery management, reporting, and advanced analytics with demand forecasting across multiple bar locations (Duży Bulldog, Mały Bulldog, and Gin Bar). It supports four user roles: Administrator, Bar Manager (Manager Baru), Warehouse Manager (Kierownik Magazynu), and Barman, each with distinct permissions. The project aims to streamline bar management, optimize inventory, and provide actionable insights for business growth.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18, TypeScript, Vite.
- **UI Framework**: Shadcn/ui (Radix UI + Tailwind CSS), Material Design 3 principles, Linear-inspired data tables.
- **State Management**: TanStack Query for server state, React Context API for auth/theming/WebSocket, local component state.
- **Routing**: Wouter.
- **Design System**: Light/dark mode, functional color coding for stock alerts, role-based visual indicators, responsive design.
- **Key Decisions**: Component-based, path aliases, separation of concerns (pages, components, lib).

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES Modules.
- **API Design**: RESTful API with WebSocket for real-time updates.
- **Session Management**: Express-session with PostgreSQL store.
- **Authentication & Authorization**: bcrypt for hashing, JWT for stateless auth, session-based login, role-based access control.
- **Key Decisions**: Monorepo, centralized error handling (Zod validation), separation of routes/storage/DB, WebSocket server.

### Data Layer
- **Database**: PostgreSQL (Neon serverless).
- **ORM**: Drizzle ORM (type-safe schema).
- **Schema Design**: User management (roles), product catalog (categories/subcategories), dual inventory (warehouse/per-bar), stock movement tracking, inventory counts, activity logging, shift assignments, notification system, report generation.
- **Key Tables**: `users`, `products`, `warehouse_stock`, `bar_stock`, `stock_requests`, `stock_issues`, `deliveries`, `inventories`, `activities`, `shift_assignments`, `reports`.
- **Data Relationships**: Products to categories; stock movements to products/users; activities to operations/users; reports aggregate data.

### Feature Specifications
- **Advanced Analytics & Demand Forecasting**:
    - Backend methods for consumption trends, predictions (days until depletion, reorder quantities), consumption heatmap, and ordering recommendations (using 90-day historical data).
    - API endpoints for `consumption-trends`, `predictions`, `heatmap`, `recommendations`.
    - Frontend analytics page with line charts, bar comparisons, heatmap, and predictions table (critical, warning, OK priorities).
    - Dashboard widget for top critical predictions.
    - Prediction algorithm based on 30-day average daily consumption.
- **Professional Reports Module**:
    - Backend generation of 7 report types: Warehouse Status, Shift, Daily, Weekly, Monthly, Product, Deliveries.
    - Reports include summary KPIs, chart data, and granular details.
    - API endpoints for `POST /api/reports/generate`, `GET /api/reports`, `GET /api/reports/:id`, `DELETE /api/reports/:id`.
    - Frontend reports page with report type cards, dynamic generation dialogs, and specific visualization components for each report type.
    - Report history section with view and delete actions.
    - Features professional design with KPI cards, Recharts visualizations, and robust error handling.

## External Dependencies
- **Database Service**: Neon serverless PostgreSQL (@neondatabase/serverless).
- **Authentication**: bcrypt, jsonwebtoken.
- **Real-time Communication**: WebSocket (ws library).
- **UI Component Libraries**: Radix UI, Tailwind CSS, Lucide React, date-fns, Recharts.
- **Form Handling**: react-hook-form, @hookform/resolvers, Zod.