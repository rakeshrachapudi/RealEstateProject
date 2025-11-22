package com.example.realestate.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    private static final Logger logger = LoggerFactory.getLogger(AsyncConfig.class);

    /**
     * Configure thread pool for async notification tasks
     */
    @Bean(name = "notificationTaskExecutor")
    public Executor notificationTaskExecutor() {
        logger.info("🔧 Configuring async task executor for notifications");

        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // Core pool size - number of threads to keep alive
        executor.setCorePoolSize(5);

        // Maximum pool size - maximum number of threads
        executor.setMaxPoolSize(10);

        // Queue capacity - how many tasks can wait in queue
        executor.setQueueCapacity(100);

        // Thread name prefix for identification
        executor.setThreadNamePrefix("Notification-");

        // Rejection policy when queue is full
        executor.setRejectedExecutionHandler((r, executor1) -> {
            logger.warn("⚠️ Notification task rejected - Queue full!");
        });

        // Wait for tasks to complete on shutdown
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);

        executor.initialize();

        logger.info("✅ Async task executor configured successfully");
        logger.info("   Core Pool Size: {}", executor.getCorePoolSize());
        logger.info("   Max Pool Size: {}", executor.getMaxPoolSize());
        logger.info("   Queue Capacity: {}", executor.getQueueCapacity());

        return executor;
    }
}