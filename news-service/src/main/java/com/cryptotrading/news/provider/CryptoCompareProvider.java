package com.cryptotrading.news.provider;

import com.cryptotrading.news.model.News;
import com.cryptotrading.news.util.SentimentAnalyzer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Provider lấy tin tức crypto từ CryptoCompare (miễn phí).
 * Docs: https://min-api.cryptocompare.com/documentation
 * Fallback 1 → CryptoCompare (primary, free tier)
 * Fallback 2 → NewsAPI.org (nếu có NEWSAPI_KEY)
 * Fallback 3 → Sample data
 */
@Component
public class CryptoCompareProvider {

    private static final Logger log = LoggerFactory.getLogger(CryptoCompareProvider.class);

    @Value("${cryptocompare.api-url:https://min-api.cryptocompare.com/data/v2/news/}")
    private String cryptoCompareApiUrl;

    @Value("${cryptocompare.api-key:}")
    private String cryptoCompareApiKey;

    @Value("${newsapi.api-url:https://newsapi.org/v2/everything}")
    private String newsApiUrl;

    @Value("${newsapi.api-key:}")
    private String newsApiKey;

    @Autowired
    private SentimentAnalyzer sentimentAnalyzer;

    @Autowired
    private ObjectMapper objectMapper;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Lấy tin tức mới nhất.
     * Ưu tiên CryptoCompare (hoạt động cả khi không có key, key giúp tăng rate limit).
     * Fallback về NewsAPI nếu CryptoCompare thất bại.
     * Cuối cùng trả về sample data nếu cả hai thất bại.
     */
    public List<News> fetchLatestNews() {
        // 1) CryptoCompare – free, không cần key (key tăng rate limit)
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(cryptoCompareApiUrl)
                    .queryParam("lang", "EN")
                    .queryParam("size", 50);

            if (cryptoCompareApiKey != null && !cryptoCompareApiKey.isBlank()) {
                builder.queryParam("api_key", cryptoCompareApiKey);
                log.info("📡 Fetching news from CryptoCompare (with API key)...");
            } else {
                log.info("📡 Fetching news from CryptoCompare (free tier, no key)...");
            }

            String json = restTemplate.getForObject(builder.toUriString(), String.class);
            List<News> ccNews = parseCryptoCompareResponse(json);
            if (!ccNews.isEmpty()) {
                return ccNews;
            }
        } catch (Exception e) {
            log.warn("⚠️  CryptoCompare fetch failed: {}", e.getMessage());
        }

        // 2) NewsAPI – fallback nếu có key
        if (newsApiKey != null && !newsApiKey.isBlank()) {
            try {
                String url = UriComponentsBuilder.fromHttpUrl(newsApiUrl)
                        .queryParam("q", "crypto OR bitcoin OR ethereum OR blockchain")
                        .queryParam("pageSize", 50)
                        .queryParam("sortBy", "publishedAt")
                        .queryParam("language", "en")
                        .queryParam("apiKey", newsApiKey)
                        .toUriString();

                log.info("📡 Fetching news from NewsAPI (fallback)...");
                String json = restTemplate.getForObject(url, String.class);
                List<News> naNews = parseNewsApiResponse(json);
                if (!naNews.isEmpty()) {
                    return naNews;
                }
            } catch (Exception e) {
                log.warn("⚠️  NewsAPI fetch failed: {}", e.getMessage());
            }
        }

        // 3) Sample data
        log.info("🔁 Returning sample news data");
        return buildSampleNews();
    }

    /**
     * Parse response từ CryptoCompare.
     * Format: { "Data": [ { "title", "url", "source", "body", "published_on" (epoch sec) } ] }
     */
    private List<News> parseCryptoCompareResponse(String json) throws Exception {
        List<News> newsList = new ArrayList<>();
        JsonNode root = objectMapper.readTree(json);
        JsonNode data = root.path("Data");

        if (!data.isArray()) {
            log.warn("Unexpected CryptoCompare response format");
            return newsList;
        }

        for (JsonNode item : data) {
            try {
                String title = item.path("title").asText("");
                String url = item.path("url").asText("");
                String sourceName = item.path("source").asText("CryptoCompare");
                String summary = item.path("body").asText(title);
                String publishedAtStr = item.path("published_on").asText(null);

                LocalDateTime publishedAt;
                if (publishedAtStr != null && publishedAtStr.matches("^\\d+$")) {
                    publishedAt = LocalDateTime.ofEpochSecond(Long.parseLong(publishedAtStr), 0, ZoneOffset.UTC);
                } else {
                    publishedAt = LocalDateTime.now();
                }

                List<String> coins = sentimentAnalyzer.extractCoins(title, summary);
                if (coins.isEmpty()) coins = List.of("BTC");

                String sentiment = sentimentAnalyzer.analyze(title, summary);

                News news = News.builder()
                        .id(UUID.randomUUID().toString())
                        .title(title)
                        .summary(summary)
                        .content(summary)
                        .source(sourceName)
                        .url(url)
                        .sentiment(sentiment)
                        .coins(coins)
                        .publishedAt(publishedAt)
                        .fetchedAt(LocalDateTime.now())
                        .views(sentimentAnalyzer.simulateViews(title))
                        .build();

                newsList.add(news);
            } catch (Exception e) {
                log.warn("Skipping malformed CryptoCompare item: {}", e.getMessage());
            }
        }

        log.info("✅ Parsed {} news articles from CryptoCompare", newsList.size());
        return newsList;
    }

    /**
     * Parse response từ NewsAPI.
     * Format: { "articles": [ { "title", "url", "source.name", "description", "content", "publishedAt" } ] }
     */
    private List<News> parseNewsApiResponse(String json) throws Exception {
        List<News> newsList = new ArrayList<>();
        JsonNode root = objectMapper.readTree(json);
        JsonNode articles = root.path("articles");

        if (!articles.isArray()) {
            log.warn("Unexpected NewsAPI response format");
            return newsList;
        }

        for (JsonNode item : articles) {
            try {
                String title = item.path("title").asText("");
                String url = item.path("url").asText("");
                String sourceName = item.path("source").path("name").asText("NewsAPI");
                String summary = item.path("description").asText(title);
                String content = item.path("content").asText(summary);
                String publishedAtStr = item.path("publishedAt").asText(null);

                LocalDateTime publishedAt = publishedAtStr != null
                        ? LocalDateTime.parse(publishedAtStr, DateTimeFormatter.ISO_DATE_TIME)
                        : LocalDateTime.now();

                List<String> coins = sentimentAnalyzer.extractCoins(title, summary);
                if (coins.isEmpty()) coins = List.of("BTC");

                String sentiment = sentimentAnalyzer.analyze(title, summary);

                News news = News.builder()
                        .id(UUID.randomUUID().toString())
                        .title(title)
                        .summary(summary)
                        .content(content)
                        .source(sourceName)
                        .url(url)
                        .sentiment(sentiment)
                        .coins(coins)
                        .publishedAt(publishedAt)
                        .fetchedAt(LocalDateTime.now())
                        .views(sentimentAnalyzer.simulateViews(title))
                        .build();

                newsList.add(news);
            } catch (Exception e) {
                log.warn("Skipping malformed NewsAPI item: {}", e.getMessage());
            }
        }

        log.info("✅ Parsed {} news articles from NewsAPI", newsList.size());
        return newsList;
    }

    /**
     * Dữ liệu mẫu khi chưa có API key (dùng để demo/test)
     */
    private List<News> buildSampleNews() {
        LocalDateTime now = LocalDateTime.now();
        List<News> samples = new ArrayList<>();

        samples.add(News.builder()
                .id("sample-001")
                .title("Bitcoin breaks new all-time high as institutional demand surges")
                .summary("BTC surged past $100,000 as major institutions continue accumulating the leading cryptocurrency.")
                .source("CoinTelegraph")
                .url("https://cointelegraph.com/sample/bitcoin-ath")
                .imageUrl("https://images.cointelegraph.com/bitcoin.jpg")
                .sentiment("positive")
                .coins(List.of("BTC"))
                .publishedAt(now.minusHours(1))
                .fetchedAt(now)
                .views(1523)
                .build());

        samples.add(News.builder()
                .id("sample-002")
                .title("Ethereum 2.0 upgrade brings record low gas fees")
                .summary("The latest Ethereum network upgrade has significantly reduced transaction costs, attracting more DeFi activity.")
                .source("CoinDesk")
                .url("https://coindesk.com/sample/ethereum-upgrade")
                .imageUrl("https://images.coindesk.com/eth.jpg")
                .sentiment("positive")
                .coins(List.of("ETH"))
                .publishedAt(now.minusHours(2))
                .fetchedAt(now)
                .views(987)
                .build());

        samples.add(News.builder()
                .id("sample-003")
                .title("Solana DeFi ecosystem hits $10B TVL milestone")
                .summary("Total value locked on Solana-based DeFi protocols has reached a new record.")
                .source("The Block")
                .url("https://theblock.co/sample/solana-defi")
                .sentiment("positive")
                .coins(List.of("SOL"))
                .publishedAt(now.minusHours(3))
                .fetchedAt(now)
                .views(742)
                .build());

        samples.add(News.builder()
                .id("sample-004")
                .title("Crypto market faces correction as Fed signals rate hikes")
                .summary("Bitcoin and altcoins dropped amid fears of tighter monetary policy from the US Federal Reserve.")
                .source("Reuters")
                .url("https://reuters.com/sample/crypto-correction")
                .sentiment("negative")
                .coins(List.of("BTC", "ETH"))
                .publishedAt(now.minusHours(4))
                .fetchedAt(now)
                .views(1105)
                .build());

        samples.add(News.builder()
                .id("sample-005")
                .title("Binance launches new BNB staking program with 12% APY")
                .summary("Binance announces a new staking product for BNB holders, offering up to 12% annual returns.")
                .source("Binance Blog")
                .url("https://binance.com/sample/bnb-staking")
                .sentiment("positive")
                .coins(List.of("BNB"))
                .publishedAt(now.minusHours(5))
                .fetchedAt(now)
                .views(634)
                .build());

        samples.add(News.builder()
                .id("sample-006")
                .title("Ripple wins key lawsuit, XRP deemed not a security")
                .summary("A federal court ruled in favor of Ripple, clarifying XRP's legal status and boosting investor confidence.")
                .source("CoinDesk")
                .url("https://coindesk.com/sample/ripple-wins")
                .sentiment("positive")
                .coins(List.of("XRP"))
                .publishedAt(now.minusHours(6))
                .fetchedAt(now)
                .views(2001)
                .build());

        samples.add(News.builder()
                .id("sample-007")
                .title("Dogecoin memecoin season: DOGE surges 40% in 24 hours")
                .summary("Dogecoin rallied sharply after celebrity endorsement and trending social media activity.")
                .source("BeInCrypto")
                .url("https://beincrypto.com/sample/doge-surge")
                .sentiment("positive")
                .coins(List.of("DOGE"))
                .publishedAt(now.minusHours(7))
                .fetchedAt(now)
                .views(1876)
                .build());

        samples.add(News.builder()
                .id("sample-008")
                .title("SEC investigates major crypto exchange for compliance issues")
                .summary("The US Securities and Exchange Commission has opened an investigation into a leading crypto exchange.")
                .source("Bloomberg")
                .url("https://bloomberg.com/sample/sec-investigation")
                .sentiment("negative")
                .coins(List.of("BTC", "ETH", "BNB"))
                .publishedAt(now.minusHours(8))
                .fetchedAt(now)
                .views(1423)
                .build());

        samples.add(News.builder()
                .id("sample-009")
                .title("Cardano smart contract adoption grows 200% quarter over quarter")
                .summary("ADA-based DApps see record growth as developers migrate to the Cardano ecosystem.")
                .source("ADA News")
                .url("https://adanews.com/sample/cardano-growth")
                .sentiment("positive")
                .coins(List.of("ADA"))
                .publishedAt(now.minusHours(9))
                .fetchedAt(now)
                .views(543)
                .build());

        samples.add(News.builder()
                .id("sample-010")
                .title("Polkadot parachain auctions attract billions in DOT staking")
                .summary("The latest round of Polkadot parachain auctions saw unprecedented participation from the community.")
                .source("PolkaProject")
                .url("https://polkaproject.com/sample/parachain")
                .sentiment("positive")
                .coins(List.of("DOT"))
                .publishedAt(now.minusHours(10))
                .fetchedAt(now)
                .views(389)
                .build());

        // Áp dụng FinBERT sentiment cho sample data (thay thế hardcoded labels)
        // Điều này chứng minh tích hợp AI hoạt động ngay cả khi dùng dữ liệu mẫu
        log.info("[SampleData] Applying FinBERT sentiment to {} sample articles...", samples.size());
        samples.forEach(n -> n.setSentiment(sentimentAnalyzer.analyze(n.getTitle(), n.getSummary())));
        log.info("[SampleData] FinBERT sentiment analysis complete.");

        return samples;
    }
}
