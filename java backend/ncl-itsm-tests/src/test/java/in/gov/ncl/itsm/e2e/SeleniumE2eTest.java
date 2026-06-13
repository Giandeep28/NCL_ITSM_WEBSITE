package in.gov.ncl.itsm.e2e;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ============================================================================
 * TEST TECHNIQUE: End-to-End (E2E) Testing with Selenium
 * ============================================================================
 *
 * This test suite demonstrates how UI interactions are automated using Selenium WebDriver.
 * It simulates a real user journey:
 *   1. Logging in as an Engineer.
 *   2. Navigating to the Knowledge Base.
 *   3. Asserting that the page elements render correctly.
 *
 * Requires the frontend to be running locally on http://localhost:5173
 */
@DisplayName("E2E Tests — Selenium Automation Framework")
@Disabled("Disabled in CI pipeline: requires running frontend server and local Chrome browser")
class SeleniumE2eTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeAll
    static void setupClass() {
        // Automatically manages the correct ChromeDriver binary
        WebDriverManager.chromedriver().setup();
    }

    @BeforeEach
    void setupTest() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Run headless for CI environments
        options.addArguments("--disable-gpu");
        options.addArguments("--window-size=1920,1080");
        
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    @DisplayName("[E2E] Support Engineer Login Journey")
    void testEngineerLoginJourney() {
        // 1. Navigate to the login page
        driver.get("http://localhost:5173/login");

        // 2. Wait for login form to load
        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("eisNumber")));
        WebElement passwordInput = driver.findElement(By.name("password"));
        WebElement loginButton = driver.findElement(By.xpath("//button[contains(text(), 'Login')]"));

        // 3. Fill in credentials
        usernameInput.sendKeys("88291000"); // Engineer EIS
        passwordInput.sendKeys("password"); // Mock password
        loginButton.click();

        // 4. Verify successful redirect to Dashboard
        wait.until(ExpectedConditions.urlContains("/dashboard"));
        assertThat(driver.getCurrentUrl()).contains("/dashboard");

        // 5. Verify the Sidebar contains 'Engineer Workspace'
        WebElement engineerMenu = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[contains(text(), 'Engineer Workspace')]")));
        assertThat(engineerMenu.isDisplayed()).isTrue();
    }

    @Test
    @DisplayName("[E2E] Knowledge Base Article Search")
    void testKnowledgeBaseSearch() {
        // 1. Setup session (assume logged in)
        driver.get("http://localhost:5173/knowledge-base");

        // 2. Wait for KB page to load
        WebElement searchBox = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[placeholder*='Search']")));

        // 3. Search for a specific term
        searchBox.sendKeys("Turbine");

        // 4. Verify article shows up
        WebElement articleTitle = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h3[contains(text(), 'Turbine Vibration Calibration')]")));
        assertThat(articleTitle.isDisplayed()).isTrue();
        
        // 5. Click the article and verify reader pane updates
        articleTitle.click();
        WebElement readerHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Turbine Vibration Calibration Protocol')]")));
        assertThat(readerHeader.isDisplayed()).isTrue();
    }
}
