package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}
