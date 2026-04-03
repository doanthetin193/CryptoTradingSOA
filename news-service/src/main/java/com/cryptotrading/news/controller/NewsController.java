package com.cryptotrading.news.controller;

import com.cryptotrading.news.model.ApiResponse;
import com.cryptotrading.news.model.News;
import com.cryptotrading.news.model.PageResponse;
import com.cryptotrading.news.service.NewsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * REST Controller cho tất cả News endpoints
 * Base path: /news
 */
@RestController
@RequestMapping("/news")
@CrossOrigin(origins = "*")
public class NewsController {

    private static final Logger log = LoggerFactory.getLogger(NewsController.class);

    @Autowired
    private NewsService newsService;

    /**
     * GET /news
     * Lấy danh sách tin tức có lọc và phân trang
     *
     * @param page      Trang (mặc định 1)
     * @param limit     Số tin mỗi trang (mặc định 10, tối đa 50)
     * @param coin      Lọc theo coin (BTC, ETH,...)
     * @param sentiment Lọc theo sentiment (positive/negative/neutral)
     * @param search    Tìm kiếm theo tiêu đề
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNews(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String coin,
            @RequestParam(required = false) String sentiment,
            @RequestParam(required = false) String search
    ) {
        log.debug("GET /news page={} limit={} coin={} sentiment={} search={}", page, limit, coin, sentiment, search);

        PageResponse<News> result = newsService.getNews(page, limit, coin, sentiment, search);

        Map<String, Object> data = Map.of(
                "news", result.getItems(),
                "pagination", result.getPagination()
        );

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * GET /news/trending
     * Lấy danh sách tin trending (phải đặt trước /{id} để không bị conflict)
     *
     * @param limit Số tin tối đa (mặc định 5)
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTrending(
            @RequestParam(defaultValue = "5") int limit
    ) {
        log.debug("GET /news/trending limit={}", limit);

        List<News> trending = newsService.getTrending(limit);

        Map<String, Object> data = Map.of(
                "trending", trending,
                "period", "24h",
                "timestamp", Instant.now().toString()
        );

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * GET /news/coins/{coin}
     * Lấy tin tức lọc theo coin cụ thể
     */
    @GetMapping("/coins/{coin}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNewsByCoin(
            @PathVariable String coin,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        log.debug("GET /news/coins/{} page={} limit={}", coin, page, limit);

        PageResponse<News> result = newsService.getNewsByCoin(coin, page, limit);

        Map<String, Object> data = Map.of(
                "news", result.getItems(),
                "pagination", result.getPagination(),
                "coin", coin.toUpperCase()
        );

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * GET /news/{id}
     * Lấy chi tiết bài báo theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<News>> getNewsById(@PathVariable String id) {
        log.debug("GET /news/{}", id);
        News news = newsService.getNewsById(id);
        return ResponseEntity.ok(ApiResponse.success(news));
    }

    /**
     * GET /health
     * Health check endpoint (dùng bởi Consul)
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        NewsService.CacheStats stats = newsService.getCacheStats();

        Map<String, Object> response = Map.of(
                "status", "UP",
                "service", "news-service",
                "version", "1.0.0",
                "timestamp", Instant.now().toString(),
                "cache", Map.of(
                        "size", stats.size(),
                        "maxSize", stats.maxSize(),
                        "totalFetches", stats.totalFetches(),
                        "hitRate", String.format("%.2f%%", stats.hitRate() * 100),
                        "missRate", String.format("%.2f%%", stats.missRate() * 100)
                )
        );

        return ResponseEntity.ok(response);
    }
}
