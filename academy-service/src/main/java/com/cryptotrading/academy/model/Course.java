package com.cryptotrading.academy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** YouTube video ID (e.g. "dQw4w9WgXcQ") */
    @Column(name = "video_id", nullable = false, unique = true, length = 50)
    private String videoId;

    /** Display title — can be overridden from seed, otherwise fetched from YouTube */
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    /**
     * Difficulty level: BEGINNER | INTERMEDIATE | ADVANCED
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false, length = 20)
    private Difficulty difficulty;

    /**
     * Topic category: BLOCKCHAIN | DEFI | TRADING | SECURITY | ALTCOINS | ...
     */
    @Column(name = "category", nullable = false, length = 100)
    private String category;

    /** Short description (seeded manually or pulled from YouTube description) */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** Sort order within a playlist/category */
    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Difficulty {
        BEGINNER, INTERMEDIATE, ADVANCED
    }
}
