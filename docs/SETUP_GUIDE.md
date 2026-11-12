# FoodFusion 2.0 — Local Setup & Development Guide

This guide walks you through setting up and running FoodFusion 2.0 locally with MySQL 8+, Spring Boot 3.3, and React 19 / Vite.

---

## 1. Prerequisites
- **Java**: OpenJDK 21 or Eclipse Temurin 21 (`java -version`)
- **Maven**: Version 3.9+ (`mvn -version`)
- **Node.js**: Version 20+ or 22+ (`node -v`)
- **MySQL**: Version 8.0+ running on `localhost:3306`

---

## 2. MySQL Database Setup
Open MySQL CLI or Workbench:

```sql
CREATE DATABASE foodfusion_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'foodfusion_user'@'localhost' IDENTIFIED BY 'SecretPass2026!';
GRANT ALL PRIVILEGES ON foodfusion_db.* TO 'foodfusion_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Backend Setup (Java 21 / Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the sample environment file or update `src/main/resources/application.properties`:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3306
   export DB_NAME=foodfusion_db
   export DB_USERNAME=foodfusion_user
   export DB_PASSWORD=SecretPass2026!
   export JWT_SECRET=YourAtLeast256BitsLongSecretKeyForFoodFusionProduction2026!
   ```

3. Build and execute Flyway migrations:
   ```bash
   mvn clean package
   ```
   *Flyway will automatically execute `V1__init_schema.sql` and `V2__seed_data.sql`.*

4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The server starts on `http://localhost:8080`.
   Explore interactive API docs at `http://localhost:8080/swagger-ui.html`.

---

## 4. Frontend Setup (React 19 / Vite / Tailwind)

1. Navigate to the root or frontend:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 5. Seed Accounts For Instant Testing
The database seed script initializes ready-to-test accounts (password for all is `Password123!`):

| Role | Email | Description |
|---|---|---|
| **Admin** | `admin@foodfusion.com` | Full platform administrative privileges |
| **Restaurant Owner** | `owner@bistrogood.com` | Manages Bella Italia & Urban Flame |
| **Customer** | `customer@foodfusion.com` | Sarah Jenkins with saved addresses & past orders |
| **Pending Owner** | `pending.chef@freshgrill.com` | Demonstrates the approval workflow |
