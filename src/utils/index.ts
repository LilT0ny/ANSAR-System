/**
 * Utilidades centralizadas de la aplicación
 * Incluye funciones comunes, formatters, y helpers
 */

export * from './pdfGenerator';
export * from './formPDF';
export * from './clinicalHistoryPDF';
export * from './certificatePDF';

/**
 * Formatea una fecha al formato español
 * @param date - Fecha a formatear
 * @returns Fecha formateada (ej: 14 de abril de 2026)
 */
export const formatDateES = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formatea una hora al formato HH:MM
 * @param time - Hora a formatear
 * @returns Hora formateada
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

/**
 * Valida si un email es válido
 * @param email - Email a validar
 * @returns true si es válido, false si no
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si un número de teléfono es válido (al menos 7 dígitos)
 * @param phone - Teléfono a validar
 * @returns true si es válido, false si no
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{7,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param currency - Moneda (default: COP)
 * @returns Cantidad formateada (ej: $1.234.567)
 */
export const formatCurrency = (amount: number, currency = 'COP'): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calcula la edad a partir de la fecha de nacimiento
 * @param birthDate - Fecha de nacimiento
 * @returns Edad en años
 */
export const calculateAge = (birthDate: string | Date): number => {
  const today = new Date();
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Obtiene el nombre completo del paciente
 * @param firstName - Primer nombre
 * @param lastName - Apellido
 * @returns Nombre completo
 */
export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

/**
 * Trunca un texto a una longitud máxima
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado con puntos suspensivos si es necesario
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Decodifica errores de Supabase a mensajes legibles
 * @param error - Error de Supabase o string
 * @returns Mensaje de error legible
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, any>;
    return errorObj.message || JSON.stringify(error);
  }
  return 'Error desconocido';
};

/**
 * Decodifica un token JWT para obtener el payload
 * @param token - Token JWT
 * @returns Payload decodificado o null
 */
export const decodeJWT = (token: string): Record<string, any> | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};
