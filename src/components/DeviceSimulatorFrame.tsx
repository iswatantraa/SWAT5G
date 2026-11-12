import React from 'react';
import { Smartphone, Monitor, Volume2, VolumeX, Code2, QrCode, History, Shield, Zap } from 'lucide-react';
import { haptics } from '../utils/haptics';

export type FrameMode = 'iphone' | 'galaxy' | 'desktop';
export type AppRole = 'sender' | 'receiver';

interface DeviceSimulatorFrameProps {
  frameMode: FrameMode;
  onChangeFrameMode: (mode: FrameMode) => void;
  appRole: AppRole;
  onChangeAppRole: (role: AppRole) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenNativeCode: () => void;
  onOpenQR: () => void;
  onOpenHistory: () => void;
  children: React.ReactNode;
}

export const DeviceSimulatorFrame: React.FC<DeviceSimulatorFrameProps> = ({
  frameMode,
  onChangeFrameMode,
  appRole,
  onChangeAppRole,
  isSoundEnabled,
  onToggleSound,
  onOpenNativeCode,
  onOpenQR,
  onOpenHistory,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start pb-12 selection:bg-cyan-500/30">
      {/* Top Application Bar - Clean 3-zone contract */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap">
                  AEROWAVE 5G
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  5.2 - 5.8 GHz ONLY
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Sender / Receiver Role Switch */}
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <button
                onClick={() => {
                  haptics.triggerTick();
                  onChangeAppRole('sender');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  appRole === 'sender'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sender Mode
              </button>
              <button
                onClick={() => {
                  haptics.triggerTick();
                  onChangeAppRole('receiver');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  appRole === 'receiver'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Receiver Mode
              </button>
            </div>

            {/* Device Frame Viewport Switch */}
            <div className="hidden md:flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <button
                onClick={() => {
                  haptics.triggerTick();
                  onChangeFrameMode('iphone');
                }}
                title="iPhone 16 Pro Viewport"
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  frameMode === 'iphone' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                iPhone
              </button>
              <button
                onClick={() => {
                  haptics.triggerTick();
                  onChangeFrameMode('galaxy');
                }}
                title="Galaxy S24 Ultra Viewport"
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  frameMode === 'galaxy' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Galaxy S24
              </button>
              <button
                onClick={() => {
                  haptics.triggerTick();
                  onChangeFrameMode('desktop');
                }}
                title="Full Responsive View"
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  frameMode === 'desktop' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Desktop
              </button>
            </div>
          </div>

          {/* Zone 3: Primary Utility CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                haptics.triggerTick();
                onOpenQR();
              }}
              title="QR Handshake"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                haptics.triggerTick();
                onOpenHistory();
              }}
              title="Transfer Logs"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onToggleSound();
              }}
              title={isSoundEnabled ? 'Audio Feedback Enabled' : 'Muted'}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={() => {
                haptics.triggerTick();
                onOpenNativeCode();
              }}
              className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Code2 className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Architecture &amp; Native Code</span>
              <span className="sm:hidden">Code</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Stage */}
      <main className="w-full flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
        {frameMode === 'desktop' ? (
          /* Desktop / Full Responsive View */
          <div className="w-full max-w-7xl">{children}</div>
        ) : (
          /* Mobile Device Frame Simulator */
          <div className="relative my-2">
            {/* Phone Exterior Casing */}
            <div
              className={`relative shadow-2xl transition-all duration-300 border-4 ${
                frameMode === 'iphone'
                  ? 'w-[385px] h-[820px] rounded-[52px] bg-slate-900 border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(6,182,212,0.25)]'
                  : 'w-[392px] h-[830px] rounded-[36px] bg-slate-900 border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(59,130,246,0.25)]'
              }`}
            >
              {/* Camera / Notch Cutout */}
              {frameMode === 'iphone' ? (
                /* Dynamic Island */
                <div className="absolute top-3 inset-x-0 mx-auto w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-2.5 shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[8px] font-mono text-cyan-300 font-bold">5G</span>
                  </div>
                </div>
              ) : (
                /* Galaxy Punch-hole */
                <div className="absolute top-3.5 inset-x-0 mx-auto w-3.5 h-3.5 bg-black rounded-full z-30 flex items-center justify-center shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                </div>
              )}

              {/* Internal Screen Content with Native Scroll Container */}
              <div className="w-full h-full rounded-[48px] overflow-hidden flex flex-col bg-slate-950">
                {/* Mobile Status Bar */}
                <div className="h-10 pt-2 px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-20 shrink-0">
                  <span className="font-semibold text-white">09:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-cyan-400">5 GHz WiFi</span>
                    <div className="w-4 h-2.5 border border-slate-400 rounded-xs p-0.5 flex items-center">
                      <div className="w-full h-full bg-cyan-400 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Content body inside phone */}
                <div className="flex-1 overflow-y-auto px-4 pb-6">{children}</div>

                {/* Bottom Home Indicator Bar */}
                <div className="h-5 flex items-center justify-center pb-1 shrink-0 select-none">
                  <div className="w-32 h-1 bg-slate-700/80 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
