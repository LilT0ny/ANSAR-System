import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Plus, Edit, Trash2, X, Check, Mail, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const Patients = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for display with new fields for UH 11 & UH 12
    // Helper: calculate age from birth date
    const calculateAge = (birthDate) => {
        if (!birthDate) return '—';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const [patients, setPatients] = useState([
        {
            id: 1,
            firstName: 'Juan',
            lastName: 'Pérez',
            docId: '12345678',
            email: 'juan@example.com',
            phone: '555-0123',
            birthDate: '1992-03-15',
            gender: 'Masculino',
            city: 'Bogotá',
            lastVisit: '2026-02-10',
            paymentStatus: 'DEUDA',
            isActive: true
        },
        {
            id: 2,
            firstName: 'María',
            lastName: 'López',
            docId: '87654321',
            email: 'maria@example.com',
            phone: '555-0987',
            birthDate: '1998-07-22',
            gender: 'Femenino',
            city: 'Medellín',
            lastVisit: '2026-02-05',
            paymentStatus: 'AL_DIA',
            isActive: true
        },
        {
            id: 3,
            firstName: 'Carlos',
            lastName: 'Ruiz',
            docId: '11223344',
            email: 'carlos@example.com',
            phone: '555-4433',
            birthDate: '1981-11-08',
            gender: 'Masculino',
            city: 'Cali',
            lastVisit: '2025-12-15',
            paymentStatus: 'AL_DIA',
            isActive: true
        },
    ]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log(data);
        // Connect to backend API in real app
        setPatients([...patients, {
            ...data,
            id: Date.now(),
            lastVisit: new Date().toISOString().split('T')[0],
            paymentStatus: 'AL_DIA',
            isActive: true
        }]);
        setShowForm(false);
        reset();
    };


    const handleSoftDelete = (id) => {
        if (window.confirm('¿Está seguro de realizar la baja lógica de este paciente?')) {
            setPatients(patients.map(p => p.id === id ? { ...p, isActive: false } : p));
        }
    };

    const sendPaymentReminder = (email) => {
        alert(`Recordatorio de pago enviado a ${email}`);
        // Integration with Resend/SendGrid would go here (UH 7/UH 12)
    };

    const filteredPatients = patients.filter(patient =>
        patient.isActive && (
            patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.docId.includes(searchTerm)
        )
    );

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Gestión de Pacientes</h1>
                    <p className="text-secondary mt-1">Administra la base de datos, historial y estados de cuenta.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm cursor-pointer"
                >
                    <Plus size={20} />
                    <span>Nuevo Paciente</span>
                </button>
            </header>

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
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-primary text-white font-medium text-sm">
                        <tr>
                            <th className="px-6 py-4">Paciente</th>
                            <th className="px-6 py-4">Edad</th>
                            <th className="px-6 py-4">Género</th>
                            <th className="px-6 py-4">Contacto</th>
                            <th className="px-6 py-4">Última Visita</th>
                            <th className="px-6 py-4">Estado de Pago</th>
                            <th className="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="text-base font-semibold text-gray-900">{patient.firstName} {patient.lastName}</div>
                                        <div className="text-sm text-gray-500">ID: {patient.docId}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                    {calculateAge(patient.birthDate)} años
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {patient.gender}
                                </td>

                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex flex-col">
                                        <span>{patient.email}</span>
                                        <span className="text-xs text-gray-400">{patient.phone}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {patient.lastVisit}
                                </td>
                                <td className="px-6 py-4">
                                    {patient.paymentStatus === 'DEUDA' ? (
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
                                                <AlertTriangle size={12} />
                                                DEUDA
                                            </span>
                                            <button
                                                onClick={() => sendPaymentReminder(patient.email)}
                                                className="text-blue-500 hover:text-blue-700 text-xs underline cursor-pointer"
                                                title="Enviar Recordatorio"
                                            >
                                                [Enviar]
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                            AL DÍA
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 flex justify-center space-x-3 items-center">
                                    <button
                                        onClick={() => navigate(`/historia/${patient.id}`)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Ver Historial/Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Baja Lógica"
                                        onClick={() => handleSoftDelete(patient.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                                    No se encontraron pacientes activos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    {...register("firstName", { required: "El nombre es requerido" })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.firstName ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.firstName && <span className="text-red-500 text-xs mt-1">{errors.firstName.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                <input
                                    {...register("lastName", { required: "El apellido es requerido" })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.lastName ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.lastName && <span className="text-red-500 text-xs mt-1">{errors.lastName.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad</label>
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
                                    {...register("email", { required: "El email es requerido", pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.email ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    {...register("birthDate", { required: "La fecha de nacimiento es requerida" })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all", errors.birthDate ? "border-red-500" : "border-gray-300")}
                                />
                                {errors.birthDate && <span className="text-red-500 text-xs mt-1">{errors.birthDate.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                                <select
                                    {...register("gender", { required: "El género es requerido" })}
                                    className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white", errors.gender ? "border-red-500" : "border-gray-300")}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {errors.gender && <span className="text-red-500 text-xs mt-1">{errors.gender.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    {...register("phone")}
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
                                    className="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition-colors font-medium flex items-center space-x-2 cursor-pointer"
                                >
                                    <span>Guardar Paciente</span>
                                    <Check size={18} />
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
