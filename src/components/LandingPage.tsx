import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  BrainCircuit, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  Code2,
  Terminal,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps & { onOpenDocs: () => void }> = ({ onStart, onOpenDocs }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30 selection:text-white">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-100/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 h-20 border-b border-white/5 flex items-center justify-between px-6 sm:px-12 backdrop-blur-md bg-black/20 sticky top-0">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-xl font-bold tracking-tight uppercase font-display">PRDLY</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <button onClick={onOpenDocs} className="hover:text-white transition-colors">Documentation</button>
            <a href="#export" className="hover:text-white transition-colors">Export</a>
          </div>
          <button 
            onClick={onStart}
            className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-all active:scale-95 shadow-xl shadow-red-500/20"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3 fill-red-500" />
              <span>Next-Gen PRD Generator</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-display font-bold leading-[0.9] tracking-tighter mb-8 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
              BUILD DEEP <br />
              <span className="text-red-600">SPECIFICATIONS</span> <br />
              INSTANTLY.
            </h1>
            <p className="text-lg text-white/50 max-w-lg mb-10 leading-relaxed font-medium">
              Transform mere ideas into enterprise-grade Product Requirement Documents menggunakan deep reasoning AI. Standardized dan siap untuk development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="group flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-black transition-all shadow-2xl shadow-red-500/20 active:scale-95"
              >
                Launch App
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                <BrainCircuit className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-white/80">AI Gemini Powered</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto bg-gradient-to-br from-accent-blue/20 to-purple-500/20 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="w-full bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                   <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                   </div>
                   <div className="space-y-3">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      <div className="h-4 bg-white/10 rounded w-5/6"></div>
                      <div className="h-32 bg-accent-blue/10 border border-accent-blue/20 rounded-lg flex items-center justify-center">
                         <div className="flex flex-col items-center gap-2">
                            <Rocket className="w-8 h-8 text-accent-blue animate-bounce" />
                            <span className="text-[10px] font-mono text-accent-blue uppercase tracking-widest">Generating_Assets...</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-20px] right-[-20px] p-4 bg-dashboard-card border border-white/10 rounded-2xl shadow-xl backdrop-blur-md"
            >
              <Cpu className="w-6 h-6 text-accent-blue" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-10px] left-[-30px] p-4 bg-dashboard-card border border-white/10 rounded-2xl shadow-xl backdrop-blur-md"
            >
              <FileText className="w-6 h-6 text-accent-green" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <label className="text-[10px] font-bold text-accent-blue uppercase tracking-[0.3em] block mb-4">Deep Technical Flow</label>
            <h2 className="text-4xl font-display font-bold tracking-tight">ENGINEERED FOR EXCELLENCE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6 text-accent-blue" />}
              title="Pro Reasoning Mode"
              description="Menggunakan model reasoning tingkat tinggi untuk membedah masalah kompleks menjadi solusi terstruktur."
            />
            <FeatureCard 
              icon={<Terminal className="w-6 h-6 text-accent-green" />}
              title="Enterprise Sections"
              description="Menghasilkan 18 section PRD lengkap, mulai dari OKR hingga sistem arsitektur teknis."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-purple-400" />}
              title="Multi-Format Export"
              description="Export dokumen Anda ke Markdown, PDF, atau DOCX hanya dengan satu klik saja."
            />
            <FeatureCard 
              icon={<Code2 className="w-6 h-6 text-amber-400" />}
              title="API Specs & Data Models"
              description="Drafting API contract dan schema database otomatis untuk mempercepat proses handover ke tim dev."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
              title="Identity Integrity"
              description="Setiap sesi disimpan secara lokal di browser Anda dengan validasi data tingkat lanjut."
            />
            <FeatureCard 
              icon={<Rocket className="w-6 h-6 text-pink-400" />}
              title="Industry Templates"
              description="Mulai lebih cepat dengan 8 template industri yang sudah disesuaikan dengan standar global."
            />
          </div>
        </div>
      </section>

      {/* Stats / Proof */}
      <section className="py-24 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-5xl font-display font-bold mb-2">18+</div>
            <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Standard Sections</div>
          </div>
          <div>
            <div className="text-5xl font-display font-bold mb-2">100%</div>
            <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Privacy Focused</div>
          </div>
          <div>
            <div className="text-5xl font-display font-bold mb-2">4+</div>
            <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Model Fallbacks</div>
          </div>
          <div>
            <div className="text-5xl font-display font-bold mb-2">1k+</div>
            <div className="text-xs font-mono text-white/40 uppercase tracking-widest">PRDs Generated</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto p-12 sm:p-20 rounded-[40px] bg-gradient-to-br from-accent-blue/20 to-purple-600/20 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Logo size="lg" />
          </div>
          <h2 className="text-4xl sm:text-6xl font-display font-bold mb-8 leading-tight tracking-tight">STOP WRITING.<br />START <span className="text-accent-blue">SPECIFYING.</span></h2>
          <p className="text-lg text-white/60 mb-10 max-w-lg mx-auto">
            Gabung bersama ribuan product manager yang sudah beralih ke PRDLY untuk workflow yang lebih cerdas.
          </p>
          <button 
            onClick={onStart}
            className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-xl hover:bg-accent-blue hover:text-white transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
          >
            Launch PRDLY System
          </button>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-3 mb-6 opacity-60 grayscale hover:grayscale-0 transition-all">
          <Logo size="xs" />
          <span className="text-sm font-bold uppercase tracking-widest">PRDLY_CORE</span>
        </div>
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">&copy; 2026 PRDLY INC. GENERATED BY AI GEMINI.</p>
          <p className="text-xs font-mono font-bold text-red-500 uppercase tracking-[0.3em]">Created By Ramdan</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl hover:border-accent-blue/50 transition-all group">
    <div className="mb-6 p-3 bg-black rounded-2xl w-fit group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-4 text-white group-hover:text-accent-blue transition-colors">{title}</h3>
    <p className="text-sm text-white/50 leading-relaxed font-medium">
      {description}
    </p>
  </div>
);
