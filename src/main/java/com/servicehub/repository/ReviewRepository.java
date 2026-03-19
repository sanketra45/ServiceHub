package com.servicehub.repository;

// IT MANAGES RATINGS AND REVIEWS FOR THE SERVICE PROVIDERS
// IT RETURNS ALL THE REVIES FOR A SERVICE PROVIDER

import com.servicehub.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProviderId(Long providerId);

    List<Review> findByCustomerId(Long customerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.provider.id = :providerId")
    Double findAverageRatingByProviderId(@Param("providerId") Long providerId);

    long countByProviderId(Long providerId);
}
