import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    Trash, Lightbulb, Droplets, Waves,
    ChevronRight, HardHat,
    ShieldCheck, ImageIcon,
    Sparkles, AlertCircle,
    Activity, FileText, Info, PlusCircle,
    History as HistoryIcon, Camera, MapPin, Upload, Send, Globe
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CATEGORIES = [
    { id: 'Road Damage', icon: <HardHat size={20} />, color: 'text-amber-500', bgColor: 'bg-amber-50' },
    { id: 'Garbage Overflow', icon: <Trash size={20} />, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { id: 'Streetlight Issue', icon: <Lightbulb size={20} />, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { id: 'Water Leakage', icon: <Droplets size={20} />, color: 'text-cyan-500', bgColor: 'bg-cyan-50' },
    { id: 'Drainage Blockage', icon: <Waves size={20} />, color: 'text-slate-500', bgColor: 'bg-slate-50' }
];

const LocationMarker = ({ position, setPosition }: any) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker
            position={position}
            icon={L.divIcon({
                className: 'custom-marker',
                html: '<div class="marker-blob bg-accent-emerald"></div>'
            })}
        />
    );
};

interface CitizenPanelProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

const CitizenPanel = ({ activeTab = 'dashboard', onTabChange }: CitizenPanelProps) => {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        citizenName: ''
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [location, setLocation] = useState<any>({ lat: 19.0760, lng: 72.8777 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [scanning, setScanning] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        if (formData.title.length > 5 || formData.description.length > 10) {
            const timer = setTimeout(() => {
                const text = (formData.title + ' ' + formData.description).toLowerCase();
                if (text.includes('pothole') || text.includes('road')) setAiSuggestion('Road Damage');
                else if (text.includes('trash') || text.includes('garbage')) setAiSuggestion('Garbage Overflow');
                else if (text.includes('light') || text.includes('dark')) setAiSuggestion('Streetlight Issue');
                else if (text.includes('water') || text.includes('burst')) setAiSuggestion('Water Leakage');
                else if (text.includes('drain') || text.includes('clog')) setAiSuggestion('Drainage Blockage');
                else setAiSuggestion(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [formData.title, formData.description]);

    const fetchComplaints = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/complaints');
            setComplaints(res.data.reverse());
        } catch (err) {
            console.error("Error fetching complaints", err);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            setScanning(true);
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setTimeout(() => setScanning(false), 2000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalCategory = formData.category || aiSuggestion;
        if (!finalCategory) return alert("Please select a category.");

        setSubmitting(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', finalCategory);
        data.append('citizenName', formData.citizenName);
        if (image) data.append('image', image);
        data.append('location', JSON.stringify({ ...location, address: 'Pinned Location' }));

        try {
            await axios.post('http://localhost:5000/api/complaints', data);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setFormData({ title: '', description: '', category: '', citizenName: '' });
                setAiSuggestion(null);
                setImage(null);
                setImagePreview(null);
                fetchComplaints();
                onTabChange?.('history');
            }, 2500);
        } catch (err) {
            console.error("Error submitting complaint", err);
        } finally {
            setSubmitting(false);
        }
    };

    const stats = {
        total: complaints.length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        pending: complaints.filter(c => c.status === 'Pending').length
    };

    const renderDashboard = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Reports', val: stats.total, icon: FileText, color: 'text-primary', grad: 'bg-primary/5' },
                    { label: 'Active Issues', val: stats.pending, icon: Activity, color: 'text-primary-light', grad: 'bg-primary-light/5' },
                    { label: 'Resolved Cases', val: stats.resolved, icon: CheckCircle, color: 'text-accent-emerald', grad: 'bg-accent-emerald/5' }
                ].map((s, i) => (
                    <div key={i} className="soft-card flex items-center justify-between p-8">
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{s.label}</p>
                            <p className={`text-5xl font-black ${s.color}`}>{s.val}</p>
                        </div>
                        <div className={`w-16 h-16 rounded-[24px] ${s.grad} flex items-center justify-center ${s.color}`}>
                            <s.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black text-primary tracking-tighter">Recent Operations</h3>
                        <button onClick={() => onTabChange?.('history')} className="text-xs font-black text-primary-light hover:underline uppercase tracking-widest">View Archives</button>
                    </div>

                    <div className="space-y-4">
                        {complaints.slice(0, 4).map((c, idx) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="soft-card !p-6 flex items-center gap-6 group hover:border-primary-light/20"
                            >
                                <div className="w-16 h-16 bg-bg-soft rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-xl">
                                    {c.image ? (
                                        <img src={`http://localhost:5000${c.image}`} className="w-full h-full object-cover" alt="T" />
                                    ) : (
                                        <ImageIcon size={20} className="text-text-muted" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-black text-primary truncate group-hover:text-primary-light transition-colors">{c.title}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{c.category}</span>
                                        <div className="w-1 h-1 rounded-full bg-zinc-200"></div>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{new Date(c.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className={`soft-badge ${c.status === 'Resolved' ? 'badge-resolved' : c.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`}>
                                    {c.status}
                                </div>
                                <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                            </motion.div>
                        ))}
                        {!complaints.length && (
                            <div className="soft-card text-center py-20 bg-bg-soft/30 border-dashed border-2">
                                <p className="text-text-muted font-bold italic">No intelligence reports found in recent cycles.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <h3 className="text-2xl font-black text-primary tracking-tighter px-2">Lodge Intelligence</h3>
                    <div className="soft-card bg-primary text-white border-none p-10 flex flex-col items-center text-center space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-8 -translate-y-4 group-hover:scale-125 transition-transform duration-700">
                            <PlusCircle size={120} />
                        </div>
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[28px] flex items-center justify-center text-white shadow-2xl relative z-10">
                            <PlusCircle size={36} />
                        </div>
                        <div className="relative z-10 space-y-3">
                            <p className="text-2xl font-black tracking-tight">Report Incident</p>
                            <p className="text-white/60 text-sm font-medium">Trigger municipal rapid response protocols by reporting infrastructure failures.</p>
                        </div>
                        <button
                            onClick={() => onTabChange?.('report')}
                            className="w-full bg-white text-primary px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 hover:-translate-y-1 transition-all active:scale-95 relative z-10"
                        >
                            Open Form
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderReportForm = () => (
        <div className="max-w-5xl mx-auto animate-fade-in">
            {success ? (
                <div className="soft-card py-24 text-center border-accent-emerald/20 bg-accent-emerald/[0.02]">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-accent-emerald text-white rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-3xl shadow-accent-emerald/30"
                    >
                        <CheckCircle size={48} />
                    </motion.div>
                    <h2 className="text-4xl font-black text-primary tracking-tight mb-4">Transmission Success</h2>
                    <p className="text-text-muted font-bold max-w-md mx-auto">Your incident intelligence has been successfully logged into the Metropolitan Resilience Network.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="soft-card space-y-12">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Incident Headline</label>
                                <input
                                    type="text"
                                    className="soft-input !text-lg !font-bold"
                                    placeholder="e.g. Critical Water Leak on 5th Ave"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Citizen Identity</label>
                                <input
                                    type="text"
                                    className="soft-input"
                                    placeholder="Your Full Name"
                                    value={formData.citizenName}
                                    onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Intelligence Classification</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat.id })}
                                        className={`flex flex-col items-center gap-4 p-6 rounded-[24px] border-2 transition-all duration-300 ${formData.category === cat.id
                                            ? 'border-primary-light bg-primary-light/[0.03] shadow-xl shadow-primary/5'
                                            : 'border-bg-soft bg-bg-soft/50 hover:border-primary-light/30'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.category === cat.id ? 'bg-primary-light text-white shadow-lg' : cat.bgColor + ' ' + cat.color}`}>
                                            {cat.icon}
                                        </div>
                                        <span className="text-[9px] font-black text-center uppercase tracking-widest text-primary/70">{cat.id}</span>
                                    </button>
                                ))}
                            </div>
                            {aiSuggestion && !formData.category && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="mt-4 flex items-center gap-3 px-4 py-2.5 bg-primary/5 rounded-full w-fit border border-primary/10"
                                >
                                    <Sparkles size={14} className="text-primary-light animate-pulse" />
                                    <span className="text-[10px] font-black text-primary-light uppercase tracking-widest">System Detected: {aiSuggestion}</span>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Spatial Intel & Observations</label>
                            <textarea
                                className="soft-input !min-h-[160px] resize-none"
                                placeholder="Describe the problem in detail incorporating impact metrics..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Visual Evidence Transmit</label>
                                <div
                                    className="soft-card !p-0 h-56 border-dashed border-2 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-bg-soft/30 transition-all border-border-subtle"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full h-full">
                                            <img src={imagePreview} className="w-full h-full object-cover" alt="V" />
                                            {scanning && (
                                                <div className="absolute inset-0 bg-primary/80 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-3">
                                                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span className="font-black text-[10px] uppercase tracking-widest">Analyzing Intel...</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3 group-hover:-translate-y-1 transition-all">
                                            <div className="w-14 h-14 bg-bg-soft rounded-2xl flex items-center justify-center mx-auto text-text-muted group-hover:text-primary-light group-hover:bg-primary-light/10 transition-colors">
                                                <ImageIcon size={28} />
                                            </div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Upload Media File</p>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" className="hidden" onChange={e => e.target.files && handleFile(e.target.files[0])} accept="image/*" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Spatial Coordinate Tag</label>
                                <div className="h-56 rounded-[32px] overflow-hidden border border-border-subtle shadow-inner relative group">
                                    <MapContainer center={[19.0760, 72.8777]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationMarker position={location} setPosition={setLocation} />
                                    </MapContainer>
                                    <div className="absolute bottom-4 left-4 right-4 z-[1000] p-3 glass-panel !rounded-2xl text-[10px] font-bold text-primary italic flex items-center gap-2">
                                        <MapPin size={12} className="text-accent-emerald" />
                                        Pinned Sector: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`btn-pill btn-pill-citizen w-full py-7 !text-base tracking-[0.2em] shadow-3xl overflow-hidden relative ${submitting ? 'opacity-80' : ''}`}
                        >
                            {submitting ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Transmitting...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span>Transmit Incident Intelligence</span>
                                    <Send size={20} />
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="soft-card bg-primary text-white border-none p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12 translate-x-8 -translate-y-4">
                    <HistoryIcon size={140} />
                </div>
                <div className="relative z-10 space-y-2">
                    <h3 className="text-4xl font-black tracking-tighter">Operational History</h3>
                    <p className="text-white/60 font-medium max-w-xl">Comprehensive log of your intelligence transmissions and municipal response statuses within the Metropolitan Network.</p>
                </div>
            </div>

            <div className="soft-card !p-0 overflow-hidden border-border-subtle">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-soft/50 border-b border-border-subtle">
                                <th className="p-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Intel ID</th>
                                <th className="p-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Incident Detail</th>
                                <th className="p-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Classification</th>
                                <th className="p-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Network Status</th>
                                <th className="p-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Intel Profile</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {complaints.map((c, idx) => (
                                <motion.tr
                                    key={c.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-bg-soft/30 transition-colors group"
                                >
                                    <td className="p-6 text-[11px] font-mono text-text-muted">#{c.id.slice(-6)}</td>
                                    <td className="p-6">
                                        <p className="text-sm font-black text-primary group-hover:text-primary-light transition-colors">{c.title}</p>
                                        <p className="text-[10px] text-text-muted font-bold mt-0.5 flex items-center gap-1.5 uppercase">
                                            <Globe size={10} className="text-primary-light/50" />
                                            Metropolitan Sector
                                        </p>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-[10px] font-black text-primary-light bg-primary-light/5 px-4 py-1.5 rounded-full uppercase tracking-widest">{c.category}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className={`soft-badge !w-fit ${c.status === 'Resolved' ? 'badge-resolved' : c.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'Resolved' ? 'bg-accent-emerald' : c.status === 'In Progress' ? 'bg-primary-light' : 'bg-rose-500'}`}></div>
                                            {c.status}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="w-10 h-10 rounded-xl bg-bg-soft flex items-center justify-center text-text-muted hover:bg-primary-light/10 hover:text-primary-light transition-all active:scale-90">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!complaints.length && (
                    <div className="p-32 text-center text-text-muted space-y-4">
                        <div className="w-16 h-16 bg-bg-soft rounded-full flex items-center justify-center mx-auto opacity-30">
                            <HistoryIcon size={32} />
                        </div>
                        <p className="font-bold italic">No intelligence logs found in your operative history.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-6 h-1 bg-accent-teal rounded-full"></div>
                        <span className="text-[10px] font-black text-accent-teal uppercase tracking-[0.3em]">Metropolitan Hub</span>
                    </div>
                    <h2 className="text-5xl font-black text-primary tracking-tighter">Citizen Operations</h2>
                </div>

                <div className="flex items-center gap-2 p-1.5 glass-panel !rounded-2xl border-white bg-white/50 backdrop-blur-3xl shadow-xl shadow-primary/5">
                    {[
                        { id: 'dashboard', label: 'Telemetry', icon: Activity },
                        { id: 'report', label: 'Transmit', icon: Upload },
                        { id: 'history', label: 'Archives', icon: HistoryIcon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange?.(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:bg-bg-soft'}`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'report' && renderReportForm()}
                    {activeTab === 'history' && renderHistory()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CitizenPanel;
