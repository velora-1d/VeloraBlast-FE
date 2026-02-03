"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    Play, Square, Settings, FileText, Database, Terminal, RefreshCw, Upload,
    Camera, Table, Download, CheckCircle, MonitorPlay, Trash2, Loader2,
    AlertCircle, X, Plus, Pencil, LogOut, CreditCard, MessageSquare,
    ShieldCheck, Zap, BarChart3, Users, FolderOpen, Smartphone, QrCode,
    LayoutList, Activity, Send
} from "lucide-react";
import clsx from "clsx";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
    const [broadcastTemplate, setBroadcastTemplate] = useState("");
    const [broadcastTarget, setBroadcastTarget] = useState("verified");
    const [broadcastStatus, setBroadcastStatus] = useState<any>({ status: 'idle', logs: [], progress: 0, sent: 0, failed: 0, total: 0 });
    const [results, setResults] = useState<any[]>([]);
    const [whatsappSessions, setWhatsappSessions] = useState<any[]>([]);
    const [whatsappLimit, setWhatsappLimit] = useState(0);
    const [qrSession, setQrSession] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    // Modals
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [newSessionName, setNewSessionName] = useState("");
    const [noticeModal, setNoticeModal] = useState({ show: false, message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState<any>({ show: false, message: '', onConfirm: () => { } });
    const [inputTemplateName, setInputTemplateName] = useState("");
    const [inputTemplateContent, setInputTemplateContent] = useState("");
    const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

    // UI State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Feature: Test Send & Preview
    const [testPhone, setTestPhone] = useState("");
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

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
    const fetchPreview = async (path: string) => {
        setPreviewLoading(true);
        setPreviewData(null);
        setShowPreviewModal(true);
        try {
            const { data } = await api.get(`/results/content?path=${encodeURIComponent(path)}`);
            setPreviewData(data);
        } catch (err: any) {
            showToast(err.response?.data?.detail || "Gagal load preview", "error");
            setShowPreviewModal(false);
        } finally {
            setPreviewLoading(false);
        }
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
            try {
                const [s, l] = await Promise.all([api.get("/status"), api.get("/logs")]);
                setStatus(s.data.status);
                setLogs(l.data.logs);

                // Auto-scroll logic
                const container = document.getElementById('log-container');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            } catch { }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll for broadcast logs
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTab === 'broadcast' || broadcastStatus.status === 'running') {
            interval = setInterval(async () => {
                try {
                    const res = await api.get("/broadcast/status");
                    setBroadcastStatus(res.data);

                    // Auto-scroll for broadcast logs
                    const container = document.getElementById('broadcast-log-container');
                    if (container) {
                        container.scrollTop = container.scrollHeight;
                    }
                } catch { }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [activeTab, broadcastStatus.status]);

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
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Terminal className="text-blue-500 w-5 h-5" /> Logs
                                    {status === 'running' && <span className="flex h-2 w-2 relative ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
                                </h3>
                                <div
                                    id="log-container"
                                    className="bg-black/40 rounded-2xl p-6 font-mono text-[10px] md:text-xs text-slate-400 h-80 overflow-y-auto border border-white/5 scroll-smooth"
                                >
                                    {logs.split('\n').map((line, i) => {
                                        if (!line.trim()) return null;
                                        const isSuccess = /SUCCESS|DONE|OK|✅|Sent to/i.test(line);
                                        const isError = /ERROR|FAILED|❌|Critical/i.test(line);
                                        const isWarning = /WARNING|⚠️|WAITING|COOLDOWN|☕/i.test(line);
                                        return (
                                            <div key={i} className={clsx(
                                                "mb-1 border-l-2 pl-3 py-0.5",
                                                isSuccess ? "text-emerald-400 border-emerald-500/50 bg-emerald-500/5" :
                                                    isError ? "text-red-400 border-red-500/50 bg-red-500/5" :
                                                        isWarning ? "text-amber-400 border-amber-500/50 bg-amber-500/5" :
                                                            "text-slate-400 border-white/5"
                                            )}>
                                                <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                                {line}
                                            </div>
                                        );
                                    })}
                                    {!logs && <p className="opacity-30 italic flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Menunggu log sistem...</p>}
                                    <div id="log-end"></div>
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
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-24 text-center">
                                            <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                                                <div className="w-20 h-20 bg-slate-800/50 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-2xl">
                                                    <Users className="w-10 h-10 text-slate-600" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-xl font-bold text-white tracking-tight">Belum Ada Data Leads</h4>
                                                    <p className="text-sm text-slate-500">Mulai jalankan Scraper untuk mencari data target atau upload via fitur OCR.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button onClick={() => setActiveTab('dashboard')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:scale-105 transition-transform">Mulai Scraping</button>
                                                    <button onClick={() => setActiveTab('ocr')} className="bg-white/5 text-white border border-white/5 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">Gunakan OCR</button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {whatsappSessions.map((s: any) => {
                                    const isConnected = s.status?.toLowerCase() === 'open' || s.status?.toLowerCase() === 'connected';
                                    const isConnecting = s.status?.toLowerCase() === 'connecting' || s.status?.toLowerCase() === 'initializing';

                                    return (
                                        <div key={s.name} className="bg-slate-800/20 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-all group relative overflow-hidden">
                                            {isConnecting && <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/30 overflow-hidden"><div className="w-1/2 h-full bg-blue-500 animate-[loading_1s_infinite_linear]"></div></div>}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={clsx(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                                                        isConnected ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-500"
                                                    )}>
                                                        <Smartphone className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white tracking-tight">{s.name.split('_').slice(1).join('_')}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <div className={clsx("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-600")}></div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.status}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!isConnected && (
                                                        <button
                                                            onClick={() => setQrSession(s.name)}
                                                            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/5 group-hover:scale-110"
                                                            title="Buka QR"
                                                        >
                                                            <QrCode className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setConfirmModal({
                                                                show: true,
                                                                message: `Hapus sesi WhatsApp "${s.name.split('_').slice(1).join('_')}"?`,
                                                                onConfirm: () => api.post("/whatsapp/logout", { session_name: s.name }).then(fetchWhatsappSessions)
                                                            });
                                                        }}
                                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {whatsappSessions.length === 0 && (
                                    <div className="col-span-full py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                            <Smartphone className="w-8 h-8 text-slate-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-300">Belum Ada Sesi WhatsApp</p>
                                            <p className="text-xs text-slate-500">Tambahkan akun WhatsApp untuk mulai melakukan broadcast.</p>
                                        </div>
                                        <button onClick={() => setShowSessionModal(true)} className="bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 px-6 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all">Tambah Akun</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Send className="text-blue-500 w-5 h-5" /> Blast Configuration</h3>

                                {broadcastStatus.status === 'running' && (
                                    <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Broadcast Progress</p>
                                                <h4 className="text-2xl font-black text-white">{broadcastStatus.progress}%</h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                                                <p className="text-xs font-bold text-white">{broadcastStatus.status.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-blue-500/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500 ease-out"
                                                style={{ width: `${broadcastStatus.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase">Success</p>
                                                <p className="text-sm font-black text-emerald-400">{broadcastStatus.sent}</p>
                                            </div>
                                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase">Failed</p>
                                                <p className="text-sm font-black text-red-400">{broadcastStatus.failed}</p>
                                            </div>
                                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase">Total</p>
                                                <p className="text-sm font-black text-white">{broadcastStatus.total}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-300">Target Audience</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setBroadcastTarget('all')}
                                            className={clsx(
                                                "p-4 rounded-2xl border transition-all text-left",
                                                broadcastTarget === 'all' ? "bg-blue-600/20 border-blue-500 text-white shadow-xl shadow-blue-600/10" : "bg-white/5 border-white/5 text-slate-400"
                                            )}
                                        >
                                            <Users className="w-5 h-5 mb-2" />
                                            <p className="text-sm font-bold">All Contacts</p>
                                            <p className="text-[10px] opacity-50">Total: {leads.length}</p>
                                        </button>
                                        <button
                                            onClick={() => setBroadcastTarget('verified')}
                                            className={clsx(
                                                "p-4 rounded-2xl border transition-all text-left",
                                                broadcastTarget === 'verified' ? "bg-blue-600/20 border-blue-500 text-white shadow-xl shadow-blue-600/10" : "bg-white/5 border-white/5 text-slate-400"
                                            )}
                                        >
                                            <Smartphone className="w-5 h-5 mb-2" />
                                            <p className="text-sm font-bold">WA Active Only</p>
                                            <p className="text-[10px] opacity-50">Total: {leads.filter((l: Lead) => l.status === 'WA Active').length}</p>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300">Message Template</label>
                                    <textarea
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-blue-500 outline-none h-40 transition-all font-medium"
                                        placeholder="Tulis pesan Anda disini... Gunakan {name} untuk personalisasi."
                                        value={broadcastTemplate}
                                        onChange={(e) => setBroadcastTemplate(e.target.value)}
                                        disabled={broadcastStatus.status === 'running'}
                                    />
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Spintax & Variables Supported</p>
                                        <button onClick={() => setShowTemplateModal(true)} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"><Pencil className="w-3 h-3" /> Save as Template</button>
                                    </div>

                                    {/* Test Send Section */}
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Test Broadcast (Safety Check)</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={testPhone}
                                                onChange={e => setTestPhone(e.target.value)}
                                                placeholder="081234567890"
                                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (!testPhone || !broadcastTemplate) return showToast("Phone & Template required", "error");
                                                    try {
                                                        const res = await api.post("/broadcast/test", { phone: testPhone, message: broadcastTemplate });
                                                        showToast(res.data.message, res.data.status === 'success' ? 'success' : 'error');
                                                    } catch (e: any) {
                                                        showToast(e.response?.data?.detail || "Send failed", "error");
                                                    }
                                                }}
                                                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                            >
                                                Test Send
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {broadcastStatus.status === 'running' ? (
                                        <button
                                            onClick={async () => {
                                                await api.post("/broadcast/stop");
                                            }}
                                            className="flex-1 bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                                        >
                                            <Square className="w-4 h-4" /> Stop Broadcast
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (!broadcastTemplate.trim()) {
                                                    setNoticeModal({ show: true, message: "Template pesan tidak boleh kosong!", type: 'error' });
                                                    return;
                                                }
                                                if (whatsappSessions.filter((s: any) => s.status?.toLowerCase() === 'open' || s.status?.toLowerCase() === 'connected').length === 0) {
                                                    setNoticeModal({ show: true, message: "Hubungkan minimal satu sesi WhatsApp sebelum mengirim!", type: 'error' });
                                                    return;
                                                }
                                                setConfirmModal({
                                                    show: true,
                                                    message: "Konfirmasi mulai pengiriman pesan?",
                                                    onConfirm: async () => {
                                                        try {
                                                            await api.post("/broadcast/start", {
                                                                template: broadcastTemplate,
                                                                target: broadcastTarget
                                                            });
                                                            setNoticeModal({ show: true, message: "Broadcast dimulai!", type: 'success' });
                                                        } catch (err: any) {
                                                            setNoticeModal({ show: true, message: err.response?.data?.detail || "Gagal memulai broadcast", type: 'error' });
                                                        }
                                                    }
                                                });
                                            }}
                                            className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                                        >
                                            <Play className="w-4 h-4" /> Start Broadcast
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><LayoutList className="text-blue-500 w-5 h-5" /> Activity Log</h3>
                                    <div className="flex h-2 w-2 relative">
                                        {broadcastStatus.status === 'running' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
                                        <div className={clsx("relative inline-flex rounded-full h-2 w-2", broadcastStatus.status === 'running' ? "bg-blue-500" : "bg-slate-700")}></div>
                                    </div>
                                </div>
                                <div id="broadcast-log-container" className="flex-1 bg-black/40 rounded-2xl p-6 font-mono text-xs text-slate-400 border border-white/5 overflow-y-auto max-h-[500px] scroll-smooth min-h-[300px]">
                                    {broadcastStatus.logs?.length > 0 ? (
                                        broadcastStatus.logs.map((log: string, i: number) => {
                                            const isSent = log.includes('✅');
                                            const isFailed = log.includes('❌');
                                            const isWait = log.includes('⏳') || log.includes('⌨️');
                                            return (
                                                <div key={i} className={clsx(
                                                    "mb-2 py-1 px-3 rounded-lg border-l-2",
                                                    isSent ? "bg-emerald-500/5 border-emerald-500 text-emerald-400" :
                                                        isFailed ? "bg-red-500/5 border-red-500 text-red-400" :
                                                            isWait ? "bg-blue-500/5 border-blue-500 text-blue-400" :
                                                                "bg-white/5 border-transparent text-slate-500"
                                                )}>
                                                    {log}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 italic gap-3">
                                            <Activity className="w-8 h-8" />
                                            <p>Belum ada aktivitas broadcast</p>
                                        </div>
                                    )}
                                </div>
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

            {/* Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-4xl w-full relative max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Table className="w-5 h-5 text-blue-500" /> Data Preview</h3>
                            <button onClick={() => setShowPreviewModal(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-auto border border-white/5 rounded-xl bg-black/40">
                            {previewLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <p className="text-sm text-slate-500">Loading data...</p>
                                </div>
                            ) : previewData ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-slate-400 font-bold sticky top-0">
                                        <tr>
                                            {previewData.columns?.map((c: string) => <th key={c} className="p-3">{c}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                        {previewData.data?.map((row: any, i: number) => (
                                            <tr key={i} className="hover:bg-white/5">
                                                {previewData.columns?.map((c: string) => <td key={c} className="p-3 whitespace-nowrap">{row[c]}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-10 text-center text-slate-500">Gagal memuat data atau file kosong.</div>
                            )}
                        </div>
                        <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
                            <p>Previewing first 50 rows only.</p>
                            <button onClick={() => setShowPreviewModal(false)} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {
                confirmModal?.show && (
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
                )
            }

            {/* Notice Modal */}
            {
                noticeModal.show && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
                            <div className={clsx(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto",
                                noticeModal.type === 'success' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                            )}>
                                {noticeModal.type === 'success' ? <CheckCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">{noticeModal.type === 'success' ? 'Sukses' : 'Pesan'}</h3>
                                <p className="text-slate-400 text-sm whitespace-pre-wrap">{noticeModal.message}</p>
                            </div>
                            <button
                                onClick={() => setNoticeModal({ ...noticeModal, show: false })}
                                className="w-full bg-white/5 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
