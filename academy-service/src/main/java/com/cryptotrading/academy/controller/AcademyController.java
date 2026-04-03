package com.cryptotrading.academy.controller;

import com.cryptotrading.academy.model.ApiResponse;
import com.cryptotrading.academy.model.CourseDto;
import com.cryptotrading.academy.model.PageResponse;
import com.cryptotrading.academy.provider.YouTubeProvider;
import com.cryptotrading.academy.service.AcademyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/academy")
@RequiredArgsConstructor
@Slf4j
public class AcademyController {

    private final AcademyService academyService;
    private final YouTubeProvider youTubeProvider;

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
    // GET /academy/debug/youtube  — temporary debug endpoint
    // ─────────────────────────────────────────────────────────────────────────

    @Value("${youtube.api-key:NOT_LOADED}")
    private String debugApiKey;

    @Value("${youtube.playlist-id:NOT_LOADED}")
    private String debugPlaylistId;

    @GetMapping("/debug/youtube")
    public ResponseEntity<Map<String, Object>> debugYoutube() {
        Map<String, Object> result = new HashMap<>();

        // Show what config Spring sees
        result.put("apiKeyLoaded", !debugApiKey.isBlank() && !debugApiKey.equals("NOT_LOADED"));
        result.put("apiKeyPrefix", debugApiKey.length() > 6 ? debugApiKey.substring(0, 6) + "***" : debugApiKey);
        result.put("playlistId", debugPlaylistId);

        // Try YouTube API directly
        try {
            var httpClient = java.net.http.HttpClient.newHttpClient();
            String testUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId="
                    + debugPlaylistId + "&maxResults=5&key=" + debugApiKey;
            var request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(testUrl))
                    .GET()
                    .timeout(java.time.Duration.ofSeconds(15))
                    .build();
            var response = httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            result.put("httpStatus", response.statusCode());
            if (response.statusCode() == 200) {
                String body = response.body();
                result.put("responseLength", body.length());
                // Show first 500 chars
                result.put("responsePreview", body.substring(0, Math.min(500, body.length())));
            } else {
                result.put("errorBody", response.body().substring(0, Math.min(300, response.body().length())));
            }
        } catch (Exception e) {
            result.put("httpError", e.getMessage());
            result.put("httpErrorClass", e.getClass().getName());
        }
        return ResponseEntity.ok(result);
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
