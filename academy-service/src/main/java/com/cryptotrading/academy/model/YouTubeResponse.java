package com.cryptotrading.academy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Minimal mapping for YouTube Data API v3 videos.list.
 */
public class YouTubeResponse {

    @Data
    public static class VideoListResponse {
        private String kind;
        private String etag;
        private PageInfo pageInfo;
        private List<VideoItem> items;
    }

    @Data
    public static class PageInfo {
        private int totalResults;
        private int resultsPerPage;
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
    public static class ContentDetails {
        private String duration;
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
