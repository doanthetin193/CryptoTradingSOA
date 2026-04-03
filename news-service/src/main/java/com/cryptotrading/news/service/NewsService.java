package com.cryptotrading.news.service;

import com.cryptotrading.news.exception.NewsNotFoundException;
import com.cryptotrading.news.model.News;
import com.cryptotrading.news.model.PageResponse;
import com.cryptotrading.news.provider.CryptoCompareProvider;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Business logic cho News Service
 * Quản lý Guava cache và xử lý filter/pagination
 */
@Service
public class NewsService {

    private static final Logger log = LoggerFactory.getLogger(NewsService.class);
    private static final String CACHE_KEY_ALL = "all";
    private static final String CACHE_KEY_TRENDING = "trending";

    @Autowired
    private CryptoCompareProvider cryptoCompareProvider;

    @Value("${cache.news-ttl-hours:24}")
    private long newsTtlHours;

    @Value("${cache.trending-ttl-hours:6}")
    private long trendingTtlHours;

    @Value("${cache.max-size:100}")
    private long maxCacheSize;

    /** Cache chính chứa tất cả tin tức */
    private LoadingCache<String, List<News>> newsCache;

    /** Cache cho trending news */
    private LoadingCache<String, List<News>> trendingCache;

    /** Số lần fetch thành công */
    private long totalFetches = 0;

    @PostConstruct
    public void initCache() {
        newsCache = CacheBuilder.newBuilder()
                .maximumSize(1)
                .expireAfterWrite(newsTtlHours, TimeUnit.HOURS)
                .recordStats()
                .build(new CacheLoader<String, List<News>>() {
                    @Override
                    public List<News> load(String key) {
                        List<News> news = cryptoCompareProvider.fetchLatestNews();
                        totalFetches++;
                        log.info("📰 Cache loaded with {} articles (fetch #{})", news.size(), totalFetches);
                        return news;
                    }
                });

        trendingCache = CacheBuilder.newBuilder()
                .maximumSize(1)
                .expireAfterWrite(trendingTtlHours, TimeUnit.HOURS)
                .build(new CacheLoader<String, List<News>>() {
                    @Override
                    public List<News> load(String key) throws Exception {
                        return calculateTrending();
                    }
                });

        log.info("✅ News cache initialized (TTL: {}h, max: {})", newsTtlHours, maxCacheSize);
    }

    /**
     * Lấy danh sách tin tức có lọc và phân trang
     */
    public PageResponse<News> getNews(int page, int limit, String coin, String sentiment, String search) {
        validatePaginationParams(page, limit);

        List<News> all = getAllCached();
        List<News> filtered = applyFilters(all, coin, sentiment, search);

        return paginate(filtered, page, limit);
    }

    /**
     * Lấy tin tức theo ID
     */
    public News getNewsById(String id) {
        List<News> all = getAllCached();
        return all.stream()
                .filter(n -> id.equals(n.getId()))
                .findFirst()
                .orElseThrow(() -> new NewsNotFoundException("News article not found with id: " + id));
    }

    /**
     * Lấy danh sách tin trending (nhiều views nhất)
     */
    public List<News> getTrending(int limit) {
        if (limit < 1 || limit > 50) limit = 10;
        try {
            List<News> trending = trendingCache.get(CACHE_KEY_TRENDING);
            return trending.stream().limit(limit).collect(Collectors.toList());
        } catch (ExecutionException e) {
            log.error("Error loading trending cache: {}", e.getMessage());
            return getAllCached().stream()
                    .sorted(Comparator.comparingInt(News::getViews).reversed())
                    .limit(limit)
                    .collect(Collectors.toList());
        }
    }

    /**
     * Lấy tin tức theo coin cụ thể
     */
    public PageResponse<News> getNewsByCoin(String coin, int page, int limit) {
        validatePaginationParams(page, limit);
        String coinUpper = coin.toUpperCase();
        List<News> all = getAllCached();
        List<News> filtered = all.stream()
                .filter(n -> n.getCoins() != null && n.getCoins().contains(coinUpper))
                .collect(Collectors.toList());
        return paginate(filtered, page, limit);
    }

    /**
     * Làm mới cache ngay lập tức (gọi từ scheduler)
     */
    public void refreshCache() {
        log.info("🔄 Refreshing news cache...");
        newsCache.invalidate(CACHE_KEY_ALL);
        trendingCache.invalidate(CACHE_KEY_TRENDING);
        // Pre-warm
        getAllCached();
    }

    /**
     * Thống kê cache cho health endpoint
     */
    public CacheStats getCacheStats() {
        com.google.common.cache.CacheStats stats = newsCache.stats();
        List<News> current = getAllCached();
        return new CacheStats(
                current.size(),
                (int) maxCacheSize,
                totalFetches,
                stats.hitRate(),
                stats.missRate()
        );
    }

    // ========================
    // Private helpers
    // ========================

    private List<News> getAllCached() {
        try {
            return newsCache.get(CACHE_KEY_ALL);
        } catch (ExecutionException e) {
            log.error("Failed to load news from cache: {}", e.getMessage());
            return List.of();
        }
    }

    private List<News> applyFilters(List<News> all, String coin, String sentiment, String search) {
        return all.stream()
                .filter(n -> {
                    if (coin == null || coin.isBlank()) return true;
                    return n.getCoins() != null && n.getCoins().contains(coin.toUpperCase());
                })
                .filter(n -> {
                    if (sentiment == null || sentiment.isBlank()) return true;
                    return sentiment.equalsIgnoreCase(n.getSentiment());
                })
                .filter(n -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase();
                    return (n.getTitle() != null && n.getTitle().toLowerCase().contains(q))
                            || (n.getSummary() != null && n.getSummary().toLowerCase().contains(q));
                })
                .collect(Collectors.toList());
    }

    private <T> PageResponse<T> paginate(List<T> items, int page, int limit) {
        int total = items.size();
        int totalPages = (int) Math.ceil((double) total / limit);
        int fromIndex = Math.min((page - 1) * limit, total);
        int toIndex = Math.min(fromIndex + limit, total);

        List<T> pageItems = items.subList(fromIndex, toIndex);

        return PageResponse.<T>builder()
                .items(pageItems)
                .pagination(PageResponse.PaginationMeta.builder()
                        .page(page)
                        .limit(limit)
                        .total(total)
                        .pages(totalPages)
                        .hasNext(page < totalPages)
                        .hasPrev(page > 1)
                        .build())
                .build();
    }

    private List<News> calculateTrending() throws ExecutionException {
        return newsCache.get(CACHE_KEY_ALL).stream()
                .sorted(Comparator.comparingInt(News::getViews).reversed())
                .collect(Collectors.toList());
    }

    private void validatePaginationParams(int page, int limit) {
        if (page < 1) throw new IllegalArgumentException("Page must be >= 1");
        if (limit < 1 || limit > 50) throw new IllegalArgumentException("Limit must be between 1 and 50");
    }

    /**
     * DTO chứa thống kê cache
     */
    public record CacheStats(int size, int maxSize, long totalFetches,
                              double hitRate, double missRate) {}
}
