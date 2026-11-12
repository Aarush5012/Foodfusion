# FoodFusion 2.0 — Multi-Restaurant Food Ordering Platform

FoodFusion 2.0 is a production-oriented, full-stack multi-restaurant food delivery system built with **React 19**, **Tailwind CSS**, **Java 21**, **Spring Boot 3.3**, and **MySQL 8+**.

---

## Key Features

### Three Dedicated Role-Based Dashboards
1. **Customer Dashboard**:
   - Order history with live order timeline status tracking (`PLACED`, `CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`).
   - One-click re-order and verified order reviews.
   - Order cancellation workflow (allowed for PLACED/CONFIRMED).
   - Address book (Add, Edit, Delete, Default).
   - Saved favourite restaurants and dishes.
   - Profile management.

2. **Restaurant Owner Dashboard**:
   - Multi-tenant security: owners can only view and manage their own restaurant(s).
   - Real-time revenue analytics, order trend charts, and status breakdowns.
   - Incoming orders queue with verified status lifecycle buttons.
   - Menu management: Add/edit dishes, vegetarian/spicy indicators, availability toggles, price updates.
   - Opening/closing hours, delivery fee, and minimum order threshold management.

3. **Administrator Dashboard**:
   - Platform-wide GMV, volume, and customer growth analytics.
   - Restaurant owner verification: approve or reject pending onboarding applications.
   - Account governance: Suspend or reactivate users and restaurant listings.
   - Global order monitor.
   - Platform coupon creator with usage limits and discount policies.
   - User review moderation.
   - **One-click CSV Export** for financial transactions and order reporting.

### Shopping Cart & Billing Engine
- **Single-Restaurant Isolation**: Ensures a cart belongs to one restaurant at a time with instant modal confirmation if cross-adding.
- **Authoritative Backend Pricing**: All subtotal, coupon discounts, delivery fees, and taxes are calculated with `BigDecimal`.
- **Order Snapshots**: Historical item names and prices are preserved in `order_items` snapshots.

---

## Monorepo Layout
```
foodfusion/
├── backend/                       # Java 21 / Spring Boot 3.3 Backend
│   ├── src/main/java/com/foodfusion/
│   │   ├── config/                # SecurityConfig, OpenApiConfig
│   │   ├── controller/            # REST Controllers
│   │   ├── dto/                   # Request/Response DTOs
│   │   ├── entity/                # JPA Relational Entities
│   │   ├── exception/             # GlobalExceptionHandler
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   ├── security/              # JWT Token Filter & UserDetailsService
│   │   └── service/               # Authoritative Business Logic & Billing
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/          # V1 schema & V2 seed Flyway scripts
│   ├── src/test/                  # JUnit 5 & Mockito test suites
│   ├── Dockerfile
│   └── pom.xml
│
├── src/                           # React 19 Frontend SPA
│   ├── assets/images/             # Generated high-resolution food photography
│   ├── components/                # Reusable UI primitives (Buttons, Badges, Modals)
│   ├── context/                   # AuthContext, CartContext, NotificationContext
│   ├── dashboards/                # Customer, Restaurant Owner, Admin Dashboards
│   ├── pages/                     # Public Storefront, Restaurant Details, Cart, Checkout
│   ├── services/api.ts            # REST API client matching Spring Boot endpoints
│   └── App.tsx
│
├── docs/                          # Comprehensive Technical Docs
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── SETUP_GUIDE.md
│   └── DEPLOYMENT_GUIDE.md
└── package.json
```

---

## Quick Start (Interactive Web Client)
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to interact with FoodFusion 2.0. Use the top Quick-Role Switcher to test as Customer, Restaurant Owner, or Administrator with seed data.
