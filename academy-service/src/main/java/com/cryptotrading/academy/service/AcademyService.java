package com.cryptotrading.academy.service;

import com.cryptotrading.academy.exception.ResourceNotFoundException;
import com.cryptotrading.academy.model.Course;
import com.cryptotrading.academy.model.Course.Difficulty;
import com.cryptotrading.academy.model.CourseDto;
import com.cryptotrading.academy.model.PageResponse;
import com.cryptotrading.academy.provider.YouTubeProvider;
import com.cryptotrading.academy.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademyService {

    private final CourseRepository courseRepository;
    private final YouTubeProvider youTubeProvider;

    // ─────────────────────────────────────────────────────────────────────────
    // List courses (with optional filters)
    // ─────────────────────────────────────────────────────────────────────────

    public PageResponse<CourseDto> getCourses(
            String category,
            String difficultyStr,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sortOrder", "id").ascending());
        Difficulty difficulty = parseDifficulty(difficultyStr);

        Page<Course> coursePage;
        if (category != null && difficulty != null) {
            coursePage = courseRepository.findByCategoryAndDifficulty(category, difficulty, pageable);
        } else if (category != null) {
            coursePage = courseRepository.findByCategory(category, pageable);
        } else if (difficulty != null) {
            coursePage = courseRepository.findByDifficulty(difficulty, pageable);
        } else {
            coursePage = courseRepository.findAll(pageable);
        }

        // Fetch YouTube metadata (cached)
        Map<String, CourseDto> ytData = youTubeProvider.fetchPlaylistVideos();

        Page<CourseDto> dtoPage = coursePage.map(course -> merge(course, ytData.get(course.getVideoId())));
        return PageResponse.from(dtoPage);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Single course by videoId
    // ─────────────────────────────────────────────────────────────────────────

    public CourseDto getCourseByVideoId(String videoId) {
        Course course = courseRepository.findByVideoId(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + videoId));

        CourseDto ytDto = youTubeProvider.fetchSingleVideo(videoId);
        return merge(course, ytDto);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Merges DB entity with YouTube live data.
     * DB fields (title, description) take priority; YouTube fills in media metadata.
     */
    private CourseDto merge(Course course, CourseDto yt) {
        CourseDto.CourseDtoBuilder builder = CourseDto.builder()
                .id(course.getId())
                .videoId(course.getVideoId())
                .title(course.getTitle())            // DB title wins
                .difficulty(course.getDifficulty() != null ? course.getDifficulty().name() : null)
                .category(course.getCategory())
                .description(course.getDescription())
                .sortOrder(course.getSortOrder())
                .embedUrl("https://www.youtube.com/embed/" + course.getVideoId())
                .watchUrl("https://www.youtube.com/watch?v=" + course.getVideoId());

        if (yt != null) {
            // Prefer DB title, fall back to YouTube title
            if (course.getTitle() == null || course.getTitle().isBlank()) {
                builder.title(yt.getTitle());
            }
            // Prefer DB description, fall back to YouTube description
            if (course.getDescription() == null || course.getDescription().isBlank()) {
                builder.description(yt.getDescription());
            }
            builder.thumbnailUrl(yt.getThumbnailUrl())
                   .duration(yt.getDuration())
                   .durationFormatted(yt.getDurationFormatted())
                   .viewCount(yt.getViewCount())
                   .likeCount(yt.getLikeCount())
                   .publishedAt(yt.getPublishedAt())
                   .channelTitle(yt.getChannelTitle());
        }

        return builder.build();
    }

    private Difficulty parseDifficulty(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Difficulty.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("[AcademyService] Unknown difficulty value '{}' — ignoring filter.", value);
            return null;
        }
    }
}
