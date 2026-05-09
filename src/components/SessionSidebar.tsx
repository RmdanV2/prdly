import React from 'react';
import { History, Plus, Trash2, Clock, Briefcase, Zap, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Session {
  id: string;
  title: string;
  input: string;
  output: string;
  thinking: string;
  mode: 'standard' | 'lengkap' | 'enterprise';
  createdAt: string;
  model: string;
}

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
  onDeleteAll: () => void;
  onNewSession: () => void;
  modelStatus: { pro: string; standard: string; fallback: string };
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onDeleteAll,
  onNewSession,
  modelStatus
}) => {
  return (
    <div className="flex flex-col h-full bg-dashboard-sidebar border-r border-dashboard-border overflow-hidden">
      <div className="p-4 border-b border-dashboard-border">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-accent-blue/90 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>New PRD Session</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-dashboard-muted uppercase tracking-widest flex items-center gap-1.5">
            <History className="w-3 h-3" />
            History ({sessions.length}/50)
          </span>
          {sessions.length > 0 && (
            <button 
              onClick={onDeleteAll}
              className="text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold"
            >
              Clear All
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="px-4 py-8 text-center bg-dashboard-card/20 rounded-lg border border-dashed border-dashboard-border m-2">
            <p className="text-xs text-dashboard-subtle italic">No history yet</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group relative flex flex-col p-3 rounded-lg border transition-all cursor-pointer",
                currentSessionId === session.id
                  ? "bg-accent-blue/10 border-accent-blue/40"
                  : "bg-transparent border-transparent hover:bg-dashboard-card/50 hover:border-dashboard-border"
              )}
              onClick={() => onSelectSession(session)}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn(
                  "p-1 rounded text-[10px]",
                  session.mode === 'enterprise' ? "bg-red-500/20 text-red-500" : 
                  session.mode === 'lengkap' ? "bg-accent-blue/20 text-accent-blue" :
                  "bg-accent-green/20 text-accent-green"
                )}>
                  {session.mode === 'enterprise' ? <Briefcase className="w-3 h-3" /> : 
                   session.mode === 'lengkap' ? <LayoutGrid className="w-3 h-3" /> : 
                   <Zap className="w-3 h-3" />}
                </span>
                <span className="text-[10px] font-mono text-dashboard-subtle uppercase tracking-tighter">
                  {session.mode}
                </span>
                <span className="text-[10px] font-mono text-dashboard-subtle/50 ml-auto">
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xs font-medium text-white line-clamp-1 group-hover:text-accent-blue transition-colors">
                {session.title}
              </h3>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-dashboard-muted hover:text-red-400 transition-all p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-dashboard-border bg-dashboard-card/30">
        <h4 className="text-[10px] font-bold text-dashboard-muted uppercase tracking-widest mb-3">Model Status</h4>
        <div className="space-y-2">
          <StatusRow label="Gemini 2.5 Pro" status={modelStatus.pro} />
          <StatusRow label="Gemini 2.0 Flash" status={modelStatus.standard} />
          <StatusRow label="Gemma 4 (IT)" status={modelStatus.fallback} />
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, status }: { label: string; status: string }) => (
  <div className="flex items-center justify-between text-[10px]">
    <span className="text-dashboard-subtle">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === 'ACTIVE' ? "bg-accent-green shadow-[0_0_5px_rgba(0,255,156,0.5)]" : 
        status === 'SLOW' ? "bg-amber-400" : "bg-red-500"
      )}></span>
      <span className={cn(
        "font-mono font-bold",
        status === 'ACTIVE' ? "text-accent-green" : 
        status === 'SLOW' ? "text-amber-400" : "text-red-500"
      )}>{status}</span>
    </div>
  </div>
);
