package in.gov.ncl.itsm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Minimal Spring Boot bootstrap used exclusively by the ncl-itsm-tests module.
 * This avoids the dependency on the ncl-itsm-config fat-jar (repackaged Spring Boot
 * executable) which is not resolvable as a regular Maven compile-time dependency.
 *
 * The component scan covers the full in.gov.ncl.itsm.* package tree so all
 * application beans (Auth, User, Audit, etc.) are loaded during tests.
 */
@SpringBootApplication(scanBasePackages = "in.gov.ncl.itsm")
public class TestApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
}
