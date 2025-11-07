-- ================================================================
-- SQL SCRIPT - INSERT DỮ LIỆU TEST CHO POSTS
-- ================================================================
-- Script này sẽ tạo dữ liệu test cho posts
-- Chạy script này trong MySQL sau khi đã có users trong database
-- ================================================================

USE social_app;

-- ================================================================
-- 1. KIỂM TRA USERS CÓ TỒN TẠI KHÔNG
-- ================================================================
-- Nếu chưa có users, hãy chạy insert_sample_data.sql trước

SELECT 'Checking users...' as 'Status';
SELECT COUNT(*) as 'User Count' FROM `user`;

-- ================================================================
-- 2. XÓA POSTS CŨ (NẾU CẦN)
-- ================================================================
-- Uncomment dòng dưới nếu muốn xóa dữ liệu cũ
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE post_like;
-- TRUNCATE TABLE `comment`;
-- TRUNCATE TABLE `post`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- 3. INSERT POSTS
-- ================================================================
-- Lấy user_id đầu tiên từ database (hoặc thay bằng ID cụ thể)
SET @user_id = (SELECT id FROM `user` LIMIT 1);

-- Nếu không có user nào, tạo user test
INSERT INTO `user` (username, email, password, avatar_url, bio, created_at, updated_at)
SELECT 'testuser', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8LZiJQzZWRPEZUzNQZLqIQzJqWJq6', 
       'https://i.pravatar.cc/150?img=1', 'Test User', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email = 'test@example.com');

SET @user_id = (SELECT id FROM `user` WHERE email = 'test@example.com' LIMIT 1);

-- Insert posts cho user này
INSERT INTO `post` (user_id, image_url, caption, privacy, created_at, updated_at) VALUES
-- Post 1
(@user_id, 'https://picsum.photos/600/600?random=1', 'Beautiful sunset at the beach 🌅 #nature #sunset', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
-- Post 2
(@user_id, 'https://picsum.photos/600/600?random=2', 'Working on my new project! 💻 #coding #developer', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
-- Post 3
(@user_id, 'https://picsum.photos/600/600?random=3', 'Coffee time ☕️', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
-- Post 4
(@user_id, 'https://picsum.photos/600/600?random=4', 'New design project completed! 🎨 #design #creative', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
-- Post 5
(@user_id, 'https://picsum.photos/600/600?random=5', 'Photography session today 📸', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
-- Post 6
(@user_id, 'https://picsum.photos/600/600?random=6', 'My favorite place in the city', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
-- Post 7
(@user_id, 'https://picsum.photos/600/600?random=7', 'Exploring the mountains 🏔️ #travel #adventure', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR)),
-- Post 8
(@user_id, 'https://picsum.photos/600/600?random=8', 'Best trip ever! 🌍✈️', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 7 HOUR), DATE_SUB(NOW(), INTERVAL 7 HOUR)),
-- Post 9
(@user_id, 'https://picsum.photos/600/600?random=9', 'Cooking pasta tonight 🍝 #foodie #cooking', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR)),
-- Post 10
(@user_id, 'https://picsum.photos/600/600?random=10', 'Gym session completed 💪 #fitness #workout', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 9 HOUR), DATE_SUB(NOW(), INTERVAL 9 HOUR));

-- ================================================================
-- 4. INSERT LIKES (Tạo một số likes cho posts)
-- ================================================================
-- Lấy post IDs vừa tạo
SET @post_id_1 = (SELECT id FROM `post` ORDER BY created_at DESC LIMIT 1 OFFSET 9);
SET @post_id_2 = (SELECT id FROM `post` ORDER BY created_at DESC LIMIT 1 OFFSET 8);
SET @post_id_3 = (SELECT id FROM `post` ORDER BY created_at DESC LIMIT 1 OFFSET 7);

-- Insert likes (user tự like các post của mình)
INSERT INTO post_like (post_id, user_id, created_at) 
SELECT id, @user_id, NOW() FROM `post` WHERE user_id = @user_id
LIMIT 5;

-- ================================================================
-- 5. INSERT COMMENTS (Tạo một số comments)
-- ================================================================
-- Insert comments cho post đầu tiên
SET @first_post_id = (SELECT id FROM `post` WHERE user_id = @user_id ORDER BY created_at DESC LIMIT 1);

INSERT INTO `comment` (post_id, user_id, content, created_at) VALUES
(@first_post_id, @user_id, 'Great post! 😍', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(@first_post_id, @user_id, 'Love this! ❤️', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- ================================================================
-- 6. VERIFY DATA
-- ================================================================
SELECT '=== DATA SUMMARY ===' as 'Status';
SELECT 'Posts created:' as 'Type', COUNT(*) as 'Count' FROM `post` WHERE user_id = @user_id
UNION ALL
SELECT 'Likes created:', COUNT(*) FROM post_like WHERE post_id IN (SELECT id FROM `post` WHERE user_id = @user_id)
UNION ALL
SELECT 'Comments created:', COUNT(*) FROM `comment` WHERE post_id IN (SELECT id FROM `post` WHERE user_id = @user_id);

-- ================================================================
-- 7. HIỂN THỊ POSTS VỪA TẠO
-- ================================================================
SELECT '=== POSTS CREATED ===' as 'Status';
SELECT 
    id,
    user_id,
    SUBSTRING(caption, 1, 50) as caption_preview,
    privacy,
    created_at
FROM `post` 
WHERE user_id = @user_id
ORDER BY created_at DESC;

-- ================================================================
-- DONE!
-- ================================================================
-- Bây giờ bạn có thể:
-- 1. Login với email: test@example.com, password: password123
-- 2. Xem posts trong feed
-- 3. Test các chức năng like, comment, etc.
-- ================================================================

