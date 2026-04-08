package com.smartcampus.resource.service;

import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.ResourceStatsResponse;
import com.smartcampus.resource.entity.Resource;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import com.smartcampus.resource.exception.DuplicateResourceCodeException;
import com.smartcampus.resource.exception.ResourceNotFoundException;
import com.smartcampus.resource.mapper.ResourceMapper;
import com.smartcampus.resource.repository.ResourceRepository;
import com.smartcampus.resource.specification.ResourceSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public ResourceResponse createResource(ResourceRequest request) {
        validateAvailabilityWindow(request);

        if (resourceRepository.existsByResourceCode(request.getResourceCode())) {
            throw new DuplicateResourceCodeException(
                    "Resource code already exists: " + request.getResourceCode()
            );
        }

        Resource resource = ResourceMapper.toEntity(request);
        Resource savedResource = resourceRepository.save(resource);

        return ResourceMapper.toResponse(savedResource);
    }

    @Override
    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        validateAvailabilityWindow(request);

        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (resourceRepository.existsByResourceCodeAndIdNot(request.getResourceCode(), id)) {
            throw new DuplicateResourceCodeException(
                    "Resource code already exists: " + request.getResourceCode()
            );
        }

        ResourceMapper.updateEntityFromRequest(request, existingResource);
        Resource updatedResource = resourceRepository.save(existingResource);

        return ResourceMapper.toResponse(updatedResource);
    }

    @Override
    public void deleteResource(Long id) {
        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resourceRepository.delete(existingResource);
    }

    @Override
    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        return ResourceMapper.toResponse(resource);
    }

    @Override
    public Page<ResourceResponse> getAllResources(
            String name,
            ResourceType type,
            String building,
            ResourceStatus status,
            Boolean isBookable,
            Boolean isUnderMaintenance,
            Integer minCapacity,
            Integer maxCapacity,
            Boolean hasProjector,
            Boolean hasAc,
            Boolean hasWhiteboard,
            Boolean hasWifi,
            Boolean hasComputers,
            Boolean hasWindows,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        Specification<Resource> specification = ResourceSpecification.withFilters(
                name,
                type,
                building,
                status,
                isBookable,
                isUnderMaintenance,
                minCapacity,
                maxCapacity,
                hasProjector,
                hasAc,
                hasWhiteboard,
                hasWifi,
                hasComputers,
                hasWindows
        );

        Pageable pageable = buildPageable(page, size, sortBy, direction);

        return resourceRepository.findAll(specification, pageable)
                .map(ResourceMapper::toResponse);
    }

    @Override
    public ResourceStatsResponse getResourceStats() {
        List<Resource> resources = resourceRepository.findAll();

        long total = resources.size();

        long active = resources.stream()
                .filter(resource -> resource.getStatus() == ResourceStatus.ACTIVE)
                .count();

        long outOfService = resources.stream()
                .filter(resource -> resource.getStatus() == ResourceStatus.OUT_OF_SERVICE)
                .count();

        long underMaintenance = resources.stream()
                .filter(Resource::isUnderMaintenance)
                .count();

        long bookable = resources.stream()
                .filter(Resource::isBookable)
                .count();

        long nonBookable = total - bookable;

        Map<String, Long> byType = resources.stream()
                .filter(resource -> resource.getType() != null)
                .collect(Collectors.groupingBy(
                        resource -> resource.getType().name(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (first, second) -> first,
                        LinkedHashMap::new
                ));

        Map<String, Long> byBuilding = resources.stream()
                .filter(resource -> resource.getBuilding() != null && !resource.getBuilding().trim().isEmpty())
                .collect(Collectors.groupingBy(
                        Resource::getBuilding,
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (first, second) -> first,
                        LinkedHashMap::new
                ));

        ResourceStatsResponse statsResponse = new ResourceStatsResponse();
        statsResponse.setTotal(total);
        statsResponse.setActive(active);
        statsResponse.setOutOfService(outOfService);
        statsResponse.setUnderMaintenance(underMaintenance);
        statsResponse.setBookable(bookable);
        statsResponse.setNonBookable(nonBookable);
        statsResponse.setByType(byType);
        statsResponse.setByBuilding(byBuilding);

        return statsResponse;
    }

    private void validateAvailabilityWindow(ResourceRequest request) {
        if (request.getAvailableFrom() != null
                && request.getAvailableTo() != null
                && !request.getAvailableFrom().isBefore(request.getAvailableTo())) {
            throw new IllegalArgumentException("Available from time must be earlier than available to time");
        }
    }

    private Pageable buildPageable(int page, int size, String sortBy, String direction) {
        int safePage = Math.max(page, 0);
        int safeSize = size > 0 ? size : 10;

        String safeSortBy = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        Sort.Direction sortDirection;

        try {
            sortDirection = (direction == null || direction.isBlank())
                    ? Sort.Direction.ASC
                    : Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException ex) {
            sortDirection = Sort.Direction.ASC;
        }

        return PageRequest.of(safePage, safeSize, Sort.by(sortDirection, safeSortBy));
    }
}
