# REST API Testing Guide - Social Media Backend

## Base URL
```
http://localhost:8080
```

## API Endpoints

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "message": "User registered successfully"
}
```

**Error Response (409 Conflict):**
```json
{
  "error": "Email already exists"
}
```
or
```json
{
  "error": "Username already exists"
}
```

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": null,
    "bio": null,
    "createdAt": "2025-11-04T15:30:00"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 3. Get Current User Info
**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Hello, I'm John!",
  "createdAt": "2025-11-04T15:30:00"
}
```

**Error Response (401 Unauthorized):**
- No token or invalid token

---

### 4. Update User Info
**Endpoint:** `PUT /api/users/update`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "bio": "Updated bio text"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "bio": "Updated bio text",
  "createdAt": "2025-11-04T15:30:00"
}
```

---

## Testing with Postman

### Step 1: Register a New User
1. Create a new request in Postman
2. Set method to `POST`
3. URL: `http://localhost:8080/api/auth/register`
4. Go to Body → raw → JSON
5. Paste the register JSON
6. Click Send

### Step 2: Login
1. Create a new request
2. Set method to `POST`
3. URL: `http://localhost:8080/api/auth/login`
4. Go to Body → raw → JSON
5. Paste the login JSON
6. Click Send
7. **COPY THE TOKEN** from the response

### Step 3: Get User Info
1. Create a new request
2. Set method to `GET`
3. URL: `http://localhost:8080/api/users/me`
4. Go to Headers tab
5. Add header:
   - Key: `Authorization`
   - Value: `Bearer <paste_your_token_here>`
6. Click Send

### Step 4: Update User Info
1. Create a new request
2. Set method to `PUT`
3. URL: `http://localhost:8080/api/users/update`
4. Go to Headers tab
5. Add header:
   - Key: `Authorization`
   - Value: `Bearer <paste_your_token_here>`
6. Go to Body → raw → JSON
7. Paste the update JSON
8. Click Send

---

## Testing with cURL (Windows CMD)

### Register
```cmd
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"johndoe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Login
```cmd
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Get User Info
```cmd
curl -X GET http://localhost:8080/api/users/me -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update User
```cmd
curl -X PUT http://localhost:8080/api/users/update -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"avatarUrl\":\"https://example.com/avatar.jpg\",\"bio\":\"My new bio\"}"
```

---

## Common Error Codes

- **200 OK** - Request successful
- **401 Unauthorized** - Invalid credentials or missing/invalid token
- **404 Not Found** - User not found
- **409 Conflict** - User already exists
- **500 Internal Server Error** - Server error

---

## Important Notes

1. **JWT Token Expiration**: The token expires after 24 hours (86400000 ms)
2. **Password Security**: Passwords are hashed using BCrypt
3. **Database**: Make sure MySQL is running on port 3306
4. **Database Name**: social_app
5. **Protected Routes**: All routes except `/api/auth/**` require JWT authentication

---

## MySQL Connection Check

Before testing, ensure MySQL is running and database exists:

```sql
CREATE DATABASE IF NOT EXISTS social_app;
USE social_app;
SHOW TABLES;
```

The application will auto-create tables on first run due to `spring.jpa.hibernate.ddl-auto=update`

