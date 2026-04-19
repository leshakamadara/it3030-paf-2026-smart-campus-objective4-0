package com.smartcampus.user.dto;

import java.util.Map;

public class UpdateNotificationPrefsRequest {
    private Map<String, Boolean> notificationPrefs;

    public Map<String, Boolean> getNotificationPrefs() {
        return notificationPrefs;
    }

    public void setNotificationPrefs(Map<String, Boolean> notificationPrefs) {
        this.notificationPrefs = notificationPrefs;
    }
}
