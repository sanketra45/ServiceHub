package com.servicehub.service;

// IT IS THE BRAIN OF THE PROVIDER SYSTEM
// IT HANDELS :
// 1. creating and updating the provider profile
// 2. searching by service type, city, rating and price
// 3. nearby provider lookup using lat/long boundary
// 4. admin verification toggle
// 5. A basic AI-style recommendation score

import com.servicehub.dto.request.ProviderRequest;
import com.servicehub.dto.response.ProviderResponse;
import com.servicehub.model.ServiceProvider;
import com.servicehub.model.User;
import com.servicehub.repository.ServiceProviderRepository;
import com.servicehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ServiceProviderRepository providerRepository;
    private final UserRepository userRepository;

    // --- Create or update provider profile ---
    // Called when a PROVIDER role user sets up their profile for the first time
    public ProviderResponse createProfile(Long userId, ProviderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent duplicate profiles
        if (providerRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Provider profile already exists");
        }

        ServiceProvider provider = ServiceProvider.builder()
                .user(user)
                .serviceType(request.getServiceType())
                .description(request.getDescription())
                .city(request.getCity())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .hourlyRate(request.getHourlyRate())
                .experienceYears(request.getExperienceYears())
                .servicesOffered(request.getServicesOffered())
                .build();

        return mapToResponse(providerRepository.save(provider));
    }

    // --- Update existing provider profile ---
    public ProviderResponse updateProfile(Long userId, ProviderRequest request) {
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        provider.setServiceType(request.getServiceType());
        provider.setDescription(request.getDescription());
        provider.setCity(request.getCity());
        provider.setAddress(request.getAddress());
        provider.setLatitude(request.getLatitude());
        provider.setLongitude(request.getLongitude());
        provider.setHourlyRate(request.getHourlyRate());
        provider.setExperienceYears(request.getExperienceYears());
        provider.setServicesOffered(request.getServicesOffered());

        return mapToResponse(providerRepository.save(provider));
    }

    // --- Get single provider by ID ---
    public ProviderResponse getById(Long id) {
        return providerRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
    }

    // --- Get provider profile of the logged-in user ---
    public ProviderResponse getMyProfile(Long userId) {
        return providerRepository.findByUserId(userId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));
    }

    // --- Search with filters ---
    // Accepts optional params — if null, that filter is skipped
    public List<ProviderResponse> search(String serviceType, String city,
                                         Double minRating, Double maxPrice,
                                         String sortBy) {
        List<ServiceProvider> results;

        // Fetch based on available filters
        if (serviceType != null && city != null && minRating != null) {
            results = providerRepository
                    .findByServiceTypeIgnoreCaseAndCityIgnoreCaseAndAverageRatingGreaterThanEqual(
                            serviceType, city, minRating);
        } else if (serviceType != null && city != null) {
            results = providerRepository
                    .findByServiceTypeIgnoreCaseAndCityIgnoreCase(serviceType, city);
        } else if (serviceType != null) {
            results = providerRepository.findByServiceTypeIgnoreCase(serviceType);
        } else if (city != null) {
            results = providerRepository.findByCityIgnoreCase(city);
        } else {
            results = providerRepository.findAll();
        }

        // Apply price filter in memory
        if (maxPrice != null) {
            results = results.stream()
                    .filter(p -> p.getHourlyRate() <= maxPrice)
                    .collect(Collectors.toList());
        }

        // Sort results
        if ("price".equalsIgnoreCase(sortBy)) {
            results.sort((p1, p2) -> Double.compare(
                    p1.getHourlyRate() != null ? p1.getHourlyRate() : 0.0,
                    p2.getHourlyRate() != null ? p2.getHourlyRate() : 0.0));
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            results.sort((p1, p2) -> Double.compare(
                    p2.getAverageRating() != null ? p2.getAverageRating() : 0.0,
                    p1.getAverageRating() != null ? p1.getAverageRating() : 0.0));
        } else if ("experience".equalsIgnoreCase(sortBy)) {
            results.sort((p1, p2) -> Integer.compare(
                    p2.getExperienceYears() != null ? p2.getExperienceYears() : 0,
                    p1.getExperienceYears() != null ? p1.getExperienceYears() : 0));
        }

        return results.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // --- Find nearby providers using lat/lng bounding box ---
    // ~1 degree lat/lng ≈ 111km, so 0.05 ≈ 5.5km radius
    public List<ProviderResponse> findNearby(Double lat, Double lng, Double radiusKm) {
        double delta = (radiusKm != null ? radiusKm : 10.0) / 111.0;
        return providerRepository
                .findNearby(lat - delta, lat + delta, lng - delta, lng + delta)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- AI-style recommendation score ---
    // Used to rank providers smartly: considers rating, experience, and verified status
    // Score = (rating * 0.5) + (min(experience,10)/10 * 0.3) + (verified ? 0.2 : 0)
    public List<ProviderResponse> getRecommended(String serviceType, String city) {
        List<ServiceProvider> providers;

        if (serviceType != null && city != null) {
            providers = providerRepository
                    .findByServiceTypeIgnoreCaseAndCityIgnoreCase(serviceType, city);
        } else if (serviceType != null) {
            providers = providerRepository.findByServiceTypeIgnoreCase(serviceType);
        } else {
            providers = providerRepository.findByVerifiedTrue();
        }

        return providers.stream()
                .sorted(Comparator.comparingDouble(this::recommendationScore).reversed())
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private double recommendationScore(ServiceProvider p) {
        double ratingScore = (p.getAverageRating() / 5.0) * 0.5;
        double expScore = (Math.min(p.getExperienceYears(), 10) / 10.0) * 0.3;
        double verifiedBonus = p.isVerified() ? 0.2 : 0.0;
        return ratingScore + expScore + verifiedBonus;
    }

    // --- Admin: toggle verified badge ---
    public ProviderResponse toggleVerification(Long providerId) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setVerified(!provider.isVerified());
        return mapToResponse(providerRepository.save(provider));
    }

    // --- Helper: maps entity to response DTO ---
    public ProviderResponse mapToResponse(ServiceProvider p) {
        return ProviderResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .name(p.getUser().getName())
                .email(p.getUser().getEmail())
                .phone(p.getUser().getPhone())
                .serviceType(p.getServiceType())
                .description(p.getDescription())
                .city(p.getCity())
                .address(p.getAddress())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .hourlyRate(p.getHourlyRate())
                .experienceYears(p.getExperienceYears())
                .averageRating(p.getAverageRating())
                .totalReviews(p.getTotalReviews())
                .verified(p.isVerified())
                .photoUrl(p.getPhotoUrl())
                .servicesOffered(p.getServicesOffered())
                .workImages(p.getWorkImages()) // ✅ add this line
                .build();
    }

    // --- Enhanced AI Recommendation ---
// Score formula:
//   40% → rating (out of 5)
//   25% → experience (capped at 10 years)
//   20% → verified badge bonus
//   15% → proximity (inverse distance, only if lat/lng provided)
    public List<ProviderResponse> getAIRecommendations(
            String serviceType, String city,
            Double userLat, Double userLng) {

        List<ServiceProvider> pool;

        if (serviceType != null && city != null) {
            pool = providerRepository
                    .findByServiceTypeIgnoreCaseAndCityIgnoreCase(serviceType, city);
        } else if (serviceType != null) {
            pool = providerRepository.findByServiceTypeIgnoreCase(serviceType);
        } else if (city != null) {
            pool = providerRepository.findByCityIgnoreCase(city);
        } else {
            pool = providerRepository.findAll();
            // Just take a subset if we are doing a massive search (assuming table isn't gigantic)
        }

        return pool.stream()
                .filter(p -> p.getUser().isEnabled() && p.getHourlyRate() != null)
                .sorted(Comparator.comparingDouble(
                        p -> -aiScore(p, userLat, userLng)))  // descending
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private double aiScore(ServiceProvider p, Double userLat, Double userLng) {
        double ratingScore  = (p.getAverageRating() / 5.0) * 0.40;
        double expScore     = (Math.min(p.getExperienceYears() != null
                ? p.getExperienceYears() : 0, 10) / 10.0) * 0.25;
        double verifiedScore = p.isVerified() ? 0.20 : 0.0;

        double proximityScore = 0.0;
        if (userLat != null && userLng != null
                && p.getLatitude() != null && p.getLongitude() != null) {
            double distKm = haversineDistance(
                    userLat, userLng, p.getLatitude(), p.getLongitude());
            // Closer = higher score. Max bonus at 0km, zero bonus at 50km+
            proximityScore = Math.max(0, (50.0 - distKm) / 50.0) * 0.15;
        } else {
            // No location provided — redistribute weight to rating
            ratingScore += 0.15;
        }

        return ratingScore + expScore + verifiedScore + proximityScore;
    }

    // Haversine formula — calculates real-world distance between two lat/lng points
    private double haversineDistance(double lat1, double lng1,
                                     double lat2, double lng2) {
        final double R = 6371.0; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public ServiceProvider getByUserId(Long userId) {
        return providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
    }

    public List<String> getCities() {
        return providerRepository.findDistinctCities();
    }
}
