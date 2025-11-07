-- ================================================================
-- SCRIPT KIỂM TRA USER TRONG DATABASE
-- ================================================================
-- Script này giúp kiểm tra xem user có tồn tại trong database không
-- ================================================================

USE social_app;

-- 1. Kiểm tra tất cả users
SELECT '=== ALL USERS ===' as 'Status';
SELECT 
    id,
    username,
    email,
    avatar_url,
    bio,
    created_at
FROM `user`
ORDER BY id;

-- 2. Tìm user theo email (thay email bằng email trong token của bạn)
SELECT '=== USER BY EMAIL ===' as 'Status';
SELECT 
    id,
    username,
    email,
    avatar_url,
    bio,
    created_at
FROM `user`
WHERE email = 'test@example.com';  -- Thay bằng email trong token của bạn

-- 3. Tìm user theo email khác (nếu cần)
SELECT '=== USER BY EMAIL (dung123@gmail.com) ===' as 'Status';
SELECT 
    id,
    username,
    email,
    avatar_url,
    bio,
    created_at
FROM `user`
WHERE email = 'dung123@gmail.com';

-- 4. Tạo user test nếu chưa có (password: password123)
INSERT INTO `user` (username, email, password, avatar_url, bio, created_at, updated_at)
SELECT 
    'testuser',
    'test@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8LZiJQzZWRPEZUzNQZLqIQzJqWJq6', -- password: password123
    'https://i.pravatar.cc/150?img=1',
    'Test User',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email = 'test@example.com');

SELECT '=== USER CREATED (if not exists) ===' as 'Status';

-- 5. Kiểm tra lại sau khi tạo
SELECT '=== VERIFICATION ===' as 'Status';
SELECT 
    id,
    username,
    email,
    'User exists' as status
FROM `user`
WHERE email = 'test@example.com';

-- 6. Tạo posts cho user test
SET @test_user_id = (SELECT id FROM `user` WHERE email = 'test@example.com' LIMIT 1);

INSERT INTO `post` (user_id, image_url, caption, privacy, created_at, updated_at)
SELECT 
    @test_user_id,
    'https://picsum.photos/600/600?random=1',
    'Test post from test@example.com',
    'PUBLIC',
    NOW(),
    NOW()
WHERE @test_user_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM `post` 
    WHERE user_id = @test_user_id 
    AND caption = 'Test post from test@example.com'
);

SELECT '=== TEST POST CREATED ===' as 'Status';

