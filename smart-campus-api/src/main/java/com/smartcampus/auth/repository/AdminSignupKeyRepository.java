package com.smartcampus.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.auth.entity.AdminSignupKey;

@Repository
public interface AdminSignupKeyRepository extends JpaRepository<AdminSignupKey, UUID> {
    Optional<AdminSignupKey> findByKeyValue(String keyValue);
}
