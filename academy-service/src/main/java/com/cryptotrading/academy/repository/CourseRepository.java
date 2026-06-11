package com.cryptotrading.academy.repository;

import com.cryptotrading.academy.model.Course;
import com.cryptotrading.academy.model.Course.Difficulty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByVideoId(String videoId);

    Page<Course> findByCategory(String category, Pageable pageable);

    Page<Course> findByDifficulty(Difficulty difficulty, Pageable pageable);

    Page<Course> findByCategoryAndDifficulty(String category, Difficulty difficulty, Pageable pageable);
}
