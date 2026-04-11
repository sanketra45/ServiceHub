package com.servicehub.service;

// THIS CLASS IS RESPONSIBLE FOR SENDING THE EMAILS TO THE USERS AND PROVIDERS
// IT SENDS NOTIFICATION(EMAILS) WHEN THE SERVICE LAYER CALLS THIS METHOD
// WHEN SIGNUP, BOOKING CREATED AND STATUS UPDATE

import com.servicehub.model.Booking;
import com.servicehub.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    // --- Core send method ---
    // All email methods call this. @Async means emails are sent
    // in a background thread so the API response isn't delayed.
    @Async
    public void sendEmail(String toEmail, String subject, String htmlBody, byte[] attachment, String fileName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            if (attachment != null && fileName != null) {
                helper.addAttachment(fileName, new org.springframework.core.io.ByteArrayResource(attachment));
            }
            mailSender.send(message);
            log.info("Email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendEmail(String toEmail, String subject, String htmlBody) {
        sendEmail(toEmail, subject, htmlBody, null, null);
    }

    // --- Booking confirmation to customer ---
    // Triggered when a new booking is created (status = PENDING)
    @Async
    public void sendBookingConfirmation(Booking booking) {
        String subject = "Booking Confirmed - ProPavilion #" + booking.getId();
        String body = buildBookingConfirmationHtml(booking);
        sendEmail(booking.getCustomer().getEmail(), subject, body);
    }

    // --- Booking notification to provider ---
    // Triggered when a customer books the provider — they need to accept or reject
    @Async
    public void sendBookingReceiptEmail(Booking booking, byte[] pdfBytes) {
        String subject = "Your Booking Receipt - ServiceHub #" + booking.getId();
        String body = buildBookingConfirmationHtml(booking);
        sendEmail(booking.getCustomer().getEmail(), subject, body, pdfBytes, "Receipt_" + booking.getId() + ".pdf");
    }

    // --- Booking notification to provider ---
    // Triggered when a customer books the provider — they need to accept or reject
    @Async
    public void sendNewBookingNotificationToProvider(Booking booking) {
        String subject = "New Booking Request - ProPavilion #" + booking.getId();
        String body = buildProviderNotificationHtml(booking);
        sendEmail(booking.getProvider().getUser().getEmail(), subject, body);
    }

    // --- Status update email to customer ---
    // Triggered whenever booking status changes (ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED)
    @Async
    public void sendStatusUpdateEmail(Booking booking) {
        String subject = "Booking Update - " + booking.getStatus() + " | ProPavilion #" + booking.getId();
        String body = buildStatusUpdateHtml(booking);
        sendEmail(booking.getCustomer().getEmail(), subject, body);
    }

    // --- Welcome email to new user ---
    // Triggered after successful registration
    @Async
    public void sendWelcomeEmail(User user) {
        String subject = "Welcome to ProPavilion!";
        String body = buildWelcomeHtml(user);
        sendEmail(user.getEmail(), subject, body);
    }

    // -----------------------------------------------
    // HTML Templates
    // -----------------------------------------------

    private String buildBookingConfirmationHtml(Booking booking) {
        return """
            <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7fbf0; padding: 32px; border-radius: 16px;">
                <div style="background: #00598f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">ProPavilion</h1>
                    <p style="color: #cfe5ff; margin: 4px 0 0;">Booking Confirmed</p>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e0e4da;">
                    <h2 style="color: #181d17; margin-top: 0;">Hi %s 👋</h2>
                    <p style="color: #465860;">Your booking has been placed successfully. Here are your details:</p>
                    <div style="background: #f1f5eb; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 6px 0;"><strong>Booking ID:</strong> #%d</p>
                        <p style="margin: 6px 0;"><strong>Service:</strong> %s</p>
                        <p style="margin: 6px 0;"><strong>Provider:</strong> %s</p>
                        <p style="margin: 6px 0;"><strong>Date:</strong> %s</p>
                        <p style="margin: 6px 0;"><strong>Time:</strong> %s</p>
                        <p style="margin: 6px 0;"><strong>Address:</strong> %s</p>
                        <p style="margin: 6px 0;"><strong>Estimated Amount:</strong> ₹%.2f</p>
                        <p style="margin: 6px 0;"><strong>Status:</strong> <span style="color: #006e1c; font-weight: bold;">PENDING</span></p>
                    </div>
                    <p style="color: #465860; font-size: 14px;">The provider will confirm your booking shortly.</p>
                    <a href="%s/bookings/%d" style="display: inline-block; background: #00598f; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; margin-top: 16px;">View Booking</a>
                </div>
                <p style="text-align: center; color: #707a6c; font-size: 12px; margin-top: 16px;">© 2024 ProPavilion Marketplace</p>
            </div>
            """.formatted(
                booking.getCustomer().getName(),
                booking.getId(),
                booking.getServiceType(),
                booking.getProvider().getUser().getName(),
                booking.getBookingDate(),
                booking.getTimeSlot(),
                booking.getAddress(),
                booking.getTotalAmount(),
                baseUrl,
                booking.getId()
        );
    }

    private String buildProviderNotificationHtml(Booking booking) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7fbf0; padding: 32px; border-radius: 16px;">
                <div style="background: #006e1c; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">ProPavilion</h1>
                    <p style="color: #98f994; margin: 4px 0 0;">New Booking Request</p>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e0e4da;">
                    <h2 style="color: #181d17; margin-top: 0;">Hi %s,</h2>
                    <p style="color: #465860;">You have a new booking request. Please accept or decline it.</p>
                    <div style="background: #f1f5eb; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 6px 0;"><strong>Booking ID:</strong> #%d</p>
                        <p style="margin: 6px 0;"><strong>Customer:</strong> %s</p>
                        <p style="margin: 6px 0;"><strong>Service:</strong> %s</p>
                        <p style="margin: 6px 0;"><strong>Date:</strong> %s at %s</p>
                        <p style="margin: 6px 0;"><strong>Address:</strong> %s</p>
                        <p style="margin: 6px 0;"><strong>Description:</strong> %s</p>
                    </div>
                    <a href="%s/provider/bookings/%d" style="display: inline-block; background: #006e1c; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">View & Respond</a>
                </div>
            </div>
            """.formatted(
                booking.getProvider().getUser().getName(),
                booking.getId(),
                booking.getCustomer().getName(),
                booking.getServiceType(),
                booking.getBookingDate(),
                booking.getTimeSlot(),
                booking.getAddress(),
                booking.getDescription() != null ? booking.getDescription() : "N/A",
                baseUrl,
                booking.getId()
        );
    }

    private String buildStatusUpdateHtml(Booking booking) {
        String statusColor = switch (booking.getStatus()) {
            case ACCEPTED    -> "#006e1c";
            case IN_PROGRESS -> "#00598f";
            case COMPLETED   -> "#0c7521";
            case CANCELLED   -> "#ba1a1a";
            default          -> "#465860";
        };

        String statusMessage = switch (booking.getStatus()) {
            case ACCEPTED    -> "Great news! Your booking has been accepted by the provider.";
            case IN_PROGRESS -> "Your service is currently in progress.";
            case COMPLETED   -> "Your service has been completed. Please leave a review!";
            case CANCELLED   -> "Your booking has been cancelled.";
            default          -> "Your booking status has been updated.";
        };

        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7fbf0; padding: 32px; border-radius: 16px;">
                <div style="background: %s; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">ProPavilion</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Booking Status Update</p>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e0e4da;">
                    <h2 style="color: #181d17; margin-top: 0;">Hi %s,</h2>
                    <p style="color: #465860;">%s</p>
                    <div style="background: #f1f5eb; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 6px 0;"><strong>Booking ID:</strong> #%d</p>
                        <p style="margin: 6px 0;"><strong>Service:</strong> %s</p>
                        <p style="margin: 6px 0;"><strong>New Status:</strong> <span style="color: %s; font-weight: bold;">%s</span></p>
                    </div>
                    <a href="%s/bookings/%d" style="display: inline-block; background: %s; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">View Booking</a>
                </div>
            </div>
            """.formatted(
                statusColor,
                booking.getCustomer().getName(),
                statusMessage,
                booking.getId(),
                booking.getServiceType(),
                statusColor,
                booking.getStatus(),
                baseUrl,
                booking.getId(),
                statusColor
        );
    }

    private String buildWelcomeHtml(User user) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7fbf0; padding: 32px; border-radius: 16px;">
                <div style="background: #00598f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">ProPavilion</h1>
                    <p style="color: #cfe5ff; margin: 4px 0 0;">Welcome aboard!</p>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e0e4da;">
                    <h2 style="color: #181d17; margin-top: 0;">Welcome, %s! 🎉</h2>
                    <p style="color: #465860;">Your account has been created successfully as a <strong>%s</strong>.</p>
                    <p style="color: #465860;">You can now browse services, book professionals, and manage everything from your dashboard.</p>
                    <a href="%s" style="display: inline-block; background: #00598f; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; margin-top: 16px;">Get Started</a>
                </div>
                <p style="text-align: center; color: #707a6c; font-size: 12px; margin-top: 16px;">© 2024 ProPavilion Marketplace</p>
            </div>
            """.formatted(user.getName(), user.getRole(), baseUrl);
    }
}