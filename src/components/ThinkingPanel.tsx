import React from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface ThinkingPanelProps {
  thinking: string;
  isThinking: boolean;
  phase?: string;
}

export const ThinkingPanel: React.FC<ThinkingPanelProps> = ({ thinking, isThinking, phase }) => {
  if (!thinking && !isThinking) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-[#1F2937] bg-[#0E1015]">
      <div className="p-3 border-b border-[#1F2937] flex items-center justify-between bg-[#0E1015]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4D90FE] animate-pulse"></div>
          <span className="text-[10px] font-mono text-[#4D90FE] uppercase tracking-widest">
            {phase ? `FASE: ${phase}` : "System Reasoning Kernel"}
          </span>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-mono text-[#8E9299]">BUDGET: 8192</span>
           <div className="flex items-center gap-0.5">
              <div className="w-0.5 h-2 bg-accent-blue/50"></div>
              <div className="w-0.5 h-3 bg-accent-blue"></div>
              <div className="w-0.5 h-1 bg-accent-blue/30"></div>
           </div>
        </div>
      </div>
      <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div className="whitespace-pre-wrap text-[#8E9299]">
            {thinking}
            {isThinking && (
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="inline-block h-3 w-1.5 bg-[#4D90FE] ml-1 align-middle"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
