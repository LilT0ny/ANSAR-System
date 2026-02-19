import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Plus, Edit, Trash2, X, Check, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { patientsAPI } from '../services/api';

const Patients = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // ── Helper: calculate age ─────────────────────────────────
    const calculateAge = (birthDate) => {
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
        } catch (err) {
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
    const onSubmit = async (formData) => {
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
        } catch (err) {
            console.error('Error creating patient:', err);
            setError(err.message || 'Error al crear paciente');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete patient ────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este paciente?')) return;
        try {
            await patientsAPI.delete(id);
            await fetchPatients();
        } catch (err) {
            console.error('Error deleting patient:', err);
            setError(err.message || 'Error al eliminar paciente');
        }
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
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Gestión de Pacientes</h1>
                    <p className="text-secondary mt-1">Administra la base de datos de pacientes de la clínica.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchPatients}
                        className="text-gray-500 hover:text-primary p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Refrescar"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary font-bold hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm cursor-pointer"
                    >
                        <Plus size={20} />
                        <span>Nuevo Paciente</span>
                    </button>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4 border border-gray-100">
                <Search className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o documento..."
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-primary mr-3" size={24} />
                        <span className="text-gray-500">Cargando pacientes...</span>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-primary text-white font-medium text-sm">
                            <tr>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Documento</th>
                                <th className="px-6 py-4">Edad</th>
                                <th className="px-6 py-4">Género</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Ciudad</th>
                                <th className="px-6 py-4">Deuda</th>
                                <th className="px-6 py-4">Registrado</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-base font-semibold text-gray-900">
                                            {patient.first_name} {patient.last_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                        {patient.document_id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                        {calculateAge(patient.date_of_birth)} años
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                                        {patient.gender || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex flex-col">
                                            <span>{patient.email || '—'}</span>
                                            <span className="text-xs text-gray-400">{patient.phone || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {patient.city || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {Number(patient.debt || 0) > 0 ? (
                                            <span className="text-red-600">${Number(patient.debt).toFixed(2)}</span>
                                        ) : (
                                            <span className="text-green-600">$0.00</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {patient.created_at
                                            ? new Date(patient.created_at).toLocaleDateString('es-ES')
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center space-x-3 items-center">
                                        <button
                                            onClick={() => navigate(`/historia/${patient.id}`)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                            title="Ver Historial / Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Eliminar Paciente"
                                            onClick={() => handleDelete(patient.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPatients.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                                        {searchTerm
                                            ? 'No se encontraron pacientes con ese criterio.'
                                            : 'No hay pacientes registrados. Haz clic en "Nuevo Paciente" para comenzar.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
                                {errors.firstName && <span className="text-red-500 text-xs mt-1">{errors.firstName.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                                <input
                                    {...register("lastName", { required: "El apellido es requerido" })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.lastName ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.lastName && <span className="text-red-500 text-xs mt-1">{errors.lastName.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad *</label>
                                <input
                                    {...register("docId", { required: "El documento es requerido" })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.docId ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.docId && <span className="text-red-500 text-xs mt-1">{errors.docId.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    {...register("email", { pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.email ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
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
