import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import {
    User, FileText, Activity, Layers, Edit2, Save, X, ArrowLeft,
    CheckCircle, AlertCircle, Calendar, Phone, Mail, MapPin, Briefcase,
    Loader2, Search, Users, Download
} from 'lucide-react';
import { Odontogram, OrthodonticGallery } from '../components/organisms';
import { patientsAPI } from '../services/api';
import { calculateAge } from '../utils';
import generateClinicalHistoryPDF from '../utils/clinicalHistoryPDF';
import generateFormPDF from '../utils/formPDF';
import generateCertificatePDF from '../utils/certificatePDF';
import { PageHeader, SectionHeader } from '../components/molecules';
import { useToast } from '../components/atoms';


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
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <PageHeader 
                title="Historia Clínica"
                subtitle="Selecciona un paciente"
            />

            {/* Selection Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                {/* Info Banner */}
                <SectionHeader
                    title="Buscar Paciente"
                    description="Por nombre, cédula o teléfono"
                    icon={User}
                    iconColor="text-primary"
                    gradientFrom="from-primary/10"
                    gradientTo="to-primary/5"
                />

                {/* Search Input */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Patient List */}
                <div className="p-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-primary mr-2" size={18} />
                            <span className="text-gray-500 text-sm">Cargando...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <AlertCircle className="mx-auto text-red-400 mb-2" size={24} />
                            <p className="text-gray-600 text-sm">{error}</p>
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">
                                {searchTerm ? 'Sin resultados' : 'Sin pacientes'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-[400px] overflow-y-auto">
                            {filteredPatients.map(patient => (
                                <button
                                    key={patient.id}
                                    onClick={() => navigate(`/historia/${patient.id}`)}
                                    className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                                >
                                    {/* Avatar */}
                                    <div className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-gray-100 group-hover:bg-primary/15 text-gray-500 group-hover:text-primary flex items-center justify-center font-bold text-xs md:text-sm shrink-0 transition-colors uppercase">
                                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm md:text-base truncate">
                                            {patient.first_name} {patient.last_name}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-gray-400 truncate mt-0.5">
                                            ID: {patient.document_id}
                                            {patient.phone && <span className="hidden sm:inline"> · {patient.phone}</span>}
                                        </p>
                                    </div>

                                    {/* Right side details */}
                                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                        <div className="flex flex-col items-end">
                                            {patient.date_of_birth && (
                                                <span className="text-[10px] md:text-xs bg-gray-100 text-gray-500 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg">
                                                    {calculateAge(patient.date_of_birth)} años
                                                </span>
                                            )}
                                            {Number(patient.debt || 0) > 0 && (
                                                <span className="text-[10px] md:text-xs bg-red-50 text-red-600 font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg mt-1">
                                                    ${Number(patient.debt).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <ArrowLeft className="text-gray-300 group-hover:text-primary rotate-180 transition-colors" size={14} />
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
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('datos');
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
            showToast('Datos del paciente guardados correctamente.', 'success');
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
            showToast('Historia clínica actualizada correctamente.', 'success');
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        {/* Back button */}
                        <button
                            onClick={() => navigate('/historia')}
                            className="text-sm text-gray-400 hover:text-primary flex items-center gap-1 mb-2 transition-colors focus:underline outline-none"
                        >
                            <ArrowLeft size={14} /> <span className="hidden sm:inline">Volver a selección</span><span className="sm:hidden">Volver</span>
                        </button>

                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">Historia Clínica</h1>
                        <div className="flex items-center gap-3 mt-3">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm md:text-base font-serif shrink-0 uppercase">
                                {patient?.firstName?.[0] || '?'}{patient?.lastName?.[0] || '?'}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-gray-800 text-base md:text-lg truncate">{patient?.firstName} {patient?.lastName}</p>
                                <p className="text-[10px] md:text-xs text-gray-400 truncate mt-0.5">
                                    ID: {patient?.docId} · {age} años
                                    {patient?.gender ? ` · ${patient.gender.charAt(0).toUpperCase()}` : ''}
                                    {Number(patient?.debt) > 0 && (
                                        <span className="text-red-500 font-bold"> · DEUDA: ${Number(patient.debt).toFixed(2)}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <div className="relative group">
                            <button type="button"
                                className="flex-1 sm:flex-none px-3 py-2.5 text-gray-600 hover:text-primary hover:bg-primary/10 font-bold transition-all flex items-center justify-center gap-2 rounded-xl text-sm border-2 border-gray-200">
                                <Download size={18} /> Descargar
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <button onClick={() => generateClinicalHistoryPDF(patient, clinicalData, {})}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2 rounded-t-xl">
                                    <FileText size={16} /> Historia Clínica
                                </button>
                                <button onClick={() => generateFormPDF(patient, clinicalData)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FileText size={16} /> Formulario
                                </button>
                                <button onClick={() => generateCertificatePDF(patient, 'treatment')}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2 rounded-b-xl">
                                    <FileText size={16} /> Certificado
                                </button>
                            </div>
                        </div>
                        {isEditing ? (
                            <>
                                <button type="button" onClick={handleCancel}
                                    className="flex-1 sm:flex-none px-4 py-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 font-bold transition-all flex items-center justify-center gap-2 rounded-xl text-sm border-2 border-transparent">
                                    <X size={18} /> <span className="hidden xs:inline">Cancelar</span>
                                </button>
                                <button type="button" onClick={handleSave} disabled={saving}
                                    className="flex-1 sm:flex-none bg-primary hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm">
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto bg-primary hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm">
                                <Edit2 size={18} /> Editar Datos
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex justify-between items-center animate-shake duration-500">
                        <span className="text-sm font-medium">{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                    </div>
                )}

            </div>

            {/* ─── Content: Stacked Cards ─── */}
            <div className="space-y-6">

                

                {/* ── Card: Odontogram ─── */}
                <div className="animate-in fade-in duration-300">
                    <Odontogram patientId={patientId} readOnly={!isEditing} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* ── Card: Personal Data ─── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
                        <SectionHeader
                            title="Datos Personales"
                            icon={User}
                            iconColor="text-primary"
                            gradientFrom="from-primary/10"
                            gradientTo="to-primary/5"
                        />
                        <form onSubmit={(e) => e.preventDefault()} className="p-5 md:p-8">
                            <div className="grid grid-cols-1 gap-5 md:gap-6">
                                <InputGroup label="Nombres" name="firstName" register={patientForm.register} errors={patientForm.formState.errors} disabled={!isEditing} required />
                                <InputGroup label="Apellidos" name="lastName" register={patientForm.register} errors={patientForm.formState.errors} disabled={!isEditing} required />
                                <InputGroup label="Identificación" name="docId" register={patientForm.register} errors={patientForm.formState.errors} disabled={true} required />
                                <InputGroup label="Fecha Nacimiento" name="birthDate" type="date" register={patientForm.register} errors={patientForm.formState.errors} disabled={!isEditing} />
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 font-serif">Edad</label>
                                    <input type="text" value={`${age} años`} disabled className="w-full px-4 py-2.5 md:py-3 border rounded-xl bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 font-serif">Género</label>
                                    <select
                                        {...patientForm.register("gender")}
                                        disabled={!isEditing}
                                        className={clsx(
                                            "w-full px-4 py-2.5 md:py-3 border rounded-xl outline-none transition-all text-sm",
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


                    
                    {/* ── Card: Clinical History Questionnaire ─── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
                        <SectionHeader
                            title="Historia Clínica"
                            icon={Activity}
                            iconColor="text-blue-600"
                            gradientFrom="from-blue-50"
                            gradientTo="to-blue-50/50"
                        />
                        <div className="p-5 md:p-8 space-y-8">

                            {/* 1. Motivo de consulta */}
                            <div>
                                <h2 className="text-lg md:text-xl font-serif font-bold text-gray-800 mb-4 flex items-center gap-2 pb-4 border-b border-gray-100">
                                    <Activity className="text-primary" size={20} /> 1. Motivo de Consulta
                                </h2>
                                <textarea
                                    {...clinicalForm.register("motivo_consulta")}
                                    disabled={!isEditing}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                                    placeholder="Describa el motivo de la consulta..."
                                />
                            </div>

                            {/* 2. Antecedentes Patológicos */}
                            <div>
                                <h2 className="text-base md:text-lg font-serif font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                                    2. Antecedentes Patológicos
                                </h2>
                                <p className="text-[10px] md:text-xs text-secondary mb-4">Cuestionario de salud básico.</p>

                                <div className="space-y-1">
                                    <CheckboxRow label="Hipertensión Arterial" name="hipertension" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="Enfermedad Cardiaca" name="enfermedad_cardiaca" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="enfermedad_cardiaca_cual" detailLabel="Cuál" />
                                    <CheckboxRow label="Diabetes" name="diabetes" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="Hemorragias" name="hemorragias" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="Alergias (Med/Anest/Alim)" name="alergico" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="alergico_cual" detailLabel="Cuál" />
                                    <CheckboxRow label="Portador de VIH" name="vih" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="Embarazo" name="embarazada" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="embarazada_semanas" detailLabel="Semanas" detailType="number" />
                                    <CheckboxRow label="Medicamentos en uso" name="medicamentos_en_uso" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="medicamentos_cual" detailLabel="Cuál" />
                                    <CheckboxRow label="Otras Enfermedades" name="otras_enfermedades" register={clinicalForm.register} disabled={!isEditing}
                                        detailName="otras_enfermedades_cual" detailLabel="Cuál" />
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Antecedentes Familiares</label>
                                    <textarea
                                        {...clinicalForm.register("antecedentes_familiares")}
                                        disabled={!isEditing}
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                                        placeholder="Describa antecedentes familiares..."
                                    />
                                </div>
                            </div>

                            {/* 3. Antecedentes Estomatológicos */}
                            <div>
                                <h2 className="text-base md:text-lg font-serif font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                                    3. Antecedentes Estomatológicos
                                </h2>

                                <div className="space-y-2">
                                    <CheckboxRow label="Golpes en cara o dientes" name="golpes_cara_dientes" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="Úlceras bucales" name="ulceras_bucales" register={clinicalForm.register} disabled={!isEditing} />
                                    <CheckboxRow label="Sangrado de encías" name="sangrado_encias" register={clinicalForm.register} disabled={!isEditing} />

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <label className="text-sm font-medium text-gray-700 flex-1">¿Cuántas veces al día se cepilla los dientes?</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            {...clinicalForm.register("cepillado_veces_dia", { valueAsNumber: true })}
                                            disabled={!isEditing}
                                            className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <label className="text-sm font-medium text-gray-700 flex-1">Última visita al odontólogo</label>
                                        <input
                                            type="text"
                                            {...clinicalForm.register("ultima_visita_odontologo")}
                                            disabled={!isEditing}
                                            className="w-full sm:w-48 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                                            placeholder="Ej: Hace 6 meses"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>


                

                {/* ── Card: Image Gallery ─── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
                    <SectionHeader
                        title="Galería de Imágenes"
                        icon={Layers}
                        iconColor="text-purple-600"
                        gradientFrom="from-purple-50"
                        gradientTo="to-purple-50/50"
                    />
                    <div className="p-5 md:p-8">
                        <OrthodonticGallery patientId={patientId} />
                    </div>
                </div>


            </div>

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
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
        <label className="flex items-center gap-3 flex-1 text-sm">
            <input
                type="checkbox"
                {...register(name)}
                disabled={disabled}
                className="h-4 w-4 text-primary rounded-lg border-gray-300 focus:ring-primary disabled:opacity-50 cursor-pointer"
            />
            <span className={clsx("font-medium", disabled ? "text-gray-500" : "text-gray-700")}>{label}</span>
        </label>
        {detailName && (
            <div className="flex items-center gap-2 pl-7 sm:pl-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">{detailLabel}:</span>
                <input
                    type={detailType}
                    {...register(detailName)}
                    disabled={disabled}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-500 w-full sm:w-32"
                />
            </div>
        )}
    </div>
);

export default ClinicalHistory;
