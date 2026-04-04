package com.servicehub.controller;

// IT HANDELS ALL THE APIS RELATED TO THE REVIEWS
//  Only customers can submit reviews, only admins can delete them, and everyone can read them

import com.servicehub.dto.request.ReviewRequest;
import com.servicehub.dto.response.ReviewResponse;
import com.servicehub.model.User;
import com.servicehub.security.CustomUserDetails;
import com.servicehub.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // POST /api/reviews — Customer submits a review after completed booking
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> submit(
            @AuthenticationPrincipal CustomUserDetails userDetails,  // ✅
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.submitReview(userDetails.getUser().getId(), request));
    }

    // GET /api/reviews/provider/{id} — Anyone views a provider's reviews
    @GetMapping("/provider/{id}")
    public ResponseEntity<List<ReviewResponse>> byProvider(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getProviderReviews(id));
    }

    // GET /api/reviews/my — Customer views all reviews they have written
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReviewResponse>> myReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails) {  // ✅
        return ResponseEntity.ok(reviewService.getCustomerReviews(userDetails.getUser().getId()));
    }

    // DELETE /api/reviews/{id} — Admin removes a fake or abusive review
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
