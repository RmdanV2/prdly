import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Send, 
  RotateCcw,
  LayoutGrid,
  Code2,
  Terminal,
  Cpu,
  Monitor,
  Menu,
  X,
  HelpCircle,
  BrainCircuit,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight,
  Palette,
  Layout,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThinkingPanel } from "./components/ThinkingPanel";
import { PRDDisplay } from "./components/PRDDisplay";
import { TechStackPicker } from "./components/TechStackPicker";
import { Logo } from "./components/Logo";
import { SessionSidebar, Session } from "./components/SessionSidebar";
import { TemplateSelector } from "./components/TemplateSelector";
import { PRDNavigator } from "./components/PRDNavigator";
import { HelpModal } from "./components/HelpModal";
import { Toast, ToastMessage } from "./components/Toast";
import { LandingPage } from "./components/LandingPage";
import { DocsPage } from "./components/DocsPage";
import { cn } from "./lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  thinking?: string;
}

export default function App() {
  // Core State
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"standard" | "lengkap" | "enterprise">("standard");
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: TechStack, 3: Generation
  const [techStackData, setTechStackData] = useState<any>(null);
  const [selectedTech, setSelectedTech] = useState<Record<string, string>>({});
  const [isFetchingStack, setIsFetchingStack] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentThinking, setCurrentThinking] = useState("");
  const [currentPrd, setCurrentPrd] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentModel, setCurrentModel] = useState("");
  
  // UI State
  const [view, setView] = useState<'landing' | 'app' | 'docs'>('landing');
  const [appTheme, setAppTheme] = useState<'modern' | 'brutalist'>('modern');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'prd' | 'reasoning'>('prd');
  
  // Session & Data
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState({ pro: '...', standard: '...', fallback: '...' });
  const [rateLimit, setRateLimit] = useState({ count: 0, lastReset: Date.now() });

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize
  useEffect(() => {
    // Load sessions from localStorage
    try {
      const saved = localStorage.getItem("prdly_sessions");
      if (saved) setSessions(JSON.parse(saved));
      
      const savedLimit = localStorage.getItem("prdly_rate_limit");
      if (savedLimit) {
        const parsed = JSON.parse(savedLimit);
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - parsed.lastReset > oneHour) {
          setRateLimit({ count: 0, lastReset: Date.now() });
        } else {
          setRateLimit(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load local data", e);
    }

    // Check for shared PRD
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      const id = path.split('/').pop();
      if (id) {
        setMessages([{ role: "assistant", text: "Loading shared PRD...", thinking: "" }]);
        fetch(`/api/prd/share/${id}`)
          .then(res => res.json())
          .then(data => {
            if (data.content) {
              setCurrentPrd(data.content);
              setMessages([{ role: "assistant", text: data.content, thinking: "" }]);
              addToast('success', "Shared PRD loaded.");
            } else {
              addToast('error', "PRD share not found or expired.");
            }
          })
          .catch(() => addToast('error', "Failed to load shared PRD."));
      }
    }

    // Initial model status check
    fetchModelStatus();
    const statusInterval = setInterval(fetchModelStatus, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(statusInterval);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("prdly_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("prdly_rate_limit", JSON.stringify(rateLimit));
  }, [rateLimit]);

  // Toast Helper
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const fetchModelStatus = async () => {
    try {
      const res = await fetch("/api/models/status");
      if (res.ok) {
        const data = await res.json();
        setModelStatus(data);
      }
    } catch (e) {
      setModelStatus({ pro: 'DOWN', standard: 'DOWN', fallback: 'DOWN' });
    }
  };

  const checkRateLimit = () => {
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    let { count, lastReset } = rateLimit;

    if (now - lastReset > oneHour) {
      count = 0;
      lastReset = now;
    }

    if (count >= 10) {
      const waitMinutes = Math.ceil((lastReset + oneHour - now) / (60 * 1000));
      addToast('warning', `Limit request tercapai! Mohon tunggu ${waitMinutes} menit lagi.`);
      return false;
    }

    setRateLimit({ count: count + 1, lastReset });
    return true;
  };

  const fetchTechStackRecommendations = async (userInput: string) => {
    setIsFetchingStack(true);
    addToast('info', "Menganalisis ide untuk rekomendasi tech stack...");
    try {
      const res = await fetch("/api/tech-stack/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput })
      });
      if (!res.ok) throw new Error("Gagal mendapatkan rekomendasi tech stack.");
      const data = await res.json();
      setTechStackData(data);
      setStep(2);
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setIsFetchingStack(false);
    }
  };

  const handleConfirmTechStack = () => {
    streamPRD(input);
  };

  const streamPRD = async (userInput: string, overrideSessionId?: string) => {
    if (!checkRateLimit()) return;

    setIsGenerating(true);
    setIsThinking(true);
    setCurrentThinking("");
    setCurrentPrd("");
    setActiveTab('prd'); 
    setStep(3);

    try {
      const response = await fetch("/api/prd/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          input: userInput, 
          mode, 
          techStack: selectedTech,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let thinking = "";
      let prd = "";
      let model = "";

      // Loading phases for Better UX
      const phases = mode === "enterprise" 
        ? ["Menganalisis Arsitektur...", "Menghitung Estimasi Biaya...", "Menyusun RACI Matrix...", "Finishing Enterprise PRD..."]
        : ["Menyusun Draft...", "Detailing Features...", "Finishing Documentation..."];
      
      let phaseIdx = 0;
      const phaseInterval = setInterval(() => {
        setGenerationPhase(phases[phaseIdx % phases.length]);
        phaseIdx++;
      }, 5000);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split("\n\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          
          try {
            const data = JSON.parse(line.replace("data: ", ""));
            
            if (data.type === "thinking") {
              thinking += data.text;
              setCurrentThinking(thinking);
            } else if (data.type === "prd") {
              setIsThinking(false);
              prd += data.text;
              setCurrentPrd(prd);
            } else if (data.type === "model_info") {
              model = data.model;
              setCurrentModel(model);
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          } catch (e) {}
        }
      }
      clearInterval(phaseInterval);

      // Finalize session
      const finalPrd = prd;
      const finalThinking = thinking;
      
      const newSession: Session = {
        id: overrideSessionId || Date.now().toString(),
        title: userInput.split(' ').slice(0, 5).join(' ') + "...",
        input: userInput,
        output: finalPrd,
        thinking: finalThinking,
        mode,
        createdAt: new Date().toISOString(),
        model: model || "Gemini"
      };

      if (overrideSessionId) {
        setSessions(prev => prev.map(s => s.id === overrideSessionId ? newSession : s));
      } else {
        setSessions(prev => [newSession, ...prev].slice(0, 50));
        setCurrentSessionId(newSession.id);
      }

      setMessages([
        { role: "user", text: userInput },
        { role: "assistant", text: finalPrd, thinking: finalThinking }
      ]);
      
      addToast('success', "PRD tingkat " + mode.toUpperCase() + " berhasil dihasilkan!");
    } catch (error: any) {
      addToast('error', error.message);
      setCurrentPrd(`## ERROR\n\n${error.message}`);
    } finally {
      setIsGenerating(false);
      setIsThinking(false);
      setCurrentThinking("");
    }
  };

  const handleSend = () => {
    // Validation
    if (input.length < 20) {
      addToast('warning', "Input terlalu pendek. Minimal 20 karakter.");
      return;
    }
    if (input.length > 8000) {
      addToast('warning', "Input terlalu panjang. Maksimal 8000 karakter.");
      return;
    }
    if (!/[a-zA-Z]/.test(input)) {
        addToast('warning', "Input harus mengandung huruf.");
        return;
    }

    if (isGenerating) return;
    fetchTechStackRecommendations(input);
  };

  const handleNewSession = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setCurrentPrd("");
    setCurrentThinking("");
    setInput("");
    setStep(1);
    setTechStackData(null);
    setSelectedTech({});
    inputRef.current?.focus();
  };

  const handleSelectSession = (session: Session) => {
    setCurrentSessionId(session.id);
    setMessages([
      { role: "user", text: session.input },
      { role: "assistant", text: session.output, thinking: session.thinking }
    ]);
    setCurrentPrd(session.output);
    setCurrentThinking(session.thinking);
    setCurrentModel(session.model);
    setMode(session.mode as any);
    setStep(3); // Go straight to display
    setIsMobileMenuOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) handleNewSession();
    addToast('info', "Sesi dihapus.");
  };

  const handleShare = async () => {
    if (!currentPrd) return;
    try {
      const res = await fetch("/api/prd/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentPrd })
      });
      const data = await res.json();
      const shareUrl = `${window.location.origin}/share/${data.id}`;
      navigator.clipboard.writeText(shareUrl);
      addToast('success', "Link share berhasil disalin ke clipboard!");
    } catch (e) {
      addToast('error', "Gagal membuat link share.");
    }
  };

  const handleRegenerateSection = (section: string) => {
    const prompt = `Regenerasi bagian "${section}" dari PRD ini dengan lebih detail dan mendalam. Fokus pada aspek teknis dan operasional. Sesi sebelumnya: ${currentPrd.slice(0, 500)}...`;
    setInput(prompt);
    inputRef.current?.focus();
    addToast('info', "Prompt regenerasi bagian disiapkan.");
  };

  const handleUpdateContent = (newContent: string) => {
    setCurrentPrd(newContent);
    if (currentSessionId) {
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, output: newContent } : s));
      addToast('success', "Perubahan disimpan.");
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') handleSend();
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); }
      if (e.ctrlKey && e.key === 's' && currentPrd) { 
        e.preventDefault(); 
        addToast('info', "Sesi ini otomatis tersimpan di riwayat.");
      }
      if (e.shiftKey && e.ctrlKey && e.key === 'N') { e.preventDefault(); handleNewSession(); }
      if (e.key === 'Escape') { setHelpOpen(false); setIsMobileMenuOpen(false); }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [input, currentPrd, isGenerating]);

  const displayPRD = (isGenerating || currentPrd) ? currentPrd : "";
  const displayThinking = (isGenerating || currentThinking) ? currentThinking : (messages[messages.length-1]?.thinking || "");

  if (view === 'landing') {
    return (
      <>
        <LandingPage onStart={() => setView('app')} onOpenDocs={() => setView('docs')} />
        <Toast toasts={toasts} onClose={(id) => setToasts(t => t.filter(x => x.id !== id))} />
      </>
    );
  }

  if (view === 'docs') {
    return <DocsPage onBack={() => setView('landing')} />;
  }

  return (
    <div className={cn(
      "flex flex-col transition-colors duration-500 font-sans",
      view === 'app' ? "h-screen overflow-hidden" : "min-h-screen",
      appTheme === 'brutalist' ? "bg-dashboard-bg text-dashboard-text" : "bg-[#000000] text-[#ffffff]"
    )}>
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <Toast toasts={toasts} onClose={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      {/* Header */}
      <header className="h-16 border-b border-dashboard-border flex items-center justify-between px-4 sm:px-6 bg-dashboard-sidebar shrink-0 z-40">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-dashboard-muted hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-xl font-bold tracking-tight text-white uppercase font-display hidden xs:block">PRDLY</span>
          </div>
          <div className="h-6 w-[1px] bg-dashboard-border mx-1 sm:mx-2 hidden sm:block"></div>
          <p className="text-[10px] font-mono text-dashboard-muted uppercase tracking-[0.2em] hidden md:block">Deep Reason. Ship Fast.</p>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden md:flex items-center gap-2 bg-dashboard-card border border-dashboard-border rounded-full px-3 py-1.5 transition-all">
            <div className={cn(
              "w-2 h-2 rounded-full", 
              isGenerating ? "bg-amber-400 animate-pulse" : "bg-accent-green shadow-[0_0_8px_rgba(0,255,156,0.6)]"
            )}></div>
            <span className="text-[10px] font-mono text-dashboard-muted uppercase">
              {isGenerating ? "Processing..." : "Engine Online"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAppTheme(t => t === 'modern' ? 'brutalist' : 'modern')}
              className={cn(
                "p-2 rounded-lg transition-all",
                appTheme === 'brutalist' ? "text-accent-blue" : "text-dashboard-muted hover:text-white"
              )}
              title="Ganti Aesthetic UI"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setHelpOpen(true)}
              className="p-2 text-dashboard-muted hover:text-white transition-colors"
              title="Keyboard Shortcuts"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNewSession}
              className="flex items-center gap-2 bg-gradient-to-r from-accent-blue to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">New session</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-80 bg-dashboard-sidebar z-[60] lg:hidden"
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-dashboard-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Logo size="xs" />
                      <span className="text-sm font-bold text-white font-display">PRDLY_HISTORY</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-dashboard-muted hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <SessionSidebar 
                    sessions={sessions}
                    currentSessionId={currentSessionId}
                    onSelectSession={handleSelectSession}
                    onDeleteSession={handleDeleteSession}
                    onDeleteAll={() => { if(confirm('Hapus semua history?')) { setSessions([]); addToast('info', 'History dibersihkan'); } }}
                    onNewSession={handleNewSession}
                    modelStatus={modelStatus}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="w-72 border-r border-dashboard-border bg-dashboard-sidebar shrink-0 hidden lg:flex flex-col">
          <SessionSidebar 
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onDeleteAll={() => { if(confirm('Hapus semua history?')) { setSessions([]); addToast('info', 'History dibersihkan'); } }}
            onNewSession={handleNewSession}
            modelStatus={modelStatus}
          />
        </aside>

        {/* Work Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-dashboard-bg relative">
          {/* Main Controls Overlay */}
          <div className="p-4 sm:p-6 border-b border-dashboard-border bg-dashboard-bg/50 backdrop-blur-md sticky top-0 z-30">
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1 bg-dashboard-card p-1 rounded-lg border border-dashboard-border w-fit">
                  <button 
                    onClick={() => setMode("standard")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all",
                      mode === "standard" ? "bg-amber-400 text-black shadow-lg shadow-amber-500/20" : "text-dashboard-muted hover:text-white"
                    )}
                  >
                    <Zap className="w-4 h-4" />
                    STANDAR
                  </button>
                  <button 
                    onClick={() => setMode("lengkap")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all",
                      mode === "lengkap" ? "bg-accent-blue text-white shadow-lg shadow-blue-500/20" : "text-dashboard-muted hover:text-white"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    LENGKAP
                  </button>
                  <button 
                    onClick={() => setMode("enterprise")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all",
                      mode === "enterprise" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-dashboard-muted hover:text-white"
                    )}
                  >
                    <Briefcase className="w-4 h-4" />
                    ENTERPRISE
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-dashboard-subtle px-3 py-1.5 bg-dashboard-card/30 rounded border border-dashboard-border/50">
                  <Clock className="w-3 h-3 text-accent-blue" />
                  <span>RATE LIMIT: {10 - rateLimit.count} LEFT</span>
                </div>
              </div>

              <div className="relative group">
                <textarea 
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isGenerating}
                  className="w-full h-28 bg-dashboard-card border border-dashboard-border rounded-xl p-4 text-sm text-white focus:border-accent-blue outline-none resize-none font-sans custom-scrollbar transition-all group-hover:border-dashboard-border/80 shadow-inner"
                  placeholder="Ketik ide produk Anda di sini... (Contoh: Bangun platform SaaS untuk manajemen proyek berbasis AI)"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-3">
                  <span className={cn(
                    "text-[10px] font-mono transition-colors",
                    input.length > 7000 ? "text-red-400" : "text-dashboard-subtle"
                  )}>{input.length} / 8000</span>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isGenerating}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                      input.trim() && !isGenerating
                        ? "bg-accent-blue text-white hover:bg-accent-blue/90 active:scale-90 shadow-lg shadow-blue-500/40"
                        : "bg-dashboard-border text-dashboard-subtle cursor-not-allowed"
                    )}
                  >
                    {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden relative">
            {step === 3 && <PRDNavigator content={displayPRD} />}

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
                {step === 2 && techStackData && (
                  <div className="flex-1 overflow-y-auto bg-dashboard-bg">
                    <TechStackPicker 
                      categories={techStackData.categories}
                      selections={selectedTech}
                      onSelect={(catId, optName) => setSelectedTech(prev => ({ ...prev, [catId]: optName }))}
                      onConfirm={handleConfirmTechStack}
                    />
                  </div>
                )}

                {step === 3 && (
                  <>
                    {/* Reasoning Panel */}
                    <div className={cn(
                      "md:w-[400px] lg:w-[450px] border-r border-dashboard-border h-full transition-all flex flex-col",
                      activeTab === 'reasoning' ? "flex flex-1" : "hidden md:flex"
                    )}>
                      <ThinkingPanel 
                        thinking={displayThinking} 
                        isThinking={isThinking} 
                        phase={generationPhase}
                      />
                    </div>

                    {/* PRD Output Panel */}
                    <div className={cn(
                      "flex-1 h-full",
                      activeTab === 'prd' ? "flex" : "hidden md:flex"
                    )}>
                        <PRDDisplay 
                          content={displayPRD} 
                          isGenerating={isGenerating}
                          currentModel={currentModel}
                          onUpdateContent={handleUpdateContent}
                          onRegenerateSection={handleRegenerateSection}
                          onShare={handleShare}
                          theme={appTheme}
                          mode={mode}
                          selectedTech={selectedTech}
                        />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <div className={cn(
                    "flex-1 flex flex-col items-center justify-start p-8 sm:p-12 text-center overflow-y-auto custom-scrollbar",
                    appTheme === 'brutalist' ? "bg-[#111318]" : "bg-[#090b0e]"
                  )}>
                      <div className="max-w-4xl w-full">
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-12"
                        >
                            <div className="mx-auto flex justify-center mb-6">
                              <Logo size="lg" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">READY_FOR_INITIALIZATION</h2>
                            <p className="text-sm text-dashboard-muted max-w-xl mx-auto leading-relaxed">
                              Masukkan ide produk Anda atau pilih salah satu template profesional di bawah ini untuk memulai proses generasi PRD tingkat enterprise.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="h-[1px] flex-1 bg-dashboard-border"></div>
                              <span className="text-[10px] font-bold text-dashboard-muted uppercase tracking-[0.2em]">Industry Templates</span>
                              <div className="h-[1px] flex-1 bg-dashboard-border"></div>
                            </div>
                            <TemplateSelector onSelect={(p) => { setInput(p); inputRef.current?.focus(); }} />
                        </motion.div>

                        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                            <div className="flex flex-col items-center gap-2">
                              <Monitor className="w-5 h-5 text-accent-blue" />
                              <span className="text-[10px] font-mono">CROSS-PLATFORM</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <Cpu className="w-5 h-5 text-accent-green" />
                              <span className="text-[10px] font-mono">AI-AUGMENTED</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <Terminal className="w-5 h-5 text-amber-400" />
                              <span className="text-[10px] font-mono">ENTERPRISE-SPEC</span>
                            </div>
                        </div>
                      </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 border-t border-dashboard-border bg-dashboard-sidebar flex items-center justify-between px-4 text-[10px] font-mono text-dashboard-subtle shrink-0 z-40">
        <div className="flex gap-4">
          <span className="hidden sm:inline">ENGINE: <span className="text-red-500">GEMINI-AI-CORE</span></span>
          <span className="text-white hidden xs:inline">LATENCY: {isGenerating ? "STREAMING" : "18ms"}</span>
          <span className="text-red-500 font-bold">CREATED BY RAMDAN</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('docs')} className="hover:text-red-500 transition-colors flex items-center gap-1.5">
             <HelpCircle className="w-3 h-3" />
             DOCS_&_HELP
          </button>
          <span className="text-dashboard-subtle uppercase">&copy; 2026 PRDLY_CORE</span>
        </div>
      </footer>
    </div>
  );
}
