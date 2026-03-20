package com.servicehub.service;

// THIS IS THE MAIN LOGIC CLASS OF THE REVIEW

import com.servicehub.dto.request.ReviewRequest;
import com.servicehub.dto.response.ReviewResponse;
import com.servicehub.model.*;
import com.servicehub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ServiceProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    // --- Submit a review ---
    // Only allowed after a booking is COMPLETED
    // Recalculates and saves the provider's average rating immediately
    public ReviewResponse submitReview(Long customerId, ReviewRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        ServiceProvider provider = providerRepository.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Gate: only completed bookings can be reviewed
        if (booking.getStatus() != com.servicehub.model.enums.BookingStatus.COMPLETED) {
            throw new RuntimeException("Can only review completed bookings");
        }

        // Gate: customer must own the booking
        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("You can only review your own bookings");
        }

        Review review = Review.builder()
                .customer(customer)
                .provider(provider)
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        reviewRepository.save(review);

        // Recalculate and persist provider's average rating
        recalculateRating(provider);

        return mapToResponse(review);
    }

    // --- Get all reviews for a provider ---
    public List<ReviewResponse> getProviderReviews(Long providerId) {
        return reviewRepository.findByProviderId(providerId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // --- Get all reviews written by a customer ---
    public List<ReviewResponse> getCustomerReviews(Long customerId) {
        return reviewRepository.findByCustomerId(customerId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // --- Admin: delete a fake/abusive review ---
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        ServiceProvider provider = review.getProvider();
        reviewRepository.delete(review);
        recalculateRating(provider); // Recalculate after deletion too
    }

    // --- Recalculate average rating from all reviews in DB ---
    // This keeps averageRating always accurate, even after deletions
    private void recalculateRating(ServiceProvider provider) {
        Double avg = reviewRepository.findAverageRatingByProviderId(provider.getId());
        long count = reviewRepository.countByProviderId(provider.getId());
        provider.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        provider.setTotalReviews((int) count);
        providerRepository.save(provider);
    }

    // --- Helper: maps entity to response DTO ---
    private ReviewResponse mapToResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .customerId(r.getCustomer().getId())
                .customerName(r.getCustomer().getName())
                .providerId(r.getProvider().getId())
                .providerName(r.getProvider().getUser().getName())
                .bookingId(r.getBooking().getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
