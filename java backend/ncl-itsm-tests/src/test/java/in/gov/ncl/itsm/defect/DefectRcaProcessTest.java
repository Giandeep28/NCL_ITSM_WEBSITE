package in.gov.ncl.itsm.defect;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ============================================================================
 * TEST TECHNIQUE: Defect Management & Root Cause Analysis (RCA) Process
 * ============================================================================
 *
 * This test models the defect lifecycle mapping to systems like Jira,
 * confirming that defects properly undergo Root Cause Analysis classification.
 */
@DisplayName("Defect Management & RCA Testing")
class DefectRcaProcessTest {

    // Mock entity representing a Jira Defect Issue
    static class DefectIssue {
        String issueKey;
        String status;
        String rcaCategory;
        String rcaDescription;
        LocalDateTime resolutionTime;

        DefectIssue(String issueKey) {
            this.issueKey = issueKey;
            this.status = "OPEN";
        }
        
        void performRCA(String category, String description) {
            this.rcaCategory = category;
            this.rcaDescription = description;
            this.status = "RCA_COMPLETED";
        }

        void closeDefect() {
            if (!"RCA_COMPLETED".equals(this.status)) {
                throw new IllegalStateException("Cannot close defect without RCA");
            }
            this.status = "CLOSED";
            this.resolutionTime = LocalDateTime.now();
        }
    }

    @Test
    @DisplayName("[Defect Management] Cannot close a defect without performing RCA")
    void defect_cannotCloseWithoutRca() {
        DefectIssue defect = new DefectIssue("NCL-8422");
        
        assertThat(defect.status).isEqualTo("OPEN");
        
        assertThatThrownBy(defect::closeDefect)
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Cannot close defect without RCA");
    }

    @Test
    @DisplayName("[Root Cause Analysis] Successful RCA process allows closure")
    void defect_rcaProcess_allowsClosure() {
        DefectIssue defect = new DefectIssue("NCL-8423");

        // Perform RCA
        defect.performRCA("CODE_FAULT", "NullPointerException in SLA calculator due to missing timezone fallback");
        
        assertThat(defect.status).isEqualTo("RCA_COMPLETED");
        assertThat(defect.rcaCategory).isEqualTo("CODE_FAULT");

        // Close defect
        defect.closeDefect();

        assertThat(defect.status).isEqualTo("CLOSED");
        assertThat(defect.resolutionTime).isNotNull();
    }
}
