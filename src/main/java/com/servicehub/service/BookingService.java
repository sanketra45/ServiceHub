package com.servicehub.service;

import com.servicehub.dto.request.BookingRequest;
import com.servicehub.dto.response.BookingResponse;
import com.servicehub.dto.response.ProviderResponse;
import com.servicehub.model.*;
import com.servicehub.model.enums.BookingStatus;
import com.servicehub.model.enums.PaymentStatus;
import com.servicehub.repository.*;
import com.servicehub.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final MessageService messageService;
    private final PdfService pdfService;

    public PdfService getPdfService() {
        return pdfService;
    }

    public BookingResponse createBooking(Long customerId, BookingRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        ServiceProvider provider = providerRepository.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        boolean slotTaken = bookingRepository.existsByProviderIdAndBookingDateAndTimeSlot(
                request.getProviderId(), request.getBookingDate(), request.getTimeSlot());

        if (slotTaken) {
            throw new RuntimeException("This time slot is already booked");
        }

        Double total = provider.getHourlyRate();

        Booking booking = Booking.builder()
                .customer(customer)
                .provider(provider)
                .serviceType(request.getServiceType())
                .description(request.getDescription())
                .bookingDate(request.getBookingDate())
                .timeSlot(request.getTimeSlot())
                .address(request.getAddress())
                .totalAmount(total)
                .status(BookingStatus.PENDING)

                // 🔥🔥🔥 MAIN FIX (DON’T MISS THIS)
                .paymentStatus(PaymentStatus.PENDING)

                .build();

        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    public void sendBookingConfirmations(Booking booking) {
        emailService.sendBookingConfirmation(booking);
        emailService.sendNewBookingNotificationToProvider(booking);
        messageService.sendBookingMessage(booking);
        try {
            byte[] pdfBytes = pdfService.generateBookingReceipt(booking);
            emailService.sendBookingReceiptEmail(booking, pdfBytes);
        } catch (Exception e) {
            // Log error but don't block
            System.err.println("Failed to generate and send receipt pdf: " + e.getMessage());
        }
    }

    public BookingResponse updateStatus(Long bookingId, BookingStatus newStatus,
                                        Long requesterId, String requesterRole) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        validateStatusTransition(booking, newStatus, requesterId, requesterRole);
        booking.setStatus(newStatus);

        Booking updatedBooking = bookingRepository.save(booking);
        emailService.sendStatusUpdateEmail(updatedBooking);

        return mapToResponse(updatedBooking);
    }

    private void validateStatusTransition(Booking booking, BookingStatus newStatus,
                                          Long requesterId, String role) {
        BookingStatus current = booking.getStatus();

        if ("ADMIN".equals(role)) return;

        if ("PROVIDER".equals(role)) {
            Long providerId = booking.getProvider().getUser().getId();
            if (!providerId.equals(requesterId)) {
                throw new RuntimeException("Not your booking");
            }

            if (!((current == BookingStatus.PENDING && newStatus == BookingStatus.ACCEPTED) ||
                    (current == BookingStatus.ACCEPTED && newStatus == BookingStatus.IN_PROGRESS) ||
                    (current == BookingStatus.IN_PROGRESS && newStatus == BookingStatus.COMPLETED))) {
                throw new RuntimeException("Invalid status transition for provider");
            }
        }

        if ("CUSTOMER".equals(role)) {
            if (!booking.getCustomer().getId().equals(requesterId)) {
                throw new RuntimeException("Not your booking");
            }

            if (!(current == BookingStatus.PENDING && newStatus == BookingStatus.CANCELLED)) {
                throw new RuntimeException("Customer can only cancel pending bookings");
            }
        }
    }

    public List<BookingResponse> getCustomerBookings(Long customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID || b.getPaymentStatus() == PaymentStatus.REFUNDED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getProviderBookings(Long userId) {
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        return bookingRepository.findByProviderId(provider.getId())
                .stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID || b.getPaymentStatus() == PaymentStatus.REFUNDED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public Booking getBookingEntityById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public ProviderResponse emergencyBook(String serviceType, String city,
                                          com.servicehub.service.ProviderService providerService) {
        return providerRepository
                .findByServiceTypeIgnoreCaseAndCityIgnoreCase(serviceType, city)
                .stream()
                .filter(p -> p.isVerified())
                .max(java.util.Comparator.comparingDouble(ServiceProvider::getAverageRating))
                .map(providerService::mapToResponse)
                .orElseThrow(() -> new RuntimeException(
                        "No available verified providers for " + serviceType + " in " + city));
    }

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .customerId(b.getCustomer().getId())
                .customerName(b.getCustomer().getName())
                .providerId(b.getProvider().getId())
                .providerName(b.getProvider().getUser().getName())
                .serviceType(b.getServiceType())
                .description(b.getDescription())
                .bookingDate(b.getBookingDate())
                .timeSlot(b.getTimeSlot())
                .status(b.getStatus())
                .totalAmount(b.getTotalAmount())
                .address(b.getAddress())
                .createdAt(b.getCreatedAt())
                .build();
    }
}