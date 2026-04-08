package com.smartcampus.resource.service;

import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.ResourceStatsResponse;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import org.springframework.data.domain.Page;

public interface ResourceService {

    ResourceResponse createResource(ResourceRequest request);

    ResourceResponse updateResource(Long id, ResourceRequest request);

    void deleteResource(Long id);

    ResourceResponse getResourceById(Long id);

    Page<ResourceResponse> getAllResources(
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
    );

    ResourceStatsResponse getResourceStats();
}
