package com.cryptotrading.academy.provider;

import com.cryptotrading.academy.model.CourseDto;
import com.cryptotrading.academy.model.YouTubeResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class YouTubeProvider {

    private static final Pattern DURATION_PATTERN =
            Pattern.compile("PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?");

    @Value("${youtube.api-key:}")
    private String apiKey;

    @Value("${youtube.base-url:https://www.googleapis.com/youtube/v3}")
    private String baseUrl;

    @Value("${youtube.cache-ttl-hours:24}")
    private int cacheTtlHours;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private Cache<String, CourseDto> videoCache;

    public YouTubeProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public CourseDto fetchSingleVideo(String videoId) {
        if (videoId == null || videoId.isBlank()) {
            return buildMinimalDto(videoId);
        }

        CourseDto cached = getCache().getIfPresent(videoId);
        if (cached != null) {
            return cached;
        }

        if (!isConfigured()) {
            return buildMinimalDto(videoId);
        }

        try {
            CourseDto course = fetchVideoDetail(videoId);
            getCache().put(videoId, course);
            return course;
        } catch (Exception e) {
            log.warn("[YouTubeProvider] Cannot fetch metadata for video {}: {}", videoId, e.getMessage());
            return buildMinimalDto(videoId);
        }
    }

    private Cache<String, CourseDto> getCache() {
        if (videoCache == null) {
            videoCache = CacheBuilder.newBuilder()
                    .maximumSize(1000)
                    .expireAfterWrite(cacheTtlHours, TimeUnit.HOURS)
                    .build();
        }
        return videoCache;
    }

    private boolean isConfigured() {
        return apiKey != null
                && !apiKey.isBlank()
                && !"your-youtube-api-key-here".equalsIgnoreCase(apiKey.trim());
    }

    private CourseDto fetchVideoDetail(String videoId) throws Exception {
        String url = UriComponentsBuilder
                .fromHttpUrl(baseUrl + "/videos")
                .queryParam("part", "snippet,contentDetails,statistics")
                .queryParam("id", videoId)
                .queryParam("key", apiKey)
                .build()
                .toUriString();

        String body = get(url);
        YouTubeResponse.VideoListResponse response =
                objectMapper.readValue(body, YouTubeResponse.VideoListResponse.class);

        if (response.getItems() == null || response.getItems().isEmpty()) {
            return buildMinimalDto(videoId);
        }
        return mapVideoItem(response.getItems().get(0));
    }

    private CourseDto mapVideoItem(YouTubeResponse.VideoItem item) {
        YouTubeResponse.VideoSnippet snippet = item.getSnippet();
        YouTubeResponse.ContentDetails contentDetails = item.getContentDetails();
        YouTubeResponse.Statistics stats = item.getStatistics();

        String thumbnail = null;
        if (snippet != null && snippet.getThumbnails() != null) {
            YouTubeResponse.Thumbnails thumbnails = snippet.getThumbnails();
            if (thumbnails.getMaxres() != null) {
                thumbnail = thumbnails.getMaxres().getUrl();
            } else if (thumbnails.getHigh() != null) {
                thumbnail = thumbnails.getHigh().getUrl();
            } else if (thumbnails.getMedium() != null) {
                thumbnail = thumbnails.getMedium().getUrl();
            }
        }

        String duration = contentDetails == null ? null : contentDetails.getDuration();

        return CourseDto.builder()
                .videoId(item.getId())
                .title(snippet == null ? null : snippet.getTitle())
                .description(snippet == null ? null : snippet.getDescription())
                .thumbnailUrl(thumbnail)
                .duration(duration)
                .durationFormatted(formatDuration(duration))
                .viewCount(stats == null ? null : stats.getViewCount())
                .likeCount(stats == null ? null : stats.getLikeCount())
                .publishedAt(snippet == null ? null : snippet.getPublishedAt())
                .channelTitle(snippet == null ? null : snippet.getChannelTitle())
                .embedUrl("https://www.youtube.com/embed/" + item.getId())
                .watchUrl("https://www.youtube.com/watch?v=" + item.getId())
                .build();
    }

    private CourseDto buildMinimalDto(String videoId) {
        return CourseDto.builder()
                .videoId(videoId)
                .embedUrl("https://www.youtube.com/embed/" + videoId)
                .watchUrl("https://www.youtube.com/watch?v=" + videoId)
                .build();
    }

    private String formatDuration(String iso) {
        if (iso == null || iso.isBlank()) {
            return null;
        }

        Matcher matcher = DURATION_PATTERN.matcher(iso);
        if (!matcher.matches()) {
            return iso;
        }

        int hours = matcher.group(1) == null ? 0 : Integer.parseInt(matcher.group(1));
        int minutes = matcher.group(2) == null ? 0 : Integer.parseInt(matcher.group(2));
        int seconds = matcher.group(3) == null ? 0 : Integer.parseInt(matcher.group(3));

        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, seconds);
        }
        return String.format("%d:%02d", minutes, seconds);
    }

    private String get(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            String preview = response.body().substring(0, Math.min(200, response.body().length()));
            throw new RuntimeException("YouTube API returned HTTP " + response.statusCode() + ": " + preview);
        }
        return response.body();
    }
}
