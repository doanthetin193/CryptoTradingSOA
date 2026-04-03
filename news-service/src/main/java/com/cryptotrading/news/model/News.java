package com.cryptotrading.news.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Model đại diện cho một bài tin tức crypto
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class News {

    /** ID duy nhất của bài báo */
    private String id;

    /** Tiêu đề bài báo */
    private String title;

    /** Tóm tắt nội dung */
    private String summary;

    /** Nội dung đầy đủ (nếu có) */
    private String content;

    /** Nguồn báo (CryptoPanic, CoinTelegraph, v.v.) */
    private String source;

    /** URL bài báo gốc */
    private String url;

    /** URL ảnh thumbnail */
    private String imageUrl;

    /** Sentiment: positive | negative | neutral */
    private String sentiment;

    /** Danh sách coins liên quan: ["BTC", "ETH"] */
    private List<String> coins;

    /** Thời điểm bài báo được xuất bản */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime publishedAt;

    /** Thời điểm chúng ta lấy bài báo về */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime fetchedAt;

    /** Số lượt xem (optional) */
    @Builder.Default
    private Integer views = 0;
}
