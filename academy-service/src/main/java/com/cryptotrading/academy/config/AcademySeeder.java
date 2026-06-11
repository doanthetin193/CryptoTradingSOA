package com.cryptotrading.academy.config;

import com.cryptotrading.academy.model.Course;
import com.cryptotrading.academy.model.Course.Difficulty;
import com.cryptotrading.academy.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AcademySeeder implements CommandLineRunner {

    private static final Set<String> BROKEN_SEED_VIDEO_IDS = Set.of(
            "E5f_mAe4DyE",
            "H2_B6GxCdRQ",
            "3GJCBaahUc8"
    );

    private final CourseRepository courseRepository;

    @Override
    public void run(String... args) {
        List<Course> seeds = List.of(
                course("GmOzih6I1zs", "Bitcoin Mining Explained", Difficulty.BEGINNER,
                        "BLOCKCHAIN", "FOUNDATIONS", "Understand mining, blocks, and why Bitcoin needs computing work.", 1),
                course("s4g1XFU8Gto", "Bitcoin Explained and Made Simple", Difficulty.BEGINNER,
                        "BLOCKCHAIN", "FOUNDATIONS", "A beginner friendly overview of Bitcoin as digital money.", 2),
                course("bBC-nXj3Ng4", "How Bitcoin Actually Works", Difficulty.INTERMEDIATE,
                        "BLOCKCHAIN", "FOUNDATIONS", "A deeper visual explanation of transactions, hashes, and consensus.", 3),
                course("SSo_EIwHSd4", "How a Blockchain Works", Difficulty.BEGINNER,
                        "BLOCKCHAIN", "FOUNDATIONS", "Learn how blocks link together and protect transaction history.", 4),
                course("1Hu8lzoi0Tw", "Ethereum Explained for Beginners", Difficulty.BEGINNER,
                        "BLOCKCHAIN", "FOUNDATIONS", "Move from Bitcoin basics to Ethereum and programmable money.", 5),
                course("M3EFi_POhps", "Proof of Stake vs Proof of Work", Difficulty.INTERMEDIATE,
                        "BLOCKCHAIN", "FOUNDATIONS", "Compare two major consensus models used by crypto networks.", 6),

                course("SQyg9pyJ1Ac", "Cryptocurrency Wallets Explained", Difficulty.BEGINNER,
                        "SECURITY", "SECURITY_BASICS", "Understand hot wallets, cold wallets, custodial wallets, and key ownership.", 1),
                course("SC1arXuwWOY", "Wallets and Seed Phrases", Difficulty.BEGINNER,
                        "SECURITY", "SECURITY_BASICS", "Learn why seed phrases matter and how to avoid losing access.", 2),
                course("EoFWcSKRMyg", "Crypto Introduction in Vietnamese", Difficulty.BEGINNER,
                        "SECURITY", "SECURITY_BASICS", "A Vietnamese intro lesson that helps connect the basic crypto terms.", 3),
                course("dWmv6UW5ikk", "Crypto Scam Awareness", Difficulty.INTERMEDIATE,
                        "SECURITY", "SECURITY_BASICS", "Spot fake endorsements, investment traps, and common social engineering patterns.", 4),

                course("ZE2HxTmxfrI", "Smart Contracts Explained", Difficulty.INTERMEDIATE,
                        "DEFI", "DEFI_ALTCOINS", "Learn how smart contracts power apps, tokens, and DeFi protocols.", 1),
                course("e9Eg0CmboFU", "DeFi Explained for Beginners", Difficulty.INTERMEDIATE,
                        "DEFI", "DEFI_ALTCOINS", "Understand decentralized finance, lending, swapping, and protocol risk.", 2),
                course("vx_JyxuV1DE", "Stablecoins Explained", Difficulty.BEGINNER,
                        "DEFI", "DEFI_ALTCOINS", "Review why stablecoins exist and how they are used in crypto markets.", 3),
                course("bF0_HsOVERs", "Altcoins Explained", Difficulty.BEGINNER,
                        "ALTCOINS", "DEFI_ALTCOINS", "Learn what altcoins are and why research quality matters.", 4),
                course("NNQLJcJEzv0", "NFT Explained in 5 Minutes", Difficulty.BEGINNER,
                        "ALTCOINS", "DEFI_ALTCOINS", "A quick overview of non-fungible tokens and digital ownership.", 5),
                course("rYQgy8QDEBI", "How Cryptocurrency Actually Works", Difficulty.INTERMEDIATE,
                        "ALTCOINS", "DEFI_ALTCOINS", "Connect crypto concepts to real projects, coins, and market narratives.", 6),

                course("evAJW38orgM", "Technical Analysis for Beginners", Difficulty.INTERMEDIATE,
                        "TRADING", "TRADING_BASICS", "Start reading charts with trend, support, resistance, and basic structure.", 1),
                course("tW13N4Hll88", "Candlestick Pattern Guide", Difficulty.INTERMEDIATE,
                        "TRADING", "TRADING_BASICS", "Learn common candle patterns without overcomplicating chart reading.", 2),
                course("94GFz7tPKVE", "Trading Risk Management", Difficulty.ADVANCED,
                        "TRADING", "TRADING_BASICS", "Focus on risk per trade, invalidation, and protecting capital.", 3),
                course("gb7nNveNBjg", "Risk Management in 20 Minutes", Difficulty.ADVANCED,
                        "TRADING", "TRADING_BASICS", "A broader risk lesson that applies to crypto and other markets.", 4),
                course("P8EtfNHbbsQ", "Money and Risk Management Plan", Difficulty.ADVANCED,
                        "TRADING", "TRADING_BASICS", "Turn risk rules into a repeatable trading plan.", 5)
        );

        removeBrokenSeeds();
        seeds.forEach(this::upsertCourse);
        log.info("[AcademySeeder] Academy seed data is ready: {} courses", seeds.size());
    }

    private void removeBrokenSeeds() {
        BROKEN_SEED_VIDEO_IDS.forEach(videoId ->
                courseRepository.findByVideoId(videoId).ifPresent(courseRepository::delete)
        );
    }

    private void upsertCourse(Course seed) {
        Course course = courseRepository.findByVideoId(seed.getVideoId()).orElse(seed);
        course.setTitle(seed.getTitle());
        course.setDifficulty(seed.getDifficulty());
        course.setCategory(seed.getCategory());
        course.setLearningPath(seed.getLearningPath());
        course.setDescription(seed.getDescription());
        course.setSortOrder(seed.getSortOrder());
        courseRepository.save(course);
    }

    private Course course(
            String videoId,
            String title,
            Difficulty difficulty,
            String category,
            String learningPath,
            String description,
            int sortOrder
    ) {
        return Course.builder()
                .videoId(videoId)
                .title(title)
                .difficulty(difficulty)
                .category(category)
                .learningPath(learningPath)
                .description(description)
                .sortOrder(sortOrder)
                .build();
    }
}
