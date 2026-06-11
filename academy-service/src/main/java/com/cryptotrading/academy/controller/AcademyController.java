package com.cryptotrading.academy.controller;

import com.cryptotrading.academy.model.ApiResponse;
import com.cryptotrading.academy.model.CourseDto;
import com.cryptotrading.academy.model.CourseRequest;
import com.cryptotrading.academy.model.LearningPathDto;
import com.cryptotrading.academy.model.PageResponse;
import com.cryptotrading.academy.model.ProgressRequest;
import com.cryptotrading.academy.service.AcademyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/academy")
@RequiredArgsConstructor
@Slf4j
public class AcademyController {

    private final AcademyService academyService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "academy-service",
                "version", "1.1.0",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<PageResponse<CourseDto>>> getCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        int safeSize = Math.min(size, 50);
        log.info("[AcademyController] GET /courses category={}, difficulty={}, page={}, size={}",
                category, difficulty, page, safeSize);

        PageResponse<CourseDto> result = academyService.getCourses(
                category,
                difficulty,
                page,
                safeSize,
                userId
        );
        return ResponseEntity.ok(ApiResponse.success("Courses fetched successfully", result));
    }

    @GetMapping("/courses/{videoId}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourseByVideoId(
            @PathVariable String videoId,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        log.info("[AcademyController] GET /courses/{}", videoId);
        return ResponseEntity.ok(ApiResponse.success(academyService.getCourseByVideoId(videoId, userId)));
    }

    @GetMapping("/paths")
    public ResponseEntity<ApiResponse<List<LearningPathDto>>> getLearningPaths(
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Learning paths fetched successfully",
                academyService.getLearningPaths(userId)));
    }

    @PutMapping("/progress/{videoId}")
    public ResponseEntity<ApiResponse<CourseDto>> updateProgress(
            @PathVariable String videoId,
            @RequestBody ProgressRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        CourseDto course = academyService.updateProgress(userId, videoId, request.isCompleted());
        return ResponseEntity.ok(ApiResponse.success("Progress saved successfully", course));
    }

    @PostMapping("/admin/courses/preview")
    public ResponseEntity<ApiResponse<CourseDto>> previewCourse(@RequestBody CourseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Course preview fetched successfully",
                academyService.previewCourse(request)));
    }

    @PostMapping("/admin/courses")
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(@RequestBody CourseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Course created successfully",
                academyService.createCourse(request)));
    }

    @PutMapping("/admin/courses/{id}")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(
            @PathVariable Long id,
            @RequestBody CourseRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully",
                academyService.updateCourse(id, request)));
    }

    @DeleteMapping("/admin/courses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        academyService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Course deleted successfully", null));
    }
}
