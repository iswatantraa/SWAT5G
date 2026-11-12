import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, Smartphone, AlertTriangle, ShieldCheck, Zap, Radio, RefreshCw, X } from 'lucide-react';
import { DevicePeer } from '../types/transfer';
import { haptics } from '../utils/haptics';

interface RadarScannerProps {
  peers: DevicePeer[];
  onSelectPeer: (peer: DevicePeer) => void;
  selectedPeerId?: string;
  isScanning: boolean;
  onRefreshScan: () => void;
}

export const RadarScanner: React.FC<RadarScannerProps> = ({
  peers,
  onSelectPeer,
  selectedPeerId,
  isScanning,
  onRefreshScan,
}) => {
  const [warningPeer, setWarningPeer] = useState<DevicePeer | null>(null);

  const handlePeerClick = (peer: DevicePeer) => {
    if (!peer.is5GHzLocked || peer.band === '2.4GHz') {
      haptics.triggerTick();
      setWarningPeer(peer);
      return;
    }
    haptics.triggerMagneticLock();
    onSelectPeer(peer);
  };

  // Node placement polar coordinates mapped to container percentage
  const nodePositions = [
    { left: '26%', top: '22%' },
    { left: '74%', top: '24%' },
    { left: '20%', top: '68%' },
    { left: '76%', top: '66%' },
    { left: '50%', top: '84%' },
  ];

  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto flex items-center justify-center p-4 select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Outer boundary ring */}
      <div className="absolute inset-4 rounded-full border border-slate-800/80 bg-slate-950/40 backdrop-blur-md shadow-2xl" />

      {/* Concentric Radar Rings */}
      <div className="absolute inset-10 rounded-full border border-cyan-500/15 pointer-events-none" />
      <div className="absolute inset-20 rounded-full border border-cyan-500/20 pointer-events-none" />
      <div className="absolute inset-32 rounded-full border border-cyan-500/25 pointer-events-none" />
      <div className="absolute inset-44 rounded-full border border-cyan-500/30 pointer-events-none" />

      {/* Crosshair grid lines */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[1px] bg-cyan-500/10 pointer-events-none" />
      <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-[1px] bg-cyan-500/10 pointer-events-none" />

      {/* Radiating radar pulses */}
      {isScanning && (
        <>
          <div className="absolute inset-8 rounded-full border border-cyan-400/40 animate-pulse-ring-slow pointer-events-none" />
          <div className="absolute inset-14 rounded-full border border-cyan-400/30 animate-pulse-ring-fast pointer-events-none" />
        </>
      )}

      {/* Revolving Radar Sweep Line */}
      {isScanning && (
        <div className="absolute inset-4 rounded-full overflow-hidden pointer-events-none">
          <div 
            className="w-full h-full origin-center animate-radar-sweep"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.35) 0deg, rgba(6, 182, 212, 0.12) 35deg, transparent 75deg)',
            }}
          />
        </div>
      )}

      {/* Center Host Device (Self) */}
      <div className="relative z-20 flex flex-col items-center">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center cursor-pointer"
          onClick={() => {
            haptics.triggerRadarPing();
            onRefreshScan();
          }}
          title="Host Device (Local 5 GHz AP)"
        >
          <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center text-cyan-400">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="text-[9px] font-mono font-bold tracking-wider mt-0.5 text-cyan-300">5GHz HOST</span>
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </motion.div>
        <span className="text-[11px] font-medium text-slate-300 mt-2 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-800">
          This Device (Broadcasting)
        </span>
      </div>

      {/* Detected Peer Nodes */}
      {peers.map((peer, idx) => {
        const pos = nodePositions[idx % nodePositions.length];
        const isSelected = selectedPeerId === peer.id;
        const is24g = peer.band === '2.4GHz';

        return (
          <motion.div
            key={peer.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 220, delay: idx * 0.12 }}
            style={{ position: 'absolute', left: pos.left, top: pos.top }}
            className="-translate-x-1/2 -translate-y-1/2 z-30"
          >
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handlePeerClick(peer)}
              className={`relative group flex flex-col items-center cursor-pointer transition-all duration-300 focus:outline-none`}
            >
              {/* Outer halo */}
              <div
                className={`relative w-12 h-12 rounded-2xl p-0.5 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'ring-4 ring-cyan-400 bg-cyan-400 shadow-xl shadow-cyan-400/50 scale-105'
                    : is24g
                    ? 'bg-amber-500/60 ring-2 ring-amber-500/40 opacity-70'
                    : 'bg-gradient-to-tr from-slate-700 to-slate-800 hover:ring-2 hover:ring-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30'
                }`}
              >
                <div className="w-full h-full rounded-[14px] bg-slate-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Status mini badge */}
                <span
                  className={`absolute -bottom-1 -right-1 text-[8px] font-bold px-1 rounded-sm border ${
                    is24g
                      ? 'bg-amber-950 text-amber-300 border-amber-600'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-500'
                  }`}
                >
                  {is24g ? '2.4G' : '5G'}
                </span>
              </div>

              {/* Text label */}
              <div className="mt-1.5 flex flex-col items-center max-w-[90px] text-center">
                <span className="text-[11px] font-semibold text-slate-200 truncate w-full">
                  {peer.name.split("'s ")[1] || peer.name}
                </span>
                <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                  {is24g ? (
                    <span className="text-amber-400">Rejected</span>
                  ) : (
                    <>
                      <Wifi className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{peer.channel}ch · {peer.rssi}dBm</span>
                    </>
                  )}
                </span>
              </div>
            </motion.button>
          </motion.div>
        );
      })}

      {/* 2.4 GHz Rejection Diagnostic Warning Modal */}
      <AnimatePresence>
        {warningPeer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-amber-500/30 p-5 shadow-2xl text-left"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  onClick={() => setWarningPeer(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-semibold text-white">5 GHz Strict Enforcement Block</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Connection with <strong className="text-amber-300">{warningPeer.name}</strong> was rejected. 
                  The device is currently linked on <span className="font-mono text-amber-400">{warningPeer.frequencyMHz} MHz (Channel {warningPeer.channel})</span> in the crowded 2.4 GHz spectrum.
                </p>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Detected Frequency:</span>
                  <span className="font-mono text-amber-400">{warningPeer.frequencyMHz} MHz (&lt; 5000 MHz)</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Policy:</span>
                  <span className="font-mono text-cyan-400">BAND_5GHZ (5180 - 5825 MHz)</span>
                </div>
                <div className="flex justify-between">
                  <span>Reason:</span>
                  <span>Zero 2.4 GHz interference guarantee</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setWarningPeer(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
                >
                  Dismiss & Keep 5 GHz Only
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
