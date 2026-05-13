-- Catalogos basicos
INSERT INTO appointment_statuses (id, code, description) VALUES
  (1, 'SCHEDULED',   'Cita programada'),
  (2, 'CANCELLED',   'Cita cancelada'),
  (3, 'RESCHEDULED', 'Cita reprogramada'),
  (4, 'COMPLETED',   'Cita finalizada');

INSERT INTO session_types (id, name) VALUES
  (1, 'Evaluacion inicial'),
  (2, 'Sesion terapeutica');

-- Usuarios demo. El password_hash se reemplaza al boot por DemoUserSeeder
-- con un BCrypt fresco, calculado a partir de "secretaria123" / "coordinador123".
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('secretaria@clinica.mx',  'PLACEHOLDER_WILL_BE_REPLACED_ON_BOOT', 'Maria Garcia Lopez',  'secretaria'),
  ('coordinador@clinica.mx', 'PLACEHOLDER_WILL_BE_REPLACED_ON_BOOT', 'Dr. Roberto Mendez',  'coordinador');

-- Salas (3 consultorios)
INSERT INTO rooms (name, location, capacity) VALUES
  ('Sala 1', 'Planta baja - Ala norte', 1),
  ('Sala 2', 'Planta baja - Ala sur',   1),
  ('Sala 3', 'Primer piso',             1);

-- Terapeutas (3 fijos, una sala cada uno)
INSERT INTO therapists (full_name, specialty, room_id, active) VALUES
  ('Dra. Laura Sanchez Perez',      'Psicologia clinica',           1, TRUE),
  ('Psic. Jorge Flores Gutierrez',  'Terapia cognitivo-conductual', 2, TRUE),
  ('Dra. Patricia Mora Delgado',    'Terapia familiar sistemica',   3, TRUE);

-- Pacientes de ejemplo
INSERT INTO patients (folio, full_name, phone, email, birth_date) VALUES
  ('PAC-0001', 'Ana Torres Ramos',      '555-123-4567', 'ana.torres@email.com',  '1990-03-15'),
  ('PAC-0002', 'Carlos Ruiz Mendoza',   '555-234-5678', 'carlos.ruiz@email.com', '1985-07-22'),
  ('PAC-0003', 'Elena Vazquez Cruz',    '555-345-6789', 'elena.v@email.com',     '1995-11-08'),
  ('PAC-0004', 'Miguel Herrera Santos', '555-456-7890', 'miguel.h@email.com',    '1978-05-30'),
  ('PAC-0005', 'Lucia Morales Fuentes', '555-567-8901', 'lucia.m@email.com',     '2000-09-14');
