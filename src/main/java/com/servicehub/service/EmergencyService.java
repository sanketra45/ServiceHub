package com.servicehub.service;

// This is the core logic — find the best available verified provider using the AI score,
// auto-assign them, save the request, and fire a notification email.

import com.servicehub.model.*;
import com.servicehub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmergencyService {

    private final EmergencyRepository emergencyRepository;
    private final ServiceProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // --- Create emergency request and auto-assign best provider ---
    public EmergencyRequest createEmergency(Long customerId, String serviceType,
                                            String city, String description,
                                            String address, Double lat, Double lng) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Find verified providers for this service in this city
        List<ServiceProvider> candidates = providerRepository
                .findByServiceTypeIgnoreCaseAndCityIgnoreCase(serviceType, city)
                .stream()
                .filter(ServiceProvider::isVerified)
                .toList();

        if (candidates.isEmpty()) {
            // Try without city filter if none found locally
            candidates = providerRepository
                    .findByServiceTypeIgnoreCase(serviceType)
                    .stream()
                    .filter(ServiceProvider::isVerified)
                    .toList();
        }

        if (candidates.isEmpty()) {
            throw new RuntimeException(
                    "No verified providers available for " + serviceType);
        }

        // Pick the best one using AI score
        final Double userLat = lat;
        final Double userLng = lng;
        ServiceProvider best = candidates.stream()
                .max(Comparator.comparingDouble(
                        p -> aiScore(p, userLat, userLng)))
                .orElseThrow();

        EmergencyRequest request = EmergencyRequest.builder()
                .customer(customer)
                .assignedProvider(best)
                .serviceType(serviceType)
                .city(city)
                .description(description)
                .address(address)
                .latitude(lat)
                .longitude(lng)
                .status("PROVIDER_FOUND")
                .build();

        EmergencyRequest saved = emergencyRepository.save(request);

        // Notify provider immediately
        emailService.sendEmail(
                best.getUser().getEmail(),
                "🚨 Emergency Request — " + serviceType,
                buildEmergencyEmailHtml(saved, best)
        );

        return saved;
    }

    // Get emergency history for a customer
    public List<EmergencyRequest> getCustomerEmergencies(Long customerId) {
        return emergencyRepository
                .findByCustomerIdOrderByRequestedAtDesc(customerId);
    }

    // Get emergency requests assigned to a provider
    public List<EmergencyRequest> getProviderEmergencies(Long userId) {
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        return emergencyRepository
                .findByAssignedProviderIdOrderByRequestedAtDesc(provider.getId());
    }

    // Admin — all pending emergencies
    public List<EmergencyRequest> getPendingEmergencies() {
        return emergencyRepository.findByStatus("PROVIDER_FOUND");
    }

    private double aiScore(ServiceProvider p, Double lat, Double lng) {
        double score = (p.getAverageRating() / 5.0) * 0.55
                + (Math.min(p.getExperienceYears() != null
                ? p.getExperienceYears() : 0, 10) / 10.0) * 0.25
                + (p.isVerified() ? 0.20 : 0.0);
        if (lat != null && lng != null
                && p.getLatitude() != null && p.getLongitude() != null) {
            double d = haversine(lat, lng, p.getLatitude(), p.getLongitude());
            score += Math.max(0, (50.0 - d) / 50.0) * 0.15;
        }
        return score;
    }

    private double haversine(double lat1, double lng1,
                             double lat2, double lng2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng/2) * Math.sin(dLng/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private String buildEmergencyEmailHtml(EmergencyRequest req,
                                           ServiceProvider provider) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;
                        background:#fff3cd;padding:32px;border-radius:16px;
                        border:2px solid #ff6b35;">
                <h2 style="color:#c0392b;">🚨 Emergency Service Request</h2>
                <p>Hi <strong>%s</strong>, you have been auto-assigned an emergency request.</p>
                <div style="background:white;padding:16px;border-radius:8px;">
                    <p><strong>Service:</strong> %s</p>
                    <p><strong>Customer:</strong> %s</p>
                    <p><strong>Address:</strong> %s</p>
                    <p><strong>Description:</strong> %s</p>
                    <p><strong>Requested at:</strong> %s</p>
                </div>
                <p style="color:#c0392b;font-weight:bold;">
                    Please respond immediately.</p>
            </div>
            """.formatted(
                provider.getUser().getName(),
                req.getServiceType(),
                req.getCustomer().getName(),
                req.getAddress() != null ? req.getAddress() : "N/A",
                req.getDescription() != null ? req.getDescription() : "N/A",
                req.getRequestedAt()
        );
    }
}
