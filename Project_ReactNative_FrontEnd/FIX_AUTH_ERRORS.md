# 🔧 FIX LỖI AUTHENTICATION & TOKEN

## ❌ Các Lỗi Đã Phát Hiện

### 1. Lỗi: `payload.userId?.split is not a function`
**Nguyên nhân:**
- Token payload có `userId` có thể là:
  - `undefined` hoặc `null`
  - `number` (ID trong database)
  - `string` (email)
- Code cũ cố gọi `.split()` mà không kiểm tra type

**Đã Fix:**
- ✅ Kiểm tra type của `userId` trước khi gọi `.split()`
- ✅ Handle cả 3 trường hợp: undefined, number, string

### 2. Lỗi: API 404 - User not found
**Nguyên nhân:**
- Token có `userId: "test@example.com"` (email)
- Backend tìm user bằng email từ token
- User với email đó không tồn tại trong database

**Giải pháp:**
- ✅ Code tự động tạo profile từ token khi API trả về 404
- ✅ Fallback về local storage nếu không thể tạo từ token

### 3. Mismatch giữa Token và Database
**Vấn đề:**
- Token payload: `{"userId": "test@example.com", "username": undefined}`
- User trong AsyncStorage: `{"email": "dung123@gmail.com"}`
- Email không khớp → API không tìm thấy user

## ✅ Đã Fix

### 1. profileStorage.ts
- ✅ Safely extract `userId` (handle number, string, undefined)
- ✅ Safely extract `email` từ nhiều nguồn
- ✅ Safely extract `username` với fallback logic
- ✅ Better error handling và logging

### 2. authDebugger.ts
- ✅ Hiển thị thông tin token chi tiết hơn
- ✅ Check token format trước khi decode

### 3. Script SQL
- ✅ `CHECK_USER_IN_DB.sql` - Kiểm tra user trong database
- ✅ Tự động tạo user test nếu chưa có

## 🔍 Cách Kiểm Tra

### Bước 1: Kiểm tra User trong Database

```sql
-- Chạy script: CHECK_USER_IN_DB.sql
-- Hoặc chạy trực tiếp:
USE social_app;
SELECT * FROM `user` WHERE email = 'test@example.com';
```

### Bước 2: Kiểm tra Token

1. Mở app React Native
2. Chạy debug check (nếu có)
3. Xem token payload trong logs:
   ```
   📋 Token payload: {
     userId: "...",
     username: "...",
     email: "...",
     sub: "..."
   }
   ```

### Bước 3: Kiểm tra API

```bash
# Test với curl (thay TOKEN bằng token thực tế)
curl -X GET "http://localhost:8080/api/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🛠️ Cách Fix

### Option 1: Tạo User trong Database

```sql
-- Tạo user với email khớp với token
INSERT INTO `user` (username, email, password, created_at, updated_at)
VALUES (
  'testuser',
  'test@example.com',  -- Email trong token
  '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8LZiJQzZWRPEZUzNQZLqIQzJqWJq6', -- password123
  NOW(),
  NOW()
);
```

### Option 2: Login lại với Email đúng

1. Đảm bảo user tồn tại trong database
2. Login lại với email đó
3. Token mới sẽ có email đúng

### Option 3: Sử dụng Local Profile (Tạm thời)

- Code đã tự động tạo profile từ token khi API fail
- Profile được lưu local và có thể dùng offline
- Khi API hoạt động lại, sẽ sync với server

## 📋 Token Payload Structure

Token có thể có các format:

**Format 1 (Backend hiện tại):**
```json
{
  "userId": 123,        // Long - ID trong database
  "sub": "user@email.com",  // String - Email
  "exp": 1234567890,
  "iat": 1234567890
}
```

**Format 2 (Token cũ có thể có):**
```json
{
  "userId": "user@email.com",  // String - Email (thay vì ID)
  "sub": "user@email.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

Code đã được fix để handle cả 2 format.

## 🚀 Sau Khi Fix

1. **Restart app** React Native
2. **Login lại** để lấy token mới
3. **Kiểm tra logs** - không còn lỗi `split is not a function`
4. **Test API** - `/api/users/me` sẽ hoạt động

## 📝 Notes

- Token cũ có thể có format khác → Cần login lại
- User phải tồn tại trong database → Chạy script SQL
- Email trong token phải khớp với email trong database

---

**Nếu vẫn gặp lỗi:**
1. Xem logs chi tiết trong console
2. Kiểm tra token payload
3. Kiểm tra user trong database
4. Test API trực tiếp với Postman/curl

