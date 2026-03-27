import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('request'); // 'request' or 'verify'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authAPI.signInWithOtp(email);
            setStep('verify');
        } catch (err: any) {
            console.error('OTP Request error:', err);
            setError(err.message || 'Error al solicitar el código. Asegúrate de que el correo esté registrado.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { user } = await authAPI.verifyOtp(email, otp);

            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                name: user.full_name || 'Usuario',
                role: user.role || 'doctor',
                email: user.email || email,
            }));

            setTimeout(() => navigate('/dashboard'), 800);
        } catch (err: any) {
            console.error('OTP Verify error:', err);
            setError(err.message || 'Código incorrecto o expirado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="p-8 text-center bg-primary/5">
                    <h2 className="text-3xl font-serif font-bold text-gray-800 tracking-wide">AN-SAR</h2>
                    <p className="text-secondary mt-2 text-sm">Portal Clínico Administrativo</p>
                </div>

                <div className="p-8">
                    {step === 'request' ? (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Profesional</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                        placeholder="doctora@clinica.com"
                                    />
                                </div>
                            </div>

                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-green-600 text-white py-3 rounded-lg font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                            >
                                <span>{loading ? 'Enviando...' : 'Solicitar Código de Acceso'}</span>
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Hemos enviado un código a <strong>{email}</strong>.
                                    Por favor, ingrésalo a continuación.
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código de 6 dígitos</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all tracking-[1em] text-center text-xl font-bold"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>

                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-green-600 text-white py-3 rounded-lg font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                            >
                                <span>{loading ? 'Verificando...' : 'Verificar e Ingresar'}</span>
                                {!loading && <ArrowRight size={20} />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('request')}
                                className="w-full text-sm text-gray-500 hover:text-primary transition-colors mt-2"
                            >
                                ¿No recibiste el código? Volver a intentar
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center border-t pt-6">
                        <a href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
                            ← Volver al sitio público
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
