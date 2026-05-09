import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Ctrl', 'Enter'], desc: 'Kirim input dan generate PRD' },
  { keys: ['Ctrl', 'K'], desc: 'Fokus ke input textarea' },
  { keys: ['Ctrl', 'S'], desc: 'Simpan sesi ke riwayat' },
  { keys: ['Ctrl', 'E'], desc: 'Toggle mode Edit dan View' },
  { keys: ['Ctrl', 'Shift', 'N'], desc: 'Buat sesi baru' },
  { keys: ['Escape'], desc: 'Tutup modal atau drawer' },
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-dashboard-card border border-dashboard-border rounded-2xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-blue/10 rounded-lg">
                    <Keyboard className="w-5 h-5 text-accent-blue" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Keyboard Shortcuts</h2>
                </div>
                <button onClick={onClose} className="text-dashboard-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-dashboard-border/50 last:border-0 last:pb-0">
                    <span className="text-sm text-dashboard-subtle">{s.desc}</span>
                    <div className="flex gap-1.5">
                      {s.keys.map((k, ki) => (
                        <kbd key={ki} className="px-2 py-1 bg-dashboard-bg border border-dashboard-border rounded text-[10px] font-mono text-accent-blue shadow-sm">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-dashboard-bg/50 rounded-xl border border-dashboard-border">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-4 h-4 text-dashboard-muted mt-0.5" />
                  <p className="text-xs text-dashboard-muted leading-relaxed">
                    PRDLY dirancang untuk produktivitas tingkat tinggi. Gunakan shortcut ini untuk mempercepat workflow pembuatan dokumen produk Anda.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
