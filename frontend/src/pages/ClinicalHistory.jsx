import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import {
    User, FileText, Activity, Layers, Edit2, Save, X, ArrowLeft,
    CheckCircle, AlertCircle, Calendar, Phone, Mail, MapPin, Briefcase
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
        window.scrollTo(0, 0);
    }, []);

    const onSubmit = (data) => {
        console.log("Saving data:", data);
        setTimeout(() => {
            setIsEditing(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 500);
    };

    const handleCancel = () => {
        setIsEditing(false);
        reset();
    };

    const tabs = [
        { id: 'datos', label: 'Datos Personales', icon: User },
        { id: 'odontograma', label: 'Odontograma', icon: Layers },
        { id: 'antecedentes', label: 'Antecedentes', icon: Activity },
        { id: 'evolucion', label: 'Evolución', icon: FileText },
    ];

    return (
        <div className="space-y-8 relative animate-in fade-in duration-300">

            {/* ─── Page Header (integrated, no sticky subheader) ─── */}
            <div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Title + Patient info */}
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-800">Historia Clínica</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm font-serif">
                                {MOCK_PATIENT.firstName[0]}{MOCK_PATIENT.lastName[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{MOCK_PATIENT.firstName} {MOCK_PATIENT.lastName}</p>
                                <p className="text-xs text-gray-400">Cédula: {MOCK_PATIENT.docId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Edit / Save / Cancel buttons */}
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 font-medium transition-colors flex items-center gap-2 rounded-lg"
                                >
                                    <X size={18} /> Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    className="bg-primary hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
                                >
                                    <Save size={18} /> Guardar Cambios
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="bg-primary hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
                            >
                                <Edit2 size={18} /> Editar Datos
                            </button>
                        )}
                    </div>
                </div>

                {/* Editing banner */}
                {isEditing && (
                    <div className="mt-4 ml-14 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-primary font-medium">
                        <Edit2 size={14} />
                        Modo de edición activo — Los cambios solo se guardarán al presionar "Guardar Cambios".
                    </div>
                )}
            </div>

            {/* ─── Content Layout ───────────────────────────────── */}
            <div className="flex gap-8 flex-col lg:flex-row">

                {/* Tabs / Navigation */}
                <div className="w-full lg:w-64 shrink-0 space-y-2">
                    {tabs.map(tab => (
                        <button
                            type="button"
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
                <div className="flex-1 min-h-[600px]">

                    {/* ── Section: Personal Data ─────────────────── */}
                    {activeTab === 'datos' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in duration-200">
                            <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                <User className="text-primary" /> Datos Personales
                            </h2>
                            <form onSubmit={(e) => e.preventDefault()}>
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
                            </form>
                        </div>
                    )}

                    {/* ── Section: Odontogram ────────────────────── */}
                    {activeTab === 'odontograma' && (
                        <div className="animate-in fade-in duration-200">
                            <Odontogram patientId={id} readOnly={!isEditing} />
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
                                <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Galería de Imágenes</h3>
                                <OrthodonticGallery patientId={id} />
                            </div>
                        </div>
                    )}

                    {/* ── Section: Background ────────────────────── */}
                    {activeTab === 'antecedentes' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in duration-200">
                            <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                <Activity className="text-primary" /> Antecedentes Médicos
                            </h2>
                            <form onSubmit={(e) => e.preventDefault()}>
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
                            </form>
                        </div>
                    )}

                    {/* ── Section: Evolution ─────────────────────── */}
                    {activeTab === 'evolucion' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in duration-200">
                            <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                <FileText className="text-primary" /> Notas de Evolución
                            </h2>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-6">
                                    <textarea
                                        {...register("evolution")}
                                        disabled={!isEditing}
                                        rows={12}
                                        className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y disabled:bg-gray-50 disabled:text-gray-500 font-mono text-sm leading-relaxed"
                                        placeholder="Bitácora de evolución del tratamiento..."
                                    />
                                </div>
                            </form>
                        </div>
                    )}

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
