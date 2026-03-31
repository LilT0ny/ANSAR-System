import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { user } = await authAPI.login(email, password);

            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                name: user.full_name || 'Usuario',
                role: user.role || 'doctor',
                email: user.email || email,
            }));

            setTimeout(() => navigate('/dashboard'), 800);
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Credenciales incorrectas');
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
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="doctor@clinica.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-green-600 text-white py-3 rounded-lg font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                        >
                            <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

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