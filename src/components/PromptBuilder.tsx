import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Terminal, Layout, Server, Smartphone, Globe, Code2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface PromptTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  template: (prj: string, stack: string, features: string, api: string) => string;
}

const TABS: PromptTab[] = [
  {
    id: 'fullstack',
    name: 'Full Stack',
    icon: <Terminal className="w-4 h-4" />,
    template: (prj, stack, features, api) => `Act as a senior full-stack developer. Build ${prj} using ${stack}.
Features to implement: ${features}.
API Endpoints: ${api}.
Requirements:
- Clean architecture
- Strict TypeScript
- Database schema matching PRD`
  },
  {
    id: 'frontend',
    name: 'Frontend/UI',
    icon: <Layout className="w-4 h-4" />,
    template: (prj, stack, features) => `Build the UI for ${prj} using ${stack}.
Key Components:
- Modular components
- Responsive design
- Features supported: ${features}
- Modern UI/UX patterns`
  },
  {
    id: 'backend',
    name: 'Backend/API',
    icon: <Server className="w-4 h-4" />,
    template: (prj, stack, features, api) => `Build a scalable backend for ${prj} using ${stack}.
Required:
- Implement these API endpoints: ${api}
- Use robust validation
- Error handling middleware
- Database integration`
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    icon: <Smartphone className="w-4 h-4" />,
    template: (prj, stack, features) => `Create a mobile application for ${prj} using React Native/Expo.
Scope:
- Cross-platform support
- Smooth transitions
- Implementing Fitur: ${features}`
  },
  {
    id: 'webapp',
    name: 'Web App',
    icon: <Globe className="w-4 h-4" />,
    template: (prj, stack, features) => `Build a high-performance web app for ${prj} using ${stack}.
Focus on:
- Fast loading times (Core Web Vitals)
- Modern state management
- Integrated features: ${features}`
  }
];

interface PromptBuilderProps {
  prdContent: string;
  selectedTech: Record<string, string>;
}

export const PromptBuilder: React.FC<PromptBuilderProps> = ({ prdContent, selectedTech }) => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const projectName = prdContent.match(/# (.*)/)?.[1] || "My Project";
  const techStack = Object.values(selectedTech).join(", ") || "the recommended stack";
  
  // Basic parsing of features and API
  const features = prdContent.split('## Fitur Utama')[1]?.split('##')[0]?.trim().slice(0, 500) + "..." || "as defined in PRD";
  const api = prdContent.split('## API Specification')[1]?.split('##')[0]?.trim().slice(0, 500) + "..." || "Restful APIs";

  const currentTab = TABS.find(t => t.id === activeTab)!;
  const promptValue = currentTab.template(projectName, techStack, features, api);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptValue);
    setCopiedId(activeTab);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mt-12 p-8 bg-dashboard-sidebar border border-white/5 rounded-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-600 rounded-lg">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">AI Prompt Builder</h3>
          <p className="text-xs text-dashboard-muted">Generate coding prompt untuk AI assistant (Claude, Cursor, ChatGPT)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              activeTab === tab.id
                ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20"
                : "bg-white/5 text-dashboard-muted border-transparent hover:border-white/10"
            )}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="relative group">
        <textarea
          readOnly
          value={promptValue}
          className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-mono text-white/80 outline-none resize-none custom-scrollbar"
        />
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
        >
          {copiedId === activeTab ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiedId === activeTab ? "Copied!" : "Copy Prompt"}
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-[9px] font-mono text-dashboard-muted uppercase tracking-widest px-2">
        <span className="text-red-500 underline">Tip:</span> Gunakan prompt ini di Cursor AI atau Claude 3.5 Sonnet untuk hasil maksimal.
      </div>
    </div>
  );
};
