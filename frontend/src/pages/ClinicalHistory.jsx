import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import {
    User, FileText, Activity, Layers, Edit2, Save, X, ArrowLeft, CheckCircle, AlertCircle
} from 'lucide-react';
import Odontogram from '../components/Odontogram';
import OrthodonticGallery from '../components/OrthodonticGallery';

// Mock patient data
const MOCK_PATIENT = {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    docId: '12345678',
    birthDate: '1990-05-15',
    phone: '555-0123',
    email: 'juan@example.com',
    occupation: 'Ingeniero',
    address: 'Av. Las Flores 123',
    allergies: 'Penicilina',
    background: 'Diabetes tipo 2 controlada',
    evolution: 'Paciente con buena higiene, presenta caries en pieza 18.'
};

const ClinicalHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('datos');
    const [showToast, setShowToast] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: MOCK_PATIENT
    });

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    const onSubmit = (data) => {
        console.log("Saving data:", data);
        // Simulate API call
        setTimeout(() => {
            setIsEditing(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 500);
    };

    const tabs = [
        { id: 'datos', label: 'Datos Personales', icon: User },
        { id: 'odontograma', label: 'Odontograma', icon: Layers },
        { id: 'antecedentes', label: 'Antecedentes', icon: Activity },
        { id: 'evolucion', label: 'Evolución', icon: FileText },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-12 relative animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/pacientes')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-800">Historia Clínica</h1>
                        <p className="text-secondary text-sm">Paciente: <span className="font-semibold text-primary">{MOCK_PATIENT.firstName} {MOCK_PATIENT.lastName}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => { setIsEditing(false); reset(); }}
                                className="px-4 py-2 text-gray-600 hover:text-red-500 font-medium transition-colors flex items-center gap-2"
                            >
                                <X size={18} /> Cancelar
                            </button>
                            <button
                                onClick={handleSubmit(onSubmit)}
                                className="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all flex items-center gap-2"
                            >
                                <Save size={18} /> Guardar Cambios
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
                        >
                            <Edit2 size={18} /> Editar Datos
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 flex gap-8 flex-col lg:flex-row">

                {/* Tabs / Navigation */}
                <div className="w-full lg:w-64 shrink-0 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full text-left px-5 py-4 rounded-xl flex items-center gap-3 transition-all duration-200 font-medium",
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                            )}
                        >
                            <tab.icon size={20} className={activeTab === tab.id ? "text-white" : "text-gray-400"} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
                    <form onSubmit={handleSubmit(onSubmit)} className="animate-in slide-in-from-right-4 duration-300">

                        {/* Section: Personal Data */}
                        {activeTab === 'datos' && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                    <User className="text-primary" /> Datos Personales
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Nombres" name="firstName" register={register} errors={errors} disabled={!isEditing} required />
                                    <InputGroup label="Apellidos" name="lastName" register={register} errors={errors} disabled={!isEditing} required />
                                    <InputGroup label="Cédula / DNI" name="docId" register={register} errors={errors} disabled={!isEditing} required />
                                    <InputGroup label="Fecha Nacimiento" name="birthDate" type="date" register={register} errors={errors} disabled={!isEditing} />
                                    <InputGroup label="Teléfono" name="phone" register={register} errors={errors} disabled={!isEditing} />
                                    <InputGroup label="Email" name="email" type="email" register={register} errors={errors} disabled={!isEditing} />
                                    <InputGroup label="Ocupación" name="occupation" register={register} errors={errors} disabled={!isEditing} />
                                    <InputGroup label="Dirección" name="address" register={register} errors={errors} disabled={!isEditing} className="md:col-span-2" />
                                </div>
                            </div>
                        )}

                        {/* Section: Odontogram */}
                        {activeTab === 'odontograma' && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                    <Layers className="text-primary" /> Odontograma Digital
                                </h2>
                                <div className="mb-8">
                                    <Odontogram patientId={id} readOnly={!isEditing} />
                                </div>
                                <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Galería de Imágenes</h3>
                                <OrthodonticGallery patientId={id} />
                            </div>
                        )}

                        {/* Section: Background */}
                        {activeTab === 'antecedentes' && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                    <Activity className="text-primary" /> Antecedentes Médicos
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Alergias</label>
                                        <textarea
                                            {...register("allergies")}
                                            disabled={!isEditing}
                                            rows={3}
                                            className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                                            placeholder="Describa alergias conocidas..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Antecedentes Patológicos</label>
                                        <textarea
                                            {...register("background")}
                                            disabled={!isEditing}
                                            rows={5}
                                            className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                                            placeholder="Enfermedades crónicas, cirugías previas, etc..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section: Evolution */}
                        {activeTab === 'evolucion' && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                    <FileText className="text-primary" /> Notas de Evolución
                                </h2>
                                <div className="space-y-6">
                                    <textarea
                                        {...register("evolution")}
                                        disabled={!isEditing}
                                        rows={12}
                                        className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y disabled:bg-gray-50 disabled:text-gray-500 font-mono text-sm leading-relaxed"
                                        placeholder="Bitácora de evolución del tratamiento..."
                                    />
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-50">
                    <CheckCircle className="text-primary" size={20} />
                    <span>Datos actualizados correctamente.</span>
                </div>
            )}
        </div>
    );
};

// Reusable Input Component
const InputGroup = ({ label, name, type = "text", register, errors, disabled, required, className }) => (
    <div className={className}>
        <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">{label}</label>
        <div className="relative">
            <input
                type={type}
                {...register(name, { required: required ? "Este campo es obligatorio" : false })}
                disabled={disabled}
                className={clsx(
                    "w-full px-4 py-3 border rounded-lg outline-none transition-all font-sans",
                    disabled ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed" : "bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    errors[name] && "border-red-500 focus:border-red-500"
                )}
            />
            {errors[name] && <AlertCircle className="absolute right-3 top-3.5 text-red-500" size={16} />}
        </div>
        {errors[name] && <span className="text-red-500 text-xs mt-1 block">{errors[name].message}</span>}
    </div>
);

export default ClinicalHistory;
