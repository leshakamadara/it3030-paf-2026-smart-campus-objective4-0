package com.smartcampus.booking.service;

import java.time.OffsetDateTime;
import java.util.Map;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import com.smartcampus.booking.exception.ConflictException;

@Service
public class ConflictCheckService {

    private static final String CONFLICT_SQL = """
            SELECT COUNT(*)
              FROM bookings
             WHERE resource_id = :rid
               AND status NOT IN ('REJECTED','CANCELLED')
               AND start_time < :endTime
               AND end_time > :startTime
            """;

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public ConflictCheckService(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
    }

    public void assertNoConflict(Long resourceId, OffsetDateTime startTime, OffsetDateTime endTime) {
        Integer conflictCount = namedParameterJdbcTemplate.queryForObject(
                CONFLICT_SQL,
                Map.of("rid", resourceId, "startTime", startTime, "endTime", endTime),
                Integer.class
        );

        if (conflictCount != null && conflictCount > 0) {
            throw new ConflictException("Requested time slot conflicts with an existing booking");
        }
    }
}
