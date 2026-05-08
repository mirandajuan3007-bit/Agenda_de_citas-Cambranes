package com.clinica.agenda.enums;

public enum Role {
    SECRETARY,
    COORDINATOR;

    public String authority() {
        return "ROLE_" + name();
    }
}
