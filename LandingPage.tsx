import { motion } from 'framer-motion';
import { Camera, MapPin, Clock, LayoutDashboard, Globe } from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
    onLogin: () => void;
}

const LandingPage = ({ onStart, onLogin }: LandingPageProps) => {
    return (
        <div className="min-h-screen bg-white selection:bg-primary-light selection:text-white font-['Inter'] overflow-x-hidden">
            {/* Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-5">
                <nav className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4 glass-panel !rounded-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                            <Globe size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-primary flex items-baseline">
                            CIVIC<span className="text-primary-light italic">AI</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        <a href="#vision" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">Vision</a>
                        <a href="#network" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">Network</a>
                        <a href="#resources" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">Resources</a>
                        <button
                            onClick={onLogin}
                            className="bg-primary-light/10 text-primary-light px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary-light hover:text-white transition-all active:scale-95"
                        >
                            Log In
                        </button>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden geometric-bg">
                {/* Abstract Geometric Shapes */}
                <div className="absolute inset-0 z-0">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px]"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary/20 backdrop-blur-[2px]"></div>

                    {/* Geometric Skews */}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-white skew-y-[-2deg] origin-bottom-left translate-y-12 shadow-2xl"></div>
                </div>

                <div className="max-w-5xl mx-auto px-8 relative z-10 text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="space-y-8"
                    >
                        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tight leading-[0.95] drop-shadow-2xl">
                            Fixing Cities, One<br />
                            <span className="text-accent-teal">Report at Atime</span>
                        </h1>

                        <p className="text-white/70 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                            Empowering communities with smart infrastructure reporting and real-time civic intelligence.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
                    >
                        <button
                            onClick={onStart}
                            className="btn-pill btn-pill-citizen !text-base !px-14 !py-7"
                        >
                            Citizen Portal
                            <LayoutDashboard size={20} />
                        </button>
                        <button
                            onClick={onLogin}
                            className="btn-pill btn-pill-admin !text-base !px-14 !py-7"
                        >
                            Admin Dashboard
                            <LayoutDashboard size={20} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 bg-white relative z-20">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="mb-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tighter">Unified Civic Operations</h2>
                        <div className="w-24 h-2 bg-accent-teal mx-auto rounded-full"></div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={<Camera className="text-primary-light" size={40} />}
                            title="Snap & Send"
                            description="Instant infrastructure reporting with AI-powered evidence analysis."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={<MapPin className="text-accent-emerald" size={40} />}
                            title="Smart Routing"
                            description="AI dispatches reports to appropriate departments with high-velocity precision."
                            delay={0.5}
                        />
                        <FeatureCard
                            icon={<Clock className="text-accent-teal" size={40} />}
                            title="Live Updates"
                            description="Real-time telemetry tracking as your report moves through the resolution cycle."
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-bg-main border-t border-border-subtle">
                <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-12">
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <Globe className="text-primary" size={28} />
                            <span className="text-2xl font-black text-primary tracking-tighter">CIVICAI</span>
                        </div>
                        <p className="text-text-muted font-medium max-w-sm">
                            Next-generation governance powered by real-time infrastructure intelligence and community resilience and smart cities!
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black text-primary uppercase text-xs tracking-widest mb-6">Portal Access</h4>
                        <ul className="space-y-4 text-sm font-bold text-text-muted">
                            <li><button onClick={onStart} className="hover:text-primary">Citizen Hub</button></li>
                            <li><button onClick={onLogin} className="hover:text-primary">Admin Command</button></li>
                            <li><a href="#" className="hover:text-primary">Support Info</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-primary uppercase text-xs tracking-widest mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm font-bold text-text-muted">
                            <li><a href="#" className="hover:text-primary">Digital Privacy</a></li>
                            <li><a href="#" className="hover:text-primary">Civic Trust</a></li>
                            <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-border-subtle text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex justify-between items-center">
                    <p>© 2026 Smart Systems Group</p>
                    <p>Designed for Metropolitan Resilience</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay }}
        className="soft-card group hover:border-primary-light"
    >
        <div className="w-20 h-20 rounded-[28px] bg-bg-soft flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <h3 className="text-2xl font-black text-primary mt-8 mb-4 tracking-tighter">{title}</h3>
        <p className="text-text-muted font-medium leading-relaxed">
            {description}
        </p>
    </motion.div>
);

export default LandingPage;
