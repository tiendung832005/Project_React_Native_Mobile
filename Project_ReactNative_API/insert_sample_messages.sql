-- ================================================================
-- SQL SCRIPT - INSERT SAMPLE MESSAGES CHO TESTING
-- ================================================================
-- Run this script in MySQL Workbench or phpMyAdmin
-- Database: social_app
-- ================================================================

USE social_app;

-- ================================================================
-- INSERT SAMPLE MESSAGES
-- ================================================================
-- Tạo cuộc trò chuyện giữa các users để test messaging feature

-- Cuộc trò chuyện giữa User 1 (john_doe) và User 2 (jane_smith)
-- Note: chat_id is nullable, so we don't need to include it
INSERT INTO message (id, sender_id, receiver_id, content, type, is_read, created_at) VALUES
-- User 1 gửi cho User 2
(1, 1, 2, 'Hey Jane! How are you?', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 1, 2, 'I saw your new design project, it looks amazing!', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
-- User 2 trả lời
(3, 2, 1, 'Thanks John! I''m doing great, thanks for asking 😊', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 1 HOUR 50 MINUTE)),
(4, 2, 1, 'How about you? How''s your project going?', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 1 HOUR 50 MINUTE)),
-- User 1 trả lời
(5, 1, 2, 'It''s going well! Almost finished with the backend', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 1 HOUR 40 MINUTE)),
(6, 1, 2, 'Want to grab coffee this weekend?', 'TEXT', false, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- Cuộc trò chuyện giữa User 1 (john_doe) và User 3 (mike_wilson)
(7, 1, 3, 'Hey Mike! When are you going on your next trip?', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 3, 1, 'Hey John! Planning to go to Japan next month 🌸', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(9, 1, 3, 'That sounds amazing! I''ve always wanted to visit Japan', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(10, 3, 1, 'You should come with me! It''ll be fun', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(11, 1, 3, 'I''ll think about it! Let me check my schedule', 'TEXT', false, DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Cuộc trò chuyện giữa User 2 (jane_smith) và User 3 (mike_wilson)
(12, 2, 3, 'Hi Mike! Love your travel photos 📸', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(13, 3, 2, 'Thanks Jane! Your photography is inspiring too!', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 2 HOUR 50 MINUTE)),
(14, 2, 3, 'Maybe we can do a photo shoot together sometime?', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 2 HOUR 40 MINUTE)),
(15, 3, 2, 'That would be awesome! Let''s plan something', 'TEXT', false, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),

-- Cuộc trò chuyện giữa User 1 (john_doe) và User 4 (sarah_johnson)
(16, 1, 4, 'Hi Sarah! That pasta you posted looks delicious!', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(17, 4, 1, 'Thank you! It''s my grandmother''s recipe', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 3 HOUR 50 MINUTE)),
(18, 1, 4, 'Can you share the recipe? I''d love to try it', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 3 HOUR 40 MINUTE)),
(19, 4, 1, 'Of course! I''ll send it to you later', 'TEXT', false, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),

-- Cuộc trò chuyện giữa User 2 (jane_smith) và User 5 (david_lee)
(20, 2, 5, 'Hey David! Great workout today! 💪', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(21, 5, 2, 'Thanks Jane! How was your day?', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 4 HOUR 50 MINUTE)),
(22, 2, 5, 'It was good! Working on some new designs', 'TEXT', true, DATE_SUB(NOW(), INTERVAL 4 HOUR 40 MINUTE)),
(23, 5, 2, 'That''s awesome! Can''t wait to see them', 'TEXT', false, DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- ================================================================
-- VERIFY MESSAGES
-- ================================================================

SELECT 'MESSAGES' as 'Table', COUNT(*) as 'Count' FROM message;

-- Xem cuộc trò chuyện giữa User 1 và User 2
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
WHERE (m.sender_id = 1 AND m.receiver_id = 2) OR (m.sender_id = 2 AND m.receiver_id = 1)
ORDER BY m.created_at ASC;

-- ================================================================
-- DONE!
-- ================================================================
-- Total messages inserted: 23 messages
-- Conversations created:
-- - User 1 <-> User 2: 6 messages
-- - User 1 <-> User 3: 5 messages
-- - User 2 <-> User 3: 4 messages
-- - User 1 <-> User 4: 4 messages
-- - User 2 <-> User 5: 4 messages
-- ================================================================

