package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    // Get messages between two users
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
           "(m.sender.id = :userId2 AND m.receiver.id = :userId1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findMessagesBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    // Get unread messages for a user
    @Query("SELECT m FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    List<Message> findUnreadMessagesForUser(@Param("userId") Long userId);
    
    // Count unread messages for a user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadMessagesForUser(@Param("userId") Long userId);
    
    // Mark messages as read
    @Query("UPDATE Message m SET m.isRead = true WHERE m.receiver.id = :userId AND m.sender.id = :senderId AND m.isRead = false")
    void markMessagesAsRead(@Param("userId") Long userId, @Param("senderId") Long senderId);
}
