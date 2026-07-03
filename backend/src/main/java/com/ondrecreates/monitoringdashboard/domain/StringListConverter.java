package com.ondrecreates.monitoringdashboard.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Arrays;
import java.util.List;

/** Stores a small tag list as a single comma-joined column — no join table needed for this scale. */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

    @Override
    public String convertToDatabaseColumn(List<String> tags) {
        return tags == null ? "" : String.join(",", tags);
    }

    @Override
    public List<String> convertToEntityAttribute(String column) {
        return column == null || column.isBlank() ? List.of() : Arrays.asList(column.split(","));
    }
}
