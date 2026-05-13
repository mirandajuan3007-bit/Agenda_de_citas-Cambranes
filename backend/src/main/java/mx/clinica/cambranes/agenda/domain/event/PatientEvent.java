package mx.clinica.cambranes.agenda.domain.event;

import mx.clinica.cambranes.agenda.domain.model.Patient;
import mx.clinica.cambranes.agenda.domain.model.User;

public record PatientEvent(Patient patient, User performedBy, String payload) {}
