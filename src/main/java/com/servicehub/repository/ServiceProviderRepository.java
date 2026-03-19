package com.servicehub.repository;

// IT HANDELS DATABASE OPERATIONS FOR SERVICE PROVIDERS
// IT IS USED TO FETCHED PROVIDERS BY CITY, TYPE, RATING

import com.servicehub.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {

    List<ServiceProvider> findByServiceTypeIgnoreCase(String serviceType);

    List<ServiceProvider> findByCityIgnoreCase(String city);

    List<ServiceProvider> findByServiceTypeIgnoreCaseAndCityIgnoreCase(
            String serviceType, String city);

    List<ServiceProvider> findByVerifiedTrue();

    Optional<ServiceProvider> findByUserId(Long userId);

    // Find providers by min rating
    List<ServiceProvider> findByAverageRatingGreaterThanEqual(Double rating);

    // Find by service type, city and min rating
    List<ServiceProvider> findByServiceTypeIgnoreCaseAndCityIgnoreCaseAndAverageRatingGreaterThanEqual(
            String serviceType, String city, Double rating);

    // Nearby providers (within bounding box — use Google Maps for precise distance)
    @Query("SELECT p FROM ServiceProvider p WHERE " +
            "p.latitude BETWEEN :minLat AND :maxLat AND " +
            "p.longitude BETWEEN :minLng AND :maxLng")
    List<ServiceProvider> findNearby(
            @Param("minLat") Double minLat, @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng, @Param("maxLng") Double maxLng);
}
