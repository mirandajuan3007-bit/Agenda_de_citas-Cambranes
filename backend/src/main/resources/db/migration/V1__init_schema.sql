-- Esquema inicial del modulo de agenda (MySQL 8.x)

CREATE TABLE users (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  role            VARCHAR(50)  NOT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rooms (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  location    VARCHAR(255),
  capacity    INT DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE therapists (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  user_id     BIGINT NULL,
  full_name   VARCHAR(255) NOT NULL,
  specialty   VARCHAR(255),
  notes       TEXT,
  room_id     BIGINT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_therapist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_therapist_room FOREIGN KEY (room_id) REFERENCES rooms(id),
  UNIQUE KEY uk_therapist_room (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE patients (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  folio       VARCHAR(50)  NOT NULL,
  full_name   VARCHAR(255) NOT NULL,
  phone       VARCHAR(50),
  email       VARCHAR(255),
  birth_date  DATE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_patient_folio (folio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointment_statuses (
  id          SMALLINT     NOT NULL,
  code        VARCHAR(50)  NOT NULL,
  description TEXT,
  PRIMARY KEY (id),
  UNIQUE KEY uk_status_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE session_types (
  id    SMALLINT    NOT NULL,
  name  VARCHAR(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_session_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointments (
  id                    BIGINT       NOT NULL AUTO_INCREMENT,
  patient_id            BIGINT       NOT NULL,
  therapist_id          BIGINT       NOT NULL,
  room_id               BIGINT       NOT NULL,
  session_type_id       SMALLINT     NOT NULL,
  start_at              DATETIME     NOT NULL,
  end_at                DATETIME     NOT NULL,
  duration_minutes      INT          NOT NULL,
  status_id             SMALLINT     NOT NULL,
  created_by            BIGINT NULL,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cancelled_reason      TEXT,
  cancelled_at          TIMESTAMP NULL,
  payment_proof_path    VARCHAR(500),
  cuota                 DECIMAL(10,2),
  comments              TEXT,
  rescheduled_from_id   BIGINT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_appt_patient   FOREIGN KEY (patient_id)         REFERENCES patients(id)             ON DELETE RESTRICT,
  CONSTRAINT fk_appt_therapist FOREIGN KEY (therapist_id)       REFERENCES therapists(id)           ON DELETE RESTRICT,
  CONSTRAINT fk_appt_room      FOREIGN KEY (room_id)            REFERENCES rooms(id)                ON DELETE RESTRICT,
  CONSTRAINT fk_appt_session   FOREIGN KEY (session_type_id)    REFERENCES session_types(id),
  CONSTRAINT fk_appt_status    FOREIGN KEY (status_id)          REFERENCES appointment_statuses(id),
  CONSTRAINT fk_appt_user      FOREIGN KEY (created_by)         REFERENCES users(id),
  CONSTRAINT fk_appt_resch     FOREIGN KEY (rescheduled_from_id) REFERENCES appointments(id),
  CONSTRAINT ck_appt_time      CHECK (start_at < end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_appt_start          ON appointments (start_at);
CREATE INDEX idx_appt_therapist_time ON appointments (therapist_id, start_at);
CREATE INDEX idx_appt_room_time      ON appointments (room_id,      start_at);
CREATE INDEX idx_appt_patient_time   ON appointments (patient_id,   start_at);
CREATE INDEX idx_appt_status         ON appointments (status_id);

CREATE TABLE audit_logs (
  id            BIGINT NOT NULL AUTO_INCREMENT,
  entity_type   VARCHAR(100) NOT NULL,
  entity_id     BIGINT NOT NULL,
  action        VARCHAR(100) NOT NULL,
  payload       JSON,
  performed_by  BIGINT NULL,
  performed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_audit_user FOREIGN KEY (performed_by) REFERENCES users(id),
  KEY idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
