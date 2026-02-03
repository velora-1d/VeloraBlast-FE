"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    Play, Square, Settings, FileText, Database, Terminal, RefreshCw, Upload,
    Camera, Table, Download, CheckCircle, MonitorPlay, Trash2, Loader2,
    AlertCircle, X, Plus, Pencil, LogOut, CreditCard, MessageSquare,
    ShieldCheck, Zap, BarChart3, Users, FolderOpen, Smartphone, QrCode
} from "lucide-react";
import clsx from "clsx";

const API_URL = "http://localhost:8000";
const OWNER_EMAIL = "nawawimahinutsman@gmail.com";

// Types & Interfaces
interface User {
    id: number;
    email: string;
    subscription_status: string;
    role: string;
}

interface Lead {
    id: number;
    phone: string;
    status: string;
    business_name?: string;
    name?: string;
    source?: string;
}

interface Template {
    id: number;
    name: string;
    content: string;
}

interface Config {
    search_phrase: string;
}

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: any;
    color: string;
}

interface NavItemProps {
    icon: any;
    label: string;
    active: boolean;
    onClick: () => void;
    color?: string;
}

// Helper Components
function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className={clsx("p-3 rounded-2xl shadow-lg", color)}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest">{title}</h3>
                <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

function SubscriptionBanner({ status, onUpgrade }: { status: string; onUpgrade: () => void }) {
    if (status === "active") return null;
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-[2.5rem] mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-blue-600/20 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                    <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Akun Anda Belum Aktif!</h3>
                    <p className="text-blue-100 text-sm opacity-80">Aktifkan paket Pro untuk membuka fitur Scraper Tanpa Batas dan Blast WhatsApp.</p>
                </div>
            </div>
            <button onClick={onUpgrade} className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-all active:scale-95 whitespace-nowrap">
                Aktifkan Paket Pro - Rp 150rb
            </button>
        </div>
    );
}

function FeatureLock({ user, onUpgrade, children }: { user: User | null; onUpgrade: () => void; children: React.ReactNode }) {
    const isActive = user?.subscription_status === "active" || user?.email === OWNER_EMAIL || user?.role === "admin";
    if (isActive) return <>{children}</>;
    return (
        <div className="relative">
            <div className="blur-sm pointer-events-none select-none opacity-50">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-3xl">
                <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto"><Zap className="w-8 h-8 text-blue-500" /></div>
                    <h3 className="text-xl font-black text-white">Fitur Terkunci</h3>
                    <p className="text-sm text-slate-400 max-w-xs">Aktifkan paket berlangganan untuk menggunakan fitur ini.</p>
                    <button onClick={onUpgrade} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">Upgrade Sekarang</button>
                </div>
            </div>
        </div>
    );
}

function NavItem({ icon: Icon, label, active, onClick, color }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all group",
                active ? "bg-white/5 text-white border border-white/5 shadow-xl" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
                color
            )}
        >
            <Icon className={clsx("w-5 h-5 transition-transform group-hover:scale-110", active ? "text-blue-500" : "text-slate-600")} />
            <span className="tracking-tight">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>}
        </button>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [status, setStatus] = useState("stopped");
    const [logs, setLogs] = useState("");
    const [config, setConfig] = useState<Config | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [target, setTarget] = useState("verified");
    const [results, setResults] = useState<any[]>([]);
    const [whatsappSessions, setWhatsappSessions] = useState<any[]>([]);
    const [whatsappLimit, setWhatsappLimit] = useState(0);
    const [qrSession, setQrSession] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    // Modals
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [newSessionName, setNewSessionName] = useState("");
    const [inputTemplateName, setInputTemplateName] = useState("");
    const [inputTemplateContent, setInputTemplateContent] = useState("");
    const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

    // UI State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; message: string; onConfirm: () => void } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // API Client
    const api = axios.create({ baseURL: API_URL, timeout: 10000 });
    api.interceptors.request.use((cfg: any) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("velora_token") : null;
        if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
        return cfg;
    });
    api.interceptors.response.use(
        (res: any) => res,
        (err: any) => {
            if (err.response?.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem("velora_token");
                router.push("/login");
            }
            return Promise.reject(err);
        }
    );

    // Fetch Functions
    const fetchUser = async () => {
        try { const { data } = await api.get("/me"); if (data) setUser(data); else router.push("/login"); }
        catch { router.push("/login"); } finally { setLoading(false); }
    };
    const fetchLeads = async () => { try { const { data } = await api.get("/master-data"); setLeads(data); } catch { } };
    const fetchTemplates = async () => { try { const { data } = await api.get("/templates"); setTemplates(data); } catch { } };
    const fetchResults = async () => { try { const { data } = await api.get("/results"); setResults(data.results || []); } catch { } };
    const fetchConfig = async () => { try { const { data } = await api.get("/config"); setConfig(data); } catch { } };
    const fetchWhatsappSessions = async () => {
        try { const { data } = await api.get("/whatsapp/sessions"); if (data) { setWhatsappSessions(data.sessions || []); setWhatsappLimit(data.max_senders || 0); } } catch { }
    };

    useEffect(() => { fetchUser(); fetchConfig(); fetchLeads(); fetchTemplates(); fetchWhatsappSessions(); }, []);
    useEffect(() => { if (activeTab === 'broadcast') { fetchWhatsappSessions(); fetchTemplates(); } }, [activeTab]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let retryCount = 0;
        const maxRetries = 20; // 20 * 3s = 60 seconds timeout

        if (qrSession) {
            setQrCodeUrl(null);
            const fetchQr = async () => {
                try {
                    const res = await api.get(`/whatsapp/qr/${qrSession}?t=${Date.now()}`, { responseType: 'blob' });
                    if (res.status === 200 && res.data.size > 0) {
                        const url = URL.createObjectURL(res.data);
                        setQrCodeUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
                        retryCount = 0; // Reset on success
                    }
                } catch (err: any) {
                    retryCount++;
                    if (err.response?.status === 200 && err.response?.data?.detail === "Already connected") {
                        // Session is already connected
                        showToast("WhatsApp sudah terhubung!", "success");
                        setQrSession(null);
                        fetchWhatsappSessions();
                        return;
                    }
                    if (retryCount >= maxRetries) {
                        showToast("QR timeout. Silakan coba lagi.", "error");
                        setQrSession(null);
                    }
                }
            };
            fetchQr();
            interval = setInterval(fetchQr, 3000);
        }
        return () => clearInterval(interval);
    }, [qrSession]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try { const [s, l] = await Promise.all([api.get("/status"), api.get("/logs")]); setStatus(s.data.status); setLogs(l.data.logs); } catch { }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleUpgrade = async () => {
        try {
            const { data } = await api.post("/subscription/create-payment");
            if (data.token && (window as any).snap) {
                (window as any).snap.pay(data.token, {
                    onSuccess: () => { showToast("Pembayaran Berhasil!", "success"); fetchUser(); },
                    onPending: () => showToast("Menunggu Pembayaran...", "info"),
                    onError: () => showToast("Pembayaran Gagal.", "error")
                });
            }
        } catch { showToast("Gagal membuat transaksi.", "error"); }
    };

    const handleStartScraper = async () => { try { await api.post("/start"); setStatus("running"); } catch { showToast("Gagal.", "error"); } };
    const handleStopScraper = async () => { try { await api.post("/stop"); setStatus("stopped"); } catch { showToast("Gagal.", "error"); } };

    const handleBroadcast = () => {
        setConfirmModal({
            show: true, message: `Mulai pengiriman ke ${target}?`,
            onConfirm: async () => { try { await api.post("/broadcast/start", { target }); showToast("Broadcast dimulai!", "success"); } catch { showToast("Gagal.", "error"); } }
        });
    };

    if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-72 bg-slate-950/50 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col z-50">
                <div className="mb-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <MonitorPlay className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-white">VELORA<span className="text-blue-500 font-light italic ml-1">BLAST</span></h1>
                </div>
                <nav className="space-y-2 flex-1">
                    <NavItem icon={BarChart3} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={Table} label="Data Leads" active={activeTab === 'leads'} onClick={() => { setActiveTab('leads'); fetchLeads(); }} />
                    <NavItem icon={CheckCircle} label="WA Active" active={activeTab === 'waactive'} onClick={() => { setActiveTab('waactive'); fetchLeads(); }} color="text-emerald-400" />
                    <NavItem icon={FolderOpen} label="Histori" active={activeTab === 'history'} onClick={() => { setActiveTab('history'); fetchResults(); }} color="text-amber-400" />
                    <NavItem icon={Camera} label="OCR" active={activeTab === 'ocr'} onClick={() => setActiveTab('ocr')} />
                    <NavItem icon={MessageSquare} label="Broadcast" active={activeTab === 'broadcast'} onClick={() => { setActiveTab('broadcast'); fetchTemplates(); }} />
                    {user?.email !== OWNER_EMAIL && user?.role !== 'admin' && (
                        <NavItem icon={CreditCard} label="Billing" active={activeTab === 'billing'} onClick={() => router.push('/dashboard/billing')} color="text-emerald-400" />
                    )}
                </nav>
                <div className="mt-auto space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black">{user?.email?.[0]?.toUpperCase()}</div>
                            <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                        </div>
                        {user?.email === OWNER_EMAIL && (
                            <button onClick={() => router.push('/admin')} className="w-full mb-2 flex items-center justify-center gap-2 py-2 text-[10px] font-black text-indigo-400 border border-indigo-400/20 hover:bg-indigo-400/10 rounded-lg">
                                <ShieldCheck className="w-3 h-3" /> Admin
                            </button>
                        )}
                        <button onClick={() => { localStorage.removeItem("velora_token"); router.push("/login"); }} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-lg">
                            <LogOut className="w-3 h-3" /> Keluar
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="ml-72 p-12 min-h-screen">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            {activeTab === 'dashboard' && 'Dashboard'}{activeTab === 'leads' && 'Data Leads'}{activeTab === 'waactive' && 'WA Active'}
                            {activeTab === 'history' && 'Histori'}{activeTab === 'ocr' && 'OCR'}{activeTab === 'broadcast' && 'Broadcast'}
                        </h2>
                    </div>
                    {activeTab === 'dashboard' && (
                        <div className="flex gap-4">
                            {status === 'running' ? (
                                <button onClick={handleStopScraper} className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl font-black flex items-center gap-2"><Square className="w-4 h-4" /> Stop</button>
                            ) : (
                                <button onClick={handleStartScraper} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl"><Play className="w-4 h-4" /> Start</button>
                            )}
                        </div>
                    )}
                </header>

                <SubscriptionBanner status={user?.subscription_status || "inactive"} onUpgrade={handleUpgrade} />

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatsCard title="Total Leads" value={leads.length} icon={Users} color="bg-blue-600" />
                            <StatsCard title="Pesan Terkirim" value="0" icon={MessageSquare} color="bg-indigo-600" />
                            <StatsCard title="Status" value={status.toUpperCase()} icon={RefreshCw} color={status === 'running' ? 'bg-emerald-500' : 'bg-slate-700'} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-3xl p-8">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Terminal className="text-blue-500 w-5 h-5" /> Logs</h3>
                                <div className="bg-black/40 rounded-2xl p-6 font-mono text-xs text-slate-400 h-80 overflow-y-auto border border-white/5">
                                    {logs.split('\n').map((line, i) => <div key={i} className="mb-1">{line}</div>)}
                                    {!logs && <p className="opacity-30 italic">Waiting...</p>}
                                </div>
                            </div>
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Settings className="text-indigo-500 w-5 h-5" /> Config</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Search Phrase</label>
                                        <div className="flex gap-2 mt-1">
                                            <input id="search_phrase_input" defaultValue={config?.search_phrase || ""} placeholder="Coffee Shop Jakarta" className="flex-1 bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white outline-none" />
                                            <button onClick={async () => { const val = (document.getElementById('search_phrase_input') as HTMLInputElement).value; await api.post("/config", { ...config, search_phrase: val }); fetchConfig(); showToast("Config updated!", "success"); }} className="bg-indigo-600 px-4 rounded-xl text-xs font-bold">Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leads Tab */}
                {activeTab === 'leads' && (
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Database Leads</h3>
                            <div className="flex gap-3">
                                <button onClick={async () => { await api.post("/sync-master"); fetchLeads(); showToast("Data synced!", "success"); }} className="bg-white/5 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><RefreshCw className="w-3 h-3" /> Sync</button>
                                <button onClick={async () => { const res = await api.post("/clean-leads"); fetchLeads(); showToast(res.data?.message || "Cleaned!", "success"); }} className="bg-amber-600/10 text-amber-400 border border-amber-600/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Trash2 className="w-3 h-3" /> Clean Nomor</button>
                                <button onClick={async () => { await api.post("/validate-wa"); showToast("Validasi dimulai!", "info"); }} className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Cek WA</button>
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-white/5 bg-white/5"><th className="p-4 text-xs font-bold text-slate-500">Phone</th><th className="p-4 text-xs font-bold text-slate-500">Status</th><th className="p-4 text-xs font-bold text-slate-500">Name</th></tr></thead>
                            <tbody>
                                {leads.map((l: Lead) => <tr key={l.id} className="border-b border-white/5"><td className="p-4 text-white font-mono">{l.phone}</td><td className="p-4"><span className={clsx("px-2 py-1 rounded text-xs", l.status === 'WA Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500')}>{l.status}</span></td><td className="p-4 text-slate-400">{l.business_name || l.name || '-'}</td></tr>)}
                                {leads.length === 0 && <tr><td colSpan={3} className="p-20 text-center opacity-20">No data</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* WA Active Tab */}
                {activeTab === 'waactive' && (
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-emerald-500/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-emerald-400">WA Active Only</h3>
                            <button onClick={() => {
                                const activeLeads = leads.filter((l: Lead) => l.status === 'WA Active');
                                const csv = 'phone,name,business_name,source\n' + activeLeads.map((l: Lead) => `${l.phone},${l.name || '-'},${l.business_name || '-'},${l.source}`).join('\n');
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = 'wa_active_leads.csv'; a.click();
                            }} className="bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Download className="w-3 h-3" /> Export CSV</button>
                        </div>
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-white/5"><th className="p-4 text-xs font-bold text-emerald-500">Phone</th><th className="p-4 text-xs font-bold text-emerald-500">Name</th><th className="p-4 text-xs font-bold text-emerald-500">Source</th></tr></thead>
                            <tbody>
                                {leads.filter((l: Lead) => l.status === 'WA Active').map((l: Lead) => <tr key={l.id} className="border-b border-white/5"><td className="p-4 text-white font-mono">{l.phone}</td><td className="p-4 text-slate-400">{l.business_name || l.name || '-'}</td><td className="p-4 text-xs text-blue-400">{l.source}</td></tr>)}
                                {leads.filter((l: Lead) => l.status === 'WA Active').length === 0 && <tr><td colSpan={3} className="p-20 text-center opacity-20">Belum ada nomor WA terverifikasi aktif.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-xl font-bold text-amber-400 mb-4">Histori Scraping</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {results.map((r: any, i: number) => <div key={i} className="bg-slate-800/50 border border-white/5 rounded-2xl p-4"><FolderOpen className="w-5 h-5 text-amber-400 mb-2" /><p className="text-sm text-white">{r.file}</p></div>)}
                            {results.length === 0 && <p className="col-span-3 text-center opacity-20 py-10">No files</p>}
                        </div>
                    </div>
                )}

                {/* OCR Tab */}
                {activeTab === 'ocr' && (
                    <div className="max-w-2xl mx-auto bg-slate-900/50 border border-white/5 rounded-3xl p-12 text-center space-y-6">
                        <Camera className="w-16 h-16 text-blue-500 mx-auto" />
                        <h3 className="text-2xl font-black text-white">OCR Intelligence</h3>
                        <p className="text-slate-500">Upload gambar untuk ekstrak nomor HP</p>
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-12"><Upload className="w-8 h-8 text-slate-500 mx-auto" /></div>
                    </div>
                )}

                {/* Broadcast Tab */}
                {activeTab === 'broadcast' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><QrCode className="text-green-500 w-5 h-5" /> WhatsApp Sessions</h3>
                                {whatsappSessions.length < whatsappLimit && <button onClick={() => setShowSessionModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Plus className="w-3 h-3" /> Connect</button>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {whatsappSessions.map((s: any) => (
                                    <div key={s.name} className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="w-5 h-5 text-green-500" />
                                            <div><p className="text-sm font-bold text-white">{s.name.split('_').slice(1).join('_')}</p><p className="text-[10px] text-slate-400">{s.status}</p></div>
                                        </div>
                                        <button onClick={() => setQrSession(s.name)} className="text-xs text-blue-400"><QrCode className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-white"><MessageSquare className="inline w-5 h-5 text-indigo-500 mr-2" />Templates</h3>
                                    <button onClick={() => setShowTemplateModal(true)} className="text-xs text-indigo-400">+ New</button>
                                </div>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {templates.map((t: Template) => (
                                        <div key={t.id} className="p-4 bg-white/5 rounded-xl group relative">
                                            <div className="flex justify-between"><h4 className="font-bold text-white text-sm">{t.name}</h4>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                                    <button onClick={() => { setInputTemplateName(t.name); setInputTemplateContent(t.content); setEditingTemplateId(t.id); setShowTemplateModal(true); }}><Pencil className="w-3 h-3 text-blue-400" /></button>
                                                    <button onClick={() => api.delete(`/templates/${t.id}`).then(fetchTemplates)}><Trash2 className="w-3 h-3 text-red-400" /></button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">{t.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-4"><Zap className="inline w-5 h-5 text-blue-500 mr-2" />Launch</h3>
                                <select value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-white mb-4">
                                    <option value="verified">Verified WA Only</option><option value="all">All</option>
                                </select>
                                <button onClick={handleBroadcast} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black mt-auto">🚀 BROADCAST</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Session Modal */}
            {showSessionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative">
                        <button onClick={() => setShowSessionModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                        <h3 className="text-xl font-bold text-white mb-6">Tambah WhatsApp</h3>
                        <input value={newSessionName} onChange={e => setNewSessionName(e.target.value)} placeholder="Nama Sesi" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white mb-6" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowSessionModal(false)} className="flex-1 bg-white/5 py-3 rounded-xl font-bold">Batal</button>
                            <button onClick={() => { api.post("/whatsapp/session", { session_name: newSessionName }).then(res => { fetchWhatsappSessions(); setShowSessionModal(false); setNewSessionName(""); if (res.data?.name) setQrSession(res.data.name); }).catch(() => showToast("Gagal", "error")); }} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative">
                        <button onClick={() => { setShowTemplateModal(false); setEditingTemplateId(null); setInputTemplateName(""); setInputTemplateContent(""); }} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                        <h3 className="text-xl font-bold text-white mb-6">{editingTemplateId ? "Edit" : "Buat"} Template</h3>
                        <input value={inputTemplateName} onChange={e => setInputTemplateName(e.target.value)} placeholder="Nama Template" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white mb-4" />
                        <textarea value={inputTemplateContent} onChange={e => setInputTemplateContent(e.target.value)} placeholder="Isi pesan..." rows={4} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white mb-6 resize-none" />
                        <div className="flex gap-3">
                            <button onClick={() => { setShowTemplateModal(false); setEditingTemplateId(null); }} className="flex-1 bg-white/5 py-3 rounded-xl font-bold">Batal</button>
                            <button onClick={() => { const req = editingTemplateId ? api.put(`/templates/${editingTemplateId}`, { name: inputTemplateName, content: inputTemplateContent }) : api.post("/templates", { name: inputTemplateName, content: inputTemplateContent }); req.then(() => { fetchTemplates(); setShowTemplateModal(false); setEditingTemplateId(null); setInputTemplateName(""); setInputTemplateContent(""); showToast("Saved!", "success"); }).catch(() => showToast("Error", "error")); }} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {qrSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative">
                        <button onClick={() => setQrSession(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                        <h3 className="text-xl font-bold text-white mb-6 text-center">Scan QR</h3>
                        <div className="bg-white p-4 rounded-xl aspect-square flex items-center justify-center">
                            {qrCodeUrl ? <img src={qrCodeUrl} className="w-full h-full object-contain" alt="QR" /> : <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />}
                        </div>
                        <p className="text-center text-slate-500 text-xs mt-4">Buka WhatsApp → Perangkat Tertaut → Scan</p>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={clsx("fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[100]", toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white')}>
                    {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                    {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {/* Confirm Modal */}
            {confirmModal?.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center space-y-6">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h3 className="text-xl font-bold text-white">Konfirmasi</h3>
                        <p className="text-slate-400 text-sm">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 bg-white/5 py-3 rounded-xl font-bold">Batal</button>
                            <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold">Ya</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
