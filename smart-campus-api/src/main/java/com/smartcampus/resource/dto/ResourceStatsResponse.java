package com.smartcampus.resource.dto;

import java.util.Map;

public class ResourceStatsResponse {

    private long total;
    private long active;
    private long outOfService;
    private long underMaintenance;
    private long bookable;
    private long nonBookable;
    private Map<String, Long> byType;
    private Map<String, Long> byBuilding;

    public ResourceStatsResponse() {
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getActive() {
        return active;
    }

    public void setActive(long active) {
        this.active = active;
    }

    public long getOutOfService() {
        return outOfService;
    }

    public void setOutOfService(long outOfService) {
        this.outOfService = outOfService;
    }

    public long getUnderMaintenance() {
        return underMaintenance;
    }

    public void setUnderMaintenance(long underMaintenance) {
        this.underMaintenance = underMaintenance;
    }

    public long getBookable() {
        return bookable;
    }

    public void setBookable(long bookable) {
        this.bookable = bookable;
    }

    public long getNonBookable() {
        return nonBookable;
    }

    public void setNonBookable(long nonBookable) {
        this.nonBookable = nonBookable;
    }

    public Map<String, Long> getByType() {
        return byType;
    }

    public void setByType(Map<String, Long> byType) {
        this.byType = byType;
    }

    public Map<String, Long> getByBuilding() {
        return byBuilding;
    }

    public void setByBuilding(Map<String, Long> byBuilding) {
        this.byBuilding = byBuilding;
    }
}
