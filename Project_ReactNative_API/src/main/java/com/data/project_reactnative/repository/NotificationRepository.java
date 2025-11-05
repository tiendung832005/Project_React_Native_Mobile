package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
