import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import clsx from 'clsx';


const Patients = () => {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for display
    const [patients, setPatients] = useState([
        { id: 1, firstName: 'Juan', lastName: 'Perez', docId: '12345678', email: 'juan@example.com', phone: '555-0123' },
        { id: 2, firstName: 'Maria', lastName: 'Gomez', docId: '87654321', email: 'maria@example.com', phone: '555-0987' },
    ]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log(data);
        // TODO: Connect to backend API
        setPatients([...patients, { ...data, id: Date.now() }]);
        setShowForm(false);
        reset();
    };

    const filteredPatients = patients.filter(patient =>
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.docId.includes(searchTerm)
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-800">Gestión de Pacientes</h1>
                        <p className="text-secondary mt-1">Administra la base de datos de tus pacientes.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        <span>Nuevo Paciente</span>
                    </button>
                </header>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center space-x-4 border border-gray-100">
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
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Nombre Completo</th>
                                <th className="px-6 py-4">Documento</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Teléfono</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">{patient.firstName} {patient.lastName}</td>
                                    <td className="px-6 py-4 text-gray-600">{patient.docId}</td>
                                    <td className="px-6 py-4 text-gray-600">{patient.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{patient.phone}</td>
                                    <td className="px-6 py-4 flex justify-center space-x-3">
                                        <button className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                        <button className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                        No se encontraron pacientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Register Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
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
                                        className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none", errors.firstName ? "border-red-500" : "border-gray-300")}
                                    />
                                    {errors.firstName && <span className="text-red-500 text-xs mt-1">{errors.firstName.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                    <input
                                        {...register("lastName", { required: "El apellido es requerido" })}
                                        className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none", errors.lastName ? "border-red-500" : "border-gray-300")}
                                    />
                                    {errors.lastName && <span className="text-red-500 text-xs mt-1">{errors.lastName.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad</label>
                                    <input
                                        {...register("docId", { required: "El documento es requerido" })}
                                        className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none", errors.docId ? "border-red-500" : "border-gray-300")}
                                    />
                                    {errors.docId && <span className="text-red-500 text-xs mt-1">{errors.docId.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        {...register("email", { required: "El email es requerido", pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })}
                                        className={clsx("w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none", errors.email ? "border-red-500" : "border-gray-300")}
                                    />
                                    {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
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
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition-colors font-medium flex items-center space-x-2"
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
        </div>
    );
};

export default Patients;
