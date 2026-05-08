package com.clinica.agenda.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter
public class RescheduleForm {

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime startTime;

    @NotNull
    @Min(value = 15)
    private Integer durationMinutes;

    private Integer therapistId;
    private Integer roomId;

    @Size(max = 2000)
    private String reason;
}
