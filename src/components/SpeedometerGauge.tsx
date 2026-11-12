import React, { useMemo } from 'react';
import { Wifi, Gauge, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { TelemetryData } from '../types/transfer';

interface SpeedometerGaugeProps {
  telemetry: TelemetryData;
  speedHistory: number[];
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  telemetry,
  speedHistory,
}) => {
  const maxSpeed = 120; // 120 MB/s gauge scale
  const normalizedSpeed = Math.min(Math.max(telemetry.currentSpeedMBps, 0), maxSpeed);
  const percentage = (normalizedSpeed / maxSpeed) * 100;

  // Arc calculation for SVG gauge (from -210deg to 30deg = 240deg sweep)
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  // Sparkline path for waveform history
  const sparklinePath = useMemo(() => {
    if (!speedHistory || speedHistory.length < 2) return '';
    const w = 180;
    const h = 32;
    const points = speedHistory.map((val, idx) => {
      const x = (idx / (speedHistory.length - 1)) * w;
      const y = h - (Math.min(val, maxSpeed) / maxSpeed) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${points.join(' L ')}`;
  }, [speedHistory]);

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur-md">
      {/* 5 GHz Locked Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wider">5 GHz ULTRA-SPEED LOCKED</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 ml-0.5" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{telemetry.rttMs.toFixed(1)} ms</span>
        </div>
      </div>

      {/* Main Gauge & Speed readout */}
      <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Arc Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-36 h-36 -rotate-[210deg] transform" viewBox="0 0 160 160">
            {/* Background Arc Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="rgba(30, 41, 59, 0.8)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Active Gradient Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#speedGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Digital Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums">
              {telemetry.currentSpeedMBps.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold -mt-0.5">
              MB / SEC
            </span>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
              Peak: {telemetry.peakSpeedMBps.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Live Frequency Waveform & Telemetry Specs */}
        <div className="w-full flex-1 flex flex-col justify-between space-y-3">
          {/* Waveform graph */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span className="text-cyan-400 flex items-center gap-1">
                <Gauge className="w-3 h-3" /> Live Throughput Stability
              </span>
              <span>120 MB/s Cap</span>
            </div>
            <div className="w-full h-8 flex items-center">
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 180 32" preserveAspectRatio="none">
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Telemetry Matrix Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2">
              <span className="block text-[9px] text-slate-400 uppercase font-mono">Frequency</span>
              <span className="text-xs font-mono font-bold text-cyan-300 tabular-nums">
                {telemetry.frequencyMHz} MHz
              </span>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2">
              <span className="block text-[9px] text-slate-400 uppercase font-mono">Channel</span>
              <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">
                Ch {telemetry.channel}
              </span>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2">
              <span className="block text-[9px] text-slate-400 uppercase font-mono">Stream Chunks</span>
              <span className="text-xs font-mono font-bold text-cyan-300 tabular-nums">
                {telemetry.dynamicChunkSizeMB} MB x 8
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
