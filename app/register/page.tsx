"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MonitorPlay, CheckCircle, AlertCircle, ArrowLeft, UserPlus, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        if (password !== confirmPassword) {
            setError("Kata sandi tidak cocok");
            return;
        }

        setIsAnimating(true);
        setError("");

        try {
            await axios.post(`${API_URL}/register`, { email, password });
            setSuccess(true);
            setIsAnimating(false);

            // Auto redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2500);
        } catch (err: any) {
            setIsAnimating(false);
            setError(err.response?.data?.detail || "Pendaftaran Gagal");
            setTimeout(() => setError(""), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 overflow-hidden select-none">
            {/* Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className={clsx(
                "w-full max-w-md z-10 transition-all duration-1000 transform",
                (isAnimating || success) ? "scale-95 opacity-0" : "scale-100 opacity-100",
                success && "hidden"
            )}>
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-widest uppercase">Kembali ke Situs</span>
                </Link>

                {/* Logo Section */}
                <div className="text-center mb-10 space-y-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl shadow-2xl shadow-blue-500/20 mb-6 transform hover:rotate-12 transition-transform duration-500">
                        <MonitorPlay className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white">
                        VELORA<span className="text-blue-500 font-light italic ml-1">BLAST</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-bold tracking-[0.4em] uppercase opacity-60">Pendaftaran Akun Baru</p>
                </div>

                {/* Register Card */}
                <div className={clsx(
                    "bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative group transition-all duration-300",
                    error ? "border-red-500/50 shake" : "hover:border-white/20"
                )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-[3rem] pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Identitas Email</label>
                            <input
                                type="email"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Kata Sandi Kuat</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 pr-12 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Konfirmasi Sandi</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 pr-12 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs font-bold animate-fade-in px-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isAnimating}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden relative"
                        >
                            <span className="relative z-10 tracking-tight">{isAnimating ? "Memproses Data..." : "Daftar Sekarang"}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            {!isAnimating && <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-xs font-medium">
                            Sudah punya akun? <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Masuk Sesi</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Overlay */}
            {success && (
                <div className="text-center z-10 animate-fade-in">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4">Pendaftaran Berhasil!</h2>
                    <p className="text-slate-400 max-w-xs mx-auto mb-8">Akun Anda sedang disiapkan. Mengalihkan ke halaman masuk...</p>
                    <div className="w-12 h-1 bg-white/5 mx-auto rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-full origin-left animate-loading"></div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loading {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-loading { animation: loading 2.5s linear forwards; }
      `}</style>
        </div>
    );
}
