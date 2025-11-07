-- ================================================================
-- QUICK SCRIPT - INSERT POSTS CHO USER HIỆN TẠI
-- ================================================================
-- Script này sẽ insert posts cho user đầu tiên trong database
-- Dùng khi bạn đã có user và muốn test posts ngay
-- ================================================================

USE social_app;

-- Lấy user đầu tiên
SET @user_id = (SELECT id FROM `user` ORDER BY id LIMIT 1);

-- Kiểm tra có user không
SELECT 
    CASE 
        WHEN @user_id IS NULL THEN 'ERROR: No users found! Please create a user first.'
        ELSE CONCAT('Found user ID: ', @user_id, ' - Inserting posts...')
    END as 'Status';

-- Nếu không có user, dừng lại
-- Nếu có user, insert posts
INSERT INTO `post` (user_id, image_url, caption, privacy, created_at, updated_at) 
SELECT 
    @user_id,
    'https://picsum.photos/600/600?random=1',
    'My first post! Hello world! 👋',
    'PUBLIC',
    NOW(),
    NOW()
WHERE @user_id IS NOT NULL;

INSERT INTO `post` (user_id, image_url, caption, privacy, created_at, updated_at) 
SELECT 
    @user_id,
    'https://picsum.photos/600/600?random=2',
    'Beautiful day today! ☀️ #sunny',
    'PUBLIC',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
WHERE @user_id IS NOT NULL;

INSERT INTO `post` (user_id, image_url, caption, privacy, created_at, updated_at) 
SELECT 
    @user_id,
    'https://picsum.photos/600/600?random=3',
    'Working hard! 💻 #coding',
    'PUBLIC',
    DATE_SUB(NOW(), INTERVAL 1 HOUR),
    DATE_SUB(NOW(), INTERVAL 1 HOUR)
WHERE @user_id IS NOT NULL;

INSERT INTO `post` (user_id, image_url, caption, privacy, created_at, updated_at) 
SELECT 
    @user_id,
    'https://picsum.photos/600/600?random=4',
    'Coffee break! ☕️',
    'PUBLIC',
    DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    DATE_SUB(NOW(), INTERVAL 30 MINUTE)
WHERE @user_id IS NOT NULL;

INSERT INTO `post` (user_id, image_url, caption, privacy, created_at, updated_at) 
SELECT 
    @user_id,
    'https://picsum.photos/600/600?random=5',
    'Great view! 🌆',
    'PUBLIC',
    NOW(),
    NOW()
WHERE @user_id IS NOT NULL;

-- Hiển thị kết quả
SELECT '=== POSTS CREATED ===' as 'Status';
SELECT 
    id,
    user_id,
    SUBSTRING(caption, 1, 30) as caption,
    privacy,
    created_at
FROM `post` 
WHERE user_id = @user_id
ORDER BY created_at DESC;

SELECT CONCAT('Total posts for user ', @user_id, ': ', COUNT(*)) as 'Summary'
FROM `post` 
WHERE user_id = @user_id;

