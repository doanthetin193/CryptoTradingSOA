package com.cryptotrading.academy.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPathDto {
    private String id;
    private String title;
    private String description;
    private int totalCourses;
    private int completedCourses;
    private int progressPercent;
    private List<CourseDto> courses;
}
