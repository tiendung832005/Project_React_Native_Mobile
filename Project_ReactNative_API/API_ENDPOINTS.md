# API Endpoints Documentation

## Base URL
```
http://localhost:8080
```

---

## 🔐 Authentication APIs

### 1. Register New User
- **Endpoint:** `POST /api/auth/register`
- **Description:** Register a new user account
- **Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### 2. Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Login and get JWT token
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

---

## 👤 User Management APIs

### 3. Get Current User Profile
- **Endpoint:** `GET /api/users/me`
- **Description:** Get logged-in user's information
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```
- **Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Software Developer",
  "createdAt": "2025-11-04T10:30:00"
}
```

### 4. Update User Profile ✅
- **Endpoint:** `PUT /api/users/update`
- **Description:** Update user's avatar and bio
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```
- **Request Body:**
```json
{
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "bio": "Full Stack Developer | Tech Enthusiast"
}
```
- **Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "bio": "Full Stack Developer | Tech Enthusiast",
  "createdAt": "2025-11-04T10:30:00"
}
```

### 5. Search User by Phone
- **Endpoint:** `GET /api/users/search?phone={phone_number}`
- **Description:** Search for a user by phone number
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Tìm thấy người dùng",
  "data": {
    "id": 2,
    "username": "janedoe",
    "avatarUrl": "https://example.com/jane-avatar.jpg"
  }
}
```

---

## 👥 Friend Management APIs

### 6. Send Friend Request
- **Endpoint:** `POST /api/friends/request`
- **Description:** Send a friend request to another user
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```
- **Request Body:**
```json
{
  "receiverId": 2
}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Đã gửi lời mời kết bạn",
  "data": {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "status": "PENDING",
    "createdAt": "2025-11-04T11:00:00"
  }
}
```

### 7. Accept Friend Request
- **Endpoint:** `POST /api/friends/accept/{requestId}`
- **Description:** Accept a pending friend request
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Đã chấp nhận lời mời kết bạn",
  "data": null
}
```

### 8. Reject Friend Request
- **Endpoint:** `POST /api/friends/reject/{requestId}`
- **Description:** Reject a pending friend request
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Đã từ chối lời mời kết bạn",
  "data": null
}
```

### 9. Get Friend Requests
- **Endpoint:** `GET /api/friends/requests`
- **Description:** Get all pending friend requests for current user
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Lấy danh sách lời mời thành công",
  "data": [
    {
      "id": 1,
      "senderId": 2,
      "senderUsername": "janedoe",
      "senderAvatarUrl": "https://example.com/jane-avatar.jpg",
      "status": "PENDING",
      "createdAt": "2025-11-04T11:00:00"
    }
  ]
}
```

### 10. Get Friends List
- **Endpoint:** `GET /api/friends`
- **Description:** Get list of all friends
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Lấy danh sách bạn bè thành công",
  "data": [
    {
      "id": 2,
      "username": "janedoe",
      "avatarUrl": "https://example.com/jane-avatar.jpg",
      "bio": "Designer"
    }
  ]
}
```

### 11. Unfriend User
- **Endpoint:** `DELETE /api/friends/{friendId}`
- **Description:** Remove a friend from friend list
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Đã hủy kết bạn",
  "data": null
}
```

### 12. Block User
- **Endpoint:** `POST /api/friends/block/{userId}`
- **Description:** Block a user
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Đã chặn người dùng",
  "data": null
}
```

### 13. Unblock User
- **Endpoint:** `POST /api/friends/unblock/{userId}`
- **Description:** Unblock a previously blocked user
- **Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Đã bỏ chặn người dùng",
  "data": null
}
```

---

## 📝 Notes

### Authentication
- Most endpoints require JWT authentication
- Include the token in the Authorization header: `Bearer {token}`
- Token is obtained from the login endpoint

### Error Responses
All error responses follow this format:
```json
{
  "status": "error",
  "code": 400,
  "message": "Error description here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔗 Frontend Integration

### For React Native or any frontend:

1. **Create an API service file** (e.g., `api.js` or `apiService.js`)
2. **Set base URL:**
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

3. **Example functions:**
```javascript
// Login
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get current user
export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Update profile
export const updateProfile = async (token, avatarUrl, bio) => {
  const response = await fetch(`${API_BASE_URL}/users/update`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ avatarUrl, bio })
  });
  return response.json();
};
```

4. **For production, change the base URL to your deployed server:**
```javascript
const API_BASE_URL = 'https://your-domain.com/api';
```

---

## ✅ Summary

### Available APIs:
- ✅ User Registration
- ✅ User Login (JWT)
- ✅ Get User Profile
- ✅ **Update User Profile (avatarUrl, bio)**
- ✅ Search User
- ✅ Friend Request Management
- ✅ Friends List
- ✅ Block/Unblock Users

### The **Update User Profile API** is fully implemented and ready to use!

**Endpoint:** `PUT /api/users/update`  
**Fields:** `avatarUrl`, `bio`  
**Authentication:** Required (JWT token)

