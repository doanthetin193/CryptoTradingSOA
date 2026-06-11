package com.cryptotrading.academy.model;

import lombok.Data;

@Data
public class CourseRequest {

    private String youtubeUrl;
    private String videoId;
    private String title;
    private String difficulty;
    private String category;
    private String learningPath;
    private String description;
    private Integer sortOrder;
}
