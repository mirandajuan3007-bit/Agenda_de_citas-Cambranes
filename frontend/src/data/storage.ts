/**
 * @file data/storage.ts
 * Capa de acceso a datos usando localStorage como almacenamiento persistente.
 *
 * Simula el rol de la base de datos PostgreSQL descrita en el diseño.
 * Toda lectura y escritura de datos del sistema pasa por este módulo.
 *
 * Patrón: getData() + saveData(). Los servicios llaman a getData(), mutan
 * el objeto en memoria y luego llaman a saveData() para persistir.
 */

import type { AppData } from '../types';
import { SEED_DATA } from './seed';

/** Clave usada en localStorage. Cambiarla limpia todos los datos. */
const STORAGE_KEY = 'agenda_cambranes_v1';

/**
 * Inicializa el store si no existe todavía.
 * Debe llamarse una vez al arrancar la aplicación (en main.tsx).
 * Si ya hay datos guardados, no los sobreescribe.
 */
export function initStorage(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
  }
}

/**
 * Lee y parsea el store completo desde localStorage.
 *
 * Equivale a `SELECT * FROM todas_las_tablas` en una base de datos relacional.
 * Los servicios llaman a esta función al inicio de cada operación para obtener
 * el estado actual de los datos.
 *
 * @throws Si localStorage no está disponible (SSR, contexto restringido).
 */
export function getData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Fallback: si alguien borró manualmente el key, reiniciar con seed
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return { ...SEED_DATA };
  }
  return JSON.parse(raw) as AppData;
}

/**
 * Serializa y guarda el store completo en localStorage.
 *
 * Equivale a hacer COMMIT de una transacción. Los servicios llaman a esta
 * función después de cada mutación para persistir los cambios.
 *
 * @param data - Estado completo del store a guardar
 */
export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Restablece el store a los datos iniciales (seed).
 * Útil para desarrollo y pruebas. No debe exponerse en producción.
 */
export function resetToSeed(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
}
