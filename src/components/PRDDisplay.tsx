import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, FileDown, Terminal, Edit3, Eye, Share2, RefreshCw, ChevronDown, Rocket } from "lucide-react";
import { cn } from "../lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import JSZip from "jszip";
import { motion, AnimatePresence } from "motion/react";
import { PromptBuilder } from "./PromptBuilder";

interface PRDDisplayProps {
  content: string;
  isGenerating?: boolean;
  onUpdateContent?: (newContent: string) => void;
  onRegenerateSection?: (section: string) => void;
  onShare?: () => void;
  currentModel?: string;
  theme?: 'modern' | 'brutalist';
  selectedTech?: Record<string, string>;
  mode?: "standard" | "lengkap" | "enterprise";
}

export const PRDDisplay: React.FC<PRDDisplayProps> = ({ 
  content, 
  isGenerating = false,
  onUpdateContent,
  onRegenerateSection,
  onShare,
  currentModel = "GPT-4",
  theme = 'modern',
  selectedTech = {},
  mode = "standard"
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [exportOpen, setExportOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("");

  const isModern = theme === 'modern';

  useEffect(() => {
    if (!isEditing) {
      setEditContent(content);
    }
  }, [content, isEditing]);

  // Progress logic
  const sections = useMemo(() => [
    "Ringkasan Eksekutif", "Pernyataan Masalah", "Tujuan (OKR)", "User Persona",
    "User Journey", "Scope Proyek", "Fitur Utama", "Estimasi Story Points",
    "Arsitektur Sistem", "API Specification", "Data Model", "Struktur UI/UX",
    "Non-Functional Requirements", "Strategi Rilis", "Risiko & Mitigasi",
    "Rencana Pengujian", "Metrik Kesuksesan", "Timeline Proyek"
  ], []);

  useEffect(() => {
    if (isGenerating) {
      let count = 0;
      let lastSection = "";
      sections.forEach(s => {
        if (content.toLowerCase().includes(s.toLowerCase())) {
          count++;
          lastSection = s;
        }
      });
      setProgress(Math.round((count / sections.length) * 100));
      setCurrentSection(lastSection);
    } else {
      setProgress(content ? 100 : 0);
    }
  }, [content, isGenerating, sections]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    setExportOpen(false);
    const blob = new Blob([content], { type: "text/markdown" });
    saveBlob(blob, `PRD_${Date.now()}.md`);
  };

  const handleExportPDF = async () => {
    setExportOpen(false);
    const element = document.getElementById('prd-content');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        backgroundColor: isModern ? "#090b0e" : "#111318",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Fix html2canvas oklab/oklch error by standardizing colors in the clone
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * { 
              color-interpolation-filters: auto !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }
            .markdown-body * {
              color: ${isModern ? '#a3a3a3' : '#8E9299'} !important;
            }
            .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body strong {
              color: white !important;
            }
            .markdown-body a {
              color: ${isModern ? '#ff0000' : '#4D90FE'} !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PRD_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };

  const handleExportDOCX = async () => {
    setExportOpen(false);
    const doc = new Document({
      sections: [{
        properties: {},
        children: content.split('\n').map(line => {
          if (line.startsWith('# ')) {
            return new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1 });
          } else if (line.startsWith('## ')) {
            return new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2 });
          }
          return new Paragraph({ children: [new TextRun(line)] });
        }),
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveBlob(blob, `PRD_${Date.now()}.docx`);
  };

  const handleExportZIP = async () => {
    setExportOpen(false);
    const zip = new JSZip();
    const projectName = content.match(/# (.*)/)?.[1] || "My Project";
    
    // docs/PRD.md
    zip.file("docs/PRD.md", content);
    
    // docs/FOLDER-STRUCTURE.md
    const folderStructure = `# FOLDER STRUCTURE - ${projectName}\n\n\`\`\`\nsrc/\n├── components/\n├── services/\n├── hooks/\n├── lib/\n├── types/\n└── App.tsx\npackage.json\ntsconfig.json\n.env.example\n\`\`\``;
    zip.file("docs/FOLDER-STRUCTURE.md", folderStructure);
    
    // docs/IMPLEMENTATION-GUIDE.md
    const implementationGuide = `# IMPLEMENTATION GUIDE - ${projectName}\n\n1. Setup Environment\n2. Database Migration\n3. Core Business Logic\n4. UI Components\n5. Integration Testing\n6. Deployment`;
    zip.file("docs/IMPLEMENTATION-GUIDE.md", implementationGuide);
    
    // README.md
    zip.file("README.md", `# ${projectName}\n\nGenerated by PRDLY. Follow the docs folder for implementation.`);

    const blob = await zip.generateAsync({ type: "blob" });
    saveBlob(blob, `${projectName.toLowerCase().replace(/\s+/g, '-')}-prd-enterprise.zip`);
  };

  const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleEdit = () => {
    if (isEditing && onUpdateContent) {
      onUpdateContent(editContent);
    }
    setIsEditing(!isEditing);
  };

  if (!content && !isGenerating) return null;

  return (
    <div className={cn(
      "flex-1 flex flex-col overflow-hidden relative transition-colors duration-500",
      isModern ? "bg-[#090b0e]" : "bg-[#111318]"
    )}>
      {/* Progress Bar */}
      {isGenerating && (
        <div className="absolute top-0 left-0 w-full h-1 bg-dashboard-sidebar z-20">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn(
              "h-full shadow-[0_0_10px_rgba(59,130,246,0.6)]",
              isModern ? "bg-accent-blue" : "bg-accent-green"
            )}
          />
        </div>
      )}

      <div className={cn(
        "p-3 border-b flex items-center justify-between z-10 transition-colors",
        isModern ? "bg-[#0c0f14] border-white/5 shadow-sm" : "bg-[#15171C] border-[#1F2937]"
      )}>
        <div className="flex items-center gap-3">
          <Terminal className="h-3 w-3 text-dashboard-muted" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-[#8E9299] uppercase tracking-tighter leading-none mb-0.5">
              {isGenerating ? `GEN_STREAM :: ${currentSection || 'INIT'}` : `PRD_STORED :: ${currentModel}`}
            </span>
            {isGenerating && (
              <span className="text-[10px] font-mono text-accent-blue animate-pulse">
                PROGRESS: {progress}%
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleEdit}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded transition-all uppercase font-mono border",
              isEditing 
                ? "bg-accent-green/20 text-accent-green border-accent-green/40" 
                : "bg-[#1F2937] text-dashboard-muted border-transparent hover:text-white"
            )}
          >
            {isEditing ? <Eye className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
            {isEditing ? "View" : "Edit"}
          </button>

          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2937] text-[10px] rounded text-dashboard-muted border border-transparent hover:text-white hover:border-dashboard-border transition-all"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>

          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded border transition-all",
                exportOpen 
                  ? "bg-red-600 text-white border-red-600" 
                  : "bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600 hover:text-white"
              )}
            >
              <FileDown className="h-3 w-3" />
              Export
              <ChevronDown className={cn("h-3 w-3 transition-transform", exportOpen && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {exportOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-40 bg-[#15171c] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <button 
                    onClick={handleExportMarkdown} 
                    className="w-full text-left px-4 py-3 text-[10px] text-white/70 hover:bg-red-600/10 hover:text-red-500 border-b border-white/5 transition-colors uppercase font-bold tracking-widest"
                  >
                    Markdown
                  </button>
                  <button 
                    onClick={handleExportPDF} 
                    className="w-full text-left px-4 py-3 text-[10px] text-white/70 hover:bg-red-600/10 hover:text-red-500 border-b border-white/5 transition-colors uppercase font-bold tracking-widest"
                  >
                    PDF Document
                  </button>
                  <button 
                    onClick={handleExportDOCX} 
                    className="w-full text-left px-4 py-3 text-[10px] text-white/70 hover:bg-red-600/10 hover:text-red-500 transition-colors uppercase font-bold tracking-widest border-b border-white/5"
                  >
                    Word DOCX
                  </button>
                  {mode === "enterprise" && (
                    <button 
                      onClick={handleExportZIP} 
                      className="w-full text-left px-4 py-3 text-[10px] text-accent-green hover:bg-accent-green/10 transition-colors uppercase font-bold tracking-widest"
                    >
                      Download ZIP Bundle
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isEditing ? (
          <div className="p-6 lg:p-10 max-w-4xl mx-auto h-full">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full bg-dashboard-bg border border-dashboard-border rounded-xl p-6 text-dashboard-subtle font-mono text-sm focus:outline-none focus:border-accent-blue/50 resize-none transition-all"
              placeholder="Edit your PRD here..."
            />
          </div>
        ) : (
          <div className="p-6 lg:p-10 overflow-y-auto" id="prd-content">
            <article className={cn(
              "max-w-3xl mx-auto",
              isModern ? "font-sans leading-relaxed" : "font-mono"
            )}>
              <div className={cn(
                "mb-8 p-6 border rounded-2xl relative overflow-hidden group transition-all",
                isModern 
                  ? "border-white/10 bg-white/[0.02] backdrop-blur-sm shadow-xl" 
                  : "border-[#1F2937] bg-[#0E1015]"
              )}>
                <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Rocket className={cn("w-16 h-16", isModern ? "text-accent-blue" : "text-white")} />
                </div>
                <h1 className={cn(
                  "text-3xl font-bold text-white mb-4 uppercase tracking-tight relative z-10",
                  isModern ? "font-sans" : "font-display"
                )}>Product Requirements Document</h1>
                <div className="flex flex-wrap gap-4 text-[10px] font-mono text-[#8E9299] relative z-10">
                  <div className="flex gap-2">
                    <span className={cn(isModern ? "text-accent-blue" : "text-accent-green")}>IDENTIFIER:</span> 
                    <span>PRD-{Date.now().toString().slice(-6)}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={cn(isModern ? "text-accent-blue" : "text-accent-green")}>STATUS:</span> 
                    <span className={isGenerating ? "text-amber-400" : isModern ? "text-accent-blue" : "text-accent-green"}>
                      {isGenerating ? "DRAFTING..." : "RELEASED"}
                    </span>
                  </div>
                  <div className="flex gap-2"><span className="text-accent-blue font-bold">TIMESTAMP:</span> <span>{new Date().toLocaleString()}</span></div>
                </div>
                
                <div className="mt-4 p-3 bg-red-600/10 border border-red-600/20 rounded-lg flex items-center gap-3 relative z-10 transition-all hover:bg-red-600/15">
                   <div className="p-1 px-1.5 bg-red-600 rounded text-[8px] font-bold text-white tracking-widest shrink-0">AI_CORE</div>
                   <span className="text-[10px] font-mono text-white/70">Generated by <span className="text-red-500 font-bold underline decoration-red-500/30">AI GEMINI 3.0 FLASH</span> - Technical Specification Mode</span>
                </div>
              </div>
              
              <div className="markdown-body relative">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({node, ...props}) => (
                      <div className="group flex items-center gap-3 relative">
                        <h2 {...props} id={props.children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} />
                        <button 
                          onClick={() => onRegenerateSection?.(props.children?.toString() || "")}
                          className="opacity-0 group-hover:opacity-100 p-1.5 bg-dashboard-card border border-dashboard-border rounded hover:text-accent-blue transition-all"
                          title="Regenerate this section"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>

              {!isGenerating && content && (
                <PromptBuilder prdContent={content} selectedTech={selectedTech} />
              )}
            </article>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="p-4 border-t border-dashboard-border bg-dashboard-card/50 flex justify-end gap-3 rounded-b-xl">
          <button onClick={() => setEditContent(content)} className="px-4 py-2 text-xs text-dashboard-muted hover:text-white transition-colors">Reset to Original</button>
          <button onClick={handleToggleEdit} className="px-4 py-2 bg-accent-blue text-white rounded-lg text-xs font-bold hover:bg-accent-blue/90 transition-all">Save Changes</button>
        </div>
      )}
    </div>
  );
};
