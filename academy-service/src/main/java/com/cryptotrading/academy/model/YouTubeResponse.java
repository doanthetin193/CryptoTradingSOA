package com.cryptotrading.academy.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Maps the JSON response from YouTube Data API v3 (playlistItems.list or videos.list)
 */
public class YouTubeResponse {

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PlaylistItemsResponse {
        private String kind;
        private String etag;
        private PageInfo pageInfo;
        private String nextPageToken;
        private List<PlaylistItem> items;
    }

    @Data
    public static class PlaylistItem {
        private String kind;
        private String etag;
        private String id;
        private Snippet snippet;
    }

    @Data
    public static class Snippet {
        private String publishedAt;
        private String channelId;
        private String title;
        private String description;
        private Thumbnails thumbnails;
        private String channelTitle;
        private String playlistId;
        private int position;
        private ResourceId resourceId;
    }

    @Data
    public static class ResourceId {
        private String kind;
        @JsonProperty("videoId")
        private String videoId;
    }

    @Data
    public static class Thumbnails {
        @JsonProperty("default")
        private Thumbnail defaultThumbnail;
        private Thumbnail medium;
        private Thumbnail high;
        private Thumbnail standard;
        private Thumbnail maxres;
    }

    @Data
    public static class Thumbnail {
        private String url;
        private int width;
        private int height;
    }

    @Data
    public static class PageInfo {
        private int totalResults;
        private int resultsPerPage;
    }

    // ─── Video Details ───────────────────────────────────────────────────────

    @Data
    public static class VideoListResponse {
        private String kind;
        private String etag;
        private PageInfo pageInfo;
        private List<VideoItem> items;
    }

    @Data
    public static class VideoItem {
        private String kind;
        private String etag;
        private String id;
        private VideoSnippet snippet;
        private ContentDetails contentDetails;
        private Statistics statistics;
    }

    @Data
    public static class VideoSnippet {
        private String publishedAt;
        private String channelId;
        private String title;
        private String description;
        private Thumbnails thumbnails;
        private String channelTitle;
        private String defaultAudioLanguage;
    }

    @Data
    public static class ContentDetails {
        private String duration;  // ISO 8601, e.g. "PT12M34S"
        private String dimension;
        private String definition;
    }

    @Data
    public static class Statistics {
        private String viewCount;
        private String likeCount;
        private String commentCount;
    }
}
