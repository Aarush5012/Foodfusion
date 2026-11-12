# FoodFusion 2.0 — Testing & Quality Assurance Guide

This guide details the automated test suites, manual verification matrices, and regression procedures across the backend and frontend.

---

## 1. Backend Testing (JUnit 5, Mockito & Spring Boot Test)

All backend tests are located under `/backend/src/test/java/com/foodfusion/`.

### Running All Backend Tests
```bash
cd backend
mvn test
```

### Test Coverage Highlights
1. **`AuthServiceTest.java`**:
   - `testRegisterCustomerSuccess`: Validates normal customer registration and `ROLE_CUSTOMER` assignment.
   - `testRegisterDuplicateEmailThrowsBadRequest`: Enforces unique email constraint.
   - `testRegisterOwnerSetsPendingApproval`: Enforces that restaurant owner registrations receive `PENDING_APPROVAL` status until reviewed by an admin.

2. **`OrderBillingServiceTest.java`**:
   - `testOrderCreationCalculatesAccurateTotals`: Verifies exact mathematical billing calculation using `BigDecimal` for line totals, subtotal, 8% sales tax, delivery fee, and grand total.
   - `testEmptyCartThrowsBadRequest`: Prevents order generation from empty carts.
   - Snapshot preservation: Confirms historical item names and unit prices are snapshot into `order_items`.

---

## 2. Frontend Verification & End-to-End Scenarios

### Running Frontend Compilation & Linting
```bash
npm run build
npm run lint
```

### Verification Matrix
| Flow | Test Case | Expected Outcome |
|---|---|---|
| **Role Switcher** | Click "Customer View" | Renders customer hubs, saved orders, and favorites. |
| **Role Switcher** | Click "Restaurant Owner View" | Displays Marco Bellini's kitchen dashboard, revenue metrics, and dish management. |
| **Role Switcher** | Click "Admin View" | Displays platform GMV, pending owner onboarding queue, and user governance. |
| **Single Restaurant Isolation** | Add item from Bella Italia, then add item from Urban Flame | Triggers `ConflictModal` warning user that cart only supports 1 restaurant. |
| **Coupon Validation** | Enter `WELCOME20` on order > $25 | Authoritatively calculates 20% discount (up to $15 cap). |
| **Order Status Transitions** | Owner accepts incoming order -> Kitchen -> Courier -> Delivered | Order progress updates in real time on Customer's Live Tracker. |
| **Order Cancellation** | Customer cancels order while `PLACED` | State changes to `CANCELLED`; prevented if in `PREPARING` or later. |
| **CSV Export** | Admin clicks "Download CSV Report" | Triggers browser download of `foodfusion_orders_<date>.csv`. |
