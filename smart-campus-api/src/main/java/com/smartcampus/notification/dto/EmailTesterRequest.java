package com.smartcampus.notification.dto;

public class EmailTesterRequest {
    private String to;
    private String type; // PROMOTIONAL, SUPPORT, UPDATE, CUSTOM
    private String subject;
    private String message;

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
