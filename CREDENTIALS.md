# Login Credentials and URLs

## 🔐 Application Access

### Frontend (Web Application)
- **URL**: http://localhost:3000
- **Login Page**: http://localhost:3000/login

### Backend API
- **URL**: http://localhost:8000
- **API Base**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/docs
- **Login Endpoint**: http://localhost:8000/api/auth/login

---

## 👤 Default User Credentials

⚠️ **IMPORTANT**: These are default credentials for development/demo purposes. **Change these passwords in production!**

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: admin@frauddetection.com
- **Role**: ADMIN
- **Permissions**: Full system access, user management, configuration

### Investigator User
- **Username**: `investigator`
- **Password**: `investigator123`
- **Email**: investigator@frauddetection.com
- **Role**: INVESTIGATOR
- **Permissions**: Full case management, transaction scoring, entity analysis

### Analyst User
- **Username**: `analyst`
- **Password**: `analyst123`
- **Email**: analyst@frauddetection.com
- **Role**: ANALYST
- **Permissions**: View transactions/scores, comment on cases, read-only access to most features

---

## 🔑 Database Credentials

### PostgreSQL
- **Host**: localhost
- **Port**: 5433
- **Database**: fraud_detection
- **Username**: postgres
- **Password**: fraud123
- **Connection String**: `postgresql://postgres:fraud123@localhost:5433/fraud_detection`

### Redis
- **Host**: localhost
- **Port**: 6379
- **Database**: 0
- **URL**: `redis://localhost:6379/0`
- **Password**: None (default)

### Neo4j
- **Browser URL**: http://localhost:7474
- **Bolt URL**: neo4j://localhost:7687
- **Username**: neo4j
- **Password**: fraud123
- **Connection URI**: `neo4j://localhost:7687`

---

## 📡 API Authentication

### Login Request
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

### Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@frauddetection.com",
    "role": "admin",
    "full_name": "Admin User"
  }
}
```

### Using the Token
Include the token in the Authorization header:
```bash
curl -X GET "http://localhost:8000/api/transactions" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Login
1. Navigate to: http://localhost:3000/login
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Login"

---

## 🔒 Security Notes

### Development Environment
- Default passwords are weak and should only be used for development
- JWT tokens expire after 24 hours (configurable)
- All passwords are hashed using bcrypt

### Production Checklist
- [ ] Change all default passwords
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set secure JWT secret key
- [ ] Enable rate limiting
- [ ] Set up proper firewall rules
- [ ] Regular security audits

---

## 📋 User Roles and Permissions

| Role | Transactions | Cases | Entities | Users | Settings |
|------|-------------|-------|----------|-------|----------|
| **ADMIN** | Full Access | Full Access | Full Access | Full Access | Full Access |
| **INVESTIGATOR** | Score/View | Full Access | Full Access | View Only | View Only |
| **ANALYST** | View Only | View/Comment | View Only | View Only | View Only |
| **READ_ONLY** | View Only | View Only | View Only | View Only | View Only |

---

## 🐳 Docker Container Access

### PostgreSQL
```bash
docker exec -it fraud-detection-postgres psql -U postgres -d fraud_detection
```

### Redis CLI
```bash
docker exec -it fraud-detection-redis redis-cli
```

### Neo4j Browser
- Open: http://localhost:7474
- Login with: neo4j / fraud123

---

## 🔧 Creating New Users

### Via API (Admin Only)
```bash
curl -X POST "http://localhost:8000/api/users" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword",
    "full_name": "New User",
    "role": "analyst"
  }'
```

### Via Database (Direct)
```sql
INSERT INTO users (username, email, hashed_password, full_name, role, is_active)
VALUES (
  'newuser',
  'newuser@example.com',
  '$2b$12$...', -- Use get_password_hash() function
  'New User',
  'analyst',
  true
);
```

---

## 📞 Support

If you encounter login issues:
1. Verify backend is running: `http://localhost:8000/docs`
2. Check database connection: `python scripts/check_services.py`
3. Verify users exist: Run `python scripts/seed_data.py`
4. Check logs: `docker logs fraud-detection-postgres`

---

**Last Updated**: December 2024
**Environment**: Development
**⚠️ Change all passwords before production deployment!**

