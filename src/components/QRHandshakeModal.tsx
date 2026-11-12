import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, Camera, Copy, Check, ShieldCheck, Wifi, X, ArrowRight, RefreshCw } from 'lucide-react';
import { QRHandshakePayload } from '../types/transfer';
import { haptics } from '../utils/haptics';

interface QRHandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHandshakeConfirmed: () => void;
  senderName: string;
}

export const QRHandshakeModal: React.FC<QRHandshakeModalProps> = ({
  isOpen,
  onClose,
  onHandshakeConfirmed,
  senderName,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [simulatedScanned, setSimulatedScanned] = useState(false);

  if (!isOpen) return null;

  const handshakeData: QRHandshakePayload = {
    version: '1.4',
    ssid: 'DIRECT-AeroWave-5G-Ch48',
    wpaKey: 'aero99x-5ghz-secure',
    ip: '192.168.49.1',
    port: 50505,
    band: '5GHz',
    channel: 48,
    frequencyMHz: 5240,
    security: 'WPA3_SAE',
    token: 'tok_5g_8f912c9e782a45d0',
    senderName: senderName,
    os: 'android',
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText(`SSID: ${handshakeData.ssid}\nWPA3: ${handshakeData.wpaKey}`);
    haptics.triggerTick();
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSimulateScan = () => {
    haptics.triggerMagneticLock();
    setSimulatedScanned(true);
    setTimeout(() => {
      onHandshakeConfirmed();
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-left flex flex-col space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cross-Platform 5 GHz Handshake</h3>
              <p className="text-[11px] text-slate-400">Zero-configuration instant Wi-Fi direct link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => {
              haptics.triggerTick();
              setActiveTab('generate');
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Sender QR Code</span>
          </button>
          <button
            onClick={() => {
              haptics.triggerTick();
              setActiveTab('scan');
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Receiver Camera</span>
          </button>
        </div>

        {activeTab === 'generate' ? (
          /* Generate QR view */
          <div className="flex flex-col items-center space-y-4 py-2">
            {/* SVG Rendered Dynamic QR Code */}
            <div className="relative p-4 rounded-2xl bg-white border-4 border-cyan-500/30 shadow-2xl flex items-center justify-center">
              <svg className="w-48 h-48" viewBox="0 0 100 100">
                {/* Visual authentic QR code matrix pattern */}
                <rect width="100" height="100" fill="#ffffff" />
                {/* Corner Positioning markers */}
                <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="2" />
                <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="1" />
                <rect x="13" y="13" width="10" height="10" fill="#06b6d4" rx="1" />

                <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="2" />
                <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="1" />
                <rect x="77" y="13" width="10" height="10" fill="#06b6d4" rx="1" />

                <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="2" />
                <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="1" />
                <rect x="13" y="77" width="10" height="10" fill="#06b6d4" rx="1" />

                {/* Timing lines */}
                <line x1="33" y1="17" x2="67" y2="17" stroke="#0f172a" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="17" y1="33" x2="17" y2="67" stroke="#0f172a" strokeWidth="2" strokeDasharray="3 3" />

                {/* QR Data modules */}
                <rect x="35" y="24" width="4" height="4" fill="#0f172a" />
                <rect x="43" y="24" width="4" height="4" fill="#0f172a" />
                <rect x="51" y="24" width="4" height="4" fill="#06b6d4" />
                <rect x="59" y="24" width="4" height="4" fill="#0f172a" />

                <rect x="25" y="36" width="4" height="4" fill="#0f172a" />
                <rect x="33" y="36" width="4" height="4" fill="#06b6d4" />
                <rect x="41" y="36" width="4" height="4" fill="#0f172a" />
                <rect x="49" y="36" width="4" height="4" fill="#0f172a" />
                <rect x="57" y="36" width="4" height="4" fill="#0f172a" />
                <rect x="65" y="36" width="4" height="4" fill="#06b6d4" />

                <rect x="35" y="48" width="4" height="4" fill="#06b6d4" />
                <rect x="43" y="48" width="4" height="4" fill="#0f172a" />
                <rect x="51" y="48" width="4" height="4" fill="#0f172a" />
                <rect x="59" y="48" width="4" height="4" fill="#06b6d4" />
                <rect x="67" y="48" width="4" height="4" fill="#0f172a" />

                <rect x="25" y="60" width="4" height="4" fill="#0f172a" />
                <rect x="33" y="60" width="4" height="4" fill="#0f172a" />
                <rect x="41" y="60" width="4" height="4" fill="#06b6d4" />
                <rect x="49" y="60" width="4" height="4" fill="#0f172a" />
                <rect x="57" y="60" width="4" height="4" fill="#0f172a" />

                <rect x="35" y="72" width="4" height="4" fill="#0f172a" />
                <rect x="43" y="72" width="4" height="4" fill="#06b6d4" />
                <rect x="51" y="72" width="4" height="4" fill="#0f172a" />
                <rect x="59" y="72" width="4" height="4" fill="#0f172a" />

                <rect x="35" y="84" width="4" height="4" fill="#06b6d4" />
                <rect x="43" y="84" width="4" height="4" fill="#0f172a" />
                <rect x="51" y="84" width="4" height="4" fill="#0f172a" />
                <rect x="59" y="84" width="4" height="4" fill="#06b6d4" />
                <rect x="67" y="84" width="4" height="4" fill="#0f172a" />

                {/* Central 5G Emblem */}
                <circle cx="50" cy="50" r="8" fill="#0284c7" />
                <text x="50" y="53" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">5G</text>
              </svg>
            </div>

            {/* Hotspot Credentials Box */}
            <div className="w-full rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Wi-Fi Hotspot:</span>
                <span className="font-mono text-cyan-300 font-semibold">{handshakeData.ssid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Spectrum Lock:</span>
                <span className="font-mono text-emerald-400 font-semibold">5240 MHz (Ch 48 · 5 GHz)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Security Mode:</span>
                <span className="font-mono text-slate-300">WPA3-SAE / Multi-P2P</span>
              </div>
            </div>

            <button
              onClick={handleCopyCredentials}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? 'Credentials Copied!' : 'Copy Wi-Fi Direct Credentials'}</span>
            </button>
          </div>
        ) : (
          /* Scan QR View */
          <div className="flex flex-col items-center space-y-4 py-2">
            <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Simulated camera feed */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950/90 to-slate-900/60" />

              {/* Viewfinder Target Reticle */}
              <div className="relative w-40 h-40 border-2 border-cyan-400/80 rounded-xl flex items-center justify-center">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                {/* Laser scan line */}
                <motion.div
                  animate={{ y: [-60, 60, -60] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="w-36 h-0.5 bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                />
              </div>

              {simulatedScanned && (
                <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-xs flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs animate-bounce">
                    5 GHz Token Verified!
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 text-center">
              Point your camera at the other device's screen. Android and iOS join the 5 GHz LocalOnlyHotspot with zero manual Wi-Fi configuration.
            </p>

            <button
              onClick={handleSimulateScan}
              disabled={simulatedScanned}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>{simulatedScanned ? 'Pairing 5 GHz Link...' : 'Simulate Instant Camera Scan'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
