package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<Chat, Long> {
}
