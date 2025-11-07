# 🎯 QUICK START - TEST POST APIs

## 📋 Tóm Tắt

Bạn đã có:
- ✅ 7 Post APIs hoàn chỉnh
- ✅ File SQL với dữ liệu mẫu sẵn sàng
- ✅ Tài liệu đầy đủ

---

## 🚀 3 BƯỚC ĐỂ TEST

### BƯỚC 1: Insert Dữ Liệu Mẫu
```bash
# Mở MySQL Workbench hoặc CMD
mysql -u root -p12345678 social_app < insert_sample_data.sql
```

**Hoặc trong MySQL Workbench:**
1. File → Open SQL Script → chọn `insert_sample_data.sql`
2. Click ⚡ Execute

**Kết quả:** 5 users, 15 posts, 26 likes, 26 comments

---

### BƯỚC 2: Start Spring Boot App
```bash
.\gradlew bootRun
```

**Chờ thấy:**
```
Started ProjectReactNativeApplication in X.XXX seconds
```

---

### BƯỚC 3: Test trong Postman

#### 1. Login
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
→ Copy `token` từ response

#### 2. Xem Newsfeed
```
GET http://localhost:8080/api/posts/feed
Authorization: Bearer {YOUR_TOKEN}
```
→ Sẽ thấy ~10-12 posts (của John và bạn bè)

#### 3. Like một post
```
POST http://localhost:8080/api/posts/1/like
Authorization: Bearer {YOUR_TOKEN}
```

#### 4. Comment vào post
```
POST http://localhost:8080/api/posts/1/comments
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
  "content": "Amazing post! 🔥"
}
```

#### 5. Xem comments
```
GET http://localhost:8080/api/posts/1/comments
Authorization: Bearer {YOUR_TOKEN}
```

---

## 📚 TÀI LIỆU CHI TIẾT

| File | Mô Tả |
|------|-------|
| `POST_API_DOCUMENTATION.md` | Tài liệu đầy đủ 7 Post APIs |
| `POSTMAN_TEST_GUIDE.md` | Hướng dẫn test trong Postman |
| `INSERT_DATA_GUIDE.md` | Hướng dẫn insert dữ liệu mẫu |
| `insert_sample_data.sql` | File SQL với data mẫu |
| `SUMMARY.md` | Tổng quan toàn bộ dự án |

---

## 🎯 7 POST APIs ĐÃ HOÀN THÀNH

1. ✅ **POST** `/api/posts` - Đăng bài mới
2. ✅ **GET** `/api/posts/feed` - Xem newsfeed
3. ✅ **PUT** `/api/posts/{id}/privacy` - Đổi chế độ xem
4. ✅ **POST** `/api/posts/{id}/like` - Thích bài viết
5. ✅ **DELETE** `/api/posts/{id}/like` - Bỏ thích
6. ✅ **POST** `/api/posts/{id}/comments` - Bình luận
7. ✅ **GET** `/api/posts/{id}/comments` - Xem comments

---

## 👥 TEST ACCOUNTS

```
john@example.com   | password123 | Software Developer
jane@example.com   | password123 | Designer & Photographer
mike@example.com   | password123 | Travel Blogger
sarah@example.com  | password123 | Food Lover
david@example.com  | password123 | Fitness Coach
```

---

## 🔥 TEST SCENARIOS

### Scenario 1: Cơ Bản
1. Login với `john@example.com`
2. Xem feed → Thấy nhiều posts
3. Like post ID 4
4. Comment: "Great post!"
5. Xem comments của post 4

### Scenario 2: Privacy
1. Login với `john@example.com`
2. Tạo post PUBLIC → Mike (bạn) thấy ✅
3. Đổi sang PRIVATE → Mike không thấy ❌
4. Đổi sang FRIENDS → Mike thấy lại ✅

### Scenario 3: Multiple Users
1. Login `john` → Like post của Jane
2. Login `jane` → Refresh feed → Thấy John đã like
3. Jane comment vào post của John
4. Login `john` → Thấy comment từ Jane

---

## ⚠️ TROUBLESHOOTING

### Lỗi: "Post not found"
→ Kiểm tra database đã có posts chưa:
```sql
SELECT COUNT(*) FROM post;
```

### Lỗi: "User not found"
→ Verify đã insert users:
```sql
SELECT * FROM user;
```

### Lỗi: 401 Unauthorized
→ Token hết hạn hoặc sai, login lại

### Newsfeed trống
→ Kiểm tra friend_request có status ACCEPTED:
```sql
SELECT * FROM friend_request WHERE status = 'ACCEPTED';
```

---

## 🎉 DONE!

**Tất cả đã sẵn sàng để test!**

Bất kỳ câu hỏi nào, xem file `POST_API_DOCUMENTATION.md` hoặc `POSTMAN_TEST_GUIDE.md`

**Happy Testing! 🚀**

