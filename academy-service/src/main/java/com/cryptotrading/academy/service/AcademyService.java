package com.cryptotrading.academy.service;

import com.cryptotrading.academy.exception.ResourceNotFoundException;
import com.cryptotrading.academy.model.Course;
import com.cryptotrading.academy.model.Course.Difficulty;
import com.cryptotrading.academy.model.CourseDto;
import com.cryptotrading.academy.model.CourseProgress;
import com.cryptotrading.academy.model.CourseRequest;
import com.cryptotrading.academy.model.LearningPathDto;
import com.cryptotrading.academy.model.PageResponse;
import com.cryptotrading.academy.provider.YouTubeProvider;
import com.cryptotrading.academy.repository.CourseProgressRepository;
import com.cryptotrading.academy.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademyService {

    private static final String DEFAULT_PATH = "FOUNDATIONS";
    private static final Pattern VIDEO_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{11}$");
    private static final Pattern YOUTUBE_PATH_PATTERN =
            Pattern.compile("/(?:embed|shorts|live)/([a-zA-Z0-9_-]{11})");

    private final CourseRepository courseRepository;
    private final CourseProgressRepository progressRepository;
    private final YouTubeProvider youTubeProvider;

    public PageResponse<CourseDto> getCourses(
            String category,
            String difficultyStr,
            int page,
            int size,
            String userId
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

        Map<String, CourseProgress> progress = completedProgress(userId);

        return PageResponse.from(coursePage.map(course ->
                merge(course, null, progress)
        ));
    }

    public CourseDto getCourseByVideoId(String videoId, String userId) {
        Course course = findCourse(videoId);
        return merge(course, youTubeProvider.fetchSingleVideo(videoId), completedProgress(userId));
    }

    public List<LearningPathDto> getLearningPaths(String userId) {
        Map<String, CourseProgress> progress = completedProgress(userId);

        Map<String, List<CourseDto>> coursesByPath = courseRepository.findAll().stream()
                .sorted(Comparator
                        .comparingInt((Course course) -> pathOrder(pathId(course)))
                        .thenComparing(course -> course.getSortOrder() == null ? 0 : course.getSortOrder())
                        .thenComparing(Course::getId))
                .map(course -> merge(course, null, progress))
                .collect(Collectors.groupingBy(
                        CourseDto::getLearningPath,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        return coursesByPath.entrySet().stream()
                .map(entry -> toLearningPath(entry.getKey(), entry.getValue()))
                .toList();
    }

    public CourseDto updateProgress(String userId, String videoId, boolean completed) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Authentication is required to save course progress");
        }

        Course course = findCourse(videoId);
        CourseProgress progress = progressRepository.findByUserIdAndVideoId(userId, videoId)
                .orElseGet(() -> CourseProgress.builder()
                        .userId(userId)
                        .videoId(videoId)
                        .build());

        progress.setCompleted(completed);
        progress.setCompletedAt(completed ? completedAt(progress) : null);
        progressRepository.save(progress);

        Map<String, CourseProgress> progressMap = completed ? Map.of(videoId, progress) : Map.of();
        return merge(course, null, progressMap);
    }

    public CourseDto previewCourse(CourseRequest request) {
        String videoId = resolveVideoId(request);
        CourseDto youtube = youTubeProvider.fetchSingleVideo(videoId);

        return CourseDto.builder()
                .videoId(videoId)
                .title(firstNonBlank(request.getTitle(), youtube.getTitle()))
                .description(firstNonBlank(request.getDescription(), youtube.getDescription()))
                .difficulty(parseDifficultyOrDefault(request.getDifficulty()).name())
                .category(normalizeCategory(request.getCategory()))
                .learningPath(normalizeLearningPath(request.getLearningPath()))
                .sortOrder(request.getSortOrder())
                .thumbnailUrl(youtube.getThumbnailUrl())
                .duration(youtube.getDuration())
                .durationFormatted(youtube.getDurationFormatted())
                .viewCount(youtube.getViewCount())
                .likeCount(youtube.getLikeCount())
                .publishedAt(youtube.getPublishedAt())
                .channelTitle(youtube.getChannelTitle())
                .embedUrl("https://www.youtube.com/embed/" + videoId)
                .watchUrl("https://www.youtube.com/watch?v=" + videoId)
                .build();
    }

    @Transactional
    public CourseDto createCourse(CourseRequest request) {
        String videoId = resolveVideoId(request);
        courseRepository.findByVideoId(videoId).ifPresent(course -> {
            throw new IllegalArgumentException("Course already exists for videoId: " + videoId);
        });

        Course course = Course.builder()
                .videoId(videoId)
                .title(required(request.getTitle(), "title"))
                .difficulty(parseDifficultyOrDefault(request.getDifficulty()))
                .category(normalizeCategory(request.getCategory()))
                .learningPath(normalizeLearningPath(request.getLearningPath()))
                .description(normalize(request.getDescription()))
                .sortOrder(request.getSortOrder())
                .build();

        Course saved = courseRepository.save(course);
        return merge(saved, youTubeProvider.fetchSingleVideo(videoId), Map.of());
    }

    @Transactional
    public CourseDto updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));

        String nextVideoId = resolveVideoId(request, course.getVideoId());
        if (!nextVideoId.equals(course.getVideoId())) {
            courseRepository.findByVideoId(nextVideoId).ifPresent(existing -> {
                if (!existing.getId().equals(course.getId())) {
                    throw new IllegalArgumentException("Course already exists for videoId: " + nextVideoId);
                }
            });
            progressRepository.deleteByVideoId(course.getVideoId());
            course.setVideoId(nextVideoId);
        }

        course.setTitle(required(request.getTitle(), "title"));
        course.setDifficulty(parseDifficultyOrDefault(request.getDifficulty()));
        course.setCategory(normalizeCategory(request.getCategory()));
        course.setLearningPath(normalizeLearningPath(request.getLearningPath()));
        course.setDescription(normalize(request.getDescription()));
        course.setSortOrder(request.getSortOrder());

        Course saved = courseRepository.save(course);
        return merge(saved, youTubeProvider.fetchSingleVideo(saved.getVideoId()), Map.of());
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
        progressRepository.deleteByVideoId(course.getVideoId());
        courseRepository.delete(course);
    }

    private Course findCourse(String videoId) {
        return courseRepository.findByVideoId(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + videoId));
    }

    private CourseDto merge(Course course, CourseDto youtube, Map<String, CourseProgress> progress) {
        CourseProgress courseProgress = progress.get(course.getVideoId());

        CourseDto.CourseDtoBuilder builder = CourseDto.builder()
                .id(course.getId())
                .videoId(course.getVideoId())
                .title(course.getTitle())
                .difficulty(course.getDifficulty() == null ? null : course.getDifficulty().name())
                .category(course.getCategory())
                .learningPath(pathId(course))
                .description(course.getDescription())
                .sortOrder(course.getSortOrder())
                .embedUrl("https://www.youtube.com/embed/" + course.getVideoId())
                .watchUrl("https://www.youtube.com/watch?v=" + course.getVideoId())
                .completed(courseProgress != null)
                .completedAt(courseProgress == null ? null : courseProgress.getCompletedAt().toString());

        if (youtube != null) {
            if (course.getTitle() == null || course.getTitle().isBlank()) {
                builder.title(youtube.getTitle());
            }
            if (course.getDescription() == null || course.getDescription().isBlank()) {
                builder.description(youtube.getDescription());
            }
            builder.thumbnailUrl(youtube.getThumbnailUrl())
                    .duration(youtube.getDuration())
                    .durationFormatted(youtube.getDurationFormatted())
                    .viewCount(youtube.getViewCount())
                    .likeCount(youtube.getLikeCount())
                    .publishedAt(youtube.getPublishedAt())
                    .channelTitle(youtube.getChannelTitle());
        }

        return builder.build();
    }

    private Map<String, CourseProgress> completedProgress(String userId) {
        if (userId == null || userId.isBlank()) {
            return Map.of();
        }
        return progressRepository.findByUserIdAndCompletedTrue(userId).stream()
                .collect(Collectors.toMap(CourseProgress::getVideoId, progress -> progress));
    }

    private LearningPathDto toLearningPath(String pathId, List<CourseDto> courses) {
        int completed = (int) courses.stream().filter(CourseDto::isCompleted).count();
        int total = courses.size();

        return LearningPathDto.builder()
                .id(pathId)
                .title(pathTitle(pathId))
                .description(pathDescription(pathId))
                .totalCourses(total)
                .completedCourses(completed)
                .progressPercent(total == 0 ? 0 : Math.round(completed * 100f / total))
                .courses(courses)
                .build();
    }

    private String pathId(Course course) {
        if (course.getLearningPath() == null || course.getLearningPath().isBlank()) {
            return DEFAULT_PATH;
        }
        return course.getLearningPath();
    }

    private String pathTitle(String pathId) {
        return switch (pathId) {
            case "SECURITY_BASICS" -> "Wallet & Security";
            case "DEFI_ALTCOINS" -> "DeFi & Altcoins";
            case "TRADING_BASICS" -> "Trading Basics";
            case "RISK_CONTROL" -> "Risk Control";
            default -> "Crypto Foundations";
        };
    }

    private String pathDescription(String pathId) {
        return switch (pathId) {
            case "SECURITY_BASICS" -> "Protect wallets, seed phrases, and accounts before putting money at risk.";
            case "DEFI_ALTCOINS" -> "Understand smart contracts, stablecoins, DeFi, altcoins, and NFTs.";
            case "TRADING_BASICS" -> "Read market context, plan trades, and research coins with discipline.";
            case "RISK_CONTROL" -> "Protect capital, accounts, and mindset before scaling up.";
            default -> "Build the minimum crypto knowledge needed before using trading features.";
        };
    }

    private int pathOrder(String pathId) {
        return switch (pathId) {
            case "SECURITY_BASICS" -> 2;
            case "DEFI_ALTCOINS" -> 3;
            case "TRADING_BASICS" -> 4;
            case "RISK_CONTROL" -> 5;
            default -> 1;
        };
    }

    private LocalDateTime completedAt(CourseProgress progress) {
        if (progress.isCompleted() && progress.getCompletedAt() != null) {
            return progress.getCompletedAt();
        }
        return LocalDateTime.now();
    }

    private Difficulty parseDifficulty(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Difficulty.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("[AcademyService] Ignoring unknown difficulty: {}", value);
            return null;
        }
    }

    private String resolveVideoId(CourseRequest request) {
        return resolveVideoId(request, null);
    }

    private String resolveVideoId(CourseRequest request, String fallback) {
        if (request == null) {
            throw new IllegalArgumentException("Course request is required");
        }

        String raw = firstNonBlank(request.getVideoId(), request.getYoutubeUrl(), fallback);
        if (raw == null) {
            throw new IllegalArgumentException("YouTube URL or videoId is required");
        }

        String candidate = extractVideoId(raw.trim());
        if (!VIDEO_ID_PATTERN.matcher(candidate).matches()) {
            throw new IllegalArgumentException("Invalid YouTube videoId or URL");
        }
        return candidate;
    }

    private String extractVideoId(String value) {
        if (VIDEO_ID_PATTERN.matcher(value).matches()) {
            return value;
        }

        try {
            URI uri = URI.create(value);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
            String path = uri.getPath() == null ? "" : uri.getPath();

            if (host.contains("youtu.be")) {
                String[] parts = path.split("/");
                if (parts.length > 1) return parts[1];
            }

            if (host.contains("youtube.com")) {
                String fromQuery = queryParam(uri.getRawQuery(), "v");
                if (fromQuery != null) return fromQuery;

                Matcher matcher = YOUTUBE_PATH_PATTERN.matcher(path);
                if (matcher.find()) return matcher.group(1);
            }
        } catch (IllegalArgumentException ignored) {
            // Fall through to final validation.
        }

        return value;
    }

    private String queryParam(String query, String name) {
        if (query == null || query.isBlank()) {
            return null;
        }
        for (String part : query.split("&")) {
            String[] pair = part.split("=", 2);
            if (pair.length == 2 && name.equals(pair[0])) {
                return URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    private Difficulty parseDifficultyOrDefault(String value) {
        Difficulty difficulty = parseDifficulty(value);
        return difficulty == null ? Difficulty.BEGINNER : difficulty;
    }

    private String normalizeCategory(String value) {
        String category = normalize(value);
        return category.isBlank() ? "BLOCKCHAIN" : category.toUpperCase();
    }

    private String normalizeLearningPath(String value) {
        String learningPath = normalize(value);
        return learningPath.isBlank() ? DEFAULT_PATH : learningPath.toUpperCase();
    }

    private String required(String value, String field) {
        String normalized = normalize(value);
        if (normalized.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return normalized;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }
}
