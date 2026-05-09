import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Info, Rocket, Database, Layers, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export interface TechOption {
  name: string;
  description: string;
  badge: string;
}

export interface TechCategory {
  id: string;
  name: string;
  options: TechOption[];
}

interface TechStackPickerProps {
  categories: TechCategory[];
  selections: Record<string, string>;
  onSelect: (categoryId: string, optionName: string) => void;
  onConfirm: () => void;
}

export const TechStackPicker: React.FC<TechStackPickerProps> = ({ 
  categories, 
  selections, 
  onSelect, 
  onConfirm 
}) => {
  const isComplete = categories.every(cat => !!selections[cat.id]);

  const getIcon = (id: string) => {
    switch(id.toLowerCase()) {
      case 'frontend': return <Globe className="w-5 h-5" />;
      case 'backend': return <Layers className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      default: return <Rocket className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Step 2: Pilih Tech Stack</h2>
        <p className="text-dashboard-muted text-sm">Rekomendasi AI berdasarkan ide produk Anda. Pilih yang paling sesuai.</p>
      </div>

      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category.id} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-dashboard-border pb-2">
              <div className="p-2 bg-red-600/10 text-red-500 rounded-lg">
                {getIcon(category.id)}
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">{category.name}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.options.map((option) => (
                <button
                  key={option.name}
                  onClick={() => onSelect(category.id, option.name)}
                  className={cn(
                    "relative p-5 rounded-2xl border text-left transition-all group",
                    selections[category.id] === option.name
                      ? "bg-red-600/10 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.1)]"
                      : "bg-dashboard-card/50 border-dashboard-border hover:border-dashboard-border/80 hover:bg-dashboard-card"
                  )}
                >
                  {selections[category.id] === option.name && (
                    <div className="absolute top-4 right-4 text-red-500">
                      <CheckCircle2 className="w-5 h-5 fill-red-500 text-white" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className={cn(
                       "inline-px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest px-1.5 w-fit",
                       option.badge === "Paling Populer" ? "bg-red-500 text-white" :
                       option.badge === "Enterprise" ? "bg-white text-black" :
                       "bg-dashboard-border text-dashboard-muted"
                    )}>
                      {option.badge}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{option.name}</h4>
                      <p className="text-xs text-dashboard-muted leading-relaxed mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="pt-10 flex flex-col items-center gap-4">
        <button
          onClick={onConfirm}
          disabled={!isComplete}
          className={cn(
            "px-12 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center gap-3",
            isComplete 
              ? "bg-red-600 text-white shadow-2xl shadow-red-500/20 hover:bg-white hover:text-black"
              : "bg-dashboard-border text-dashboard-subtle cursor-not-allowed"
          )}
        >
          Generate PRD Sekarang
          <Rocket className="w-5 h-5" />
        </button>
        {!isComplete && (
          <p className="flex items-center gap-2 text-[10px] font-mono text-amber-500/80 uppercase tracking-widest">
            <Info className="w-3 h-3" />
            Mohon pilih satu opsi untuk setiap kategori
          </p>
        )}
      </div>
    </div>
  );
};
