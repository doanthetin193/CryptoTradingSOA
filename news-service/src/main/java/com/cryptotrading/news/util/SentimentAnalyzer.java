package com.cryptotrading.news.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Phân tích sentiment bài báo crypto.
 *
 * Chiến lược 2 lớp:
 *   1. Gọi Python FinBERT service (localhost:3008) — AI thực sự, chính xác hơn
 *   2. Fallback về keyword matching nếu Python service chưa chạy / bị lỗi
 *
 * → News Service hoạt động bình thường kể cả khi sentiment-service down.
 */
@Component
public class SentimentAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(SentimentAnalyzer.class);

    @Value("${sentiment.service-url:http://localhost:3008}")
    private String sentimentServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    private static final List<String> POSITIVE_KEYWORDS = Arrays.asList(
            "surge", "rally", "bull", "gain", "rise", "soar", "high", "record",
            "breakout", "adopt", "approve", "launch", "growth", "profit", "win",
            "partnership", "upgrade", "milestone", "boost", "recover", "rebound",
            "tăng", "phục hồi", "kỷ lục", "tích cực", "lợi nhuận"
    );

    private static final List<String> NEGATIVE_KEYWORDS = Arrays.asList(
            "crash", "drop", "fall", "bear", "loss", "decline", "dump", "low",
            "hack", "scam", "ban", "restrict", "fraud", "collapse", "risk",
            "warning", "fine", "lawsuit", "fear", "sell-off", "plunge",
            "giảm", "sụp đổ", "rủi ro", "cảnh báo", "thua lỗ"
    );

    /** Tối đa lượt xem ngẫu nhiên tạo ra để mô phỏng trending */
    private static final int MAX_SIMULATED_VIEWS = 2000;

    /**
     * Phân tích sentiment từ title + summary.
     *
     * Thử FinBERT (Python) trước, fallback về keyword nếu không có.
     */
    public String analyze(String title, String summary) {
        if (title == null) return "neutral";

        // ── Bước 1: Thử Python FinBERT service ───────────────────────────
        try {
            // Gộp title + phần đầu summary (max ~300 ký tự) để FinBERT có context
            String summarySnippet = (summary != null && summary.length() > 200)
                    ? summary.substring(0, 200) : (summary != null ? summary : "");
            String text = title + ". " + summarySnippet;

            Map<String, String> request = Map.of("text", text);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    sentimentServiceUrl + "/sentiment/analyze",
                    request,
                    Map.class
            );

            if (response != null && response.containsKey("label")) {
                String label = (String) response.get("label");
                double score = response.get("score") instanceof Number
                        ? ((Number) response.get("score")).doubleValue() : 0.0;
                log.debug("[SentimentAnalyzer] FinBERT → {} ({:.0f}%) for: {}",
                        label, score * 100, title);
                return label;
            }
        } catch (Exception e) {
            // Không log ERROR vì đây là expected khi sentiment-service chưa chạy
            log.debug("[SentimentAnalyzer] FinBERT service unavailable ({}), using keyword fallback",
                    e.getClass().getSimpleName());
        }

        // ── Bước 2: Fallback keyword matching ────────────────────────────
        return analyzeByKeywords(title, summary);
    }

    /**
     * Keyword-based sentiment (fallback khi FinBERT không khả dụng).
     */
    private String analyzeByKeywords(String title, String summary) {
        String combined = (title + " " + (summary != null ? summary : "")).toLowerCase();

        long positiveCount = POSITIVE_KEYWORDS.stream()
                .filter(combined::contains)
                .count();

        long negativeCount = NEGATIVE_KEYWORDS.stream()
                .filter(combined::contains)
                .count();

        if (positiveCount > negativeCount) return "positive";
        if (negativeCount > positiveCount) return "negative";
        return "neutral";
    }

    /**
     * Map coin name/symbol có trong title về ký hiệu chuẩn
     */
    private static final Map<String, String> COIN_KEYWORDS = Map.of(
            "bitcoin", "BTC",
            "btc", "BTC",
            "ethereum", "ETH",
            "eth", "ETH",
            "bnb", "BNB",
            "binance", "BNB",
            "solana", "SOL",
            "sol", "SOL",
            "ripple", "XRP",
            "xrp", "XRP"
    );

    private static final Map<String, String> COIN_KEYWORDS_EXT = Map.of(
            "cardano", "ADA",
            "ada", "ADA",
            "dogecoin", "DOGE",
            "doge", "DOGE",
            "polkadot", "DOT",
            "dot", "DOT"
    );

    public List<String> extractCoins(String title, String summary) {
        String combined = (title + " " + (summary != null ? summary : "")).toLowerCase();
        List<String> found = new java.util.ArrayList<>();

        COIN_KEYWORDS.forEach((keyword, symbol) -> {
            if (combined.contains(keyword) && !found.contains(symbol)) {
                found.add(symbol);
            }
        });

        COIN_KEYWORDS_EXT.forEach((keyword, symbol) -> {
            if (combined.contains(keyword) && !found.contains(symbol)) {
                found.add(symbol);
            }
        });

        return found;
    }

    /**
     * Sinh số views giả để mô phỏng trending (không có DB thực)
     */
    public int simulateViews(String id) {
        return Math.abs(id.hashCode() % MAX_SIMULATED_VIEWS) + 1;
    }
}
