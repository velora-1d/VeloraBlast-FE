"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  ChevronRight,
  MapPin,
  Zap,
  Shield,
  BarChart3,
  Globe,
  CheckCircle2,
  ArrowRight,
  MonitorPlay,
  Database,
  Users,
  MessageSquare,
  Lock
} from "lucide-react";
import clsx from "clsx";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">

      {/* Animasi Latar Belakang */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigasi */}
      <nav className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled ? "bg-[#0f172a]/80 backdrop-blur-md py-4 border-white/10" : "bg-transparent py-6 border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              VELORA<span className="text-blue-500 font-light italic ml-1">BLAST</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Fitur</a>
            <a href="#stats" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Hasil</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Harga</a>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Masuk</Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
              Coba Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Section Hero */}
      <section className="relative pt-40 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest animate-bounce">
              <Zap className="w-3 h-3" /> Edisi SaaS v2.5 Baru
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
              Ekstraksi Data Maps & <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Blast WhatsApp </span>
              Otomatis.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              Platform all-in-one untuk riset pasar dan pemasaran otomatis. Ambil ribuan data prospek dari Google Maps dan hubungi mereka via WhatsApp dalam hitungan menit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-black shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Mulai Berlangganan Sekarang <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="px-8 py-4 rounded-2xl text-lg font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                Lihat Demo Sistem
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4 grayscale opacity-50">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-6" alt="Google" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="h-6" alt="WhatsApp" />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#1e293b]/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 text-blue-500 fill-current ml-1" />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tonton Preview Sistem</p>
              </div>
              {/* Dashboard Mockup Glimpse */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fitur */}
      <section id="features" className="py-24 px-6 relative z-10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-white">Teknologi Outreach Masa Depan</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Dirancang untuk skalabilitas SaaS dengan fitur paling lengkap untuk membantu bisnis Anda tumbuh.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Database className="w-6 h-6" />}
              title="Google Maps Scraper"
              desc="Ambil data Nama Bisnis, Alamat, dan No. HP langsung dari Google Maps tanpa API Key mahal."
              delay="0"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="WhatsApp Validator"
              desc="Sistem cerdas untuk memastikan nomor target aktif di WhatsApp untuk menghemat waktu Anda."
              delay="100"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Broadcast Otomatis"
              desc="Kirim ribuan pesan personal dengan sistem Anti-Ban dan Spintax canggih."
              delay="200"
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Isolasi Data Aman"
              desc="Setiap user memiliki database PostgreSQL terpisah. Tidak ada data yang tertukar atau bocor."
              delay="300"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Multi-Akun WAHA"
              desc="Gunakan banyak akun WhatsApp secara bergantian (Round-Robin) untuk outreach skala besar."
              delay="400"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Dashboard Analisis"
              desc="Pantau efektivitas kampanye, jumlah leads, dan performa blast secara real-time."
              delay="500"
            />
          </div>
        </div>
      </section>

      {/* Section Statistik */}
      <section id="stats" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10 text-center md:text-left">
            <div className="space-y-4 max-w-md">
              <h2 className="text-4xl font-black text-white leading-tight">Membantu Bisnis Skala Kecil Menjadi Raksasa.</h2>
              <p className="text-blue-100/80">Kami memberikan data yang Anda butuhkan untuk mendominasi pasar lokal di Indonesia.</p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:gap-16">
              <StatItem label="Data Prospek" value="2M+" />
              <StatItem label="Pesan Terkirim" value="10M+" />
              <StatItem label="Pengguna Aktif" value="500+" />
              <StatItem label="Akurasi Data" value="98%" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Pricing */}
      <section id="pricing" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-white">Investasi Untuk Masa Depan Bisnis Anda</h2>
            <p className="text-slate-400">Pilih paket yang sesuai dengan kebutuhan ekspansi market Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 space-y-8 hover:border-blue-500/50 transition-colors group relative overflow-hidden">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Paket Bulanan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">Rp 150rb</span>
                  <span className="text-slate-500 font-medium">/bulan</span>
                </div>
              </div>
              <ul className="space-y-4">
                <PriceFeature text="Scraper Unlimited Data" />
                <PriceFeature text="1 Akun WhatsApp Active" />
                <PriceFeature text="Akses OCR Pro 100/hari" />
                <PriceFeature text="Dukungan Email 24/7" />
                <PriceFeature text="Database Prospek Pribadi" />
              </ul>
              <Link href="/register" className="block w-full text-center bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all">
                Mulai Sekarang
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-blue-600 rounded-[3rem] p-10 space-y-8 shadow-2xl shadow-blue-600/20 transform md:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-white/20 px-6 py-2 rounded-bl-3xl text-sm font-black text-white uppercase tracking-wider">Terlaris</div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Paket Tahunan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">Rp 1.2jt</span>
                  <span className="text-blue-200 font-medium">/tahun</span>
                </div>
              </div>
              <ul className="space-y-4">
                <PriceFeature text="Semua Fitur Bulanan" light />
                <PriceFeature text="Akses Multi-Akun (5 Akun)" light />
                <PriceFeature text="OCR Pro Unlimited" light />
                <PriceFeature text="Prioritas Support WA" light />
                <PriceFeature text="Akses API Developer" light />
              </ul>
              <Link href="/register" className="block w-full text-center bg-white text-blue-600 font-bold py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                Ambil Penawaran Terbaik
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <MonitorPlay className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                VELORA<span className="text-blue-500 font-light italic ml-1">BLAST</span>
              </span>
            </div>
            <p className="text-slate-500 max-w-sm">Solusi pemasaran otomatis paling kuat di Indonesia. Membangun jembatan data antara Google Maps dan WhatsApp.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">Produk</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-blue-400">Scraper Pro</a></li>
              <li><a href="#" className="hover:text-blue-400">WA Validator</a></li>
              <li><a href="#" className="hover:text-blue-400">OCR Intelligence</a></li>
              <li><a href="#" className="hover:text-blue-400">Broadcast Engine</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">Perusahaan</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-blue-400">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-blue-400">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-blue-400">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-blue-400">Hubungi Kami</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 text-center text-slate-600 text-xs">
          © 2026 Velora Blast SaaS. Seluruh hak cipta dilindungi oleh PT. Velora Digital.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: any) {
  return (
    <div
      className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4 hover:bg-white/[0.08] transition-all duration-300 group"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div className="space-y-1">
      <div className="text-3xl md:text-4xl font-black text-white">{value}</div>
      <div className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-60">{label}</div>
    </div>
  );
}

function PriceFeature({ text, light }: any) {
  return (
    <li className={clsx("flex items-center gap-3 text-sm", light ? "text-blue-50" : "text-slate-400")}>
      <CheckCircle2 className={clsx("w-5 h-5", light ? "text-white" : "text-blue-500")} />
      {text}
    </li>
  );
}
