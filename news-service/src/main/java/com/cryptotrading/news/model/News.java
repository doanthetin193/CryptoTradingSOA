package com.cryptotrading.news.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Model Ä‘áº¡i diá»‡n cho má»™t bÃ i tin tá»©c crypto
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class News {

    /** ID duy nháº¥t cá»§a bÃ i bÃ¡o */
    private String id;

    /** TiÃªu Ä‘á» bÃ i bÃ¡o */
    private String title;

    /** TÃ³m táº¯t ná»™i dung */
    private String summary;

    /** Ná»™i dung Ä‘áº§y Ä‘á»§ (náº¿u cÃ³) */
    private String content;

    /** Nguá»“n bÃ¡o (CryptoCompare, CoinTelegraph, v.v.) */
    private String source;

    /** URL bÃ i bÃ¡o gá»‘c */
    private String url;

    /** URL áº£nh thumbnail */
    private String imageUrl;

    /** Sentiment: positive | negative | neutral */
    private String sentiment;

    /** Danh sÃ¡ch coins liÃªn quan: ["BTC", "ETH"] */
    private List<String> coins;

    /** Thá»i Ä‘iá»ƒm bÃ i bÃ¡o Ä‘Æ°á»£c xuáº¥t báº£n */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime publishedAt;

    /** Thá»i Ä‘iá»ƒm chÃºng ta láº¥y bÃ i bÃ¡o vá» */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime fetchedAt;

    /** Sá»‘ lÆ°á»£t xem (optional) */
    @Builder.Default
    private Integer views = 0;
}
