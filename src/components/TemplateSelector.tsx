import React from 'react';
import { Layout, Smartphone, Globe, BarChart3, ShoppingBag, Settings, CreditCard, GraduationCap } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  icon: React.ReactNode;
  prompt: string;
}

interface TemplateSelectorProps {
  onSelect: (prompt: string) => void;
}

const templates: Template[] = [
  {
    id: 'b2b-saas',
    title: 'SaaS B2B Platform',
    icon: <Layout className="w-5 h-5 text-accent-blue" />,
    prompt: 'Generasikan PRD untuk platform SaaS B2B yang fokus pada manajemen tim remote. Fitur utama meliputi dashboard analitik, manajemen tugas, dan sistem reporting otomatis.'
  },
  {
    id: 'mobile-consumer',
    title: 'Aplikasi Mobile Consumer',
    icon: <Smartphone className="w-5 h-5 text-accent-green" />,
    prompt: 'Generasikan PRD untuk aplikasi mobile consumer bertema "Social Fitness". Pengguna bisa memesan pelatih pribadi, melacak lari dengan GPS, dan berbagi progress ke komunitas.'
  },
  {
    id: 'api-service',
    title: 'REST API Service',
    icon: <Globe className="w-5 h-5 text-purple-400" />,
    prompt: 'Generasikan PRD untuk layanan REST API yang menyediakan data real-time harga logistik antar kota di Indonesia. Fokus pada skalabilitas, latensi rendah, dan dokumentasi API.'
  },
  {
    id: 'analytics',
    title: 'Dashboard Analytics',
    icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
    prompt: 'Generasikan PRD untuk dashboard analytics perusahaan e-commerce. Harus bisa menampilkan real-time sales, cohort analysis user retention, dan prediksi stok barang.'
  },
  {
    id: 'ecommerce',
    title: 'Platform E-Commerce',
    icon: <ShoppingBag className="w-5 h-5 text-pink-400" />,
    prompt: 'Generasikan PRD untuk platform e-commerce khusus produk artisan lokal. Meliputi sistem marketplace, sistem pembayaran terintegrasi, dan tracking pengiriman.'
  },
  {
    id: 'internal-system',
    title: 'Sistem Internal',
    icon: <Settings className="w-5 h-5 text-gray-400" />,
    prompt: 'Generasikan PRD untuk sistem internal HRIS (Human Resource Information System). Mencakup absensi biometrik, pengajuan cuti, dan manajemen payroll.'
  },
  {
    id: 'fintech',
    title: 'Produk Fintech',
    icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
    prompt: 'Generasikan PRD untuk aplikasi e-wallet modern. Fitur utama transfer antar bank, pembayaran QRIS, sistem tabungan digital, dan fitur split bill.'
  },
  {
    id: 'edutech',
    title: 'Platform Edukasi',
    icon: <GraduationCap className="w-5 h-5 text-indigo-400" />,
    prompt: 'Generasikan PRD untuk platform Learning Management System (LMS) interaktif. Fokus pada video streaming, kuis interaktif, dan sertifikasi otomatis.'
  }
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.prompt)}
          className="flex flex-col items-start p-4 bg-dashboard-card/50 border border-dashboard-border rounded-xl hover:border-accent-blue/50 hover:bg-accent-blue/5 transition-all text-left group"
        >
          <div className="mb-3 p-2 bg-dashboard-bg rounded-lg group-hover:scale-110 transition-transform">
            {template.icon}
          </div>
          <h3 className="text-sm font-medium text-white mb-1">{template.title}</h3>
          <p className="text-[11px] text-dashboard-muted line-clamp-2">Contoh prompt template PRD industri</p>
        </button>
      ))}
    </div>
  );
};
