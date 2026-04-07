package com.smartcampus.resource.mapper;

import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.entity.Resource;

import java.time.LocalTime;

public class ResourceMapper {

    private ResourceMapper() {
        // Utility class
    }

    public static Resource toEntity(ResourceRequest request) {
        if (request == null) {
            return null;
        }

        Resource resource = new Resource();
        mapRequestToEntity(request, resource);
        return resource;
    }

    public static ResourceResponse toResponse(Resource resource) {
        if (resource == null) {
            return null;
        }

        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setResourceCode(resource.getResourceCode());
        response.setName(resource.getName());
        response.setType(resource.getType());
        response.setBuilding(resource.getBuilding());
        response.setStatus(resource.getStatus());
        response.setAvailableFrom(resource.getAvailableFrom());
        response.setAvailableTo(resource.getAvailableTo());
        response.setBookable(resource.isBookable());
        response.setUnderMaintenance(resource.isUnderMaintenance());
        response.setDescription(resource.getDescription());
        response.setCapacity(resource.getCapacity());
        response.setImageUrl(resource.getImageUrl());
        response.setHasProjector(resource.isHasProjector());
        response.setHasAc(resource.isHasAc());
        response.setHasWhiteboard(resource.isHasWhiteboard());
        response.setHasWifi(resource.isHasWifi());
        response.setHasComputers(resource.isHasComputers());
        response.setHasWindows(resource.isHasWindows());
        response.setCreatedAt(resource.getCreatedAt());
        response.setUpdatedAt(resource.getUpdatedAt());

        // Derived display status for UI
        response.setDisplayStatus(determineDisplayStatus(resource));

        return response;
    }

    public static void updateEntityFromRequest(ResourceRequest request, Resource resource) {
        if (request == null || resource == null) {
            return;
        }

        mapRequestToEntity(request, resource);
    }

    private static void mapRequestToEntity(ResourceRequest request, Resource resource) {
        resource.setResourceCode(request.getResourceCode());
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setBuilding(request.getBuilding());
        resource.setStatus(request.getStatus());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setBookable(request.isBookable());
        resource.setUnderMaintenance(request.isUnderMaintenance());
        resource.setDescription(request.getDescription());
        resource.setCapacity(request.getCapacity());
        resource.setImageUrl(request.getImageUrl());
        resource.setHasProjector(request.isHasProjector());
        resource.setHasAc(request.isHasAc());
        resource.setHasWhiteboard(request.isHasWhiteboard());
        resource.setHasWifi(request.isHasWifi());
        resource.setHasComputers(request.isHasComputers());
        resource.setHasWindows(request.isHasWindows());
    }

    private static String determineDisplayStatus(Resource resource) {
        if (resource.isUnderMaintenance()) {
            return "UNDER_MAINTENANCE";
        }

        if (resource.getStatus() != null && resource.getStatus().name().equals("OUT_OF_SERVICE")) {
            return "OUT_OF_SERVICE";
        }

        LocalTime now = LocalTime.now();
        if (resource.getAvailableFrom() != null
                && resource.getAvailableTo() != null
                && (now.isBefore(resource.getAvailableFrom()) || now.isAfter(resource.getAvailableTo()))) {
            return "NOT_AVAILABLE_NOW";
        }

        return "AVAILABLE";
    }
}
