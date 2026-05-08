package com.clinica.agenda.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter
public class AppointmentForm {

    /** "EVALUATION" o "THERAPY" — controla los flujos del RF-01. */
    @NotNull(message = "Seleccione el tipo de cita.")
    private String appointmentType;

    /** Necesario solo cuando appointmentType=THERAPY. */
    private Integer patientId;

    /** Datos del paciente nuevo (solo cuando appointmentType=EVALUATION). */
    private String firstName;
    private String lastName;
    private String phone;
    private String email;

    @NotNull(message = "Seleccione un terapeuta.")
    private Integer therapistId;

    @NotNull(message = "Seleccione una sala.")
    private Integer roomId;

    @NotNull(message = "Seleccione el tipo de sesion.")
    private Integer sessionTypeId;

    @NotNull(message = "Seleccione la fecha de la cita.")
    private LocalDate date;

    @NotNull(message = "Seleccione la hora de inicio.")
    private LocalTime startTime;

    @NotNull(message = "Indique la duracion de la cita en minutos.")
    @Min(value = 15, message = "La duracion minima es de 15 minutos.")
    private Integer durationMinutes;

    private BigDecimal fee;

    @Size(max = 2000, message = "El comentario no puede pasar de 2000 caracteres.")
    private String comments;
}
