/**
 * Utilidades para aplicar temas de color dinámicos
 */

function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Aplica los colores del tema dinámicamente
 * @param primaryColor - Color primario en formato hex (#RRGGBB)
 */
export function applyThemeColors(primaryColor: string): void {
  const root = document.documentElement;

  // Guardar el color primario
  root.style.setProperty('--primary', primaryColor);

  // Calcular colores derivados
  const hoverColor = adjustBrightness(primaryColor, -20);
  const lightColor = primaryColor + '15'; // Transparencia 15
  const rgb = hexToRgb(primaryColor);

  // Aplicar todas las variaciones
  root.style.setProperty('--primary-hover', hoverColor);
  root.style.setProperty('--primary-light', lightColor);
  root.style.setProperty('--primary-rgb', `${rgb.r},${rgb.g},${rgb.b}`);

  // Guardar en localStorage para persistencia
  localStorage.setItem('theme-color', primaryColor);
}

/**
 * Carga el color guardado del localStorage
 */
export function loadSavedTheme(): string | null {
  return localStorage.getItem('theme-color');
}

/**
 * Resetea el tema al color por defecto
 */
export function resetTheme(): void {
  const defaultColor = '#8CC63E';
  applyThemeColors(defaultColor);
}
