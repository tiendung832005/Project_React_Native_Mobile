package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
