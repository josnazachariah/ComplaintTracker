import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, Globe, Shield, Sparkles, Key, Mail } from 'lucide-react';

interface LoginProps {
    onLogin: (role: 'citizen' | 'admin', email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/login', { email, password });
            if (res.data.success) {
                onLogin(res.data.role, res.data.email);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication service unavailable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-8 relative overflow-hidden geometric-bg">
            {/* Multi-layered Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary-light/20 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-transparent to-primary-light/30 backdrop-blur-[2px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[520px] relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-[28px] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl border border-white/20"
                    >
                        <Globe size={36} />
                    </motion.div>
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-8 h-[2px] bg-white/20"></div>
                        <span className="text-[11px] font-black text-white/60 uppercase tracking-[0.4em]">Metropolitan Gateway</span>
                        <div className="w-8 h-[2px] bg-white/20"></div>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">Secure Access</h1>
                </div>

                <div className="soft-card !p-12 glass-panel !bg-white/90 backdrop-blur-3xl shadow-3xl border border-white">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Operator Identity</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    className="soft-input !pl-12 !bg-bg-soft/50 focus:!bg-white border-none shadow-inner"
                                    placeholder="Enter registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Authentication Key</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                    <Key size={18} />
                                </div>
                                <input
                                    type="password"
                                    className="soft-input !pl-12 !bg-bg-soft/50 focus:!bg-white border-none shadow-inner"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 text-rose-600 text-[12px] bg-rose-50 p-5 rounded-[24px] border border-rose-100 font-black uppercase tracking-wider shadow-inner"
                            >
                                <AlertCircle size={20} />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-pill btn-pill-admin w-full py-6 !text-xs !tracking-[0.3em] shadow-3xl relative overflow-hidden group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Shield size={18} className="group-hover:rotate-12 transition-transform" />
                                    <span>Initiate Protocol</span>
                                </div>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-16 flex flex-col items-center gap-8">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                        <Shield size={12} />
                        End-to-End Resilience Active
                    </p>
                    <div className="flex gap-2">
                        {[0, 0.2, 0.4].map((delay, i) => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ repeat: Infinity, duration: 2, delay }}
                                className="w-1.5 h-1.5 rounded-full bg-white/30"
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
