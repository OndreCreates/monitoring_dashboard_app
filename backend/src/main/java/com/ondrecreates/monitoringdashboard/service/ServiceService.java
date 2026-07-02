package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.api.dto.ServiceRequest;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.exception.ResourceNotFoundException;
import com.ondrecreates.monitoringdashboard.repository.ServiceRepository;
import java.util.List;
import org.springframework.stereotype.Component;

// @Component instead of @Service — the domain entity is already named "Service",
// so importing org.springframework.stereotype.Service here would clash with it.
@Component
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final EventService eventService;

    public ServiceService(ServiceRepository serviceRepository, EventService eventService) {
        this.serviceRepository = serviceRepository;
        this.eventService = eventService;
    }

    public List<Service> findAll() {
        return serviceRepository.findAll();
    }

    public Service findById(Long id) {
        return serviceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service " + id + " not found"));
    }

    public Service create(ServiceRequest request) {
        Service service = new Service();
        service.setName(request.name());
        service.setUrl(request.url());
        Service saved = serviceRepository.save(service);
        eventService.recordServiceRegistered(saved);
        return saved;
    }

    public Service update(Long id, ServiceRequest request) {
        Service service = findById(id);
        service.setName(request.name());
        service.setUrl(request.url());
        return serviceRepository.save(service);
    }

    public void delete(Long id) {
        serviceRepository.delete(findById(id));
    }
}
