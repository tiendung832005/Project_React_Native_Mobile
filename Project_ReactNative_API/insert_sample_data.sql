-- ================================================================
-- SQL SCRIPT - INSERT DỮ LIỆU MẪU CHO SOCIAL MEDIA APP
-- ================================================================
-- Run this script in MySQL Workbench or phpMyAdmin
-- Database: social_app
-- ================================================================

USE social_app;

-- ================================================================
-- 1. XÓA DỮ LIỆU CŨ (NẾU CÓ)
-- ================================================================
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE post_like;
TRUNCATE TABLE `comment`;
TRUNCATE TABLE `post`;
TRUNCATE TABLE friend_request;
TRUNCATE TABLE notification;
TRUNCATE TABLE message;
TRUNCATE TABLE chat;
TRUNCATE TABLE `user`;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- 2. INSERT USERS
-- ================================================================
-- Password cho tất cả users: "password123"
-- Đã được mã hóa bằng BCrypt với rounds=10

INSERT INTO `user` (id, username, email, password, avatar_url, bio, created_at, updated_at) VALUES
(1, 'john_doe', 'john@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8LZiJQzZWRPEZUzNQZLqIQzJqWJq6', 'https://i.pravatar.cc/150?img=11', 'Software Developer | Tech Enthusiast 💻', NOW(), NOW()),
(2, 'jane_smith', 'jane@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8LZiJQzZWRPEZUzNQZLqIQzJqWJq6', 'https://i.pravatar.cc/150?img=5', 'Designer & Photographer 📸', NOW(), NOW()),
(3, 'mike_wilson', 'mike@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8LZiJQzZWRPEZUzNQZLqIQzJqWJq6', 'https://i.pravatar.cc/150?img=12', 'Travel Blogger | Adventure Seeker 🌍', NOW(), NOW()),
(4, 'sarah_johnson', 'sarah@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8LZiJQzZWRPEZUzNQZLqIQzJqWJq6', 'https://i.pravatar.cc/150?img=9', 'Food Lover | Chef 🍕', NOW(), NOW()),
(5, 'david_lee', 'david@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8LZiJQzZWRPEZUzNQZLqIQzJqWJq6', 'https://i.pravatar.cc/150?img=15', 'Fitness Coach | Gym Enthusiast 💪', NOW(), NOW());

-- ================================================================
-- 3. INSERT FRIEND REQUESTS (TẠO BẠN BÈ)
-- ================================================================
-- Status: ACCEPTED = đã là bạn bè

INSERT INTO friend_request (id, sender_id, receiver_id, status, created_at) VALUES
-- John và Jane là bạn
(1, 1, 2, 'ACCEPTED', DATE_SUB(NOW(), INTERVAL 10 DAY)),
-- John và Mike là bạn
(2, 1, 3, 'ACCEPTED', DATE_SUB(NOW(), INTERVAL 8 DAY)),
-- Jane và Mike là bạn
(3, 2, 3, 'ACCEPTED', DATE_SUB(NOW(), INTERVAL 7 DAY)),
-- John và Sarah là bạn
(4, 1, 4, 'ACCEPTED', DATE_SUB(NOW(), INTERVAL 5 DAY)),
-- Mike và Sarah là bạn
(5, 3, 4, 'ACCEPTED', DATE_SUB(NOW(), INTERVAL 4 DAY)),
-- Jane và David là bạn
(6, 2, 5, 'ACCEPTED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- Pending request: David gửi cho John
(7, 5, 1, 'PENDING', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ================================================================
-- 4. INSERT POSTS
-- ================================================================
-- Privacy: PUBLIC, FRIENDS, PRIVATE

INSERT INTO `post` (id, user_id, image_url, caption, privacy, created_at, updated_at) VALUES
-- John's posts
(1, 1, 'https://picsum.photos/600/600?random=1', 'Beautiful sunset at the beach 🌅 #nature #sunset', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(2, 1, 'https://picsum.photos/600/600?random=2', 'Working on my new project! 💻 #coding #developer', 'FRIENDS', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 1, 'https://picsum.photos/600/600?random=3', 'Coffee time ☕️', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Jane's posts
(4, 2, 'https://picsum.photos/600/600?random=4', 'New design project completed! 🎨 #design #creative', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(5, 2, 'https://picsum.photos/600/600?random=5', 'Photography session today 📸', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(6, 2, 'https://picsum.photos/600/600?random=6', 'My favorite place in the city', 'FRIENDS', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- Mike's posts
(7, 3, 'https://picsum.photos/600/600?random=7', 'Exploring the mountains 🏔️ #travel #adventure', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(8, 3, 'https://picsum.photos/600/600?random=8', 'Best trip ever! 🌍✈️', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 7 HOUR), DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(9, 3, 'https://picsum.photos/600/600?random=9', 'Hidden gems of the city', 'PRIVATE', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- Sarah's posts
(10, 4, 'https://picsum.photos/600/600?random=10', 'Cooking pasta tonight 🍝 #foodie #cooking', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(11, 4, 'https://picsum.photos/600/600?random=11', 'New recipe turned out amazing! 😋', 'FRIENDS', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(12, 4, 'https://picsum.photos/600/600?random=12', 'Dessert time 🍰', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- David's posts
(13, 5, 'https://picsum.photos/600/600?random=13', 'Gym session completed 💪 #fitness #workout', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 9 HOUR), DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(14, 5, 'https://picsum.photos/600/600?random=14', 'Morning run 🏃‍♂️', 'PUBLIC', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(15, 5, 'https://picsum.photos/600/600?random=15', 'Healthy meal prep for the week', 'FRIENDS', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- ================================================================
-- 5. INSERT LIKES
-- ================================================================
-- Users liking different posts

INSERT INTO post_like (id, post_id, user_id, created_at) VALUES
-- Post 1 (John's sunset) - 4 likes
(1, 1, 2, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 1, 3, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 1, 4, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(4, 1, 5, DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Post 2 (John's project) - 2 likes from friends
(5, 2, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(6, 2, 3, DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- Post 3 (John's coffee) - 3 likes
(7, 3, 2, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(8, 3, 4, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(9, 3, 5, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),

-- Post 4 (Jane's design) - 5 likes
(10, 4, 1, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(11, 4, 3, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(12, 4, 4, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(13, 4, 5, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(14, 4, 2, DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Post 5 (Jane's photo) - 3 likes
(15, 5, 1, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(16, 5, 3, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(17, 5, 5, DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- Post 7 (Mike's mountain) - 4 likes
(18, 7, 1, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(19, 7, 2, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(20, 7, 4, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(21, 7, 5, DATE_SUB(NOW(), INTERVAL 6 HOUR)),

-- Post 10 (Sarah's pasta) - 3 likes
(22, 10, 1, DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(23, 10, 3, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(24, 10, 5, DATE_SUB(NOW(), INTERVAL 8 HOUR)),

-- Post 13 (David's gym) - 2 likes
(25, 13, 2, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(26, 13, 4, DATE_SUB(NOW(), INTERVAL 7 HOUR));

-- ================================================================
-- 6. INSERT COMMENTS
-- ================================================================

INSERT INTO `comment` (id, post_id, user_id, content, created_at) VALUES
-- Comments on Post 1 (John's sunset)
(1, 1, 2, 'Wow! Amazing view! 😍', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 1, 3, 'Where is this? I want to go there!', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 1, 1, 'Thanks! It''s at Santa Monica Beach', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(4, 1, 4, 'Beautiful colors! 🌅', DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- Comments on Post 2 (John's project)
(5, 2, 2, 'What are you building?', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(6, 2, 1, 'A social media app! 🚀', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(7, 2, 3, 'Can''t wait to see it!', DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Comments on Post 4 (Jane's design)
(8, 4, 1, 'Your designs are always amazing!', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(9, 4, 3, 'Love the color palette! 🎨', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(10, 4, 2, 'Thank you guys! ❤️', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(11, 4, 5, 'This is incredible!', DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Comments on Post 5 (Jane's photo)
(12, 5, 1, 'Great shot! 📸', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(13, 5, 3, 'What camera do you use?', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(14, 5, 2, 'Sony A7III 😊', DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- Comments on Post 7 (Mike's mountain)
(15, 7, 1, 'I need a vacation like this!', DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(16, 7, 2, 'Take me with you next time! 😄', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(17, 7, 3, 'Will do! Planning another trip soon', DATE_SUB(NOW(), INTERVAL 6 HOUR)),

-- Comments on Post 10 (Sarah's pasta)
(18, 10, 1, 'Looks delicious! 🍝', DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(19, 10, 3, 'Can you share the recipe?', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(20, 10, 4, 'Sure! I''ll post it tomorrow', DATE_SUB(NOW(), INTERVAL 8 HOUR)),

-- Comments on Post 12 (Sarah's dessert)
(21, 12, 1, 'My mouth is watering! 😋', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(22, 12, 3, 'I want this NOW!', DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Comments on Post 13 (David's gym)
(23, 13, 2, 'Keep it up! 💪', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(24, 13, 4, 'Inspiring!', DATE_SUB(NOW(), INTERVAL 7 HOUR)),

-- Comments on Post 14 (David's run)
(25, 14, 1, 'How many km today?', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(26, 14, 5, '10km! New personal record 🎉', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- ================================================================
-- 7. VERIFY DATA
-- ================================================================

SELECT 'USERS' as 'Table', COUNT(*) as 'Count' FROM `user`
UNION ALL
SELECT 'POSTS', COUNT(*) FROM `post`
UNION ALL
SELECT 'LIKES', COUNT(*) FROM `post_like`
UNION ALL
SELECT 'COMMENTS', COUNT(*) FROM `comment`
UNION ALL
SELECT 'FRIEND REQUESTS', COUNT(*) FROM friend_request;

-- ================================================================
-- DONE!
-- ================================================================
-- Total data inserted:
-- - 5 Users (all with password: password123)
-- - 15 Posts (mix of PUBLIC, FRIENDS, PRIVATE)
-- - 26 Likes
-- - 26 Comments
-- - 7 Friend Requests (6 ACCEPTED, 1 PENDING)
-- ================================================================

-- Test login with these credentials:
-- Email: john@example.com, Password: password123
-- Email: jane@example.com, Password: password123
-- Email: mike@example.com, Password: password123
-- Email: sarah@example.com, Password: password123
-- Email: david@example.com, Password: password123

