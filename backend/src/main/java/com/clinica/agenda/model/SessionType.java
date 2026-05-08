package com.clinica.agenda.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "session_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;
}
