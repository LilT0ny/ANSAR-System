import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Calendar, DollarSign } from 'lucide-react';
import { usePatients, useAppointments } from '../hooks';
import { StatCard, PatientCard } from '../components/molecules';
import { Spinner } from '../components/atoms';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { Patient, Appointment } from '../types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { patients, loading: loadingPatients } = usePatients();
  const { appointments, loading: loadingAppointments } = useAppointments();

  const loading = loadingPatients || loadingAppointments;

  // Calcular KPIs
  const { totalPatients, pendingAppointments, totalDebt, recentPatients } = useMemo(() => {
    const total = patients.length;
    
    const pending = appointments.filter(
      a => a.status === 'pendiente' || a.status === 'confirmada'
    ).length;
    
    const debt = patients.reduce((sum, p) => sum + Number(p.debt || 0), 0);
    
    const recent = [...patients]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3);

    return { totalPatients: total, pendingAppointments: pending, totalDebt: debt, recentPatients: recent };
  }, [patients, appointments]);

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.full_name || 'Doctor(a)';

  const kpis = [
    { label: 'Total Pacientes', value: loading ? '...' : String(totalPatients), icon: Users, variant: 'default' as const },
    { label: 'Citas Pendientes', value: loading ? '...' : String(pendingAppointments), icon: Calendar, variant: 'success' as const },
    { label: 'Deuda Total', value: loading ? '...' : `$${totalDebt.toFixed(2)}`, icon: DollarSign, variant: 'warning' as const },
    { label: 'Tratamientos', value: '—', icon: Activity, variant: 'info' as const },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-in fade-in slide-in-from-left-4 duration-500">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-gray-800">
          Hola, {userName}
        </h1>
        <p className="text-secondary mt-1 text-sm md:text-base font-medium">
          Resumen general. Tienes{' '}
          <span className="text-primary font-bold">
            {totalPatients} paciente{totalPatients !== 1 ? 's' : ''}
          </span>{' '}
          registrado{totalPatients !== 1 ? 's' : ''}.
        </p>
      </header>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, index) => (
          <StatCard
            key={index}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            variant={kpi.variant}
            isLoading={loading}
          />
        ))}
      </div>

      {/* Charts & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rendimiento Mensual */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 font-serif">Rendimiento Mensual</h3>
          <AnalyticsCharts />
        </div>

        {/* Pacientes Recientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 font-serif">Pacientes Recientes</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : recentPatients.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">No hay pacientes registrados.</p>
            ) : (
              recentPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))
            )}
          </div>
          <button
            onClick={() => navigate('/pacientes')}
            className="w-full mt-6 py-2 text-primary font-medium text-sm hover:underline"
          >
            Ver Todos los Pacientes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;