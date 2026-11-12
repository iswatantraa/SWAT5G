import React from 'react';
import { motion } from 'motion/react';
import { Pause, Play, X, CheckCircle2, Layers } from 'lucide-react';
import { formatBytes } from '../data/mockFiles';
import { haptics } from '../utils/haptics';

interface LiquidProgressRingProps {
  progressPercent: number;
  transferredBytes: number;
  totalBytes: number;
  etaSeconds: number;
  currentSpeedMBps: number;
  isPaused: boolean;
  isCompleted: boolean;
  onTogglePause: () => void;
  onCancel: () => void;
}

export const LiquidProgressRing: React.FC<LiquidProgressRingProps> = ({
  progressPercent,
  transferredBytes,
  totalBytes,
  etaSeconds,
  currentSpeedMBps,
  isPaused,
  isCompleted,
  onTogglePause,
  onCancel,
}) => {
  const clampedProgress = Math.min(Math.max(progressPercent, 0), 100);
  const totalChunks = 24;
  const completedChunks = Math.floor((clampedProgress / 100) * totalChunks);

  const formatEta = (seconds: number) => {
    if (isCompleted) return 'Transfer Finished';
    if (seconds <= 0) return 'Calculating...';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins > 0 ? `${mins}m ` : ''}${secs}s remaining`;
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
      {/* Liquid Progress Container */}
      <div className="flex flex-col items-center">
        {/* Liquid circle container */}
        <div className="relative w-44 h-44 rounded-full border-4 border-slate-800/90 bg-slate-950 p-2 overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Liquid fill container */}
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-600 via-cyan-500 to-sky-400 opacity-80 transition-all duration-500 ease-out"
            style={{ height: `${clampedProgress}%` }}
          >
            {/* Animated liquid crest wave */}
            {!isCompleted && clampedProgress > 0 && clampedProgress < 100 && (
              <div className="absolute -top-3 inset-x-0 h-6 w-[200%] opacity-40 animate-liquid-wave bg-gradient-to-r from-transparent via-white to-transparent" />
            )}
          </div>

          {/* Central content overlay */}
          <div className="relative z-20 flex flex-col items-center text-center">
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="text-emerald-400 flex flex-col items-center"
              >
                <CheckCircle2 className="w-12 h-12" />
                <span className="text-sm font-bold text-white mt-1">100% COMPLETE</span>
                <span className="text-[10px] text-emerald-300 font-mono">Checksum Verified</span>
              </motion.div>
            ) : (
              <>
                <span className="text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums drop-shadow-md">
                  {clampedProgress.toFixed(0)}%
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-200 mt-0.5 drop-shadow">
                  {formatBytes(transferredBytes)} / {formatBytes(totalBytes)}
                </span>
                <span className="text-[10px] font-mono text-cyan-200/90 mt-1">
                  {formatEta(etaSeconds)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Chunk Distribution Visualizer */}
        <div className="w-full mt-5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Dynamic 16MB Chunk Ring
            </span>
            <span>
              {completedChunks} / {totalChunks} Chunks Synced
            </span>
          </div>

          <div className="grid grid-cols-12 gap-1.5">
            {Array.from({ length: totalChunks }).map((_, idx) => {
              const isDone = idx < completedChunks;
              const isCurrent = idx === completedChunks && !isPaused && !isCompleted;

              return (
                <div
                  key={idx}
                  className={`h-2.5 rounded-sm transition-all duration-300 ${
                    isDone
                      ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                      : isCurrent
                      ? 'bg-cyan-600 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                  title={`Chunk #${idx + 1}: ${isDone ? 'Completed (CRC32 OK)' : isCurrent ? 'Streaming...' : 'Pending'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Transfer Action Controls */}
        <div className="w-full mt-5 flex items-center justify-center gap-3">
          {!isCompleted ? (
            <>
              <button
                onClick={() => {
                  haptics.triggerTick();
                  onTogglePause();
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  isPaused
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                <span>{isPaused ? 'Resume Transfer' : 'Pause'}</span>
              </button>

              <button
                onClick={() => {
                  haptics.triggerTick();
                  onCancel();
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={onCancel}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/25"
            >
              Start New Transfer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
