/**
 * Color scheme and styling constants for the entire application
 * Used for consistent header styling, icons, and section theming
 */

export const iconColors = {
  clinic: 'text-primary',           // Green - Building
  services: 'text-green-500',       // Darker green - Stethoscope
  schedule: 'text-purple-500',      // Purple - Clock
  doctor: 'text-indigo-600',        // Indigo - User (NEW)
  dashboard: 'text-blue-600',       // Blue - Home
  billing: 'text-orange-500',       // Orange - Receipt
  patients: 'text-blue-600',        // Blue - Users
  history: 'text-cyan-500',         // Cyan - FileText
} as const;

export const gradients = {
  clinic: 'from-primary/10 to-primary/5',
  services: 'from-green-50 to-green-50/50',
  schedule: 'from-purple-50 to-purple-50/50',
  doctor: 'from-indigo-50 to-indigo-50/50',
  dashboard: 'from-blue-50 to-blue-50/50',
  billing: 'from-orange-50 to-orange-50/50',
  patients: 'from-blue-50 to-blue-50/50',
  history: 'from-cyan-50 to-cyan-50/50',
} as const;

export const sectionConfig = {
  clinic: {
    icon: 'Building',
    iconColor: iconColors.clinic,
    gradient: gradients.clinic,
  },
  services: {
    icon: 'Stethoscope',
    iconColor: iconColors.services,
    gradient: gradients.services,
  },
  schedule: {
    icon: 'Clock',
    iconColor: iconColors.schedule,
    gradient: gradients.schedule,
  },
  doctor: {
    icon: 'User',
    iconColor: iconColors.doctor,
    gradient: gradients.doctor,
  },
  dashboard: {
    icon: 'Home',
    iconColor: iconColors.dashboard,
    gradient: gradients.dashboard,
  },
  billing: {
    icon: 'Receipt',
    iconColor: iconColors.billing,
    gradient: gradients.billing,
  },
  patients: {
    icon: 'Users',
    iconColor: iconColors.patients,
    gradient: gradients.patients,
  },
  history: {
    icon: 'FileText',
    iconColor: iconColors.history,
    gradient: gradients.history,
  },
} as const;
