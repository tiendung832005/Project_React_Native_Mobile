# 🗄️ HƯỚNG DẪN INSERT DỮ LIỆU MẪU VÀO MYSQL

## 📋 Dữ Liệu Mẫu

File `insert_sample_data.sql` chứa:
- **5 Users** với mật khẩu đã mã hóa BCrypt
- **15 Posts** (PUBLIC, FRIENDS, PRIVATE)
- **26 Likes** 
- **26 Comments**
- **7 Friend Requests** (6 accepted, 1 pending)

---

## 🚀 CÁCH 1: Sử dụng MySQL Workbench

### Bước 1: Mở MySQL Workbench
1. Kết nối đến MySQL server (localhost:3306)
2. Username: `root`
3. Password: `12345678` (hoặc password của bạn)

### Bước 2: Chạy Script
1. Click **File** → **Open SQL Script**
2. Chọn file `insert_sample_data.sql`
3. Click biểu tượng **⚡ Execute** (hoặc Ctrl+Shift+Enter)
4. Đợi script chạy xong

### Bước 3: Kiểm Tra
```sql
USE social_app;

-- Xem tất cả users
SELECT * FROM user;

-- Xem tất cả posts
SELECT * FROM post;

-- Xem posts với số likes và comments
SELECT 
    p.id,
    p.caption,
    p.privacy,
    u.username,
    COUNT(DISTINCT l.id) as likes_count,
    COUNT(DISTINCT c.id) as comments_count
FROM post p
LEFT JOIN user u ON p.user_id = u.id
LEFT JOIN `like` l ON p.id = l.post_id
LEFT JOIN comment c ON p.id = c.post_id
GROUP BY p.id, p.caption, p.privacy, u.username
ORDER BY p.created_at DESC;
```

---

## 🚀 CÁCH 2: Sử dụng Command Line

### Windows (CMD hoặc PowerShell):
```cmd
cd C:\Users\hi\IdeaProjects\Project_React_Native\Project_ReactNative_API

mysql -u root -p12345678 social_app < insert_sample_data.sql
```

### Nếu MySQL không trong PATH:
```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p12345678 social_app < insert_sample_data.sql
```

### Linux/Mac:
```bash
mysql -u root -p12345678 social_app < insert_sample_data.sql
```

---

## 🚀 CÁCH 3: Sử dụng phpMyAdmin (XAMPP)

1. Mở phpMyAdmin: `http://localhost/phpmyadmin`
2. Chọn database `social_app` ở sidebar trái
3. Click tab **SQL** ở trên
4. Click **Choose File** và chọn `insert_sample_data.sql`
5. Scroll xuống và click **Go**

---

## 👥 THÔNG TIN USERS ĐÃ TẠO

### User 1: John Doe
```
Email: john@example.com
Password: password123
Username: john_doe
Bio: Software Developer | Tech Enthusiast 💻
Avatar: https://i.pravatar.cc/150?img=11
Posts: 3 bài (1 PUBLIC, 1 FRIENDS, 1 PUBLIC)
```

### User 2: Jane Smith
```
Email: jane@example.com
Password: password123
Username: jane_smith
Bio: Designer & Photographer 📸
Avatar: https://i.pravatar.cc/150?img=5
Posts: 3 bài (2 PUBLIC, 1 FRIENDS)
```

### User 3: Mike Wilson
```
Email: mike@example.com
Password: password123
Username: mike_wilson
Bio: Travel Blogger | Adventure Seeker 🌍
Avatar: https://i.pravatar.cc/150?img=12
Posts: 3 bài (2 PUBLIC, 1 PRIVATE)
```

### User 4: Sarah Johnson
```
Email: sarah@example.com
Password: password123
Username: sarah_johnson
Bio: Food Lover | Chef 🍕
Avatar: https://i.pravatar.cc/150?img=9
Posts: 3 bài (2 PUBLIC, 1 FRIENDS)
```

### User 5: David Lee
```
Email: david@example.com
Password: password123
Username: david_lee
Bio: Fitness Coach | Gym Enthusiast 💪
Avatar: https://i.pravatar.cc/150?img=15
Posts: 3 bài (2 PUBLIC, 1 FRIENDS)
```

---

## 🔗 MỐI QUAN HỆ BẠN BÈ

```
John (1) ←→ Jane (2)   ✅ Bạn bè
John (1) ←→ Mike (3)   ✅ Bạn bè
John (1) ←→ Sarah (4)  ✅ Bạn bè
Jane (2) ←→ Mike (3)   ✅ Bạn bè
Jane (2) ←→ David (5)  ✅ Bạn bè
Mike (3) ←→ Sarah (4)  ✅ Bạn bè
David (5) → John (1)   ⏳ Pending (chờ chấp nhận)
```

---

## 🧪 TEST NGAY SAU KHI INSERT

### 1. Login với John
```bash
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
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### 2. Xem Newsfeed của John
```bash
GET http://localhost:8080/api/posts/feed
Authorization: Bearer {token}
```

**John sẽ thấy:**
- Bài của chính John (3 bài)
- Bài PUBLIC của Jane, Mike, Sarah, David
- Bài FRIENDS của Jane và Mike (vì họ là bạn)
- **KHÔNG** thấy bài PRIVATE của Mike

### 3. Like một bài viết
```bash
POST http://localhost:8080/api/posts/4/like
Authorization: Bearer {token}
```

### 4. Comment vào bài
```bash
POST http://localhost:8080/api/posts/4/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "This is amazing! 🔥"
}
```

### 5. Xem bình luận
```bash
GET http://localhost:8080/api/posts/4/comments
Authorization: Bearer {token}
```

---

## 📊 QUERIES HỮU ÍCH

### Xem tất cả posts với thông tin đầy đủ:
```sql
SELECT 
    p.id,
    p.caption,
    p.privacy,
    u.username as author,
    p.created_at,
    (SELECT COUNT(*) FROM post_like WHERE post_id = p.id) as likes,
    (SELECT COUNT(*) FROM comment WHERE post_id = p.id) as comments
FROM post p
JOIN user u ON p.user_id = u.id
ORDER BY p.created_at DESC;
```

### Xem ai like bài nào:
```sql
SELECT 
    p.id as post_id,
    p.caption,
    u.username as liked_by
FROM post_like l
JOIN post p ON l.post_id = p.id
JOIN user u ON l.user_id = u.id
ORDER BY p.id, l.created_at DESC;
```

### Xem tất cả comments:
```sql
SELECT 
    c.id,
    p.caption as post,
    u.username as commenter,
    c.content,
    c.created_at
FROM comment c
JOIN post p ON c.post_id = p.id
JOIN user u ON c.user_id = u.id
ORDER BY c.created_at DESC;
```

### Xem bạn bè của một user:
```sql
-- Bạn bè của John (user_id = 1)
SELECT DISTINCT
    CASE 
        WHEN sender_id = 1 THEN receiver_id
        ELSE sender_id
    END as friend_id,
    u.username,
    u.email
FROM friend_request fr
JOIN user u ON (
    CASE 
        WHEN fr.sender_id = 1 THEN fr.receiver_id
        ELSE fr.sender_id
    END = u.id
)
WHERE (sender_id = 1 OR receiver_id = 1)
AND status = 'ACCEPTED';
```

---

## 🔄 XÓA VÀ INSERT LẠI

Nếu muốn reset data và insert lại:

### Cách 1: Chạy lại file SQL
File đã có lệnh xóa dữ liệu cũ ở đầu:
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `like`;
TRUNCATE TABLE `comment`;
TRUNCATE TABLE `post`;
-- ...
SET FOREIGN_KEY_CHECKS = 1;
```

### Cách 2: Manual Delete
```sql
USE social_app;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE post_like;
TRUNCATE TABLE `comment`;
TRUNCATE TABLE `post`;
TRUNCATE TABLE friend_request;
TRUNCATE TABLE notification;
TRUNCATE TABLE message;
TRUNCATE TABLE `user`;
SET FOREIGN_KEY_CHECKS = 1;
```

Sau đó chạy lại file `insert_sample_data.sql`

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Password đã được mã hóa
Tất cả users có password: `password123`
Đã mã hóa bằng BCrypt: `$2a$10$N9qo8uLOickgx2ZMRZoMye1J8LZiJQzZWRPEZUzNQZLqIQzJqWJq6`

### 2. Timestamps
Các timestamps được tạo tự động:
- Posts: Từ 10 giờ trước đến hiện tại
- Comments và Likes: Thời gian phù hợp với post

### 3. Privacy Levels
- **PUBLIC**: Ai cũng thấy (kể cả không phải bạn bè)
- **FRIENDS**: Chỉ bạn bè thấy
- **PRIVATE**: Chỉ mình tôi thấy

### 4. Auto-increment IDs
Script sử dụng ID cụ thể (1, 2, 3...) để dễ test.
Nếu insert thêm data sau này, MySQL sẽ tự động tăng ID.

---

## ✅ KIỂM TRA SAU KHI INSERT

Chạy query này để verify:
```sql
USE social_app;

SELECT 'USERS' as 'Table', COUNT(*) as 'Count' FROM `user`
UNION ALL
SELECT 'POSTS', COUNT(*) FROM `post`
UNION ALL
SELECT 'LIKES', COUNT(*) FROM post_like
UNION ALL
SELECT 'COMMENTS', COUNT(*) FROM `comment`
UNION ALL
SELECT 'FRIEND REQUESTS', COUNT(*) FROM friend_request;
```

**Kết quả mong đợi:**
```
+------------------+-------+
| Table            | Count |
+------------------+-------+
| USERS            |     5 |
| POSTS            |    15 |
| LIKES            |    26 |
| COMMENTS         |    26 |
| FRIEND REQUESTS  |     7 |
+------------------+-------+
```

---

## 🎉 HOÀN TẤT!

Sau khi insert xong, bạn có thể:
1. ✅ Login với bất kỳ user nào (email + password: password123)
2. ✅ Xem newsfeed đầy posts
3. ✅ Like/Unlike posts
4. ✅ Comment vào posts
5. ✅ Test privacy levels
6. ✅ Test friend relationships

**Bắt đầu test trong Postman ngay! 🚀**

