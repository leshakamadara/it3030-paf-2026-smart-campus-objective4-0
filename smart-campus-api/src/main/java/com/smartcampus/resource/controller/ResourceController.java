package com.smartcampus.resource.controller;

import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.ResourceStatsResponse;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import com.smartcampus.resource.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    /**
     * USER + ADMIN
     * Get all resources with optional advanced filters, pagination, and sorting.
     *
     * Example:
     * GET /api/resources?name=lab&type=LAB&building=Engineering&status=ACTIVE&page=0&size=10&sortBy=name&direction=asc
     */
    @GetMapping
    //@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<ResourceResponse>> getAllResources(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) Boolean isBookable,
            @RequestParam(required = false) Boolean isUnderMaintenance,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) Boolean hasProjector,
            @RequestParam(required = false) Boolean hasAc,
            @RequestParam(required = false) Boolean hasWhiteboard,
            @RequestParam(required = false) Boolean hasWifi,
            @RequestParam(required = false) Boolean hasComputers,
            @RequestParam(required = false) Boolean hasWindows,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Page<ResourceResponse> resources = resourceService.getAllResources(
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
                hasWindows,
                page,
                size,
                sortBy,
                direction
        );

        return ResponseEntity.ok(resources);
    }

    /**
     * USER + ADMIN
     * Get one resource by id.
     */
    @GetMapping("/{id}")
    //@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        ResourceResponse resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    /**
     * ADMIN only
     * Create a new resource.
     */
    @PostMapping
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request) {
        ResourceResponse createdResource = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdResource);
    }

    /**
     * ADMIN only
     * Update an existing resource.
     */
    @PutMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest request
    ) {
        ResourceResponse updatedResource = resourceService.updateResource(id, request);
        return ResponseEntity.ok(updatedResource);
    }

    /**
     * ADMIN only
     * Delete a resource by id.
     */
    @DeleteMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * ADMIN only
     * Get resource analytics/statistics.
     */
    @GetMapping("/stats")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceStatsResponse> getResourceStats() {
        ResourceStatsResponse stats = resourceService.getResourceStats();
        return ResponseEntity.ok(stats);
    }
}
