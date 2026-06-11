package com.cryptotrading.academy.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseDto {

    private Long id;
    private String videoId;
    private String title;
    private String difficulty;
    private String category;
    private String learningPath;
    private String description;
    private Integer sortOrder;

    private String thumbnailUrl;
    private String duration;
    private String durationFormatted;
    private String viewCount;
    private String likeCount;
    private String publishedAt;
    private String channelTitle;

    private String embedUrl;
    private String watchUrl;
    private boolean completed;
    private String completedAt;
}
