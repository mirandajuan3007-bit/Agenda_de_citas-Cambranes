package com.clinica.agenda.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class PatientForm {

    @NotBlank(message = "El nombre del paciente es obligatorio.")
    @Size(max = 255)
    private String fullName;

    @Size(max = 50)
    private String phone;

    @Email(message = "El correo no tiene un formato valido.")
    @Size(max = 255)
    private String email;

    private LocalDate birthDate;
}
