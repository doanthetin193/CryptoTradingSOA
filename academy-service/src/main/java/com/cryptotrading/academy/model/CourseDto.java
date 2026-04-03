package com.cryptotrading.academy.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Enriched DTO returned to the frontend — combines DB metadata + YouTube live data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseDto {

    // ── From DB (Course entity) ──────────────────────────────────────────────
    private Long id;
    private String videoId;
    private String title;
    private String difficulty;
    private String category;
    private String description;
    private Integer sortOrder;

    // ── From YouTube API ─────────────────────────────────────────────────────
    private String thumbnailUrl;
    private String duration;        // ISO 8601 e.g. "PT12M34S"
    private String durationFormatted; // human-readable e.g. "12:34"
    private String viewCount;
    private String likeCount;
    private String publishedAt;
    private String channelTitle;

    // ── Computed ─────────────────────────────────────────────────────────────
    private String embedUrl;        // https://www.youtube.com/embed/{videoId}
    private String watchUrl;        // https://www.youtube.com/watch?v={videoId}
}
