# FoodFusion 2.0 — Production Deployment Architecture

## 1. Architecture Overview
- **Client Frontend**: React 19 SPA deployed on Vercel or Cloudflare Pages with client-side routing fallback.
- **Backend API**: Java 21 Spring Boot containerized via multi-stage Docker build, hosted on AWS ECS, Google Cloud Run, or Railway.
- **Database**: Managed MySQL 8.0+ (Amazon RDS, Google Cloud SQL, or PlanetScale) with automated backups and connection pooling.

---

## 2. Frontend Deployment (Vercel)
Vercel configuration in `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Set environment variables on Vercel:
```
VITE_API_BASE_URL=https://api.foodfusion.com
```

---

## 3. Backend Deployment (Docker & Cloud Run / ECS)
Build the container:
```bash
docker build -t foodfusion-backend:2.0.0 -f backend/Dockerfile backend/
```
Run container in production:
```bash
docker run -d \
  -p 8080:8080 \
  -e PORT=8080 \
  -e DB_HOST=db.production.foodfusion.internal \
  -e DB_PORT=3306 \
  -e DB_NAME=foodfusion_prod \
  -e DB_USERNAME=app_runner \
  -e DB_PASSWORD=$PROD_DB_SECRET \
  -e JWT_SECRET=$PROD_JWT_SECRET \
  -e CORS_ALLOWED_ORIGINS=https://foodfusion.vercel.app \
  foodfusion-backend:2.0.0
```

---

## 4. Security Hardening Checklist
- [x] Passwords hashed with BCrypt (10 rounds).
- [x] JWT access tokens verified via HMAC SHA-256 with 256-bit secret.
- [x] CORS restricted to verified frontend origin.
- [x] Zero database credentials exposed to frontend.
- [x] Parameterized JPA queries preventing SQL injection.
- [x] Multi-tenant restaurant owner isolation enforced at service layer.
