-- Datos semilla para arrancar el modulo. Las contrasenias estan hasheadas con BCrypt.
-- Usuarios demo:
--   secretaria@clinica.local / password123  (rol SECRETARY)
--   coordinador@clinica.local / password123  (rol COORDINATOR)

INSERT INTO appointment_statuses (id, code, description) VALUES
    (1, 'SCHEDULED',   'Cita programada'),
    (2, 'CANCELLED',   'Cita cancelada'),
    (3, 'RESCHEDULED', 'Cita reprogramada'),
    (4, 'COMPLETED',   'Cita finalizada');

INSERT INTO session_types (name) VALUES
    ('Evaluacion inicial'),
    ('Sesion terapeutica');

INSERT INTO rooms (name, location, capacity) VALUES
    ('Consultorio 1', 'Planta baja', 1),
    ('Consultorio 2', 'Planta baja', 1),
    ('Consultorio 3', 'Primer piso', 1);

INSERT INTO users (email, password_hash, full_name, role) VALUES
    ('secretaria@clinica.local',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Maria Lopez',     'SECRETARY'),
    ('coordinador@clinica.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jorge Hernandez', 'COORDINATOR');

INSERT INTO therapists (user_id, full_name, specialty, room_id, active) VALUES
    (NULL, 'Dra. Ana Ramirez',    'Psicologia clinica',     1, TRUE),
    (NULL, 'Dr. Luis Castaneda',  'Terapia cognitiva',      2, TRUE),
    (NULL, 'Dra. Sofia Mendoza',  'Psicologia infantil',    3, TRUE);

INSERT INTO patients (folio, full_name, phone, email, birth_date) VALUES
    ('PAC-20260101-0001', 'Carlos Perez Reyes', '5551112233', 'carlos.perez@example.com', '1990-04-12'),
    ('PAC-20260101-0002', 'Laura Diaz Soto',    '5552223344', 'laura.diaz@example.com',   '1995-09-23');
