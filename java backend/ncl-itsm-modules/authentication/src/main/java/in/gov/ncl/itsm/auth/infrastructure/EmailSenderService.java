package in.gov.ncl.itsm.auth.infrastructure;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSenderService {

    private final JavaMailSender mailSender;

    @Value("${ncl.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:noreply@ncl.gov.in}")
    private String fromEmail;

    public EmailSenderService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String recipientEmail, String recipientName, String otp, String subjectType) {
        if (mailEnabled && mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(recipientEmail);
                message.setSubject("NCL HQ ITSM Platform - " + subjectType);
                message.setText("Dear " + recipientName + ",\n\n"
                        + "Your OTP code is: " + otp + "\n"
                        + "This code is valid for 5 minutes. Please do not share this code with anyone.\n\n"
                        + "Best regards,\n"
                        + "NCL HQ ITSM Security Team");
                mailSender.send(message);
                System.out.println("📬 Real email successfully sent to " + recipientEmail);
            } catch (Exception e) {
                System.err.println("❌ Failed to send real email to " + recipientEmail + ": " + e.getMessage());
                // Fallback to console printing in case SMTP connection fails
                printSimulatedEmail(recipientEmail, recipientName, otp, subjectType);
            }
        } else {
            printSimulatedEmail(recipientEmail, recipientName, otp, subjectType);
        }
    }

    private void printSimulatedEmail(String recipientEmail, String recipientName, String otp, String subjectType) {
        System.out.println("=================================================");
        System.out.println("📧 SIMULATED " + subjectType.toUpperCase() + " EMAIL DISPATCH");
        System.out.println("Recipient Email: " + recipientEmail + " (" + recipientName + ")");
        System.out.println("OTP Code: " + otp);
        System.out.println("=================================================");
    }
}
