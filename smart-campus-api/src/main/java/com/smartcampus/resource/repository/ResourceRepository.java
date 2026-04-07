package com.smartcampus.resource.repository;

import com.smartcampus.resource.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    boolean existsByResourceCode(String resourceCode);

    boolean existsByResourceCodeAndIdNot(String resourceCode, Long id);
}
