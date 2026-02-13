import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';

const Settings = () => {
    const [clinicName, setClinicName] = useState('Clínica Dental AN-SAR');
    const [email, setEmail] = useState('contacto@ansar.com');
    const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200');
    const [doctorName, setDoctorName] = useState('Dra. Ansar');
    const [specialty, setSpecialty] = useState('Odontología General');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            {/* Standard Header */}
            <header>
                <h1 className="text-3xl font-serif font-bold text-gray-800">Configuración</h1>
                <p className="text-secondary mt-1">Ajustes generales del sistema.</p>
            </header>

            {/* Profile Photo Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Perfil del Doctor</h3>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Photo */}
                    <div className="relative group">
                        <div className="h-28 w-28 rounded-2xl overflow-hidden shadow-md border-2 border-gray-100 bg-gray-200">
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label
                            htmlFor="profile-upload"
                            className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            <Camera size={24} className="text-white" />
                        </label>
                        <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* Info fields */}
                    <div className="flex-1 space-y-4 w-full">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Doctor</label>
                            <input
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                            <input
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline mt-2">
                            <Upload size={16} />
                            Cambiar foto de perfil
                        </button>
                    </div>
                </div>
            </div>

            {/* Clinic Info Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Información de la Clínica</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Clínica</label>
                        <input
                            value={clinicName}
                            onChange={(e) => setClinicName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <button className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
