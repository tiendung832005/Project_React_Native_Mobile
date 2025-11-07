# ✅ FIXED: 500 Error on GET /api/posts

## 🔧 What Was Fixed

### 1. **Added Missing Endpoint**
- **Problem:** Frontend calling `GET /api/posts?page=1&limit=10` but endpoint didn't exist
- **Solution:** Added new `@GetMapping` endpoint to handle `/api/posts` with pagination params

### 2. **Added Comprehensive Logging**
- **Problem:** No error logging to debug 500 errors
- **Solution:** Added detailed logging in PostController and PostService:
  - User authentication details
  - Database query results
  - Privacy filtering results
  - Error stack traces

### 3. **Fixed Empty Posts Handling**
- **Problem:** Crash when user has no friends/posts
- **Solution:** Added check for empty friend list before querying

### 4. **JWT Token Fix** 
- **Problem:** Token contained email in `userId` claim, causing lookup failures
- **Solution:** Updated `AuthService.login()` to use `jwtUtil.generateToken(email, userId)` with both parameters

---

## 🚀 How to Test

### 1. Start the Application
```bash
.\gradlew bootRun
```

Wait for: `Started ProjectReactNativeApplication in X.XXX seconds`

### 2. Test with Postman

#### A. Login First
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful",
  "user": { ... }
}
```

✅ Copy the `token`

#### B. Test GET /api/posts (NEW)
```http
GET http://localhost:8080/api/posts?page=1&limit=10
Authorization: Bearer {YOUR_TOKEN}
```

**Expected Response:** `200 OK`
```json
[
  {
    "id": 1,
    "userId": 1,
    "username": "john_doe",
    "userAvatarUrl": "...",
    "imageUrl": "...",
    "caption": "...",
    "privacy": "PUBLIC",
    "likesCount": 4,
    "commentsCount": 3,
    "likedByCurrentUser": false,
    "createdAt": "2025-11-07T10:00:00",
    "updatedAt": "2025-11-07T10:00:00"
  }
]
```

#### C. Test GET /api/posts/feed (EXISTING)
```http
GET http://localhost:8080/api/posts/feed
Authorization: Bearer {YOUR_TOKEN}
```

**Same response format as above**

---

## 📋 API Endpoints Summary

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/posts` | Get posts with pagination | ✅ NEW |
| GET | `/api/posts/feed` | Get newsfeed | ✅ FIXED |
| POST | `/api/posts` | Create new post | ✅ |
| PUT | `/api/posts/{id}/privacy` | Update privacy | ✅ |
| POST | `/api/posts/{id}/like` | Like post | ✅ |
| DELETE | `/api/posts/{id}/like` | Unlike post | ✅ |
| POST | `/api/posts/{id}/comments` | Add comment | ✅ |
| GET | `/api/posts/{id}/comments` | Get comments | ✅ |

---

## 🔍 Debugging Guide

### Check Application Logs

When you run the app, you'll now see detailed logs:

```
2025-11-07 10:00:00 INFO  PostController - GET /api/posts - page: 1, limit: 10
2025-11-07 10:00:00 INFO  PostController - User email from token: john@example.com
2025-11-07 10:00:00 INFO  PostService - Getting posts for user: john@example.com
2025-11-07 10:00:00 INFO  PostService - Found user: john_doe (ID: 1)
2025-11-07 10:00:00 INFO  PostService - Friend IDs: [2, 3, 4]
2025-11-07 10:00:00 INFO  PostService - Total IDs to query (friends + self): 4
2025-11-07 10:00:00 INFO  PostService - Found 15 total posts
2025-11-07 10:00:00 INFO  PostService - After privacy filter: 12 visible posts
2025-11-07 10:00:00 INFO  PostService - Returning 12 post responses
2025-11-07 10:00:00 INFO  PostController - Retrieved 12 posts
```

### Common Errors & Solutions

#### ❌ Error: "User not found"
**Cause:** JWT token expired or invalid email

**Solution:**
1. Login again to get new token
2. Check token in Authorization header: `Bearer {token}`

#### ❌ Error: "Cannot resolve table 'post_like'"
**Cause:** Database table not created or wrong name

**Solution:**
1. Check MySQL is running
2. Verify table exists:
```sql
SHOW TABLES LIKE 'post_like';
```
3. If missing, restart Spring Boot to auto-create tables

#### ❌ Error: "Empty response / No posts"
**Cause:** User has no friends or no posts exist

**Solution:**
1. Insert sample data:
```bash
mysql -u root -p12345678 social_app < insert_sample_data.sql
```
2. Verify posts exist:
```sql
SELECT COUNT(*) FROM post;
```

#### ❌ Error: 401 Unauthorized
**Cause:** Missing or invalid JWT token

**Solution:**
1. Check Authorization header format: `Bearer {token}` (space after Bearer)
2. Login again to get fresh token
3. Token expires after configured time (check `application.properties`)

---

## 🗄️ Database Verification

### Check Database Connection
```sql
USE social_app;
SHOW TABLES;
```

**Expected tables:**
- `user`
- `post`
- `post_like` (not `like`)
- `comment`
- `friend_request`

### Check Posts Data
```sql
SELECT 
    p.id,
    p.caption,
    u.username as author,
    p.privacy,
    COUNT(DISTINCT pl.id) as likes,
    COUNT(DISTINCT c.id) as comments
FROM post p
LEFT JOIN user u ON p.user_id = u.id
LEFT JOIN post_like pl ON p.id = pl.post_id
LEFT JOIN comment c ON p.id = c.post_id
GROUP BY p.id
ORDER BY p.created_at DESC;
```

---

## 📱 Frontend Integration

### Update Frontend API Call

**Before (causing 500 error):**
```javascript
GET /api/posts?page=1&limit=10
```

**After (now working):** ✅
```javascript
const response = await axios.get('/api/posts', {
  params: { page: 1, limit: 10 },
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Handle Empty Response
```javascript
const posts = response.data;
if (posts.length === 0) {
  console.log('No posts available');
  // Show empty state UI
} else {
  console.log(`Loaded ${posts.length} posts`);
}
```

---

## ✅ Verification Checklist

- [x] PostController.java - Added GET /api/posts endpoint
- [x] PostController.java - Added comprehensive logging
- [x] PostService.java - Added logging and null checks
- [x] AuthService.java - Fixed JWT token generation
- [x] Build successful (no compilation errors)
- [x] Ready to test with Postman/Frontend

---

## 🎯 Next Steps

1. **Start the application:**
   ```bash
   .\gradlew bootRun
   ```

2. **Test the endpoint:**
   - Login to get token
   - Call `GET /api/posts?page=1&limit=10`
   - Should return 200 OK with posts array

3. **Check logs:**
   - Watch console for detailed logging
   - If error occurs, logs will show exact location

4. **Test from frontend:**
   - Update frontend to use correct endpoint
   - Handle empty posts array gracefully

---

## 🆘 Still Having Issues?

### Check These Files:
1. `PostController.java` - Endpoints mapping
2. `PostService.java` - Business logic
3. `application.properties` - Database config
4. Console logs - Detailed error traces

### Get Help:
- Check logs in console
- Verify database connection
- Ensure JWT token is valid
- Test with Postman first before frontend

**All fixes are complete and ready to test! 🎉**

