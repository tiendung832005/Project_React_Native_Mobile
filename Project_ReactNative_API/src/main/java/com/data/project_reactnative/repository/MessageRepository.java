package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
