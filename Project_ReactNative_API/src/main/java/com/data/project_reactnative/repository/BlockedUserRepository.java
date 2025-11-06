package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.BlockedUser;
import com.data.project_reactnative.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockedUserRepository extends JpaRepository<BlockedUser, Long> {

    @Query("SELECT b FROM BlockedUser b WHERE b.blocker.id = :blockerId AND b.blocked.id = :blockedId")
    Optional<BlockedUser> findByBlockerIdAndBlockedId(@Param("blockerId") Long blockerId, @Param("blockedId") Long blockedId);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM BlockedUser b WHERE b.blocker.id = :blockerId AND b.blocked.id = :blockedId")
    boolean existsByBlockerIdAndBlockedId(@Param("blockerId") Long blockerId, @Param("blockedId") Long blockedId);

    @Query("SELECT b FROM BlockedUser b WHERE b.blocker.id = :blockerId")
    List<BlockedUser> findAllByBlockerId(@Param("blockerId") Long blockerId);

    void deleteByBlockerAndBlocked(User blocker, User blocked);
}

