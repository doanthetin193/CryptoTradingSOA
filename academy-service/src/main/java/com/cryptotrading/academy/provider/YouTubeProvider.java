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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Fetches live video metadata from YouTube Data API v3.
 * Uses Guava in-memory cache (TTL = youtube.cache-ttl-hours, default 24h).
 */
@Component
@Slf4j
public class YouTubeProvider {

    private static final String PLAYLIST_CACHE_KEY = "playlist_all";
    private static final Pattern DURATION_PATTERN =
            Pattern.compile("PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?");

    @Value("${youtube.api-key:}")
    private String apiKey;

    @Value("${youtube.playlist-id:}")
    private String playlistId;

    @Value("${youtube.base-url:https://www.googleapis.com/youtube/v3}")
    private String baseUrl;

    @Value("${youtube.cache-ttl-hours:24}")
    private int cacheTtlHours;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    /** videoId → CourseDto (YouTube fields only) */
    private Cache<String, Map<String, CourseDto>> videoCache;

    public YouTubeProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Lazy-init cache so cacheTtlHours is injected before first use.
     */
    private Cache<String, Map<String, CourseDto>> getCache() {
        if (videoCache == null) {
            videoCache = CacheBuilder.newBuilder()
                    .maximumSize(1000)
                    .expireAfterWrite(cacheTtlHours, TimeUnit.HOURS)
                    .build();
        }
        return videoCache;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns a map of videoId → partial CourseDto (YouTube metadata only).
     * Results are cached.  Returns empty map if API key / playlist not configured.
     */
    public Map<String, CourseDto> fetchPlaylistVideos() {
        if (!isConfigured()) {
            log.warn("[YouTubeProvider] API key or playlist ID not configured — skipping YouTube fetch.");
            return Collections.emptyMap();
        }

        try {
            Map<String, CourseDto> cached = getCache().getIfPresent(PLAYLIST_CACHE_KEY);
            if (cached != null) {
                log.debug("[YouTubeProvider] Cache hit — {} videos", cached.size());
                return cached;
            }

            List<String> videoIds = fetchAllVideoIdsFromPlaylist();
            if (videoIds.isEmpty()) return Collections.emptyMap();

            Map<String, CourseDto> details = fetchVideoDetails(videoIds);
            getCache().put(PLAYLIST_CACHE_KEY, details);
            log.info("[YouTubeProvider] Fetched and cached {} videos from playlist.", details.size());
            return details;

        } catch (Exception e) {
            log.error("[YouTubeProvider] Error fetching playlist: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * Fetch a single video's YouTube metadata.  Uses the playlist cache when possible.
     */
    public CourseDto fetchSingleVideo(String videoId) {
        Map<String, CourseDto> all = fetchPlaylistVideos();
        if (all.containsKey(videoId)) return all.get(videoId);

        // Fallback: direct video lookup (not in playlist)
        try {
            Map<String, CourseDto> details = fetchVideoDetails(List.of(videoId));
            return details.getOrDefault(videoId, buildMinimalDto(videoId));
        } catch (Exception e) {
            log.error("[YouTubeProvider] Error fetching single video {}: {}", videoId, e.getMessage());
            return buildMinimalDto(videoId);
        }
    }

    /** Invalidate the cache (can be triggered by admin endpoint later). */
    public void invalidateCache() {
        getCache().invalidateAll();
        log.info("[YouTubeProvider] Cache invalidated.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank()
                && playlistId != null && !playlistId.isBlank();
    }

    /**
     * Pages through playlistItems.list to collect all video IDs.
     */
    private List<String> fetchAllVideoIdsFromPlaylist() throws Exception {
        List<String> ids = new java.util.ArrayList<>();
        String pageToken = null;

        do {
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromHttpUrl(baseUrl + "/playlistItems")
                    .queryParam("part", "snippet")
                    .queryParam("playlistId", playlistId)
                    .queryParam("maxResults", 50)
                    .queryParam("key", apiKey);
            if (pageToken != null) builder.queryParam("pageToken", pageToken);

            String body = get(builder.build().toUriString());
            YouTubeResponse.PlaylistItemsResponse response =
                    objectMapper.readValue(body, YouTubeResponse.PlaylistItemsResponse.class);

            if (response.getItems() != null) {
                response.getItems().forEach(item -> {
                    if (item.getSnippet() != null
                            && item.getSnippet().getResourceId() != null) {
                        String vid = item.getSnippet().getResourceId().getVideoId();
                        if (vid != null && !vid.isBlank()) ids.add(vid);
                    }
                });
            }
            pageToken = response.getNextPageToken();
        } while (pageToken != null);

        return ids;
    }

    /**
     * Fetches full video details (snippet + contentDetails + statistics) in batches of 50.
     */
    private Map<String, CourseDto> fetchVideoDetails(List<String> videoIds) throws Exception {
        Map<String, CourseDto> result = new HashMap<>();

        // YouTube accepts max 50 IDs per request
        int batchSize = 50;
        for (int i = 0; i < videoIds.size(); i += batchSize) {
            List<String> batch = videoIds.subList(i, Math.min(i + batchSize, videoIds.size()));
            String ids = String.join(",", batch);

            String url = UriComponentsBuilder
                    .fromHttpUrl(baseUrl + "/videos")
                    .queryParam("part", "snippet,contentDetails,statistics")
                    .queryParam("id", ids)
                    .queryParam("key", apiKey)
                    .build()
                    .toUriString();

            String body = get(url);
            YouTubeResponse.VideoListResponse response =
                    objectMapper.readValue(body, YouTubeResponse.VideoListResponse.class);

            if (response.getItems() != null) {
                response.getItems().forEach(item -> {
                    CourseDto dto = mapVideoItem(item);
                    result.put(item.getId(), dto);
                });
            }
        }
        return result;
    }

    private CourseDto mapVideoItem(YouTubeResponse.VideoItem item) {
        YouTubeResponse.VideoSnippet snippet = item.getSnippet();
        YouTubeResponse.ContentDetails cd = item.getContentDetails();
        YouTubeResponse.Statistics stats = item.getStatistics();

        String thumbnail = null;
        if (snippet != null && snippet.getThumbnails() != null) {
            YouTubeResponse.Thumbnails thumbs = snippet.getThumbnails();
            if (thumbs.getMaxres() != null) thumbnail = thumbs.getMaxres().getUrl();
            else if (thumbs.getHigh() != null)  thumbnail = thumbs.getHigh().getUrl();
            else if (thumbs.getMedium() != null) thumbnail = thumbs.getMedium().getUrl();
        }

        String duration = cd != null ? cd.getDuration() : null;

        return CourseDto.builder()
                .videoId(item.getId())
                .title(snippet != null ? snippet.getTitle() : null)
                .description(snippet != null ? snippet.getDescription() : null)
                .thumbnailUrl(thumbnail)
                .duration(duration)
                .durationFormatted(formatDuration(duration))
                .viewCount(stats != null ? stats.getViewCount() : null)
                .likeCount(stats != null ? stats.getLikeCount() : null)
                .publishedAt(snippet != null ? snippet.getPublishedAt() : null)
                .channelTitle(snippet != null ? snippet.getChannelTitle() : null)
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

    /** Converts ISO 8601 duration "PT1H2M34S" → "1:02:34" */
    private String formatDuration(String iso) {
        if (iso == null || iso.isBlank()) return null;
        Matcher m = DURATION_PATTERN.matcher(iso);
        if (!m.matches()) return iso;
        int hours   = m.group(1) != null ? Integer.parseInt(m.group(1)) : 0;
        int minutes = m.group(2) != null ? Integer.parseInt(m.group(2)) : 0;
        int seconds = m.group(3) != null ? Integer.parseInt(m.group(3)) : 0;
        if (hours > 0) return String.format("%d:%02d:%02d", hours, minutes, seconds);
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
            throw new RuntimeException("YouTube API returned HTTP " + response.statusCode()
                    + " — " + response.body().substring(0, Math.min(200, response.body().length())));
        }
        return response.body();
    }
}
