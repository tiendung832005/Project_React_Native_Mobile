# 🔧 FIX LỖI AUTHENTICATION PRINCIPAL

## ❌ Lỗi

```
"error": "User not found with email: com.data.project_reactnative.model.User@7c5b0677"
```

## 🔍 Nguyên nhân

Trong `JwtAuthenticationFilter`, code đang set **User object** làm principal:

```java
// ❌ CODE CŨ (SAI)
User userEntity = userRepository.findByEmail(username).orElse(null);
UsernamePasswordAuthenticationToken authToken =
    new UsernamePasswordAuthenticationToken(userEntity != null ? userEntity : userDetails, ...);
```

Khi controller gọi:
```java
String email = authentication.getName();
```

Nó sẽ gọi `userEntity.toString()` thay vì trả về email string, dẫn đến kết quả:
- `com.data.project_reactnative.model.User@7c5b0677` (toString() của object)

## ✅ Giải pháp

**Luôn set email (string) làm principal**, không phải User object:

```java
// ✅ CODE MỚI (ĐÚNG)
UsernamePasswordAuthenticationToken authToken =
    new UsernamePasswordAuthenticationToken(username, null, userDetails.getAuthorities());
```

Bây giờ `authentication.getName()` sẽ trả về email string như mong đợi.

## 📝 Các file đã sửa

1. **JwtAuthenticationFilter.java**
   - ✅ Luôn set email (string) làm principal
   - ✅ Removed code set User object làm principal

## 🚀 Sau khi fix

1. **Restart backend** Spring Boot
2. **Login lại** để lấy token mới
3. **Test API** - `/api/posts/feed` sẽ hoạt động
4. **Kiểm tra logs** - email sẽ đúng format

## 🧪 Test

```bash
# Test với curl
curl -X GET "http://localhost:8080/api/posts/feed" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response sẽ là list posts thay vì lỗi 404
```

## 📋 Verification

Sau khi restart backend, kiểm tra logs:

```
GET /api/posts/feed
User email from token: user@example.com  ✅ (Email string)
Found user: username (ID: 1)  ✅
Retrieved 5 posts for feed  ✅
```

Thay vì:

```
GET /api/posts/feed
User email from token: com.data.project_reactnative.model.User@7c5b0677  ❌
User not found with email: ...  ❌
```

---

**Lưu ý:** Cần restart backend để áp dụng thay đổi!

