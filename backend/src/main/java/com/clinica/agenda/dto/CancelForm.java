package com.clinica.agenda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CancelForm {
    @NotBlank(message = "Indique el motivo de la cancelacion.")
    @Size(max = 1000)
    private String reason;
}
