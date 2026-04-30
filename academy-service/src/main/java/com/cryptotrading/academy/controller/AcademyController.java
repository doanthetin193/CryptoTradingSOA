package com.cryptotrading.academy.controller;

import com.cryptotrading.academy.model.ApiResponse;
import com.cryptotrading.academy.model.CourseDto;
import com.cryptotrading.academy.model.PageResponse;
import com.cryptotrading.academy.service.AcademyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/academy")
@RequiredArgsConstructor
@Slf4j
public class AcademyController {

    private final AcademyService academyService;

    // ─────────────────────────────────────────────────────────────────────────
    // GET /academy/health
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "academy-service",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /academy/courses
    //   ?category=BLOCKCHAIN&difficulty=BEGINNER&page=0&size=10
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<PageResponse<CourseDto>>> getCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        // Cap page size to avoid accidental large fetches
        size = Math.min(size, 50);

        log.info("[AcademyController] GET /courses — category={}, difficulty={}, page={}, size={}",
                category, difficulty, page, size);

        PageResponse<CourseDto> result = academyService.getCourses(category, difficulty, page, size);
        return ResponseEntity.ok(ApiResponse.success("Courses fetched successfully", result));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /academy/courses/{videoId}
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/courses/{videoId}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourseByVideoId(
            @PathVariable String videoId
    ) {
        log.info("[AcademyController] GET /courses/{}", videoId);
        CourseDto course = academyService.getCourseByVideoId(videoId);
        return ResponseEntity.ok(ApiResponse.success(course));
    }
}
