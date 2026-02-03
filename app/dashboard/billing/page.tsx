"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    Zap,
    CheckCircle2,
    ShieldCheck,
    ArrowLeft,
    Crown,
    Users
} from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

interface Package {
    id: number;
    name: string;
    display_name: string;
    price: number;
    max_senders: number;
    duration_days: number;
}

export default function BillingPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const api = axios.create({ baseURL: API_URL });
    api.interceptors.request.use(cfg => {
        cfg.headers.Authorization = `Bearer ${localStorage.getItem("velora_token")}`;
        return cfg;
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, pkgRes] = await Promise.all([
                    api.get("/me"),
                    axios.get(`${API_URL}/packages`)
                ]);
                setUser(userRes.data);
                setPackages(pkgRes.data);
                setLoading(false);
            } catch (err) {
                router.push("/login");
            }
        };
        fetchData();
    }, []);

    const handleUpgrade = async (packageName: string) => {
        setProcessing(true);
        setSelectedPackage(packageName);
        try {
            const { data } = await api.post("/subscription/create-payment", {
                package_name: packageName
            });
            if (data.token) {
                (window as any).snap.pay(data.token, {
                    onSuccess: () => { alert("Pembayaran Berhasil!"); window.location.reload(); },
                    onPending: () => { alert("Menunggu Pembayaran..."); setProcessing(false); },
                    onError: () => { alert("Pembayaran Gagal."); setProcessing(false); },
                    onClose: () => { setProcessing(false); }
                });
            }
        } catch (e) {
            alert("Gagal membuat transaksi. Pastikan internet Anda stabil.");
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    const isActive = user?.subscription_status === 'active';

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 p-8 md:p-12 font-sans selection:bg-blue-500/30">

            {/* Back Button */}
            <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
            </button>

            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Pilih Paket Langganan</h1>
                        <p className="text-slate-500 max-w-md italic">Pilih paket yang sesuai dengan kebutuhan bisnis Anda.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Status Langganan</p>
                            <p className={clsx(
                                "text-lg font-black uppercase tracking-tight",
                                isActive ? "text-emerald-400" : "text-red-400"
                            )}>
                                {isActive ? `PAKET ${user?.package_type?.toUpperCase()} AKTIF` : 'BELUM AKTIF'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Package Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className={clsx(
                            "relative group",
                            pkg.name === "advance" && "md:scale-105"
                        )}>
                            {pkg.name === "advance" && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 px-6 py-2 rounded-full text-sm font-black text-white uppercase tracking-wider z-10">
                                    Paling Hemat
                                </div>
                            )}
                            <div className={clsx(
                                "absolute -inset-0.5 rounded-[3rem] blur transition duration-1000",
                                pkg.name === "advance"
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 opacity-40 group-hover:opacity-60"
                                    : "bg-gradient-to-r from-slate-600 to-slate-700 opacity-20 group-hover:opacity-40"
                            )}></div>
                            <div className={clsx(
                                "relative border rounded-[3rem] p-12 space-y-8 flex flex-col items-center text-center",
                                pkg.name === "advance" ? "bg-blue-600 border-blue-500" : "bg-[#0f172a] border-white/5"
                            )}>
                                <div className={clsx(
                                    "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner",
                                    pkg.name === "advance" ? "bg-white/20 text-white" : "bg-blue-600/10 text-blue-500"
                                )}>
                                    {pkg.name === "advance" ? <Crown className="w-10 h-10" /> : <Users className="w-10 h-10" />}
                                </div>
                                <div className="space-y-2">
                                    <h3 className={clsx(
                                        "text-2xl font-black italic tracking-tight",
                                        pkg.name === "advance" ? "text-white" : "text-white"
                                    )}>{pkg.display_name.toUpperCase()}</h3>
                                    <div className="flex items-baseline gap-1 justify-center">
                                        <span className="text-5xl font-black text-white">
                                            Rp {(pkg.price / 1000).toFixed(0)}rb
                                        </span>
                                        <span className={clsx(
                                            "font-bold",
                                            pkg.name === "advance" ? "text-blue-200" : "text-slate-500"
                                        )}>/ {pkg.duration_days} Hari</span>
                                    </div>
                                </div>
                                <div className={clsx(
                                    "w-full h-[1px]",
                                    pkg.name === "advance" ? "bg-white/20" : "bg-white/5"
                                )}></div>
                                <ul className="space-y-4 text-left w-full">
                                    <BenefitItem
                                        text={`Max ${pkg.max_senders} Akun WhatsApp Sender`}
                                        light={pkg.name === "advance"}
                                    />
                                    <BenefitItem text="Akses Scraper Unlimited Data Maps" light={pkg.name === "advance"} />
                                    <BenefitItem text="Blast WhatsApp Skala Besar" light={pkg.name === "advance"} />
                                    <BenefitItem text="Extraksi OCR Gambar Tanpa Batas" light={pkg.name === "advance"} />
                                    <BenefitItem text="Broadcast Bot Telegram Integrasi" light={pkg.name === "advance"} />
                                    {pkg.name === "advance" && (
                                        <BenefitItem text="Support Teknis Prioritas 24/7" light />
                                    )}
                                </ul>
                                <button
                                    onClick={() => handleUpgrade(pkg.name)}
                                    disabled={isActive || processing}
                                    className={clsx(
                                        "w-full py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl",
                                        isActive
                                            ? "bg-emerald-500/20 text-emerald-500 cursor-not-allowed border border-emerald-500/20"
                                            : pkg.name === "advance"
                                                ? "bg-white text-blue-600 hover:scale-[1.02] active:scale-95"
                                                : "bg-blue-600 text-white hover:scale-[1.02] shadow-blue-600/30 active:scale-95"
                                    )}
                                >
                                    {isActive
                                        ? 'SUDAH AKTIF'
                                        : processing && selectedPackage === pkg.name
                                            ? 'MEMPROSES...'
                                            : 'PILIH PAKET INI'}
                                </button>
                                <div className={clsx(
                                    "flex items-center justify-center gap-6",
                                    pkg.name === "advance" ? "opacity-50" : "opacity-30"
                                )}>
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                    <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Secured by Midtrans</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Box */}
                <div className="p-8 bg-blue-600/5 rounded-[2rem] border border-blue-600/10 space-y-4 text-center">
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Pembayaran akan diproses secara aman melalui gateway <strong>Midtrans</strong>.
                        Setelah pembayaran diverifikasi (settlement), akun Anda akan otomatis aktif secara <strong>INSTAN</strong>.
                        Tidak perlu konfirmasi manual.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
                        <Zap className="w-3 h-3 fill-current" /> Instant Activation Technology
                    </div>
                </div>

            </div>

        </div>
    );
}

function BenefitItem({ text, light }: { text: string; light?: boolean }) {
    return (
        <li className={clsx("flex items-center gap-4 group", light ? "text-blue-50" : "text-slate-400")}>
            <div className={clsx(
                "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
                light ? "bg-white/20 text-white" : "bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white"
            )}>
                <CheckCircle2 className="w-3 h-3" />
            </div>
            <span className={clsx(
                "text-sm font-medium tracking-tight transition-colors",
                light ? "" : "group-hover:text-white"
            )}>{text}</span>
        </li>
    );
}
