import { useState } from 'react';
import {
  LayoutDashboard, MapPin, BarChart3,
  LogOut, Shield, Menu, X as CloseIcon,
  PlusCircle, History, Home, Settings,
  MessageSquare, User, Sparkles, ChevronRight, Globe, Activity, Radio, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CitizenPanel from './components/CitizenPanel';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import LandingPage from './components/LandingPage';

interface SidebarProps {
  role: 'citizen' | 'admin';
  email: string;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

const Sidebar = ({ role, email, activeTab, setActiveTab, onLogout }: SidebarProps) => {
  const menuItems = role === 'admin' ? [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'map', label: 'Spatial Assets', icon: MapPin },
    { id: 'analytics', label: 'Intelligence', icon: BarChart3 },
    { id: 'settings', label: 'System Protocols', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'Telemetry', icon: Activity },
    { id: 'report', label: 'Transmit Intel', icon: PlusCircle },
    { id: 'history', label: 'Archives', icon: History },
    { id: 'support', label: 'Support Feed', icon: MessageSquare },
  ];

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="sidebar glass-panel !rounded-none !border-y-0 !border-l-0 border-r border-white bg-white/80 backdrop-blur-3xl"
    >
      <div className="p-10 flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/20">
          <Globe size={26} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-primary leading-none">CIVICAI</h1>
          <p className="text-[10px] font-black text-primary-light uppercase tracking-[0.3em] mt-1.5 opacity-60">Smart Core</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <div className="px-6 mb-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40 italic">
          Operational Menu
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full nav-link group ${activeTab === item.id ? 'nav-link-active !bg-primary !text-white !shadow-2xl shadow-primary/20' : '!bg-transparent hover:!bg-primary/5'}`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-primary-light/50 group-hover:text-primary transition-colors'} />
            <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
            {activeTab === item.id && <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-white ml-auto" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-6 space-y-6">
        <div className="soft-card !p-5 !rounded-2xl flex items-center gap-4 bg-bg-soft/50 border-none shadow-inner">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-white shadow-xl flex items-center justify-center">
            <User size={22} className="text-primary-light" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-black text-primary truncate uppercase tracking-widest">{email.split('@')[0]}</p>
            <p className="text-[9px] font-bold text-text-muted truncate uppercase tracking-[0.2em] mt-0.5">{role} Level 01</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-xl hover:shadow-rose-500/20"
        >
          <LogOut size={18} />
          <span>Terminate</span>
        </button>
      </div>
    </motion.aside>
  );
};

function App() {
  const [user, setUser] = useState<{ role: 'citizen' | 'admin'; email: string } | null>(null);
  const [entryMode, setEntryMode] = useState<'landing' | 'login'>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = (role: 'citizen' | 'admin', email: string) => {
    setUser({ role, email });
    setActiveTab(role === 'admin' ? 'overview' : 'dashboard');
  };

  const logout = () => {
    setUser(null);
    setEntryMode('landing');
  };

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        {entryMode === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage
              onStart={() => setEntryMode('login')}
              onLogin={() => setEntryMode('login')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="dashboard-container selection:bg-primary-light selection:text-white">
      <Sidebar
        role={user.role}
        email={user.email}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout}
      />

      <main className="main-content !p-12">
        <header className="flex items-center justify-between mb-16">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-emerald shadow-3xl shadow-accent-emerald animate-pulse"></div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-40">System Live // Metropolitan Resilience</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-primary">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-white/50 backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-primary/5">
              <Sparkles size={18} className="text-primary-light animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Core Optimized</span>
            </div>
            <button className="lg:hidden w-12 h-12 rounded-2xl bg-white border border-border-subtle flex items-center justify-center text-primary" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </header>

        <section className="relative z-10">
          <AnimatePresence mode="wait">
            {user.role === 'citizen' ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                <CitizenPanel activeTab={activeTab} onTabChange={setActiveTab} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: "circOut" }}
              >
                <AdminDashboard activeTab={activeTab as any} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="mt-32 pt-12 border-t border-zinc-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <Cpu size={14} className="text-primary-light" />
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.25em]">© 2026 Metropolitan Systems Group // CIVICAI RESILIENCE LAYER</p>
            </div>
            <div className="flex gap-10">
              <a href="#" className="text-[10px] font-black text-text-muted hover:text-primary transition-colors uppercase tracking-widest">Digital Privacy</a>
              <a href="#" className="text-[10px] font-black text-text-muted hover:text-primary transition-colors uppercase tracking-widest">Operational Log</a>
              <a href="#" className="text-[10px] font-black text-text-muted hover:text-primary transition-colors uppercase tracking-widest">Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
