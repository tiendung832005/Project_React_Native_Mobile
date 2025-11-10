package com.data.project_reactnative.service;

import com.data.project_reactnative.dto.*;
import com.data.project_reactnative.exception.UserNotFoundException;
import com.data.project_reactnative.model.*;
import com.data.project_reactnative.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageReactionRepository messageReactionRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Send a text message
     */
    @Transactional
    public MessageDTO sendMessage(Long senderId, SendMessageRequest request) {
        logger.info("Sending message from user {} to user {}", senderId, request.getReceiverId());

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Sender not found"));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new UserNotFoundException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setImageUrl(request.getImageUrl());
        message.setVideoUrl(request.getVideoUrl());

        // Set message type
        if (request.getType() != null) {
            try {
                message.setType(MessageType.valueOf(request.getType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                message.setType(MessageType.TEXT);
            }
        } else {
            // Auto-detect type based on content
            if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
                message.setType(MessageType.IMAGE);
            } else if (request.getVideoUrl() != null && !request.getVideoUrl().isEmpty()) {
                message.setType(MessageType.VIDEO);
            } else {
                message.setType(MessageType.TEXT);
            }
        }

        message.setRead(false);
        Message savedMessage = messageRepository.save(message);
        logger.info("Message sent with ID: {}", savedMessage.getId());

        return mapToMessageDTO(savedMessage);
    }

    /**
     * Upload image/video for message
     */
    @Transactional
    public String uploadMessageMedia(MultipartFile file) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path targetLocation = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return URL
            String fileUrl = "/uploads/" + filename;
            logger.info("File uploaded: {}", fileUrl);
            return fileUrl;
        } catch (IOException e) {
            logger.error("Error uploading file: ", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Get messages between two users
     */
    public List<MessageDTO> getMessagesBetweenUsers(Long currentUserId, Long otherUserId) {
        logger.info("Getting messages between user {} and user {}", currentUserId, otherUserId);

        List<Message> messages = messageRepository.findMessagesBetweenUsers(currentUserId, otherUserId);
        
        // Mark messages as read
        markMessagesAsRead(currentUserId, otherUserId);

        return messages.stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all conversations for a user (list of users they've messaged with)
     */
    public List<ConversationDTO> getConversations(Long userId) {
        logger.info("Getting conversations for user {}", userId);

        // Get all messages where user is sender or receiver, ordered by most recent
        List<Message> allMessages = messageRepository.findAll()
                .stream()
                .filter(m -> m.getSender().getId().equals(userId) || m.getReceiver().getId().equals(userId))
                .sorted((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()))
                .collect(Collectors.toList());

        // Group by other user and get the most recent message
        return allMessages.stream()
                .collect(Collectors.toMap(
                        m -> m.getSender().getId().equals(userId) ? m.getReceiver().getId() : m.getSender().getId(),
                        m -> m,
                        (m1, m2) -> m1.getCreatedAt().isAfter(m2.getCreatedAt()) ? m1 : m2
                ))
                .values()
                .stream()
                .map(m -> {
                    User otherUser = m.getSender().getId().equals(userId) ? m.getReceiver() : m.getSender();
                    // Count unread messages from this user
                    long unreadCount = messageRepository.findMessagesBetweenUsers(userId, otherUser.getId())
                            .stream()
                            .filter(msg -> msg.getReceiver().getId().equals(userId) && !msg.isRead())
                            .count();
                    return new ConversationDTO(
                            otherUser.getId(),
                            otherUser.getUsername(),
                            otherUser.getAvatarUrl(),
                            m.getContent() != null ? m.getContent() : (m.getImageUrl() != null ? "📷 Image" : "🎥 Video"),
                            m.getCreatedAt(),
                            unreadCount > 0
                    );
                })
                .sorted((c1, c2) -> c2.getLastMessageTime().compareTo(c1.getLastMessageTime()))
                .collect(Collectors.toList());
    }

    /**
     * React to a message
     */
    @Transactional
    public MessageReactionDTO reactToMessage(Long userId, Long messageId, ReactToMessageRequest request) {
        logger.info("User {} reacting to message {} with {}", userId, messageId, request.getReactionType());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        ReactionType reactionType;
        try {
            reactionType = ReactionType.valueOf(request.getReactionType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid reaction type: " + request.getReactionType());
        }

        // Check if user already reacted with this type
        MessageReaction existingReaction = messageReactionRepository
                .findByMessageIdAndUserIdAndReactionType(messageId, userId, reactionType)
                .orElse(null);

        if (existingReaction != null) {
            // Remove reaction (toggle off)
            messageReactionRepository.delete(existingReaction);
            logger.info("Reaction removed");
            return null; // Return null to indicate reaction was removed
        } else {
            // Remove any existing reaction of different type from this user
            List<MessageReaction> existingReactions = messageReactionRepository.findByMessageId(messageId);
            existingReactions.stream()
                    .filter(r -> r.getUser().getId().equals(userId))
                    .forEach(messageReactionRepository::delete);

            // Add new reaction
            MessageReaction reaction = new MessageReaction();
            reaction.setMessage(message);
            reaction.setUser(user);
            reaction.setReactionType(reactionType);
            MessageReaction savedReaction = messageReactionRepository.save(reaction);
            logger.info("Reaction added with ID: {}", savedReaction.getId());

            return mapToMessageReactionDTO(savedReaction);
        }
    }

    /**
     * Mark messages as read
     */
    @Transactional
    public void markMessagesAsRead(Long userId, Long senderId) {
        logger.info("Marking messages as read for user {} from sender {}", userId, senderId);
        
        List<Message> unreadMessages = messageRepository.findMessagesBetweenUsers(userId, senderId)
                .stream()
                .filter(m -> m.getReceiver().getId().equals(userId) && 
                            m.getSender().getId().equals(senderId) && 
                            !m.isRead())
                .collect(Collectors.toList());

        for (Message message : unreadMessages) {
            message.setRead(true);
            messageRepository.save(message);
        }
    }

    /**
     * Count unread messages for a user
     */
    public long countUnreadMessages(Long userId) {
        logger.info("Counting unread messages for user {}", userId);
        return messageRepository.countUnreadMessagesForUser(userId);
    }

    /**
     * Map Message entity to MessageDTO
     */
    private MessageDTO mapToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSender(mapToUserBasicDTO(message.getSender()));
        dto.setReceiver(mapToUserBasicDTO(message.getReceiver()));
        dto.setContent(message.getContent());
        dto.setImageUrl(message.getImageUrl());
        dto.setVideoUrl(message.getVideoUrl());
        dto.setType(message.getType().name());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());

        // Get reactions
        List<MessageReaction> reactions = messageReactionRepository.findByMessageId(message.getId());
        dto.setReactions(reactions.stream()
                .map(this::mapToMessageReactionDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    /**
     * Map User entity to UserBasicDTO
     */
    private UserBasicDTO mapToUserBasicDTO(User user) {
        UserBasicDTO dto = new UserBasicDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }

    /**
     * Map MessageReaction entity to MessageReactionDTO
     */
    private MessageReactionDTO mapToMessageReactionDTO(MessageReaction reaction) {
        MessageReactionDTO dto = new MessageReactionDTO();
        dto.setId(reaction.getId());
        dto.setUser(mapToUserBasicDTO(reaction.getUser()));
        dto.setReactionType(reaction.getReactionType().name());
        dto.setCreatedAt(reaction.getCreatedAt());
        return dto;
    }
}

