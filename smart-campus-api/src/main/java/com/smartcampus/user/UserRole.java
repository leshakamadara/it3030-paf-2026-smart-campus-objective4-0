package com.smartcampus.user;

import com.smartcampus.common.entity.Role;

public enum UserRole {
    USER,
    TECHNICIAN,
    ADMIN,
    SUPER_ADMIN;

    public Role toRole() {
        return Role.valueOf(name());
    }

    public static UserRole fromRole(Role role) {
        return UserRole.valueOf(role.name());
    }
}
