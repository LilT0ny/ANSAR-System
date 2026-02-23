import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import {
    User, FileText, Activity, Layers, Edit2, Save, X, ArrowLeft,
    CheckCircle, AlertCircle, Calendar, Phone, Mail, MapPin, Briefcase,
    Loader2, Search, Users
} from 'lucide-react';
import Odontogram from '../components/Odontogram';
import OrthodonticGallery from '../components/OrthodonticGallery';
import { patientsAPI } from '../services/api';

// ── Age calculation helper ────────────────────────────────────
const calculateAge = (birthDate) => {
    if (!birthDate) return '—';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};


// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ClinicalHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // If no patient ID in the URL → show selection screen
    if (!id) {
        return <PatientSelectionScreen navigate={navigate} />;
    }

    // Otherwise → show the clinical history for that patient
    return <PatientClinicalView patientId={id} navigate={navigate} />;
};


// ═══════════════════════════════════════════════════════════════
// PATIENT SELECTION SCREEN (when no ID)
// ═══════════════════════════════════════════════════════════════
const PatientSelectionScreen = ({ navigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all patients on mount
    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const data = await patientsAPI.list();
                setPatients(data);
                setFilteredPatients(data);
            } catch (err) {
                console.error('Error fetching patients:', err);
                setError(typeof err === 'object' ? (err.message || 'Error al cargar pacientes') : String(err));
                if (err.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [navigate]);

    // Filter patients by search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPatients(patients);
            return;
        }
        const q = searchTerm.toLowerCase();
        setFilteredPatients(
            patients.filter(p =>
                `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
                p.document_id?.toLowerCase().includes(q) ||
                p.email?.toLowerCase().includes(q) ||
                p.phone?.toLowerCase().includes(q)
            )
        );
    }, [searchTerm, patients]);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-800">Historia Clínica</h1>
                <p className="text-gray-500 mt-1">Seleccione un paciente para ver o editar su historia clínica</p>
            </div>

            {/* Selection Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Info Banner */}
                <div className="bg-gradient-to-r from-primary/5 to-emerald-50 px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Users className="text-primary" size={28} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 font-serif">Buscar Paciente</h2>
                            <p className="text-sm text-gray-500">
                                Busque por nombre, cédula, email o teléfono para acceder a la ficha clínica completa.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Input */}
                <div className="px-8 py-5 border-b border-gray-100">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar paciente por nombre, cédula, email o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Patient List */}
                <div className="px-8 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-primary mr-3" size={24} />
                            <span className="text-gray-500">Cargando pacientes...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <AlertCircle className="mx-auto text-red-400 mb-3" size={40} />
                            <p className="text-gray-600 font-medium">{error}</p>
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-16">
                            <Search className="mx-auto text-gray-300 mb-3" size={40} />
                            <p className="text-gray-500 font-medium">
                                {searchTerm
                                    ? 'No se encontraron pacientes con ese criterio.'
                                    : 'No hay pacientes registrados.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => navigate('/pacientes')}
                                    className="text-primary hover:underline mt-2 text-sm font-medium"
                                >
                                    Ir a registrar pacientes →
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[480px] overflow-y-auto">
                            {filteredPatients.map(patient => (
                                <button
                                    key={patient.id}
                                    onClick={() => navigate(`/historia/${patient.id}`)}
                                    className="w-full text-left px-5 py-4 rounded-xl border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 flex items-center gap-4 group"
                                >
                                    {/* Avatar */}
                                    <div className="h-11 w-11 rounded-full bg-gray-100 group-hover:bg-primary/15 text-gray-500 group-hover:text-primary flex items-center justify-center font-bold text-sm shrink-0 transition-colors">
                                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                            {patient.first_name} {patient.last_name}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            Cédula: {patient.document_id}
                                            {patient.email ? ` · ${patient.email}` : ''}
                                            {patient.phone ? ` · ${patient.phone}` : ''}
                                        </p>
                                    </div>

                                    {/* Right side details */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {patient.gender && (
                                            <span className="text-xs text-gray-400 capitalize hidden md:inline">
                                                {patient.gender}
                                            </span>
                                        )}
                                        {patient.date_of_birth && (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                                                {calculateAge(patient.date_of_birth)} años
                                            </span>
                                        )}
                                        {Number(patient.debt || 0) > 0 && (
                                            <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-1 rounded-lg">
                                                ${Number(patient.debt).toFixed(2)}
                                            </span>
                                        )}
                                        <ArrowLeft className="text-gray-300 group-hover:text-primary rotate-180 transition-colors" size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer count */}
                {!loading && !error && (
                    <div className="px-8 py-3 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            {filteredPatients.length} de {patients.length} paciente{patients.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
// PATIENT CLINICAL VIEW (when ID is present)
// ═══════════════════════════════════════════════════════════════
const PatientClinicalView = ({ patientId, navigate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('datos');
    const [showToast, setShowToast] = useState(false);
    const [patient, setPatient] = useState(null);
    const [clinicalData, setClinicalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const patientForm = useForm();
    const clinicalForm = useForm();

    // ── Fetch patient + clinical history from API ─────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await patientsAPI.getById(patientId);
            const mapped = {
                id: data.id,
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                docId: data.document_id || '',
                birthDate: data.date_of_birth || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                city: data.city || '',
                gender: data.gender || '',
                debt: data.debt || 0,
            };
            setPatient(mapped);
            patientForm.reset(mapped);

            // Fetch clinical history
            try {
                const historyList = await patientsAPI.getHistory(patientId);
                if (historyList && historyList.length > 0) {
                    const raw = historyList[0];
                    setClinicalData(raw);
                    // Strip server-only fields before loading into form
                    const { id: _id, patient_id: _pid, created_at: _ca, updated_at: _ua, created_by: _cb, ...formFields } = raw;
                    clinicalForm.reset(formFields);
                }
            } catch (e) {
                console.log('No clinical history found:', e.message);
            }
        } catch (err) {
            console.error('Error fetching patient:', err);
            const msg = typeof err === 'object' ? (err.message || 'Error al cargar paciente') : String(err);
            setError(msg);
            if (err.status === 401) navigate('/login');
            if (err.status === 404) setError('Paciente no encontrado.');
        } finally {
            setLoading(false);
        }
    }, [patientId, patientForm, clinicalForm, navigate]);

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
    }, [fetchData]);

    // ── Save patient personal data ────────────────────────────
    const onSavePatient = async (data) => {
        setSaving(true);
        try {
            const apiData = {
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone || null,
                address: data.address || null,
                city: data.city || null,
                gender: data.gender || null,
                date_of_birth: data.birthDate || null,
            };
            await patientsAPI.update(patientId, apiData);
            setIsEditing(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            await fetchData();
        } catch (err) {
            const msg = typeof err === 'object' ? (err.message || 'Error al guardar') : String(err);
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    // ── Save clinical history questionnaire ───────────────────
    const onSaveClinical = async (data) => {
        setSaving(true);
        try {
            // Strip server-only fields that shouldn't be sent back
            const { id: _id, patient_id: _pid, created_at: _ca, updated_at: _ua, created_by: _cb, ...cleanData } = data;
            await patientsAPI.upsertHistory(patientId, cleanData);
            setIsEditing(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            await fetchData();
        } catch (err) {
            const msg = typeof err === 'object' ? (err.message || 'Error al guardar historia clínica') : String(err);
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        if (activeTab === 'datos') {
            patientForm.handleSubmit(onSavePatient)();
        } else if (activeTab === 'antecedentes') {
            clinicalForm.handleSubmit(onSaveClinical)();
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (patient) patientForm.reset(patient);
        if (clinicalData) clinicalForm.reset(clinicalData);
    };

    const tabs = [
        { id: 'datos', label: 'Datos Personales', icon: User },
        { id: 'odontograma', label: 'Odontograma', icon: Layers },
        { id: 'antecedentes', label: 'Historia Clínica', icon: Activity },
    ];

    // ── Loading State ─────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-primary mr-3" size={28} />
                <span className="text-gray-500 text-lg">Cargando historia clínica...</span>
            </div>
        );
    }

    if (error && !patient) {
        return (
            <div className="text-center py-24">
                <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-700 mb-2">{error}</h2>
                <button onClick={() => navigate('/historia')} className="text-primary hover:underline mt-2">
                    ← Seleccionar otro paciente
                </button>
            </div>
        );
    }

    const age = calculateAge(patient?.birthDate);

    return (
        <div className="space-y-8 relative animate-in fade-in duration-300">

            {/* ─── Page Header ─── */}
            <div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        {/* Back button */}
                        <button
                            onClick={() => navigate('/historia')}
                            className="text-sm text-gray-400 hover:text-primary flex items-center gap-1 mb-2 transition-colors"
                        >
                            <ArrowLeft size={14} /> Volver a selección de paciente
                        </button>

                        <h1 className="text-3xl font-serif font-bold text-gray-800">Historia Clínica</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm font-serif">
                                {patient?.firstName?.[0] || '?'}{patient?.lastName?.[0] || '?'}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{patient?.firstName} {patient?.lastName}</p>
                                <p className="text-xs text-gray-400">
                                    Doc: {patient?.docId} · Edad: {age} años
                                    {patient?.gender ? ` · ${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}` : ''}
                                    {Number(patient?.debt) > 0 && (
                                        <span className="text-red-500 font-semibold"> · Deuda: ${Number(patient.debt).toFixed(2)}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button type="button" onClick={handleCancel}
                                    className="px-4 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 font-medium transition-colors flex items-center gap-2 rounded-lg">
                                    <X size={18} /> Cancelar
                                </button>
                                <button type="button" onClick={handleSave} disabled={saving}
                                    className="bg-primary hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2">
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)}
                                className="bg-primary hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2">
                                <Edit2 size={18} /> Editar Datos
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                    </div>
                )}

                {isEditing && (
                    <div className="mt-4 ml-14 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-primary font-medium">
                        <Edit2 size={14} />
                        Modo de edición activo — Los cambios solo se guardarán al presionar "Guardar Cambios".
                    </div>
                )}
            </div>

            {/* ─── Content Layout ─── */}
            <div className="flex gap-8 flex-col lg:flex-row">

                {/* Tabs */}
                <div className="w-full lg:w-64 shrink-0 space-y-2">
                    {tabs.map(tab => (
                        <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full text-left px-5 py-4 rounded-xl flex items-center gap-3 transition-all duration-200 font-medium",
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                            )}>
                            <tab.icon size={20} className={activeTab === tab.id ? "text-white" : "text-gray-400"} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-[600px]">

                    {/* ── Section: Personal Data ─── */}
                    {activeTab === 'datos' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in duration-200">
                            <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                <User className="text-primary" /> Datos Personales
                            </h2>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Nombres" name="firstName" register={patientForm.register} errors={patientForm.formState.errors} disabled={!isEditing} required />
                                    <InputGroup label="Apellidos" name="lastName" register={patientForm.register} errors={patientForm.formState.errors} disabled={!isEditing} required />
                                    <InputGroup label="Cédula / DNI" name="docId" register={patientForm.register} errors={patientForm.formState.errors} disabled={true} required />
                                    <InputGroup label="Fecha Nacimiento" name="birthDate" type="date" register={patientForm.register} errors={patientForm.formState.errors} disabled={!isEditing} />
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Edad</label>
                                        <input type="text" value={`${age} años`} disabled className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Género</label>
                                        <select
                                            {...patientForm.register("gender")}
                                            disabled={!isEditing}
                                            className={clsx(
                                                "w-full px-4 py-3 border rounded-lg outline-none transition-all",
                                                !isEditing ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed" : "bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            )}
                                        >
                                            <option value="">Sin especificar</option>
                                            <option value="masculino">Masculino</option>
                                            <option value="femenino">Femenino</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                    <InputGroup label="Teléfono" name="phone" register={patientForm.register} errors={patientForm.formState.errors} disabled={!isEditing} />
                                    <InputGroup label="Email" name="email" type="email" register={patientForm.register} errors={patientForm.formState.errors} disabled={true} />
                                    <InputGroup label="Ciudad" name="city" register={patientForm.register} errors={patientForm.formState.errors} disabled={!isEditing} />
                                    <InputGroup label="Dirección" name="address" register={patientForm.register} errors={patientForm.formState.errors} disabled={!isEditing} className="md:col-span-2" />
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── Section: Odontogram ─── */}
                    {activeTab === 'odontograma' && (
                        <div className="animate-in fade-in duration-200">
                            <Odontogram patientId={patientId} readOnly={!isEditing} />
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
                                <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Galería de Imágenes</h3>
                                <OrthodonticGallery patientId={patientId} />
                            </div>
                        </div>
                    )}

                    {/* ── Section: Clinical History Questionnaire ─── */}
                    {activeTab === 'antecedentes' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in duration-200 space-y-8">

                            {/* 1. Motivo de consulta */}
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 flex items-center gap-2 pb-4 border-b border-gray-100">
                                    <Activity className="text-primary" /> 1. Motivo de la Consulta
                                </h2>
                                <textarea
                                    {...clinicalForm.register("motivo_consulta")}
                                    disabled={!isEditing}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="Describa el motivo de la consulta..."
                                />
                            </div>

                            {/* 2. Antecedentes Patológicos */}
                            <div>
                                <h2 className="text-lg font-serif font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                                    2. Antecedentes Patológicos Personales y Familiares
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">Cuestionario de Salud: responda marcando cada pregunta.</p>

                                <div className="space-y-4">
                                    <CheckboxRow label="1. Hipertensión Arterial" name="hipertension" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="2. Enfermedad Cardiaca" name="enfermedad_cardiaca" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="enfermedad_cardiaca_cual" detailLabel="¿Cuál?" />
                                    <CheckboxRow label="3. Diabetes" name="diabetes" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="4. Hemorragias" name="hemorragias" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="5. Es alérgico (Medicamentos, anestésicos, alimentos u otras)" name="alergico" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="alergico_cual" detailLabel="¿Cuál?" />
                                    <CheckboxRow label="6. Es usted portador de VIH" name="vih" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="7. Está usted embarazada" name="embarazada" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="embarazada_semanas" detailLabel="Semanas" detailType="number" />
                                    <CheckboxRow label="8. Medicamentos en uso" name="medicamentos_en_uso" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="medicamentos_cual" detailLabel="¿Cuál?" />
                                    <CheckboxRow label="9. Otras Enfermedades" name="otras_enfermedades" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="otras_enfermedades_cual" detailLabel="¿Cuál?" />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">10. Antecedentes Patológicos Familiares</label>
                                    <textarea
                                        {...clinicalForm.register("antecedentes_familiares")}
                                        disabled={!isEditing}
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                                        placeholder="Describa antecedentes patológicos familiares..."
                                    />
                                </div>
                            </div>

                            {/* 3. Antecedentes Estomatológicos */}
                            <div>
                                <h2 className="text-lg font-serif font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                                    3. Antecedentes Estomatológicos
                                </h2>

                                <div className="space-y-4">
                                    <CheckboxRow label="1. Ha tenido golpes en la cara o en sus dientes" name="golpes_cara_dientes" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="2. Ha tenido úlceras bucales internas" name="ulceras_bucales" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="3. Sangran sus encías" name="sangrado_encias" register={clinicalForm.register} disabled={!isEditing} />

                                    <div className="flex items-center gap-4">
                                        <label className="text-sm font-medium text-gray-700 min-w-[280px]">4. ¿Cuántas veces al día se cepilla los dientes?</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            {...clinicalForm.register("cepillado_veces_dia", { valueAsNumber: true })}
                                            disabled={!isEditing}
                                            className="w-24 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">5. Última visita al odontólogo</label>
                                        <input
                                            type="text"
                                            {...clinicalForm.register("ultima_visita_odontologo")}
                                            disabled={!isEditing}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-500"
                                            placeholder="Ej: Hace 6 meses"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Toast */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-50">
                    <CheckCircle className="text-primary" size={20} />
                    <span>Datos actualizados correctamente.</span>
                </div>
            )}
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════
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

const CheckboxRow = ({ label, name, register, disabled, detailName, detailLabel, detailType = "text" }) => (
    <div className="flex flex-wrap items-center gap-4 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
        <label className="flex items-center gap-3 min-w-[320px] text-sm">
            <input
                type="checkbox"
                {...register(name)}
                disabled={disabled}
                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary disabled:opacity-50"
            />
            <span className={clsx("font-medium", disabled ? "text-gray-500" : "text-gray-700")}>{label}</span>
        </label>
        {detailName && (
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{detailLabel}:</span>
                <input
                    type={detailType}
                    {...register(detailName)}
                    disabled={disabled}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-500 w-40"
                />
            </div>
        )}
    </div>
);

export default ClinicalHistory;
