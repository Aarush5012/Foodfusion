# FoodFusion 2.0 — Database Schema Architecture

## Overview
FoodFusion 2.0 uses a normalised **MySQL 8+** relational schema managed through **Flyway migrations** (`V1__init_schema.sql` and `V2__seed_data.sql`).

All financial figures are stored in `DECIMAL(10, 2)` to eliminate floating-point rounding errors.

---

## Entity Relationship Overview

```
 [User] 1 ──── * [UserRoles] * ──── 1 [Role]
   │
   ├── 1 ──── * [Addresses]
   ├── 1 ──── 1 [Cart] 1 ──── * [CartItem] * ──── 1 [FoodItem]
   ├── 1 ──── * [Restaurant] (as Owner)
   │               │
   │               ├── 1 ──── * [FoodCategory] 1 ──── * [FoodItem]
   │               └── 1 ──── * [Coupons]
   │
   └── 1 ──── * [Orders] 1 ──── * [OrderItem] * ──── 1 [FoodItem]
                   │
                   ├── 1 ──── 1 [Payment]
                   └── 1 ──── 1 [Review]
```

---

## Table Definitions

### 1. `users`
Stores user profile, authentication credentials, and status.
- `id` BIGINT AUTO_INCREMENT PRIMARY KEY
- `name` VARCHAR(100) NOT NULL
- `email` VARCHAR(150) NOT NULL UNIQUE
- `password` VARCHAR(255) NOT NULL (BCrypt hashed)
- `phone` VARCHAR(30)
- `profile_image` VARCHAR(500)
- `status` VARCHAR(30) DEFAULT 'ACTIVE' (`ACTIVE`, `SUSPENDED`, `PENDING_APPROVAL`)
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### 2. `roles` & `user_roles`
Enforces Role-Based Access Control (RBAC).
- `ROLE_CUSTOMER`: Browses restaurants, manages cart, places and tracks orders, writes reviews.
- `ROLE_RESTAURANT_OWNER`: Manages owned restaurants, menus, dishes, and processes incoming orders.
- `ROLE_ADMIN`: Platform-wide governance, restaurant approvals, user account moderation, financial reporting.

### 3. `restaurants`
- `id` BIGINT AUTO_INCREMENT PRIMARY KEY
- `owner_id` BIGINT NOT NULL (FK -> users.id)
- `name` VARCHAR(150) NOT NULL
- `slug` VARCHAR(180) NOT NULL UNIQUE
- `description` TEXT
- `cuisine` VARCHAR(100) NOT NULL
- `cover_image` VARCHAR(500)
- `delivery_fee` DECIMAL(10, 2) DEFAULT 2.99
- `min_order_value` DECIMAL(10, 2) DEFAULT 15.00
- `estimated_delivery_minutes` INT DEFAULT 30
- `rating` DECIMAL(3, 2) DEFAULT 0.00
- `status` VARCHAR(30) DEFAULT 'ACTIVE' (`ACTIVE`, `PENDING_APPROVAL`, `SUSPENDED`)

### 4. `food_categories` & `food_items`
- `food_categories`: Hierarchical category grouping per restaurant (e.g., 'Wood-Fired Pizza', 'Artisan Pasta').
- `food_items`:
  - `price` DECIMAL(10, 2) NOT NULL
  - `is_vegetarian` BOOLEAN
  - `is_available` BOOLEAN (live toggle to pause ordering when sold out)
  - `is_featured` BOOLEAN
  - `spicy_level` INT (0=None, 1=Mild, 2=Medium, 3=Hot)

### 5. `carts` & `cart_items`
- Persisted in MySQL so customers don't lose carts across devices or re-login.
- Enforces **Single-Restaurant Isolation Rule**: Each cart is linked to at most one restaurant.

### 6. `orders` & `order_items`
- Orders capture the transaction snapshot:
  - `order_number`: Unique human-readable code (e.g. `FF-2026-10492`).
  - `subtotal`, `discount_amount`, `delivery_fee`, `tax_amount`, `total_amount` in `DECIMAL(10, 2)`.
  - `status`: `PLACED` -> `CONFIRMED` -> `PREPARING` -> `READY_FOR_PICKUP` -> `OUT_FOR_DELIVERY` -> `DELIVERED` (or `CANCELLED`, `REJECTED`).
- `order_items` stores historical **snapshots**:
  - `item_name_snapshot`
  - `unit_price_snapshot`
  - `total_price_snapshot`
  *Guarantee: Menu price edits never retroactively distort past orders or financial auditing.*

### 7. `coupons` & `coupon_usages`
- Supports `PERCENTAGE` or `FIXED_AMOUNT` discounts.
- Enforces `min_order_amount`, `max_discount_amount`, `start_date`, `expiry_date`, and `usage_limit`.

### 8. `reviews`
- Enforces verified purchases: One review per completed order.
