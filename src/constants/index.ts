/**
 * Constantes centralizadas de la aplicación
 * Incluye configuración de colores, valores por defecto, y constantes globales
 */

export { iconColors, gradients, sectionConfig } from './colors';

/** Rutas de la aplicación */
export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PATIENTS: '/pacientes',
  HISTORY: '/historia',
  APPOINTMENTS: '/citas',
  BILLING: '/facturacion',
  SETTINGS: '/configuracion',
  BOOKING: '/reserva',
  ORTHO_BOOKING: '/reservar/ortodoncia',
} as const;

/** Estados de citas */
export const APPOINTMENT_STATUS = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmada',
  COMPLETED: 'completada',
  CANCELLED: 'anulada',
} as const;

/** Tipos de citas */
export const APPOINTMENT_TYPES = {
  GENERAL: 'general',
  ORTHO: 'ortodoncia',
} as const;

/** Estados de pagos */
export const PAYMENT_STATUS = {
  PENDING: 'pendiente',
  PAID: 'pagado',
  CANCELLED: 'cancelado',
} as const;

/** Métodos de pago */
export const PAYMENT_METHODS = {
  CASH: 'efectivo',
  CARD: 'tarjeta',
  TRANSFER: 'transferencia',
} as const;

/** Géneros */
export const GENDER_OPTIONS = {
  MALE: 'masculino',
  FEMALE: 'femenino',
  OTHER: 'otro',
} as const;

/** Roles de usuario */
export const USER_ROLES = {
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  ASSISTANT: 'assistant',
} as const;

/** Períodos de filtrado */
export const PERIODS = {
  DAILY: 'diario',
  WEEKLY: 'semanal',
  MONTHLY: 'mensual',
  YEARLY: 'anual',
} as const;

/** Duración por defecto en minutos */
export const DEFAULT_DURATIONS = {
  APPOINTMENT: 30,
  CONSULTATION: 45,
  ORTHO_APPOINTMENT: 60,
} as const;

/** Configuración de paginación */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;
