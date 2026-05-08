package com.clinica.agenda.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "appointment_statuses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppointmentStatus {

    @Id
    private Short id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 255)
    private String description;
}
