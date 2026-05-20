package mx.clinica.cambranes.agenda.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "session_types")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SessionType {

    public static final short EVALUACION_INICIAL = 1;
    public static final short SESION_TERAPEUTICA = 2;

    @Id
    private Short id;

    @Column(nullable = false, unique = true)
    private String name;
}
