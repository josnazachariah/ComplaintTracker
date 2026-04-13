import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Map as MapIcon, Layers, CheckCircle,
    RefreshCcw, Search,
    TrendingUp, ChevronRight, Activity, Zap,
    Navigation, Sparkles, Filter, LayoutGrid,
    BarChart3 as BarChartIcon, PieChart as PieIcon,
    Settings as SettingsIcon, Download, Shield,
    AlertTriangle, ArrowUpRight, ArrowDownRight, Globe, Cpu, Radio
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

interface AdminDashboardProps {
    activeTab: 'overview' | 'map' | 'analytics' | 'settings';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab }) => {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [filter, setFilter] = useState({ category: '', status: '', priority: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [cRes, sRes] = await Promise.all([
                axios.get('http://localhost:5000/api/complaints'),
                axios.get('http://localhost:5000/api/stats')
            ]);
            // Sort by Emergency Score
            const sorted = cRes.data.sort((a: any, b: any) =>
                (b.emergencyScore || 0) - (a.emergencyScore || 0)
            );
            setComplaints(sorted);
            setStats(sRes.data);
        } catch (err) {
            console.error("Error fetching admin data", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await axios.patch(`http://localhost:5000/api/complaints/${id}`, { status: newStatus });
            fetchData();
        } catch (err) {
            console.error("Error updating status", err);
        }
    };

    const filteredComplaints = complaints.filter(c => {
        return (!filter.category || c.category === filter.category) &&
            (!filter.status || c.status === filter.status) &&
            (!filter.priority || c.priority === filter.priority);
    });

    const CHART_COLORS = ['#1e3a8a', '#3b82f6', '#14b8a6', '#10b981', '#64748b'];

    const renderOverview = () => (
        <div className="space-y-10 animate-fade-in">
            {/* Real-time Telemetry Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <OperationalStat title="Network Ingestion" value={stats?.total || 0} trend="+12%" up={true} icon={Radio} color="text-primary" />
                <OperationalStat title="Active Backlog" value={stats?.statusCounts.Pending || 0} trend="-5%" up={false} icon={Activity} color="text-primary-light" />
                <OperationalStat title="Resilience Index" value="94.2%" trend="+2.1%" up={true} icon={Shield} color="text-accent-emerald" />
                <OperationalStat title="Dispatch Vel." value="1.4h" trend="-15%" up={false} icon={Zap} color="text-accent-teal" />
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <div className="soft-card !p-0 overflow-hidden">
                        <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-bg-soft/30">
                            <div>
                                <h3 className="text-2xl font-black text-primary tracking-tighter">Command Control Log</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Live Intelligence Synchronized</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="btn-pill btn-pill-glass !py-2.5 !px-5 !text-[9px]">Export Telemetry</button>
                                <button onClick={fetchData} className="w-10 h-10 bg-white border border-border-subtle rounded-xl text-text-muted hover:text-primary-light transition-all flex items-center justify-center">
                                    <RefreshCcw size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-bg-soft/50 border-b border-border-subtle">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Operational Unit</th>
                                        <th className="p-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Priority</th>
                                        <th className="p-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Flow Status</th>
                                        <th className="p-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Dispatch</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle">
                                    {filteredComplaints.slice(0, 10).map(c => (
                                        <tr key={c.id} className="hover:bg-bg-soft/30 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-bg-soft border-2 border-white shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {c.image ? <img src={`http://localhost:5000${c.image}`} className="w-full h-full object-cover" alt="T" /> : <MapIcon size={20} className="text-text-muted" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-primary truncate group-hover:text-primary-light transition-colors">{c.title}</p>
                                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{c.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className={`soft-badge !w-fit ${c.emergencyScore >= 75 ? 'badge-pending !bg-rose-500 !text-white animate-pulse' : 'badge-progress !bg-bg-soft !text-text-muted'}`}>
                                                    {c.emergencyScore >= 75 ? 'Critical' : 'Standard'}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className={`soft-badge !w-fit ${c.status === 'Resolved' ? 'badge-resolved' : c.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`}>
                                                    {c.status}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                {c.status === 'Pending' && (
                                                    <button onClick={() => updateStatus(c.id, 'In Progress')} className="btn-pill btn-pill-admin !py-2.5 !px-6 !text-[9px] !rounded-xl">Deploy Unit</button>
                                                )}
                                                {c.status === 'In Progress' && (
                                                    <button onClick={() => updateStatus(c.id, 'Resolved')} className="btn-pill btn-pill-citizen !py-2.5 !px-6 !text-[9px] !rounded-xl">Close Loop</button>
                                                )}
                                                {c.status === 'Resolved' && <CheckCircle size={22} className="text-accent-emerald ml-auto" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="soft-card bg-primary text-white border-none p-10 space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-700">
                            <Cpu size={140} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight relative z-10">Network Filtering</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Operational Domain</label>
                                <select
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm font-bold text-white focus:bg-white focus:text-primary outline-none transition-all cursor-pointer"
                                    value={filter.category}
                                    onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                                >
                                    <option value="" className="text-primary">All Domains</option>
                                    <option value="Road Damage" className="text-primary">Transportation Assets</option>
                                    <option value="Garbage Overflow" className="text-primary">Civic Sanitation</option>
                                    <option value="Streetlight Issue" className="text-primary">Grid Resilience</option>
                                    <option value="Water Leakage" className="text-primary">Hydro Resources</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Operational Stage</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['Pending', 'In Progress', 'Resolved'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFilter({ ...filter, status: filter.status === s ? '' : s })}
                                            className={`w-full py-3 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-between ${filter.status === s ? 'bg-white text-primary border-white' : 'bg-transparent border-white/10 text-white hover:border-white/40'}`}
                                        >
                                            {s}
                                            {filter.status === s && <CheckCircle size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setFilter({ category: '', status: '', priority: '' })}
                                className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-white/10 border-2 border-white/20 text-white hover:bg-white hover:text-primary transition-all active:scale-95"
                            >Reset Control Panel</button>
                        </div>
                    </div>

                    <div className="soft-card space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Network Stability</h4>
                            <span className="text-accent-emerald font-black text-xs">+4.2% VOD</span>
                        </div>
                        <div className="w-full bg-bg-soft h-3 rounded-full overflow-hidden border border-border-subtle shadow-inner">
                            <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} className="bg-grad-admin h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-text-muted font-bold italic">Metropolitan resource density is optimized for current ingestion load.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMap = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="soft-card !p-0 h-[700px] relative overflow-hidden border-border-subtle shadow-3xl">
                <MapContainer center={[19.0760, 72.8777]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {complaints.filter(c => c.location).map(c => (
                        <Marker
                            key={c.id}
                            position={[c.location.lat, c.location.lng]}
                            icon={L.divIcon({
                                className: 'custom-marker',
                                html: `<div class="marker-blob ${c.status === 'Resolved' ? 'bg-accent-emerald' :
                                    c.status === 'In Progress' ? 'bg-primary-light' : 'bg-rose-500'
                                    } !w-5 !h-5 !border-4"></div>`,
                            })}
                        >
                            <Popup className="soft-popup">
                                <div className="p-4 min-w-[240px] space-y-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">#{c.id.slice(-6)}</span>
                                        <div className={`soft-badge ${c.status === 'Resolved' ? 'badge-resolved' : 'badge-pending'}`}>{c.status}</div>
                                    </div>
                                    <h4 className="font-black text-primary text-base tracking-tight">{c.title}</h4>
                                    {c.image && <img src={`http://localhost:5000${c.image}`} className="w-full h-32 object-cover rounded-[18px] border-2 border-bg-soft" alt="E" />}
                                    <button onClick={() => updateStatus(c.id, c.status === 'Pending' ? 'In Progress' : 'Resolved')} className="btn-pill btn-pill-admin w-full !py-3 !text-[10px] !rounded-xl">Update Operational State</button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                <div className="absolute bottom-8 left-8 z-[1000] glass-panel !bg-white/90 !p-6 flex items-center gap-10 shadow-3xl">
                    <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest">
                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-lg shadow-rose-200"></div> Pending Detection
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest">
                        <div className="w-3.5 h-3.5 rounded-full bg-primary-light shadow-lg shadow-primary-light/20"></div> Active Resource
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest">
                        <div className="w-3.5 h-3.5 rounded-full bg-accent-emerald shadow-lg shadow-accent-emerald/20"></div> Integrated Resolve
                    </div>
                </div>

                <div className="absolute top-8 right-8 z-[1000] glass-panel border-white/20 p-6 text-primary flex flex-col items-end gap-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Geospatial Precision</p>
                    <p className="text-4xl font-black flex items-baseline tracking-tighter">100<span className="text-lg ml-1 font-bold">%</span></p>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => {
        const barData = stats ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value })) : [];
        const pieData = stats ? Object.entries(stats.byDepartment).map(([name, value]) => ({ name, value })) : [];

        return (
            <div className="space-y-10 animate-fade-in">
                <div className="grid lg:grid-cols-2 gap-10">
                    <div className="soft-card space-y-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-primary tracking-tighter">Asset Ingestion Matrix</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Cross-Domain Telemetry</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                                <BarChartIcon size={24} />
                            </div>
                        </div>
                        <div className="h-[340px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={9} fontWeight={900} axisLine={false} tickLine={false} />
                                    <YAxis fontSize={9} fontWeight={900} axisLine={false} tickLine={false} />
                                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', padding: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="soft-card space-y-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-primary tracking-tighter">Sector Load Allocation</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Resource Distribution Analytics</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-accent-teal/5 text-accent-teal flex items-center justify-center">
                                <PieIcon size={24} />
                            </div>
                        </div>
                        <div className="h-[340px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={90} outerRadius={125} paddingAngle={8} dataKey="value" stroke="none">
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '24px', border: 'none', padding: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="soft-card bg-bg-soft border-primary-light/10 p-16 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
                    <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-primary-light/5 rounded-full blur-[80px]"></div>
                    <div className="absolute -right-12 -top-12 w-64 h-64 bg-accent-emerald/5 rounded-full blur-[80px]"></div>

                    <div className="flex-1 space-y-8 relative z-10 text-center md:text-left">
                        <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center text-primary-light shadow-3xl shadow-primary-light/10 border border-white">
                            <Sparkles size={36} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-primary tracking-tighter leading-tight">Metropolitan Resilience Summary</h3>
                            <p className="text-text-muted text-lg leading-relaxed font-medium max-w-2xl">
                                Systemic health index is currenty at <span className="text-primary font-black">98.2%</span>. AI-dispatched resolution pathways have mitigated 1,420 potential downtime minutes across the hydro-infrastructure sector this quarter.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 relative z-10 w-full md:w-auto">
                        <button className="btn-pill btn-pill-admin !py-6 !px-10 !text-xs">Generate Compliance Report</button>
                        <button className="btn-pill btn-pill-glass !py-5 !px-10 !text-xs">Full Resilience Audit</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSettings = () => (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            <div className="soft-card space-y-12">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-bg-soft rounded-2xl flex items-center justify-center text-primary border-2 border-white shadow-xl">
                        <SettingsIcon size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-primary tracking-tighter">Network Protocol Configuration</h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">Admin Command Level 01</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border-subtle pb-3">Automated Intelligence</h4>
                        <div className="space-y-6">
                            <SettingToggle label="Cross-Domain Auto-Classify" active={true} />
                            <SettingToggle label="Emergency Priority Escalation" active={true} />
                            <SettingToggle label="AI Visual Verification Layer" active={false} />
                            <SettingToggle label="Resource Dispatch Autonomy" active={false} />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border-subtle pb-3">Transmission Protocol</h4>
                        <div className="space-y-6">
                            <SettingToggle label="Critical Infrastructure SMS" active={true} />
                            <SettingToggle label="Daily Performance Digest" active={false} />
                            <SettingToggle label="Emergency Broadcast Link" active={true} />
                            <SettingToggle label="Public Transparency Feed" active={true} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="soft-card !bg-rose-50/50 !border-rose-100 p-12 space-y-8">
                <div className="flex items-center gap-4 text-rose-600">
                    <AlertTriangle size={24} />
                    <h3 className="text-2xl font-black tracking-tighter">Terminal Danger Zone</h3>
                </div>
                <p className="text-base text-rose-700/70 font-bold max-w-2xl">Destructive system actions detected. Proceeding will result in non-recoverable intelligence loss from the Metropolitan resilience database.</p>
                <div className="flex flex-wrap gap-4">
                    <button className="btn-pill !bg-rose-600 !text-white !px-8 !py-5 !text-[10px] shadow-2xl shadow-rose-200">Purge Operational Cache</button>
                    <button className="btn-pill !bg-white !text-rose-600 !border-rose-200 !px-8 !py-5 !text-[10px] hover:!bg-rose-50">Archive Resolved Intelligence</button>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="w-16 h-16 border-4 border-bg-soft border-t-primary-light rounded-full animate-spin"></div>
            <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Syncing Network Grid</p>
                <div className="flex gap-1.5">
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 rounded-full bg-primary-light" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary-light" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary-light" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'map' && renderMap()}
                    {activeTab === 'analytics' && renderAnalytics()}
                    {activeTab === 'settings' && renderSettings()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const OperationalStat = ({ title, value, trend, up, icon: Icon, color }: any) => (
    <div className="soft-card flex flex-col justify-between h-40 group hover:border-primary-light/20">
        <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl bg-bg-soft flex items-center justify-center ${color} border-2 border-white shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${up ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-rose-500/10 text-rose-500'}`}>
                {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{title}</p>
            <p className="text-4xl font-black text-primary tracking-tighter">{value}</p>
        </div>
    </div>
);

const SettingToggle = ({ label, active }: { label: string, active: boolean }) => (
    <div className="flex items-center justify-between group">
        <span className="text-sm font-black text-primary group-hover:text-primary-light transition-colors">{label}</span>
        <button className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-primary-light shadow-lg shadow-primary-light/20' : 'bg-bg-soft border border-border-subtle'}`}>
            <div className={`w-4 h-4 rounded-full absolute top-1 transition-all duration-300 ${active ? 'right-1 bg-white' : 'left-1 bg-text-muted/30'}`}></div>
        </button>
    </div>
);

export default AdminDashboard;
