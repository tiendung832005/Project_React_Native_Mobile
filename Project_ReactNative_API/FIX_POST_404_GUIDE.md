# 🔧 HƯỚNG DẪN FIX LỖI 404 KHI LOAD POSTS

## ❌ Vấn đề
Khi load posts, frontend báo lỗi 404:
```
ERROR Error fetching posts: [AxiosError: Request failed with status code 404]
```

## 🔍 Nguyên nhân có thể

1. **Backend chưa chạy** hoặc không accessible
2. **Chưa có dữ liệu posts** trong database
3. **Authentication token** không hợp lệ hoặc chưa login
4. **Endpoint không đúng** (đã được fix trong code)

## ✅ Giải pháp

### Bước 1: Kiểm tra Backend có chạy không

1. Mở terminal và chạy backend:
```bash
cd Project_ReactNative_API
./gradlew bootRun
```

2. Kiểm tra backend đã chạy:
- Mở browser: `http://localhost:8080/api/auth/register`
- Hoặc test bằng Postman/curl

### Bước 2: Tạo dữ liệu test trong Database

**Option 1: Dùng script đơn giản (Khuyến nghị)**

1. Mở MySQL Workbench hoặc phpMyAdmin
2. Chọn database `social_app`
3. Chạy file: `QUICK_INSERT_POSTS.sql`

Script này sẽ:
- Tự động tìm user đầu tiên trong database
- Tạo 5 posts PUBLIC cho user đó
- Hiển thị kết quả

**Option 2: Dùng script đầy đủ**

1. Chạy file: `insert_sample_data.sql`
2. Script này tạo:
   - 5 users (john, jane, mike, sarah, david)
   - 15 posts
   - Likes và comments
   - Friend requests

**Option 3: Insert thủ công**

```sql
USE social_app;

-- Lấy user_id của bạn (thay email bằng email bạn đã đăng ký)
SET @user_id = (SELECT id FROM `user` WHERE email = 'your-email@example.com' LIMIT 1);

-- Insert posts
INSERT INTO `post` (user_id, image_url, caption, privacy, created_at, updated_at) VALUES
(@user_id, 'https://picsum.photos/600/600?random=1', 'My first post! 👋', 'PUBLIC', NOW(), NOW()),
(@user_id, 'https://picsum.photos/600/600?random=2', 'Beautiful day! ☀️', 'PUBLIC', NOW(), NOW()),
(@user_id, 'https://picsum.photos/600/600?random=3', 'Working hard! 💻', 'PUBLIC', NOW(), NOW());
```

### Bước 3: Kiểm tra Authentication

1. **Đảm bảo đã login** trong app
2. **Kiểm tra token** trong AsyncStorage:
   - Token phải tồn tại
   - Token phải còn hiệu lực (chưa hết hạn)

3. **Test API với token:**
```bash
# Lấy token từ app (trong AsyncStorage hoặc log)
TOKEN="your-jwt-token-here"

# Test endpoint
curl -X GET "http://localhost:8080/api/posts/feed" \
  -H "Authorization: Bearer $TOKEN"
```

### Bước 4: Kiểm tra Logs

1. **Backend logs:**
   - Xem console của Spring Boot
   - Tìm log: "GET /api/posts" hoặc "GET /api/posts/feed"
   - Kiểm tra có lỗi gì không

2. **Frontend logs:**
   - Mở React Native debugger
   - Xem console logs
   - Kiểm tra error chi tiết

### Bước 5: Test API trực tiếp

**Dùng Postman hoặc curl:**

1. **Login để lấy token:**
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

2. **Lấy posts với token:**
```bash
curl -X GET "http://localhost:8080/api/posts/feed" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Debug Steps

### 1. Kiểm tra Endpoint có tồn tại không

Backend có 2 endpoints:
- `GET /api/posts` - với pagination params
- `GET /api/posts/feed` - không có params

Frontend đã được cập nhật để thử cả 2 endpoint.

### 2. Kiểm tra Database

```sql
-- Kiểm tra có users không
SELECT * FROM `user`;

-- Kiểm tra có posts không
SELECT * FROM `post`;

-- Kiểm tra posts của user cụ thể
SELECT p.*, u.username, u.email 
FROM `post` p 
JOIN `user` u ON p.user_id = u.id 
WHERE u.email = 'your-email@example.com';
```

### 3. Kiểm tra Security Config

Backend yêu cầu JWT token cho các endpoint `/api/posts/*`.

Kiểm tra:
- Token có được gửi trong header `Authorization: Bearer <token>`
- Token có hợp lệ không
- Token có hết hạn không (mặc định 24 giờ)

## 🔧 Đã Fix

1. ✅ **Frontend:** Cải thiện error handling, thử cả 2 endpoints
2. ✅ **Backend:** Fix bug khi user không có bạn bè (trả về empty list)
3. ✅ **Scripts:** Tạo script SQL để insert dữ liệu test dễ dàng

## 📝 Sau khi fix

Sau khi chạy script SQL và backend đã chạy:

1. **Restart app** React Native
2. **Login lại** để lấy token mới
3. **Kiểm tra feed** - posts sẽ hiển thị

## 🆘 Vẫn còn lỗi?

Nếu vẫn gặp lỗi 404:

1. **Kiểm tra URL trong config:**
   - File: `Project_ReactNative_FrontEnd/constants/config.ts`
   - Đảm bảo `API_BASE_URL` đúng với backend

2. **Kiểm tra CORS:**
   - Backend có cho phép request từ frontend không
   - Kiểm tra SecurityConfig

3. **Kiểm tra Network:**
   - Backend có chạy trên đúng port không (mặc định 8080)
   - Firewall có chặn không
   - IP address có đúng không (cho physical device)

4. **Xem chi tiết error:**
   - Mở React Native debugger
   - Xem console logs
   - Copy full error message

## 📞 Test với Postman

Import collection này vào Postman:

```json
{
  "info": {
    "name": "Instagram API Test",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "http://localhost:8080/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Get Posts Feed",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": {
          "raw": "http://localhost:8080/api/posts/feed",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "posts", "feed"]
        }
      }
    }
  ]
}
```

---

**Lưu ý:** Sau khi chạy script SQL, nhớ restart backend để đảm bảo dữ liệu mới được load!

