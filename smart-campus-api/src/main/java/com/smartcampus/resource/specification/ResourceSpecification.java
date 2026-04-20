package com.smartcampus.resource.specification;

import com.smartcampus.resource.entity.Resource;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import org.springframework.data.jpa.domain.Specification;

public class ResourceSpecification {

    private ResourceSpecification() {
        // Utility class
    }

    public static Specification<Resource> withFilters(
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
            Boolean hasWindows
    ) {
        return Specification.where(nameStartsWith(name))
                .and(hasType(type))
                .and(inBuilding(building))
                .and(hasStatus(status))
                .and(isBookable(isBookable))
                .and(isUnderMaintenance(isUnderMaintenance))
                .and(hasMinCapacity(minCapacity))
                .and(hasMaxCapacity(maxCapacity))
                .and(hasProjector(hasProjector))
                .and(hasAc(hasAc))
                .and(hasWhiteboard(hasWhiteboard))
                .and(hasWifi(hasWifi))
                .and(hasComputers(hasComputers))
                .and(hasWindows(hasWindows));
    }

    public static Specification<Resource> nameStartsWith(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return null;
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    name.trim().toLowerCase() + "%"
            );
        };
    }

    public static Specification<Resource> hasType(ResourceType type) {
        return (root, query, criteriaBuilder) -> {
            if (type == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("type"), type);
        };
    }

    public static Specification<Resource> inBuilding(String building) {
        return (root, query, criteriaBuilder) -> {
            if (building == null || building.trim().isEmpty()) {
                return null;
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("building")),
                    "%" + building.trim().toLowerCase() + "%"
            );
        };
    }

    public static Specification<Resource> hasStatus(ResourceStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<Resource> isBookable(Boolean isBookable) {
        return (root, query, criteriaBuilder) -> {
            if (isBookable == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("isBookable"), isBookable);
        };
    }

    public static Specification<Resource> isUnderMaintenance(Boolean isUnderMaintenance) {
        return (root, query, criteriaBuilder) -> {
            if (isUnderMaintenance == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("isUnderMaintenance"), isUnderMaintenance);
        };
    }

    public static Specification<Resource> hasMinCapacity(Integer minCapacity) {
        return (root, query, criteriaBuilder) -> {
            if (minCapacity == null) {
                return null;
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("capacity"), minCapacity);
        };
    }

    public static Specification<Resource> hasMaxCapacity(Integer maxCapacity) {
        return (root, query, criteriaBuilder) -> {
            if (maxCapacity == null) {
                return null;
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("capacity"), maxCapacity);
        };
    }

    public static Specification<Resource> hasProjector(Boolean hasProjector) {
        return (root, query, criteriaBuilder) -> {
            if (hasProjector == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("hasProjector"), hasProjector);
        };
    }

    public static Specification<Resource> hasAc(Boolean hasAc) {
        return (root, query, criteriaBuilder) -> {
            if (hasAc == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("hasAc"), hasAc);
        };
    }

    public static Specification<Resource> hasWhiteboard(Boolean hasWhiteboard) {
        return (root, query, criteriaBuilder) -> {
            if (hasWhiteboard == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("hasWhiteboard"), hasWhiteboard);
        };
    }

    public static Specification<Resource> hasWifi(Boolean hasWifi) {
        return (root, query, criteriaBuilder) -> {
            if (hasWifi == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("hasWifi"), hasWifi);
        };
    }

    public static Specification<Resource> hasComputers(Boolean hasComputers) {
        return (root, query, criteriaBuilder) -> {
            if (hasComputers == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("hasComputers"), hasComputers);
        };
    }

    public static Specification<Resource> hasWindows(Boolean hasWindows) {
        return (root, query, criteriaBuilder) -> {
            if (hasWindows == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("hasWindows"), hasWindows);
        };
    }
}