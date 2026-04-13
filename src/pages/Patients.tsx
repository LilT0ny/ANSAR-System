import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Plus, Edit, Trash2, X, Check, Loader2, RefreshCw, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { patientsAPI } from '../services/api';
import { Patient } from '../types';

const Patients = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // ── Helper: calculate age ─────────────────────────────────
    const calculateAge = (birthDate: string | null | undefined) => {
        if (!birthDate) return '—';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    // ── Fetch patients from API ───────────────────────────────
    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await patientsAPI.list();
            setPatients(data);
        } catch (err: any) {
            console.error('Error fetching patients:', err);
            setError(err.message || 'Error al cargar pacientes');
            if (err.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // ── Create patient ────────────────────────────────────────
    const onSubmit = async (formData: any) => {
        setSaving(true);
        setError(null);
        try {
            // Map frontend form fields to API fields
            const apiData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                document_id: formData.docId,
                email: formData.email || null,
                phone: formData.phone || null,
                date_of_birth: formData.birthDate || null,
                address: formData.address || null,
                city: formData.city || null,
                gender: formData.gender || null,
            };
            await patientsAPI.create(apiData);
            setShowForm(false);
            reset();
            // Refresh the list
            await fetchPatients();
        } catch (err: any) {
            console.error('Error creating patient:', err);
            setError(err.message || 'Error al crear paciente');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete patient ────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Está seguro de eliminar este paciente?')) return;
        try {
            await patientsAPI.delete(id);
            await fetchPatients();
        } catch (err: any) {
            console.error('Error deleting patient:', err);
            setError(err.message || 'Error al eliminar paciente');
        }
    };

    // ── Open WhatsApp ─────────────────────────────────────
    const handleWhatsApp = (patient: Patient) => {
        if (!patient.phone) {
            setError('El paciente no tiene teléfono registrado');
            return;
        }
        const phone = patient.phone.replace(/\D/g, '');
        const message = encodeURIComponent(`Hola ${patient.first_name}, te contactamos de la clínica dental. ¿En qué podemos ayudarte?`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    // ── Filter patients locally (search) ──────────────────────
    const filteredPatients = patients.filter(patient => {
        const term = searchTerm.toLowerCase();
        return (
            (patient.last_name || '').toLowerCase().includes(term) ||
            (patient.first_name || '').toLowerCase().includes(term) ||
            (patient.document_id || '').includes(searchTerm)
        );
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">Gestión de Pacientes</h1>
                    <p className="text-secondary mt-1 text-sm md:text-base">Administra la base de datos de pacientes de la clínica.</p>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                        onClick={fetchPatients}
                        className="text-gray-500 hover:text-primary p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Refrescar"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex-1 sm:flex-none justify-center bg-primary font-bold hover:bg-green-600 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-colors shadow-sm cursor-pointer text-sm"
                    >
                        <Plus size={20} />
                        <span>Nuevo Paciente</span>
                    </button>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex justify-between items-center animate-in fade-in duration-200">
                    <span className="text-sm">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm flex items-center space-x-3 border border-gray-100">
                <Search className="text-gray-400 shrink-0" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o ID..."
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Patients List - Cards on Mobile, Table on Desktop */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-primary mr-3" size={24} />
                        <span className="text-gray-500 font-medium">Cargando pacientes...</span>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {filteredPatients.map((patient) => (
                                <div key={patient.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                                            {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{patient.first_name} {patient.last_name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{calculateAge(patient.date_of_birth)} años</span>
                                                <span>•</span>
                                                <span className={Number(patient.debt || 0) > 0 ? 'text-red-600' : 'text-green-600'}>
                                                    ${Number(patient.debt || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => navigate(`/historia/${patient.id}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        {patient.phone && (
                                            <button
                                                onClick={() => handleWhatsApp(patient)}
                                                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg"
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(patient.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredPatients.length === 0 && (
                                <div className="px-6 py-12 text-center text-gray-400">
                                    {searchTerm
                                        ? 'No se encontraron pacientes.'
                                        : 'No hay pacientes registrados.'}
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead className="bg-primary text-white font-medium text-sm">
                                    <tr>
                                        <th className="px-4 py-3">Paciente</th>
                                        <th className="px-4 py-3">Edad</th>
                                        <th className="px-4 py-3">Deuda</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="text-base font-semibold text-gray-900">
                                                    {patient.first_name} {patient.last_name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {calculateAge(patient.date_of_birth)} años
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium">
                                                {Number(patient.debt || 0) > 0 ? (
                                                    <span className="text-red-600">${Number(patient.debt).toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-green-600">$0.00</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 flex justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/historia/${patient.id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Ver/Editar Historia"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {patient.phone && (
                                                    <button
                                                        onClick={() => handleWhatsApp(patient)}
                                                        className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Enviar WhatsApp"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                    onClick={() => handleDelete(patient.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPatients.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                                                {searchTerm
                                                    ? 'No se encontraron pacientes con ese criterio.'
                                                    : 'No hay pacientes registrados.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Stats footer */}
            {!loading && (
                <div className="text-sm text-gray-400 text-right">
                    {filteredPatients.length} de {patients.length} pacientes
                </div>
            )}

            {/* Register Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-serif font-bold text-gray-800">Registrar Nuevo Paciente</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    {...register("firstName", { required: "El nombre es requerido" })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.firstName ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.firstName && <span className="text-red-500 text-xs mt-1">{errors.firstName.message as string}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                                <input
                                    {...register("lastName", { required: "El apellido es requerido" })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.lastName ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.lastName && <span className="text-red-500 text-xs mt-1">{errors.lastName.message as string}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad *</label>
                                <input
                                    {...register("docId", { required: "El documento es requerido" })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.docId ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.docId && <span className="text-red-500 text-xs mt-1">{errors.docId.message as string}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    {...register("email", { pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.email ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message as string}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    {...register("birthDate")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    {...register("phone")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input
                                    {...register("address")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                                <input
                                    {...register("city")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                                <select
                                    {...register("gender")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="femenino">Femenino</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={clsx(
                                        "text-white px-6 py-2 rounded-lg shadow-md transition-colors font-medium flex items-center space-x-2 cursor-pointer",
                                        saving ? "bg-gray-400" : "bg-primary hover:bg-green-600"
                                    )}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Guardar Paciente</span>
                                            <Check size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patients;
