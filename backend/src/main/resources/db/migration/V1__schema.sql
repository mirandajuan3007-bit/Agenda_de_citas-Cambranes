-- Esquema base del modulo de agenda. Alineado con docs/05_final/diseño_base_de_datos.md.

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            VARCHAR(50)  NOT NULL,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE patients (
    id          SERIAL PRIMARY KEY,
    folio       VARCHAR(50)  NOT NULL UNIQUE,
    full_name   VARCHAR(255) NOT NULL,
    phone       VARCHAR(50),
    email       VARCHAR(255),
    birth_date  DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rooms (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    location    VARCHAR(255),
    capacity    INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE therapists (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id) ON DELETE SET NULL,
    full_name   VARCHAR(255) NOT NULL,
    specialty   VARCHAR(255),
    room_id     INT UNIQUE REFERENCES rooms(id) ON DELETE SET NULL,
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE appointment_statuses (
    id           SMALLINT PRIMARY KEY,
    code         VARCHAR(50) UNIQUE NOT NULL,
    description  TEXT
);

CREATE TABLE session_types (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE appointments (
    id                  BIGSERIAL PRIMARY KEY,
    patient_id          INT      NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    therapist_id        INT      NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,
    room_id             INT      NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    session_type_id     INT      NOT NULL REFERENCES session_types(id),
    start_at            TIMESTAMPTZ NOT NULL,
    end_at              TIMESTAMPTZ NOT NULL,
    duration_minutes    INT      NOT NULL,
    status_id           SMALLINT NOT NULL REFERENCES appointment_statuses(id),
    created_by          INT      REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    cancelled_reason    TEXT,
    cancelled_at        TIMESTAMPTZ NULL,
    cancelled_by        INT REFERENCES users(id),
    rescheduled_to_id   BIGINT REFERENCES appointments(id),
    payment_proof_path  VARCHAR(500),
    fee                 NUMERIC(10,2),
    comments            TEXT,
    CONSTRAINT chk_appt_time CHECK (start_at < end_at),
    CONSTRAINT chk_appt_duration CHECK (duration_minutes > 0)
);

CREATE INDEX idx_appt_start_at        ON appointments (start_at);
CREATE INDEX idx_appt_therapist_start ON appointments (therapist_id, start_at);
CREATE INDEX idx_appt_room_start      ON appointments (room_id, start_at);
CREATE INDEX idx_appt_patient_start   ON appointments (patient_id, start_at);
CREATE INDEX idx_appt_status          ON appointments (status_id);

CREATE TABLE audit_logs (
    id            BIGSERIAL PRIMARY KEY,
    entity_type   VARCHAR(100) NOT NULL,
    entity_id     BIGINT       NOT NULL,
    action        VARCHAR(100) NOT NULL,
    payload       TEXT,
    performed_by  INT REFERENCES users(id),
    performed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
