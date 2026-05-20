# Contexto del Sistema – Módulo de Agenda

## 1. Introducción

El presente documento describe el contexto general del módulo de agenda dentro de un sistema integral para la gestión de una clínica psicológica. Su propósito es establecer una comprensión clara del entorno en el que opera el sistema, los actores involucrados, sus límites funcionales y la problemática que busca resolver.

Este documento sirve como base para el análisis de requerimientos, el modelado del sistema y las decisiones de diseño posteriores.

---

## 2. Descripción general del sistema

El sistema corresponde a una aplicación web orientada a la gestión administrativa de una clínica psicológica.

El módulo de agenda se encarga exclusivamente de la gestión de citas entre pacientes y terapeutas, permitiendo organizar, visualizar y controlar la disponibilidad de los recursos involucrados.

Este módulo es utilizado únicamente por personal administrativo, quienes son responsables de coordinar las citas y garantizar una correcta asignación de horarios.

---

## 3. Actores del sistema

Los actores que interactúan directamente con el sistema son:

* **Secretaria:** Responsable de registrar, modificar, cancelar y consultar citas.
* **Coordinador de la clínica:** Supervisa la gestión de citas y puede acceder a la información para control y seguimiento.

---

## 4. Entorno operativo

El sistema opera bajo las siguientes condiciones:

* Plataforma web accesible desde navegador.
* Uso en entorno administrativo dentro de la clínica.
* Horario laboral definido:

  * Lunes a viernes
  * De 9:00 a 17:30
* No se permite la programación de citas en fines de semana.

---

## 5. Recursos del sistema

El módulo de agenda considera los siguientes recursos para la gestión de citas:

* **Psicólogos:** 3 disponibles.
* **Salas:** 3 consultorios disponibles.
* **Asignación fija:** Cada sala está asignada a un psicólogo específico, funcionando como su espacio de atención.

Estos recursos son fundamentales para validar la disponibilidad al momento de registrar una cita.

---

## 6. Objetivo del módulo

El módulo de agenda tiene como objetivo principal:

* Gestionar las citas de manera eficiente.
* Evitar conflictos de horario entre recursos.
* Mantener un historial completo de citas.
* Permitir el seguimiento y trazabilidad de cada sesión.

---

## 7. Alcance del módulo

El módulo de agenda incluye:

* Registro de citas.
* Visualización de citas en formato calendario.
* Reagendamiento de citas.
* Cancelación de citas.
* Gestión de estados de las citas.

---

## 8. Limitaciones del módulo

El módulo de agenda no contempla:

* Procesamiento de pagos.
* Evaluaciones socioeconómicas.
* Gestión de historial clínico detallado.
* Interacción directa con pacientes.

Estas funcionalidades corresponden a otros módulos dentro del sistema.

---

## 9. Supuestos del sistema

Para el correcto funcionamiento del módulo, se establecen los siguientes supuestos:

* Cada terapeuta tiene asignada una sala fija.
* No se permiten citas simultáneas para un mismo terapeuta, sala o paciente.
* Las citas deben registrarse dentro del horario laboral definido.
* El sistema es utilizado únicamente por personal administrativo.

---

## 10. Relación con otros módulos

El módulo de agenda interactúa de manera lógica con otros componentes del sistema, tales como:

* **Paciente:** Gestión de datos básicos.
* **Terapeuta:** Información de los psicólogos disponibles.
* **Salas:** Gestión de consultorios.
* **Tipo de sesión:** Clasificación de citas.
* **Expedientes clínicos:** (fuera del alcance, pero relacionado).

---

## 11. Reglas de Negocio Principales

* **Trazabilidad:** Las citas registradas nunca se eliminan físicamente de la base de datos.
* **Cancelaciones:** Al cancelar, únicamente se cambia el estado de la cita a "cancelada".
* **Reagendamientos:** Al modificar un horario, la cita original se archiva y se genera una nueva cita con los cambios aplicados.
* **Continuidad:** No existe tiempo de descanso obligatorio entre citas; una puede comenzar inmediatamente después de otra si hay disponibilidad.

---

## 12. Estados y Tipos de Sesión

Las citas transitan por los siguientes estados: *Programada, Cancelada, Reprogramada y Finalizada*.
Asimismo, se dividen en dos flujos principales:

* **Evaluación inicial:** Para pacientes de primera vez. Requiere el registro de datos básicos y genera un folio único.
* **Sesión terapéutica:** Citas de seguimiento para pacientes ya registrados, asignadas idealmente al mismo terapeuta.

---

## 13. Importancia dentro del sistema

El módulo de agenda es un componente central dentro del sistema, ya que:

* Coordina la interacción entre pacientes y terapeutas.
* Organiza el uso de recursos físicos (salas).
* Sirve como base para otros procesos administrativos y clínicos.

Una correcta implementación de este módulo impacta directamente en la eficiencia operativa y la calidad del servicio de la clínica.

---
