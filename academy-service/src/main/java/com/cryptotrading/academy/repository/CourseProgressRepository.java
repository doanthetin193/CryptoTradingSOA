package com.cryptotrading.academy.repository;

import com.cryptotrading.academy.model.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {
    Optional<CourseProgress> findByUserIdAndVideoId(String userId, String videoId);

    List<CourseProgress> findByUserIdAndCompletedTrue(String userId);

    void deleteByVideoId(String videoId);
}
