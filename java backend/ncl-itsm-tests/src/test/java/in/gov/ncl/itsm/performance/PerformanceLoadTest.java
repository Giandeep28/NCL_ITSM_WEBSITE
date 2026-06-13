package in.gov.ncl.itsm.performance;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.util.StopWatch;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ============================================================================
 * TEST TECHNIQUE: Performance Testing and Load Testing
 * ============================================================================
 *
 * Simulates high concurrent access to a critical section of code to measure
 * throughput, response times, and thread safety under load.
 *
 * In a real environment, this might be handled by JMeter or Gatling, but 
 * for module-level load testing, Java concurrency utilities work perfectly.
 */
@DisplayName("Performance & Load Tests")
class PerformanceLoadTest {

    // A mock "expensive" service method to simulate processing a ticket
    private void processTicketSimulation(int ticketId) throws InterruptedException {
        // Simulating DB write or external API call latency
        Thread.sleep(5); 
    }

    @Test
    @DisplayName("[Load Test] Sustained concurrent ticket processing")
    void loadTest_concurrentTicketProcessing() throws InterruptedException, ExecutionException {
        int concurrentUsers = 100;
        int requestsPerUser = 20; // Total 2000 requests
        
        ExecutorService executor = Executors.newFixedThreadPool(concurrentUsers);
        CountDownLatch latch = new CountDownLatch(1); // To start all threads simultaneously
        AtomicInteger successfulRequests = new AtomicInteger(0);

        List<Callable<Void>> tasks = new ArrayList<>();

        for (int i = 0; i < concurrentUsers; i++) {
            tasks.add(() -> {
                latch.await(); // wait for start signal
                for (int j = 0; j < requestsPerUser; j++) {
                    processTicketSimulation(j);
                    successfulRequests.incrementAndGet();
                }
                return null;
            });
        }

        StopWatch stopWatch = new StopWatch();
        
        // Submit all tasks
        List<Future<Void>> futures = new ArrayList<>();
        for (Callable<Void> task : tasks) {
            futures.add(executor.submit(task));
        }

        // Fire the starting gun
        stopWatch.start();
        latch.countDown(); 

        // Wait for all to finish
        for (Future<Void> future : futures) {
            future.get(); 
        }
        stopWatch.stop();
        executor.shutdown();

        // Assertions
        assertThat(successfulRequests.get()).isEqualTo(concurrentUsers * requestsPerUser);
        
        // 2000 requests of 5ms each sequentially = 10 seconds.
        // But with 100 threads, it should take roughly 100-200ms.
        long totalTimeMs = stopWatch.getTotalTimeMillis();
        System.out.println("Load test completed 2000 requests in " + totalTimeMs + "ms");
        
        assertThat(totalTimeMs).isLessThan(1000); // Should complete in under 1 second under concurrency
    }
}
