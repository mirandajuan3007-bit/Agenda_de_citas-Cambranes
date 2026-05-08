package com.clinica.agenda.enums;

public enum AppointmentStatusCode {
    SCHEDULED((short) 1),
    CANCELLED((short) 2),
    RESCHEDULED((short) 3),
    COMPLETED((short) 4);

    private final short id;

    AppointmentStatusCode(short id) {
        this.id = id;
    }

    public short getId() {
        return id;
    }
}
