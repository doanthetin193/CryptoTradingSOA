package com.cryptotrading.news.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Phân tích sentiment đơn giản dựa trên keyword matching
 * positive / negative / neutral
 */
@Component
public class SentimentAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(SentimentAnalyzer.class);

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
     * Phân tích sentiment từ title + summary
     */
    public String analyze(String title, String summary) {
        if (title == null) return "neutral";

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
