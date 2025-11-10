# 📨 HƯỚNG DẪN INSERT SAMPLE MESSAGES

## 📋 Tổng Quan

File `insert_sample_messages.sql` chứa **23 sample messages** giữa các users để test messaging feature.

## 🗂️ Dữ Liệu Mẫu

### Conversations được tạo:
1. **User 1 (john_doe) ↔ User 2 (jane_smith)**: 6 messages
2. **User 1 (john_doe) ↔ User 3 (mike_wilson)**: 5 messages  
3. **User 2 (jane_smith) ↔ User 3 (mike_wilson)**: 4 messages
4. **User 1 (john_doe) ↔ User 4 (sarah_johnson)**: 4 messages
5. **User 2 (jane_smith) ↔ User 5 (david_lee)**: 4 messages

### Message Types:
- Tất cả messages đều là TEXT type
- Một số messages có `is_read = false` để test unread indicator

## 🚀 CÁCH CHẠY SCRIPT

### Cách 1: MySQL Workbench
1. Mở MySQL Workbench
2. Kết nối đến database `social_app`
3. File → Open SQL Script → chọn `insert_sample_messages.sql`
4. Click ⚡ Execute (hoặc Ctrl+Shift+Enter)

### Cách 2: Command Line
```bash
cd Project_ReactNative_API
mysql -u root -p12345678 social_app < insert_sample_messages.sql
```

### Cách 3: phpMyAdmin
1. Mở phpMyAdmin: `http://localhost/phpmyadmin`
2. Chọn database `social_app`
3. Click tab **SQL**
4. Click **Choose File** → chọn `insert_sample_messages.sql`
5. Click **Go**

## ✅ KIỂM TRA SAU KHI INSERT

### 1. Kiểm tra số lượng messages:
```sql
SELECT COUNT(*) as total_messages FROM message;
-- Kết quả mong đợi: 23
```

### 2. Xem cuộc trò chuyện giữa User 1 và User 2:
```sql
SELECT 
    m.id,
    u1.username as sender,
    u2.username as receiver,
    m.content,
    m.type,
    m.is_read,
    m.created_at
FROM message m
JOIN user u1 ON m.sender_id = u1.id
JOIN user u2 ON m.receiver_id = u2.id
WHERE (m.sender_id = 1 AND m.receiver_id = 2) 
   OR (m.sender_id = 2 AND m.receiver_id = 1)
ORDER BY m.created_at ASC;
```

### 3. Xem tất cả conversations của User 1:
```sql
SELECT DISTINCT
    CASE 
        WHEN m.sender_id = 1 THEN m.receiver_id
        ELSE m.sender_id
    END as other_user_id,
    u.username,
    COUNT(*) as message_count
FROM message m
JOIN user u ON (
    CASE 
        WHEN m.sender_id = 1 THEN m.receiver_id
        ELSE m.sender_id
    END = u.id
)
WHERE m.sender_id = 1 OR m.receiver_id = 1
GROUP BY other_user_id, u.username;
```

## 🧪 TEST TRONG APP

### Bước 1: Login với User 1
- Email: `john@example.com`
- Password: `password123`

### Bước 2: Vào Messages Tab
- Sẽ thấy danh sách conversations với:
  - User 2 (jane_smith)
  - User 3 (mike_wilson)
  - User 4 (sarah_johnson)

### Bước 3: Tap vào conversation
- Sẽ thấy lịch sử tin nhắn
- Có thể gửi tin nhắn mới
- Có thể react vào tin nhắn (long press)

### Bước 4: Test từ Following Screen
- Vào tab "Likes" → "Following"
- Tap vào bất kỳ bạn bè nào
- Sẽ navigate đến chat screen với người đó

## ⚠️ LƯU Ý

1. **Chạy sau khi đã insert users**: Đảm bảo đã chạy `insert_sample_data.sql` trước để có users trong database.

2. **Foreign Key Constraints**: Script sẽ fail nếu:
   - Users không tồn tại (id 1-5)
   - Table `message` chưa được tạo

3. **Auto-increment**: Nếu đã có messages trong database, có thể cần điều chỉnh ID trong script.

4. **Timestamps**: Messages được tạo với timestamps từ 1 giờ đến 2 ngày trước để test time formatting.

## 🔄 XÓA VÀ INSERT LẠI

Nếu muốn reset messages:
```sql
USE social_app;
TRUNCATE TABLE message_reaction;
TRUNCATE TABLE message;
```

Sau đó chạy lại `insert_sample_messages.sql`

