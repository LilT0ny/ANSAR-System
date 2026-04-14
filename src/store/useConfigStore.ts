import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigState {
  clinicName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  doctorName: string;
  specialty: string;
  email: string;
  phone: string;
  address: string;
  doctorImage: string;
  services: Array<{ id: number; name: string; price: string; duration: string; description: string }>;
  schedule: Record<string, { open: string; close: string; enabled: boolean }>;
  odontogramColors: {
    caries: string;
    treated: string;
    missing: string;
    healthy: string;
  };
  updateConfig: (config: Partial<ConfigState>) => void;
}

const defaultServices = [
  { id: 1, name: 'Consulta General', price: '$50', duration: '30 min', description: 'Evaluación inicial y diagnóstico de salud bucal' },
  { id: 2, name: 'Limpieza Dental', price: '$80', duration: '45 min', description: 'Limpieza profesional y eliminación de placa bacteriana' },
  { id: 3, name: 'Blanqueamiento', price: '$200', duration: '60 min', description: 'Blanqueamiento dental profesional para una sonrisa radiante' },
  { id: 4, name: 'Ortodoncia', price: '$100', duration: '30 min', description: 'Alineación dental con brackets o dispositivos modernos' },
];

const defaultSchedule = {
  monday: { open: '09:00', close: '18:00', enabled: true },
  tuesday: { open: '09:00', close: '18:00', enabled: true },
  wednesday: { open: '09:00', close: '18:00', enabled: true },
  thursday: { open: '09:00', close: '18:00', enabled: true },
  friday: { open: '09:00', close: '18:00', enabled: true },
  saturday: { open: '09:00', close: '14:00', enabled: false },
  sunday: { open: '09:00', close: '14:00', enabled: false },
};

const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      clinicName: 'MedicCore',
      logoUrl: '',
      primaryColor: '#8CC63E',
      secondaryColor: '#6B7280',
      accentColor: '#8CC63E',
      doctorName: 'Dr./Dra.',
      specialty: 'Odontología General',
      email: 'contacto@medicore.com',
      phone: '',
      address: '',
      doctorImage: '',
      services: defaultServices,
      schedule: defaultSchedule,
      odontogramColors: {
        caries: '#EF4444',
        treated: '#3B82F6',
        missing: '#6B7280',
        healthy: '#FFFFFF',
      },
      updateConfig: (config) => set((state) => ({ ...state, ...config })),
    }),
    {
      name: 'medicore-config',
    }
  )
);

export default useConfigStore;
