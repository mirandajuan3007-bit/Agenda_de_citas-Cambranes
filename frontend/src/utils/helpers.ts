/**
 * @file utils/helpers.ts
 * Funciones auxiliares para manejo de fechas, horas y formato de texto.
 *
 * CORRECCIÓN DE BUG — Contexto:
 * El prototipo anterior usaba `date.toISOString()` para calcular la hora de fin
 * al crear/reprogramar citas. `toISOString()` devuelve siempre UTC, pero los
 * timestamps almacenados en el store usan hora LOCAL (sin offset de zona).
 * Esto provocaba que `"2026-04-27T11:00:00"` (local) se comparara contra
 * `"2026-04-27T17:00:00"` (UTC-6), generando falsos conflictos.
 *
 * La solución es usar `toLocalISO()` en lugar de `toISOString()` en todos los
 * puntos donde se construyen timestamps para guardar o comparar.
 */

// ─── Constantes de horario laboral ─────────────────────────────────────────

/** Hora de inicio de jornada laboral expresada en minutos desde medianoche (9:00). */
export const WORK_START_MIN = 9 * 60; // 540

/** Hora de fin de jornada laboral expresada en minutos desde medianoche (17:30). */
export const WORK_END_MIN = 17 * 60 + 30; // 1050

/** Pixeles asignados por cada minuto en la grilla del calendario. */
export const PX_PER_MIN = 1.5;

/** Altura total de la grilla del calendario en píxeles. */
export const CALENDAR_HEIGHT_PX = (WORK_END_MIN - WORK_START_MIN) * PX_PER_MIN; // 765px

// ─── Manejo de fechas (bug-free) ────────────────────────────────────────────

/**
 * Convierte un objeto Date a string ISO-8601 en HORA LOCAL (sin zona horaria).
 *
 * Por qué existe: `Date.toISOString()` convierte a UTC, lo que produce
 * timestamps incorrectos en zonas distintas a UTC+0. Esta función formatea
 * la fecha usando los métodos `.getHours()`, `.getMinutes()`, etc., que
 * siempre retornan la hora local del navegador.
 *
 * @example
 * // En zona UTC-6 a las 11:00 AM local:
 * toLocalISO(new Date())  // → "2026-04-27T11:00:00"
 * new Date().toISOString() // → "2026-04-27T17:00:00.000Z" ← INCORRECTO para almacenamiento
 */
export function toLocalISO(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}` +
    `T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
  );
}

/**
 * Calcula la hora de fin sumando `durationMinutes` a la hora de inicio.
 * Devuelve el resultado como string ISO local (sin zona).
 *
 * Este es el reemplazo correcto del patrón:
 *   ❌ `new Date(startAt).setMinutes(...); end.toISOString().slice(0, 19)`
 *   ✅ `addMinutes(startAt, duration)`
 *
 * @param startAt - Timestamp de inicio en formato "YYYY-MM-DDTHH:mm:ss"
 * @param minutes - Minutos a sumar
 */
export function addMinutes(startAt: string, minutes: number): string {
  const d = new Date(startAt);
  d.setMinutes(d.getMinutes() + minutes);
  return toLocalISO(d);
}

/**
 * Construye un timestamp en hora local a partir de fecha y hora separadas.
 *
 * @param date - Fecha en formato "YYYY-MM-DD"
 * @param time - Hora en formato "HH:mm"
 * @returns Timestamp "YYYY-MM-DDTHH:mm:00" en hora local
 */
export function buildLocalISO(date: string, time: string): string {
  return `${date}T${time}:00`;
}

/**
 * Extrae la parte de fecha "YYYY-MM-DD" de un timestamp local.
 *
 * @param iso - Timestamp en formato "YYYY-MM-DDTHH:mm:ss"
 */
export function isoDatePart(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Devuelve la fecha del lunes de la semana que contiene `date`.
 * Usado para anclar la vista semanal del calendario.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=dom, 1=lun …
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Devuelve los 5 días laborales (lun–vie) de la semana que empieza en `weekStart`.
 *
 * @param weekStart - Fecha de inicio de semana (debe ser lunes)
 */
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

/**
 * Devuelve la posición vertical en píxeles de un timestamp dentro de la grilla.
 * Basado en la diferencia de minutos respecto a `WORK_START_MIN`.
 *
 * @param iso - Timestamp en formato "YYYY-MM-DDTHH:mm:ss"
 * @returns Píxeles desde el top de la grilla (puede ser negativo si está antes de las 9:00)
 */
export function getTopPx(iso: string): number {
  const d = new Date(iso);
  const totalMin = d.getHours() * 60 + d.getMinutes();
  return (totalMin - WORK_START_MIN) * PX_PER_MIN;
}

/**
 * Convierte minutos de duración a píxeles de altura en la grilla.
 */
export function getHeightPx(durationMinutes: number): number {
  return durationMinutes * PX_PER_MIN;
}

// ─── Formateo para UI ───────────────────────────────────────────────────────

/**
 * Formatea un timestamp local a hora "HH:mm".
 *
 * @example formatTime("2026-04-27T14:30:00") → "14:30"
 */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Formatea un timestamp a fecha larga en español.
 *
 * @example formatDate("2026-04-27T09:00:00") → "lun., 27 de abr. de 2026"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formatea un timestamp a fecha corta en español.
 *
 * @example formatShortDate("2026-04-27T09:00:00") → "27 abr."
 */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Determina si una cita está "atrasada" (RF-07).
 * Condición: estado SCHEDULED (1) y hora de inicio ya pasó.
 *
 * IMPORTANTE: Esta condición es VISUAL y NO se almacena en la base de datos.
 * El estado en la tabla `appointments` permanece como SCHEDULED.
 *
 * @param statusId - Estado actual de la cita
 * @param startAt  - Timestamp de inicio de la cita
 * @param now      - Momento actual (inyectado para facilitar pruebas)
 */
export function isOverdue(statusId: number, startAt: string, now: Date = new Date()): boolean {
  return statusId === 1 && now > new Date(startAt);
}

/**
 * Genera los labels de hora para la columna lateral del calendario.
 * Cubre de WORK_START_MIN a WORK_END_MIN en incrementos de 30 min.
 *
 * @returns Array de strings "HH:mm" — e.g. ["09:00", "09:30", ..., "17:30"]
 */
export function generateTimeLabels(): string[] {
  const labels: string[] = [];
  for (let m = WORK_START_MIN; m <= WORK_END_MIN; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    labels.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return labels;
}

// ─── Algoritmo de layout del calendario ────────────────────────────────────

/** Resultado del cálculo de posición para un bloque de cita en la grilla. */
export interface AppointmentLayout {
  appointment: import('../types').Appointment;
  /** Offset desde la izquierda de la columna, en porcentaje (0–100). */
  leftPct: number;
  /** Ancho del bloque, en porcentaje (0–100). */
  widthPct: number;
}

/**
 * Calcula la distribución horizontal de citas en una columna del calendario
 * cuando hay solapamiento de horarios.
 *
 * Algoritmo: asigna "tracks" (carriles) en orden de inicio. Una cita se
 * coloca en el primer carril cuya última cita ya terminó. Si ninguno está
 * libre, se abre un carril nuevo. Al final, el ancho de cada bloque se
 * divide equitativamente entre el total de carriles usados.
 *
 * @param appointments - Citas del mismo día (pueden o no solaparse)
 * @returns Array con posición y ancho calculados para cada cita
 */
export function computeCalendarLayout(
  appointments: import('../types').Appointment[]
): AppointmentLayout[] {
  if (appointments.length === 0) return [];

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  // tracks[i] = ISO string del endAt de la última cita en el track i
  const tracks: string[] = [];
  const indexed: { appt: import('../types').Appointment; trackIndex: number }[] = [];

  for (const appt of sorted) {
    const apptStart = new Date(appt.startAt);
    // Buscar primer track libre (su última cita ya terminó)
    let ti = tracks.findIndex((endAt) => new Date(endAt) <= apptStart);
    if (ti === -1) {
      // No hay track libre — crear uno nuevo
      ti = tracks.length;
      tracks.push('');
    }
    tracks[ti] = appt.endAt;
    indexed.push({ appt, trackIndex: ti });
  }

  const total = tracks.length;
  return indexed.map(({ appt, trackIndex }) => ({
    appointment: appt,
    leftPct: (trackIndex / total) * 100,
    widthPct: (1 / total) * 100,
  }));
}
