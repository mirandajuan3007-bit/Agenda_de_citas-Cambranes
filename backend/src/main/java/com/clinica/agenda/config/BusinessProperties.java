package com.clinica.agenda.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;
import java.time.ZoneId;
import java.time.DayOfWeek;
import java.util.Arrays;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "agenda.business")
@Getter @Setter
public class BusinessProperties {

    private String workStart = "09:00";
    private String workEnd = "17:30";
    private String workDays = "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY";
    private int maxPendingPerPatient = 3;
    private int minDaysAhead = 0;
    private int maxDaysAhead = 90;
    private int defaultDurationMinutes = 60;
    private String timezone = "America/Mexico_City";

    public LocalTime workStartTime() { return LocalTime.parse(workStart); }
    public LocalTime workEndTime()   { return LocalTime.parse(workEnd); }
    public ZoneId zoneId()           { return ZoneId.of(timezone); }

    public List<DayOfWeek> workingDays() {
        return Arrays.stream(workDays.split(","))
                .map(String::trim)
                .map(DayOfWeek::valueOf)
                .toList();
    }
}
