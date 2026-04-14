import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, MapPin, Phone, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useConfigStore from '../store/useConfigStore';

const LandingPage = () => {
    const navigate = useNavigate();
    const { clinicName, logoUrl, primaryColor, doctorName, specialty, email, phone, address, services } = useConfigStore();

    return (
        <div className="font-sans text-secondary">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
                <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded" />}
                        <h1 className="text-xl md:text-2xl font-serif font-bold text-primary tracking-wide">{clinicName}</h1>
                    </div>
                    <div className="hidden lg:flex space-x-8">
                        <a href="#inicio" className="text-secondary hover:text-primary transition-colors text-sm">Inicio</a>
                        <a href="#servicios" className="text-secondary hover:text-primary transition-colors text-sm">Servicios</a>
                        <a href="#dra" className="text-secondary hover:text-primary transition-colors text-sm">La Doctora</a>
                        <a href="#contacto" className="text-secondary hover:text-primary transition-colors text-sm">Contacto</a>
                    </div>
                    <div className="flex space-x-3 md:space-x-4 items-center">
                        <a href="/login" className="text-[10px] md:text-sm font-medium text-gray-500 hover:text-primary transition-colors whitespace-nowrap">
                            Acceso Doctor
                        </a>
                        <button
                            onClick={() => navigate('/reserva')}
                            className="bg-primary hover:bg-green-600 text-white px-4 md:px-6 py-2 rounded-full text-[10px] md:text-sm font-medium transition-transform transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap"
                        >
                            Agendar Cita
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="inicio" className="pt-32 pb-20 bg-gradient-to-br from-gray-50 to-white">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl md:text-6xl font-serif font-bold text-gray-800 leading-tight mb-6"
                        >
                            Tu sonrisa merece <br className="hidden md:block" /> <span className="text-primary">Atención Experta</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-lg text-gray-600 mb-8 max-w-lg"
                        >
                            Cuidado dental integral con tecnología de vanguardia y un enfoque humano.
                            Resultados estéticos y funcionales garantizados.
                        </motion.p>
                        <button
                            onClick={() => navigate('/reserva')}
                            className="bg-primary hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-medium shadow-xl hover:shadow-2xl transition-all flex items-center cursor-pointer"
                        >
                            <Calendar className="mr-2" />
                            Reserva tu Cita Online
                        </button>
                    </div>
                    <div className="md:w-1/2 relative">
                        {/* Abstract organic shapes or Image */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                        <img
                            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800"
                            alt="Sonrisa Radiante"
                            className="relative rounded-2xl shadow-2xl z-10"
                        />
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="servicios" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif font-bold text-gray-800 mb-4">Nuestros Servicios</h2>
                        <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services && services.length > 0 ? (
                            services.map((service) => (
                                <ServiceCard 
                                    key={service.id}
                                    title={service.name}
                                    desc={`${service.price} • ${service.duration}`}
                                />
                            ))
                        ) : (
                            <ServiceCard title="Cargando servicios..." desc="Por favor, espera." />
                        )}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="dra" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/3">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-gray-200">
                            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600" alt={doctorName} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <h2 className="text-4xl font-serif font-bold text-gray-800 mb-6">Conoce a {doctorName}</h2>
                        <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                            {specialty}
                        </p>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Especialista comprometida con la excelencia clínica y el trato humano. Nuestra filosofía se centra en tratamientos mínimamente invasivos que perduran en el tiempo.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-700 font-medium"><CheckCircle className="text-primary mr-2" size={20} /> Experiencia Comprobada</div>
                            <div className="flex items-center text-gray-700 font-medium"><CheckCircle className="text-primary mr-2" size={20} /> Tecnología Avanzada</div>
                            <div className="flex items-center text-gray-700 font-medium"><CheckCircle className="text-primary mr-2" size={20} /> Atención Personalizada</div>
                            <div className="flex items-center text-gray-700 font-medium"><CheckCircle className="text-primary mr-2" size={20} /> Calidad Garantizada</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contacto" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="bg-primary/5 rounded-3xl p-12 flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6">Contáctanos</h2>
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-primary"><MapPin /></div>
                                    <p className="text-lg">{address || 'Dirección no disponible'}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-primary"><Phone /></div>
                                    <a href={`tel:${phone}`} className="text-lg hover:text-primary transition-colors">{phone || 'Teléfono no disponible'}</a>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-primary"><Clock /></div>
                                    <p className="text-lg">Horario personalizado configurado en la clínica</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <form className="space-y-4">
                                <input type="text" placeholder="Nombre Completo" className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
                                <input type="email" placeholder="Correo Electrónico" className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
                                <textarea placeholder="Mensaje" rows={4} className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
                                <button className="w-full bg-secondary text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">Enviar Mensaje</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl font-serif font-bold mb-4">{clinicName}</h2>
                    <p className="text-gray-400">© 2026 {clinicName}. Todos los derechos reservados.</p>
                </div>
            </footer>


        </div>
    );
};

const ServiceCard = ({ title, desc }) => (
    <div className="bg-gray-50 p-6 rounded-xl hover:shadow-sm transition-shadow">
        <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-primary mb-4">
            <Star size={18} />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{desc}</p>
    </div>
);

export default LandingPage;
