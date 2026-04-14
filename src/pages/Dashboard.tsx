import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Calendar, DollarSign, ChevronRight, TrendingUp, BarChart2 } from 'lucide-react';
import { usePatients, useAppointments, useInvoices } from '../hooks';
import { Spinner } from '../components/atoms';
import { PageHeader } from '../components/molecules/PageHeader';
import { SectionHeader } from '../components/molecules/SectionHeader';

const Dashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensual' | 'anual'>('mensual');
  const { patients, loading: loadingPatients } = usePatients();
  const { appointments, loading: loadingAppointments } = useAppointments();
  const { totalIncome, loading: loadingInvoices } = useInvoices();

  const loading = loadingPatients || loadingAppointments || loadingInvoices;

  const { totalPatients, pendingAppointments, totalDebt, recentPatients, filteredIncome } = useMemo(() => {
    const total = patients.length;
    const pending = appointments.filter(
      a => a.status === 'pendiente' || a.status === 'confirmada'
    ).length;
    const debt = patients.reduce((sum, p) => sum + Number(p.debt || 0), 0);
    const recent = [...patients]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);

    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'diario':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'semanal':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'mensual':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'anual':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const filtered = totalIncome;

    return { totalPatients: total, pendingAppointments: pending, totalDebt: debt, recentPatients: recent, filteredIncome: filtered };
  }, [patients, appointments, totalIncome, period]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.full_name || 'Doctor(a)';

  const periodLabels = { diario: 'Hoy', semanal: 'Esta semana', mensual: 'Este mes', anual: 'Este año' };
  
  const kpis = [
    { label: 'Pacientes', value: loading ? '...' : String(totalPatients), icon: Users, color: 'text-primary' },
    { label: 'Citas Pend.', value: loading ? '...' : String(pendingAppointments), icon: Calendar, color: 'text-blue-600' },
    { label: 'Deuda Total', value: loading ? '...' : `$${totalDebt.toFixed(2)}`, icon: DollarSign, color: 'text-red-500' },
    { 
      label: `Ingresos (${periodLabels[period]})`, 
      value: loading ? '...' : `$${filteredIncome.toFixed(2)}`, 
      icon: TrendingUp, 
      color: 'text-green-600',
      filter: true
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title={`Hola, ${userName}`}
        subtitle={`Tienes ${totalPatients} paciente${totalPatients !== 1 ? 's' : ''} registrado${totalPatients !== 1 ? 's' : ''}`}
      />

      {/* KPIs Grid - Minimalista */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg bg-gray-50 ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-gray-800">{kpi.value}</p>
                {kpi.filter && (
                  <select 
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="text-xs bg-gray-100 rounded px-1 py-0.5 border-0"
                  >
                    <option value="diario">Hoy</option>
                    <option value="semanal">Semana</option>
                    <option value="mensual">Mes</option>
                    <option value="anual">Año</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader
            title="Rendimiento"
            icon={BarChart2}
            iconColor="text-blue-600"
            gradientFrom="from-blue-50"
            gradientTo="to-blue-50/50"
          />
          <div className="p-4 md:p-6">
            <div className="h-48 md:h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">Gráfico de rendimiento</span>
            </div>
          </div>
        </div>

        {/* Pacientes Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader
            title="Recientes"
            icon={Users}
            iconColor="text-primary"
            gradientFrom="from-primary/10"
            gradientTo="to-primary/5"
          />
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <span />
              <button
                onClick={() => navigate('/pacientes')}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Ver todos <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : recentPatients.length === 0 ? (
                <p className="text-gray-400 text-center py-6 text-sm">Sin pacientes</p>
              ) : (
                recentPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => navigate(`/historia/${patient.id}`)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{patient.document_id}</p>
                    </div>
                    {Number(patient.debt) > 0 && (
                      <span className="text-xs font-medium text-red-500">${Number(patient.debt).toFixed(0)}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
