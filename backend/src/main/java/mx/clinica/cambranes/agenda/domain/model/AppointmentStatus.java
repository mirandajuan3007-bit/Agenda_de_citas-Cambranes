package mx.clinica.cambranes.agenda.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "appointment_statuses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AppointmentStatus {

    public static final short SCHEDULED   = 1;
    public static final short CANCELLED   = 2;
    public static final short RESCHEDULED = 3;
    public static final short COMPLETED   = 4;

    @Id
    private Short id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;
}
