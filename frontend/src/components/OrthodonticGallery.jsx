import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

const OrthodonticGallery = ({ patientId }) => {
    const [images, setImages] = useState([
        { id: 1, url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=200', stage: 'Inicial', date: '2023-01-15' },
        { id: 2, url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=200', stage: 'Progreso', date: '2023-03-20' },
    ]);
    const [uploading, setUploading] = useState(false);

    const handleUpload = (e) => {
        // Mock upload logic
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            setTimeout(() => {
                setImages([...images, {
                    id: Date.now(),
                    url: URL.createObjectURL(file), // Preview
                    stage: 'Nuevo',
                    date: new Date().toISOString().split('T')[0]
                }]);
                setUploading(false);
            }, 1000);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif font-bold text-gray-800 flex items-center">
                    <Camera className="mr-2 text-primary" size={20} />
                    Galería de Ortodoncia
                </h3>
                <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-secondary px-4 py-2 rounded-lg border border-gray-200 transition-colors flex items-center space-x-2 text-sm font-medium">
                    <Upload size={16} />
                    <span>Subir Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img) => (
                    <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={img.url} alt={img.stage} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                            <span className="text-white font-bold text-sm shadow-black drop-shadow-sm">{img.stage}</span>
                            <span className="text-white/80 text-xs">{img.date}</span>
                        </div>
                    </div>
                ))}
                {images.length === 0 && (
                    <div className="col-span-full py-8 text-center text-gray-400 text-sm">
                        No hay imágenes registradas.
                    </div>
                )}
            </div>

            {uploading && <p className="text-xs text-primary mt-2 animate-pulse">Subiendo imagen...</p>}
        </div>
    );
};

export default OrthodonticGallery;
