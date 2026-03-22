package com.servicehub.service;

// IT IS THE FULL ADMIN CONTROL PANEL
// It lets admins see all users, all bookings, manage providers, remove fake reviews,
// and get platform-wide stats like total revenue, total users, and most popular service types

import com.servicehub.dto.response.*;
import com.servicehub.model.User;
import com.servicehub.model.enums.BookingStatus;
import com.servicehub.repository.*;
import lombok.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final ProviderService providerService;
    private final ReviewService reviewService;

    // --- Get all users (customers + providers) ---
    // Used to display the user management table in admin dashboard
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToAdminUser)
                .collect(Collectors.toList());
    }

    // --- Enable / disable a user account ---
    // Disabling blocks login without deleting the account
    public AdminUserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return mapToAdminUser(user);
    }

    // --- Permanently delete a user ---
    // Should cascade-delete their bookings, reviews etc. (add @Cascade in entities if needed)
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    // --- Get all providers (pending verification + verified) ---
    public List<ProviderResponse> getAllProviders() {
        return providerRepository.findAll().stream()
                .map(providerService::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- Get only unverified providers awaiting approval ---
    public List<ProviderResponse> getPendingProviders() {
        return providerRepository.findAll().stream()
                .filter(p -> !p.isVerified())
                .map(providerService::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- Get all bookings across the platform ---
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    // --- Delete a fake or abusive review ---
    public void removeReview(Long reviewId) {
        reviewService.deleteReview(reviewId);
    }

    // --- Platform statistics ---
    // Returns key metrics for the admin dashboard summary cards
    public AdminStatsResponse getStats() {
        long totalUsers     = userRepository.count();
        long totalProviders = providerRepository.count();
        long totalBookings  = bookingRepository.count();

        long completedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();

        long pendingBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING).count();

        // Total revenue = sum of all completed booking amounts
        double totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
                .sum();

        long verifiedProviders = providerRepository.findByVerifiedTrue().size();

        // Most popular service type by booking count
        String topService = bookingRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        b -> b.getServiceType(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalProviders(totalProviders)
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .pendingBookings(pendingBookings)
                .totalRevenue(totalRevenue)
                .verifiedProviders(verifiedProviders)
                .topServiceType(topService)
                .build();
    }

    // --- Helpers ---
    private AdminUserResponse mapToAdminUser(User u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .enabled(u.isEnabled())
                .build();
    }

    private BookingResponse mapToBookingResponse(com.servicehub.model.Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .customerId(b.getCustomer().getId())
                .customerName(b.getCustomer().getName())
                .providerId(b.getProvider().getId())
                .providerName(b.getProvider().getUser().getName())
                .serviceType(b.getServiceType())
                .bookingDate(b.getBookingDate())
                .timeSlot(b.getTimeSlot())
                .status(b.getStatus())
                .totalAmount(b.getTotalAmount())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
