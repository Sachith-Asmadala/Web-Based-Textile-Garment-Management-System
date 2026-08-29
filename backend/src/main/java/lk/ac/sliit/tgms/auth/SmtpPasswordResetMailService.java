package lk.ac.sliit.tgms.auth;

import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "tgms.auth.reset.smtp-enabled", havingValue = "true")
public class SmtpPasswordResetMailService implements PasswordResetMailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public SmtpPasswordResetMailService(
            JavaMailSender mailSender,
            @Value("${tgms.auth.reset.mail-from}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendPasswordReset(
            String recipient, String fullName, String resetUrl, Instant expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipient);
        message.setSubject("Reset your TGMS password");
        message.setText("Hello " + fullName + ",\n\n"
                + "A password reset was requested for your TGMS account.\n"
                + "Use this single-use link before " + expiresAt + ":\n\n"
                + resetUrl + "\n\n"
                + "If you did not request this change, you can ignore this email.\n"
                + "For your security, do not share this link with anyone.\n");
        mailSender.send(message);
    }
}
