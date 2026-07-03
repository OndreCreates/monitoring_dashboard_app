package com.ondrecreates.monitoringdashboard.api.dto;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * Thin wrapper around Spring Data's {@link Page} — a clean, stable public API
 * contract instead of leaking Spring's internal Page/Pageable JSON shape.
 */
public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
