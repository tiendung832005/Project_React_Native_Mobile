package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.MessageReaction;
import com.data.project_reactnative.model.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {
    Optional<MessageReaction> findByMessageIdAndUserIdAndReactionType(Long messageId, Long userId, ReactionType reactionType);
    List<MessageReaction> findByMessageId(Long messageId);
    void deleteByMessageIdAndUserIdAndReactionType(Long messageId, Long userId, ReactionType reactionType);
}

