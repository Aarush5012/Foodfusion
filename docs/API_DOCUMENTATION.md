# FoodFusion 2.0 — REST API Documentation

## Base URL
```
Development: http://localhost:8080
Production:  https://api.foodfusion.com
Swagger UI:  http://localhost:8080/swagger-ui.html
OpenAPI Doc: http://localhost:8080/api-docs
```

## Authentication Header
All protected endpoints require:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register customer or restaurant owner |
| POST | `/api/auth/login` | Public | Login with email & password, returns JWT token |
| POST | `/api/auth/logout` | Public | Stateless session invalidation |

---

## 2. Restaurants & Menus (`/api/restaurants`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/restaurants` | Public | List all active restaurants (filter by `search`) |
| GET | `/api/restaurants/{id}` | Public | Get restaurant profile details |
| GET | `/api/restaurants/{id}/menu` | Public | Get menu categories and available food items |

---

## 3. Shopping Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/cart` | Customer | Fetch current persistent cart |
| POST | `/api/cart/items` | Customer | Add item to cart (validates single restaurant) |
| PUT | `/api/cart/items/{id}` | Customer | Update quantity (0 deletes item) |
| DELETE | `/api/cart` | Customer | Clear cart items |

---

## 4. Orders & Tracking (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Customer | Place order with address & coupon |
| GET | `/api/orders/my-orders` | Customer | Get order history |
| GET | `/api/orders/{id}` | Authenticated | Get full order details & item snapshots |
| POST | `/api/orders/{id}/cancel` | Customer | Cancel order (allowed if PLACED or CONFIRMED) |
| PATCH | `/api/orders/{id}/status` | Owner | Update order lifecycle status |

---

## 5. Restaurant Owner Management (`/api/owner`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/owner/dashboard` | Owner | Restaurant revenue, order counts, metrics |
| GET | `/api/owner/restaurants` | Owner | List owned restaurants |
| PUT | `/api/owner/restaurants/{id}`| Owner | Update opening hours, delivery fee, profile |
| GET | `/api/owner/menu/{restId}` | Owner | Manage menu items |
| POST | `/api/owner/menu/{restId}` | Owner | Add dish to menu |
| DELETE | `/api/owner/menu/{restId}/{id}`| Owner | Delete dish |

---

## 6. Platform Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Total platform GMV, user and restaurant metrics |
| GET | `/api/admin/users` | Admin | List all registered users |
| PATCH | `/api/admin/users/{id}/status` | Admin | Suspend or reactivate user |
| GET | `/api/admin/restaurants` | Admin | List all restaurants |
| PATCH | `/api/admin/restaurants/{id}/status`| Admin | Approve pending restaurant or suspend |
| GET | `/api/admin/orders` | Admin | View all platform orders |
| GET | `/api/admin/reports/export-csv` | Admin | Stream and download real order CSV report |
