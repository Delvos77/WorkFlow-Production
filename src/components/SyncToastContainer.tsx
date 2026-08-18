import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  RefreshCw,
  Database,
  AlertCircle,
  X,
  WifiOff,
} from 'lucide-react';
import { SyncToast } from '../types';

interface SyncToastContainerProps {
  toasts: SyncToast[];
  onDismiss: (id: string) => void;
}

export const SyncToastContainer: React.FC<SyncToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSyncing = toast.type === 'syncing';
          const isOffline = toast.type === 'offline_saved';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-3 sm:p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
                isSyncing
                  ? 'bg-slate-900/90 text-white border-blue-500/40'
                  : isOffline
                  ? 'bg-amber-950/90 text-amber-50 border-amber-500/40'
                  : isError
                  ? 'bg-red-950/90 text-red-50 border-red-500/40'
                  : 'bg-emerald-950/90 text-emerald-50 border-emerald-500/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                ) : isOffline ? (
                  <Database className="w-4 h-4 text-amber-400" />
                ) : isError ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">{toast.title}</p>
                <p className="text-[11px] opacity-85 leading-snug mt-0.5">
                  {toast.description}
                </p>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-1 text-white/60 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
