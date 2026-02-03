"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    Users,
    CreditCard,
    LayoutDashboard,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowLeftRight,
    LogOut,
    TrendingUp,
    TrendingDown,
    Activity,
    Package,
    Save,
    Plus,
    Trash2
} from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const NavItem = ({ icon: Icon, label, active, onClick, color = "text-slate-400" }: any) => (
    <button
        onClick={onClick}
        className={clsx(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
            active ? "bg-blue-600 shadow-lg shadow-blue-500/20" : "hover:bg-white/5"
        )}
    >
        <Icon className={clsx("w-5 h-5 transition-colors", active ? "text-white" : color, !active && "group-hover:text-white")} />
        <span className={clsx("text-sm font-bold tracking-tight", active ? "text-white" : "text-slate-400 group-hover:text-slate-200")}>
            {label}
        </span>
        {active && <div className="ml-auto w-1 h-4 bg-white/40 rounded-full" />}
    </button>
);

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [editingPackage, setEditingPackage] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [showNewPackageForm, setShowNewPackageForm] = useState(false);
    const [newPackage, setNewPackage] = useState({ name: '', display_name: '', price: 100000, max_senders: 1, duration_days: 30 });

    // Filters
    const [filterMonth, setFilterMonth] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPackage, setFilterPackage] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("velora_token");
            if (!token) {
                router.push("/login");
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [usersRes, transRes, pkgRes] = await Promise.all([
                axios.get(`${API_URL}/admin/users`, config),
                axios.get(`${API_URL}/admin/transactions`, config),
                axios.get(`${API_URL}/admin/packages`, config)
            ]);

            setUsers(usersRes.data);
            setTransactions(transRes.data);
            setPackages(pkgRes.data);
            setLoading(false);
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError("Gagal memuat data admin. Pastikan Anda masuk sebagai Admin.");
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">{error}</h1>
            <button onClick={() => window.location.href = "/dashboard"} className="text-blue-500 hover:underline">Kembali ke Dashboard User</button>
        </div>
    );

    const totalRevenue = transactions
        .filter((t: any) => t.transaction_status === "settlement")
        .reduce((acc: number, t: any) => acc + t.gross_amount, 0);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30">

            {/* Sidebar Navigation */}
            <aside className="fixed left-0 top-0 h-full w-72 bg-slate-950/50 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col z-50">
                <div className="mb-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-white">
                        OWNER<span className="text-blue-500 font-light italic ml-1">PANEL</span>
                    </h1>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem icon={LayoutDashboard} label="Panel Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={Users} label="Manajemen User" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <NavItem icon={CreditCard} label="Log Transaksi" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
                    <NavItem icon={Package} label="Kelola Paket" active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} />
                </nav>

                <div className="mt-auto space-y-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
                    >
                        <ArrowLeftRight className="w-4 h-4" /> Switch Mode
                    </button>

                    <button
                        onClick={() => { localStorage.removeItem("velora_token"); router.push("/login"); }}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut className="w-3 h-3" /> Logout Admin
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="ml-72 p-12 min-h-screen">

                {/* Header Section */}
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            {activeTab === 'overview' && 'System Analytics'}
                            {activeTab === 'users' && 'User Directory'}
                            {activeTab === 'transactions' && 'Revenue Streams'}
                            {activeTab === 'packages' && 'Kelola Paket'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Kendali Penuh Atas Ekosistem Velora Blast.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Status Server</div>
                                <div className="text-lg font-black text-white">OPTIMAL</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Tab: Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                    <Users className="w-20 h-20 text-blue-500" />
                                </div>
                                <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Total User Terdaftar</h4>
                                <div className="text-5xl font-black text-white tracking-tighter">{users.length}</div>
                                <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                    <TrendingUp className="w-3 h-3" /> 100% Growth
                                </div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-20 h-20 text-emerald-500" />
                                </div>
                                <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Total Pendapatan (IDR)</h4>
                                <div className="text-5xl font-black text-white tracking-tighter">Rp {(totalRevenue / 1000).toFixed(0)}k</div>
                                <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                    <TrendingUp className="w-3 h-3" /> Revenue looks good
                                </div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                    <Activity className="w-20 h-20 text-indigo-500" />
                                </div>
                                <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">User Aktif</h4>
                                <div className="text-5xl font-black text-white tracking-tighter">{users.filter((u: any) => u.subscription_status === 'active').length}</div>
                                <div className="mt-4 flex items-center gap-1 text-blue-400 text-xs font-bold">
                                    Retention High
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 underline decoration-blue-500/50 decoration-4 underline-offset-4">
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {users.slice(0, 5).map((user: any) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{user.email}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">{new Date(user.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                user.subscription_status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {user.subscription_status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Users */}
                {activeTab === 'users' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Filter Bar */}
                        <div className="flex flex-wrap gap-4 p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none"
                            >
                                <option value="">Semua Bulan</option>
                                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                                    <option key={i} value={String(i + 1)}>{m}</option>
                                ))}
                            </select>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none"
                            >
                                <option value="">Semua Tahun</option>
                                {[2024, 2025, 2026].map((y) => (
                                    <option key={y} value={String(y)}>{y}</option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                            <select
                                value={filterPackage}
                                onChange={(e) => setFilterPackage(e.target.value)}
                                className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none"
                            >
                                <option value="">Semua Paket</option>
                                <option value="monthly">Bulanan</option>
                                <option value="yearly">Tahunan</option>
                            </select>
                        </div>

                        {/* User Table */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Pengguna</th>
                                        <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Status Langganan</th>
                                        <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Kadaluarsa</th>
                                        <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Akses Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users
                                        .filter((user: any) => {
                                            const createdDate = new Date(user.created_at);
                                            if (filterMonth && createdDate.getMonth() + 1 !== parseInt(filterMonth)) return false;
                                            if (filterYear && createdDate.getFullYear() !== parseInt(filterYear)) return false;
                                            if (filterStatus && user.subscription_status !== filterStatus) return false;
                                            if (filterPackage && user.package_type !== filterPackage) return false;
                                            return true;
                                        })
                                        .map((user: any) => (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-6">
                                                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{user.email}</div>
                                                    <div className="text-[10px] text-slate-500 font-medium tracking-tight">UUID: {user.id}</div>
                                                </td>
                                                <td className="p-6">
                                                    <span className={clsx(
                                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                        user.subscription_status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        {user.subscription_status}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-sm font-medium text-slate-400">
                                                    {user.expiry_date ? new Date(user.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                                </td>
                                                <td className="p-6">
                                                    <span className={clsx(
                                                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter",
                                                        user.role === "admin" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"
                                                    )}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Transactions */}
                {activeTab === 'transactions' && (
                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {transactions.length === 0 && (
                            <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center">
                                <CreditCard className="w-16 h-16 text-slate-700 mb-4" />
                                <h3 className="text-xl font-bold text-white">Belum Ada Transaksi</h3>
                                <p className="text-sm text-slate-500 mt-2">Seluruh transaksi pembayaran akan muncul di sini.</p>
                            </div>
                        )}
                        {transactions.slice().reverse().map((t: any) => (
                            <div key={t.id} className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-indigo-500/30 transition-all">
                                <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                    t.transaction_status === "settlement" ? "bg-emerald-500/10 text-emerald-400" :
                                        t.transaction_status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                                )}>
                                    {t.transaction_status === "settlement" ? <CheckCircle2 className="w-7 h-7" /> :
                                        t.transaction_status === "pending" ? <Clock className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-lg font-black text-white tracking-tight">{t.order_id}</h4>
                                        <div className="text-2xl font-black text-indigo-400 tracking-tighter">IDR {t.gross_amount.toLocaleString('id-ID')}</div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-slate-400 uppercase font-black">{t.payment_type || "INTERNAL"}</div>
                                        <div className="text-[10px] text-slate-500 font-bold">{new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tab: Packages */}
                {activeTab === 'packages' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center">
                            <p className="text-slate-400 text-sm">Edit harga dan konfigurasi paket langganan di sini.</p>
                            <button
                                onClick={() => setShowNewPackageForm(!showNewPackageForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Tambah Paket Baru
                            </button>
                        </div>

                        {/* Create New Package Form */}
                        {showNewPackageForm && (
                            <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-[2.5rem] p-8 space-y-6">
                                <h3 className="text-xl font-black text-white">Buat Paket Baru</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nama Kode (lowercase)</label>
                                        <input
                                            type="text"
                                            value={newPackage.name}
                                            onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                            placeholder="premium"
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nama Tampilan</label>
                                        <input
                                            type="text"
                                            value={newPackage.display_name}
                                            onChange={(e) => setNewPackage({ ...newPackage, display_name: e.target.value })}
                                            placeholder="Paket Premium"
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Harga (IDR)</label>
                                        <input
                                            type="number"
                                            value={newPackage.price}
                                            onChange={(e) => setNewPackage({ ...newPackage, price: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Max Sender WA</label>
                                        <input
                                            type="number"
                                            value={newPackage.max_senders}
                                            onChange={(e) => setNewPackage({ ...newPackage, max_senders: parseInt(e.target.value) || 1 })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Durasi (Hari)</label>
                                        <input
                                            type="number"
                                            value={newPackage.duration_days}
                                            onChange={(e) => setNewPackage({ ...newPackage, duration_days: parseInt(e.target.value) || 30 })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                const token = localStorage.getItem("velora_token");
                                                await axios.post(`${API_URL}/admin/packages`, newPackage, { headers: { Authorization: `Bearer ${token}` } });
                                                fetchData();
                                                setShowNewPackageForm(false);
                                                setNewPackage({ name: '', display_name: '', price: 100000, max_senders: 1, duration_days: 30 });
                                                alert("Paket berhasil dibuat!");
                                            } catch (e: any) {
                                                alert(e.response?.data?.detail || "Gagal membuat paket.");
                                            }
                                            setSaving(false);
                                        }}
                                        disabled={saving || !newPackage.name || !newPackage.display_name}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-colors disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Paket"}
                                    </button>
                                    <button
                                        onClick={() => setShowNewPackageForm(false)}
                                        className="px-6 py-4 bg-slate-700 text-white font-black rounded-2xl hover:bg-slate-600 transition-colors"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {packages.map((pkg: any) => (
                                <div key={pkg.id} className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{pkg.display_name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                                pkg.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {pkg.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`Yakin ingin menghapus paket "${pkg.display_name}"?`)) return;
                                                    try {
                                                        const token = localStorage.getItem("velora_token");
                                                        await axios.delete(`${API_URL}/admin/packages/${pkg.id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                        fetchData();
                                                        alert("Paket berhasil dihapus!");
                                                    } catch (e) {
                                                        alert("Gagal menghapus paket.");
                                                    }
                                                }}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                                                title="Hapus Paket"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Harga (IDR)</label>
                                            <input
                                                type="number"
                                                value={editingPackage?.id === pkg.id ? editingPackage.price : pkg.price}
                                                onChange={(e) => setEditingPackage({ ...pkg, price: parseInt(e.target.value) || 0 })}
                                                onFocus={() => setEditingPackage(pkg)}
                                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Max Sender WA</label>
                                            <input
                                                type="number"
                                                value={editingPackage?.id === pkg.id ? editingPackage.max_senders : pkg.max_senders}
                                                onChange={(e) => setEditingPackage({ ...pkg, max_senders: parseInt(e.target.value) || 1 })}
                                                onFocus={() => setEditingPackage(pkg)}
                                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Durasi (Hari)</label>
                                            <input
                                                type="number"
                                                value={editingPackage?.id === pkg.id ? editingPackage.duration_days : pkg.duration_days}
                                                onChange={(e) => setEditingPackage({ ...pkg, duration_days: parseInt(e.target.value) || 30 })}
                                                onFocus={() => setEditingPackage(pkg)}
                                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    {editingPackage?.id === pkg.id && (
                                        <button
                                            onClick={async () => {
                                                setSaving(true);
                                                try {
                                                    const token = localStorage.getItem("velora_token");
                                                    await axios.put(`${API_URL}/admin/packages/${pkg.id}`, {
                                                        price: editingPackage.price,
                                                        max_senders: editingPackage.max_senders,
                                                        duration_days: editingPackage.duration_days
                                                    }, { headers: { Authorization: `Bearer ${token}` } });
                                                    fetchData();
                                                    setEditingPackage(null);
                                                    alert("Paket berhasil diupdate!");
                                                } catch (e) {
                                                    alert("Gagal update paket.");
                                                }
                                                setSaving(false);
                                            }}
                                            disabled={saving}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-colors"
                                        >
                                            <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
