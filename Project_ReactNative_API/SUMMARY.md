# ✅ TÓM TẮT DỰ ÁN - BACKEND SOCIAL MEDIA

## 📋 Tổng quan
Backend cho ứng dụng mạng xã hội (giống Instagram) được xây dựng bằng **Spring Boot** và **MySQL**.

---

## 🎯 Các API đã được triển khai

### 1. 🔐 Authentication (Xác thực)
- ✅ **Register** - `POST /api/auth/register` - Đăng ký tài khoản mới
- ✅ **Login** - `POST /api/auth/login` - Đăng nhập và nhận JWT token

### 2. 👤 User Management (Quản lý người dùng)
- ✅ **Get Profile** - `GET /api/users/me` - Lấy thông tin cá nhân
- ✅ **Update Profile** - `PUT /api/users/update` - **Cập nhật avatarUrl và bio**
- ✅ **Search User** - `GET /api/users/search?phone={phone}` - Tìm kiếm người dùng

### 3. 👥 Friend Management (Quản lý bạn bè)
- ✅ **Send Friend Request** - `POST /api/friends/request` - Gửi lời mời kết bạn
- ✅ **Accept Request** - `POST /api/friends/accept/{requestId}` - Chấp nhận lời mời
- ✅ **Reject Request** - `POST /api/friends/reject/{requestId}` - Từ chối lời mời
- ✅ **Get Requests** - `GET /api/friends/requests` - Danh sách lời mời kết bạn
- ✅ **Get Friends** - `GET /api/friends` - Danh sách bạn bè
- ✅ **Unfriend** - `DELETE /api/friends/{friendId}` - Hủy kết bạn
- ✅ **Block User** - `POST /api/friends/block/{userId}` - Chặn người dùng
- ✅ **Unblock User** - `POST /api/friends/unblock/{userId}` - Bỏ chặn người dùng

### 4. 📝 Post Management (Quản lý bài viết) 🆕
- ✅ **Create Post** - `POST /api/posts` - Đăng bài viết mới
- ✅ **Get Newsfeed** - `GET /api/posts/feed` - Xem bài viết của bạn bè
- ✅ **Update Privacy** - `PUT /api/posts/{postId}/privacy` - Cập nhật chế độ xem bài viết
- ✅ **Like Post** - `POST /api/posts/{postId}/like` - Thích bài viết (Reaction)
- ✅ **Unlike Post** - `DELETE /api/posts/{postId}/like` - Bỏ thích bài viết
- ✅ **Add Comment** - `POST /api/posts/{postId}/comments` - Bình luận bài viết
- ✅ **Get Comments** - `GET /api/posts/{postId}/comments` - Xem danh sách bình luận

---
│   ├── FriendController.java
│   └── PostController.java        # 🆕 Post APIs
## 📁 Cấu trúc dự án

```
src/main/java/com/data/project_reactnative/
│   ├── FriendService.java
│   └── PostService.java           # 🆕 Post logic
├── controller/          # REST API Controllers
│   ├── AuthController.java
│   ├── UserController.java
│   └── FriendController.java
│   ├── PostRepository.java        # 🆕
│   ├── CommentRepository.java     # 🆕
│   └── LikeRepository.java        # 🆕
├── service/            # Business Logic
│   ├── AuthService.java
│   ├── UserService.java
│   └── FriendService.java
│
├── repository/         # Database Access (JPA)
│   ├── UserRepository.java
│   ├── FriendRequestRepository.java
│   └── [other repositories]
│
├── model/             # Database Entities
│   ├── User.java
│   ├── CreatePostRequest.java      # 🆕
│   ├── PostResponse.java           # 🆕
│   ├── UpdatePostPrivacyRequest.java  # 🆕
│   ├── CreateCommentRequest.java   # 🆕
│   ├── CommentResponse.java        # 🆕
│   ├── Post.java
│   ├── Comment.java
│   ├── Like.java
│   ├── Message.java
│   ├── Chat.java
│   ├── FriendRequest.java
│   └── Notification.java
    ├── UserNotFoundException.java
    └── PostNotFoundException.java  # 🆕
├── dto/               # Data Transfer Objects
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── UpdateUserRequest.java
│   ├── UserResponse.java
│   └── [other DTOs]
│
├── security/          # Security Configuration
│   ├── SecurityConfig.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
│
├── util/             # Utilities
│   └── JwtUtil.java
│
└── exception/        # Exception Handling
    ├── GlobalExceptionHandler.java
    └── UserNotFoundException.java
```

---

## 🗄️ Database Entities

### User (Người dùng)
```java
- id (Long, Primary Key)
- username (String)
- email (String, Unique)
- password (String, BCrypt encrypted)
- avatarUrl (String)
- bio (String)
- createdAt (LocalDateTime)
- updatedAt (LocalDateTime)
```

### Post (Bài viết)
```java
- id (Long)
- user (ManyToOne User)
- imageUrl (String)
- caption (String)
- createdAt (LocalDateTime)
- updatedAt (LocalDateTime)
```

### Comment (Bình luận)
```java
- id (Long)
- post (ManyToOne Post)
- user (ManyToOne User)
- content (String)
- createdAt (LocalDateTime)
```

### Like (Thích)
```java
- id (Long)
- post (ManyToOne Post)
- user (ManyToOne User)
- createdAt (LocalDateTime)
```

### Message (Tin nhắn)
```java
- id (Long)
- sender (ManyToOne User)
- receiver (ManyToOne User)
- content (String)
- isRead (Boolean)
- createdAt (LocalDateTime)
```

### Chat (Cuộc trò chuyện)
```java
- id (Long)
- participants (ManyToMany User)
- messages (OneToMany Message)
```

### FriendRequest (Lời mời kết bạn)
```java
- id (Long)
- sender (ManyToOne User)
- receiver (ManyToOne User)
- status (Enum: PENDING/ACCEPTED/REJECTED)
- createdAt (LocalDateTime)
```

### Notification (Thông báo)
```java
- id (Long)
- user (ManyToOne User)
- type (Enum: FOLLOW/LIKE/COMMENT/MESSAGE)
- content (String)
- isRead (Boolean)
- createdAt (LocalDateTime)
```

---

## 🔧 Cấu hình (application.properties)

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/social_app
spring.datasource.username=root
spring.datasource.password=12345678
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Secret Key
jwt.secret=your-secret-key-here-make-it-long-and-secure-at-least-256-bits

# Server Port
server.port=8080
```

⚠️ **LƯU Ý:** URL database là `localhost:3306` (không phải 8080)
- Port `3306` là port mặc định của MySQL
- Port `8080` là port của Spring Boot server

---

## 🔐 Security & JWT

### JWT Token Structure
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Endpoints
Tất cả các endpoint sau đây yêu cầu JWT token trong header:
- `GET /api/users/me`
- `PUT /api/users/update` ✅ **API cập nhật profile**
- `GET /api/users/search`
- Tất cả endpoints `/api/friends/*`

### Public Endpoints
Không cần token:
- `POST /api/auth/register`
- `POST /api/auth/login`

---

## 🎯 API CẬP NHẬT THÔNG TIN CÁ NHÂN ✅

### Chi tiết API
```
Method: PUT
Endpoint: /api/users/update
Headers:
  - Authorization: Bearer {JWT_TOKEN}
  - Content-Type: application/json

Request Body:
{
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Your bio text here"
}

Response:
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Your bio text here",
  "createdAt": "2025-11-04T10:30:00"
}
```

### Implementation Files
1. **Controller:** `UserController.java`
   - Endpoint: `@PutMapping("/update")`
   - Lấy user từ JWT token
   - Gọi service để cập nhật

2. **Service:** `UserService.java`
   - Method: `updateUser(String email, UpdateUserRequest request)`
   - Validate user exists
   - Update avatarUrl và bio
   - Save to database

3. **DTO:** `UpdateUserRequest.java`
   ```java
   public class UpdateUserRequest {
       private String avatarUrl;
       private String bio;
   }
   ```

4. **Repository:** `UserRepository.java`
   - JpaRepository với method `findByEmail(String email)`

---

## 🌐 Kết nối Frontend

### 1. API Base URL
```javascript
const API_BASE_URL = 'http://localhost:8080/api';

// Cho Android Emulator:
const API_BASE_URL = 'http://10.0.2.2:8080/api';

// Cho production:
const API_BASE_URL = 'https://your-domain.com/api';
```

### 2. Ví dụ gọi API Update Profile (React Native)
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const updateProfile = async (avatarUrl, bio) => {
  try {
    // Lấy token từ storage
    const token = await AsyncStorage.getItem('token');
    
    // Gọi API
    const response = await fetch('http://localhost:8080/api/users/update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarUrl, bio }),
    });
    
    const result = await response.json();
    console.log('Profile updated:', result);
    return result;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};

// Sử dụng:
4. ✅ **POST_API_DOCUMENTATION.md** - 🆕 Tài liệu chi tiết về Post APIs
updateProfile(
  'https://example.com/my-avatar.jpg',
  'Full Stack Developer | Tech Lover'
);
```

### 3. File API Service
Đã tạo file mẫu: `frontend-api-example.js`
- Chứa tất cả functions để gọi API
- Có error handling
- Có ví dụ sử dụng trong React Native

---

## 📝 Files đã tạo

1. ✅ **API_ENDPOINTS.md** - Tài liệu đầy đủ về tất cả APIs
2. ✅ **frontend-api-example.js** - File mẫu để gọi API từ frontend
3. ✅ **SUMMARY.md** - File này (tóm tắt dự án)
### Post System 🆕
- [x] Đăng bài viết (với hình ảnh, caption, privacy)
- [x] Xem bài viết của bạn bè (Newsfeed)
- [x] Cập nhật chế độ xem bài viết (PUBLIC/FRIENDS/PRIVATE)
- [x] Thích bài viết (Like/Reaction)
- [x] Bỏ thích bài viết (Unlike)
- [x] Bình luận bài viết
- [x] Xem danh sách bình luận


---

## ✅ Checklist Features

### Authentication & User
- [x] Đăng ký user
- [x] Đăng nhập với JWT
- [x] Lấy thông tin profile
- [x] **Cập nhật avatarUrl và bio** ✅
- [x] Tìm kiếm user

### Friend System
- [x] Gửi lời mời kết bạn
- [x] Chấp nhận/Từ chối lời mời
- [x] Xem danh sách lời mời
- [x] Xem danh sách bạn bè
- [x] Hủy kết bạn
- [x] Chặn/Bỏ chặn user

### Database
- [x] 8 entities với đầy đủ relationships
- [x] JPA repositories
- [x] Timestamps tự động

### Security
- [x] JWT authentication
- [x] BCrypt password hashing
- [x] Protected endpoints
- [x] CORS configuration

---

## 🚀 Cách chạy dự án

### 1. Start MySQL Server
```bash
# Windows: Mở XAMPP hoặc MySQL Workbench
# hoặc chạy MySQL service
```

### 2. Tạo Database
```sql
CREATE DATABASE social_app;
```

### 3. Chạy Spring Boot
```bash
cd Project_ReactNative_API
gradlew bootRun
```

hoặc

```bash
./gradlew bootRun
```

### 4. Test API
- Dùng Postman
- Hoặc cURL
- Hoặc Thunder Client (VS Code)

---

## 📱 Test với Postman

### Step 1: Register
```
POST http://localhost:8080/api/auth/register
Body: {
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### Step 2: Login
```
POST http://localhost:8080/api/auth/login
Body: {
  "email": "test@example.com",
  "password": "password123"
}
```
→ Copy token từ response

### Step 3: Get Profile
```
GET http://localhost:8080/api/users/me
Headers: Authorization: Bearer {TOKEN}
```

### Step 4: Update Profile ✅
```
PUT http://localhost:8080/api/users/update
Headers: 
  - Authorization: Bearer {TOKEN}
  - Content-Type: application/json
Body: {
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Software Developer"
}
```

---

## 🎉 KẾT LUẬN

### ✅ API Update Profile đã được implement đầy đủ!

**Endpoint:** `PUT /api/users/update`

**Chức năng:**
- Cập nhật `avatarUrl` (URL ảnh đại diện)
- Cập nhật `bio` (Tiểu sử)
- Yêu cầu JWT authentication
- Trả về thông tin user đã được cập nhật

**Files liên quan:**
- `UserController.java` - REST endpoint
- `UserService.java` - Business logic
- `UpdateUserRequest.java` - DTO cho request
- `UserResponse.java` - DTO cho response
- `UserRepository.java` - Database access

### 📚 Tài liệu
- Xem `API_ENDPOINTS.md` để biết chi tiết tất cả APIs
- Xem `frontend-api-example.js` để biết cách gọi API từ frontend

### 🔗 Kết nối Frontend
Base URL: `http://localhost:8080/api`
(Đổi thành domain của bạn khi deploy production)

---

**Dự án đã sẵn sàng để kết nối với React Native frontend!** 🚀

