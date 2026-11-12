import React from 'react';
import { motion } from 'motion/react';
import { History, Smartphone, Laptop, CheckCircle2, ArrowUpRight, ArrowDownLeft, X, ExternalLink, RefreshCw } from 'lucide-react';
import { TransferHistoryRecord } from '../types/transfer';
import { haptics } from '../utils/haptics';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: TransferHistoryRecord[];
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-left flex flex-col space-y-4 max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Transfer History & Benchmarks</h3>
              <p className="text-[11px] text-slate-400">5 GHz high-speed peer sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No previous transfer history recorded yet.
            </div>
          ) : (
            history.map((record) => {
              const isSent = record.direction === 'sent';

              return (
                <div
                  key={record.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                          isSent
                            ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-400'
                            : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
                        }`}
                      >
                        {isSent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-200">{record.peerName}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                            {record.peerOS}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{record.timestamp}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs font-mono font-bold text-cyan-300">
                        {record.totalSizeFormatted}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {record.avgSpeedMBps.toFixed(1)} MB/s avg
                      </span>
                    </div>
                  </div>

                  {/* Files inside batch */}
                  <div className="pt-2 border-t border-slate-900 space-y-1">
                    {record.files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[240px] text-slate-300">{f.name}</span>
                        <span className="font-mono text-slate-500 shrink-0">{f.sizeFormatted}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer status */}
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 text-cyan-400 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      5 GHz Multi-stream Verified
                    </span>
                    <span>Duration: {record.durationSeconds}s</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              haptics.triggerTick();
              onClearHistory();
            }}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear History
          </button>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
