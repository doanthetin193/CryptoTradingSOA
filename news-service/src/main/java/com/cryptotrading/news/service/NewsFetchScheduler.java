package com.cryptotrading.news.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Task định kỳ lấy tin tức mới từ API bên ngoài
 * Chạy mỗi 15 phút để refresh cache
 */
@Service
public class NewsFetchScheduler {

    private static final Logger log = LoggerFactory.getLogger(NewsFetchScheduler.class);

    @Autowired
    private NewsService newsService;

    /**
     * Chạy lần đầu sau 30 giây khi khởi động, sau đó mỗi 15 phút
     */
    @Scheduled(initialDelay = 30_000, fixedRateString = "${scheduler.news-fetch-interval-ms:900000}")
    public void scheduledFetch() {
        log.info("🔄 [Scheduler] Starting scheduled news fetch...");
        try {
            newsService.refreshCache();
            log.info("✅ [Scheduler] News cache refreshed successfully");
        } catch (Exception e) {
            log.error("❌ [Scheduler] Failed to refresh news cache: {}", e.getMessage());
        }
    }
}
