package com.servicehub.repository;



import com.servicehub.model.EmergencyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmergencyRepository extends JpaRepository<EmergencyRequest, Long> {
    List<EmergencyRequest> findByCustomerIdOrderByRequestedAtDesc(Long customerId);
    List<EmergencyRequest> findByAssignedProviderIdOrderByRequestedAtDesc(Long providerId);
    List<EmergencyRequest> findByStatus(String status);
}
