package in.gov.ncl.itsm;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = NCLItsmApplication.class)
@ActiveProfiles("test")
class NCLItsmApplicationTests {

    @Test
    void contextLoads() {
        // Simple test to verify context loaded successfully
    }
}
