import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Wifi, Radio, Zap, ArrowRight, RefreshCw, Send, Download, 
  ShieldCheck, AlertCircle, Sparkles, FolderUp, CheckCircle, RotateCcw
} from 'lucide-react';
import { DevicePeer, TransferFile, TelemetryData, TransferHistoryRecord } from './types/transfer';
import { INITIAL_PEERS, SAMPLE_FILES, INITIAL_HISTORY, formatBytes } from './data/mockFiles';
import { haptics } from './utils/haptics';
import { RadarScanner } from './components/RadarScanner';
import { TransferParticleBeam } from './components/TransferParticleBeam';
import { SpeedometerGauge } from './components/SpeedometerGauge';
import { LiquidProgressRing } from './components/LiquidProgressRing';
import { FilePickerDrawer } from './components/FilePickerDrawer';
import { QRHandshakeModal } from './components/QRHandshakeModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { NativeCodeModal } from './components/NativeCodeModal';
import { DeviceSimulatorFrame, FrameMode, AppRole } from './components/DeviceSimulatorFrame';

export default function App() {
  // Device & Mode preferences
  const [frameMode, setFrameMode] = useState<FrameMode>('iphone');
  const [appRole, setAppRole] = useState<AppRole>('sender');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Modals state
  const [isNativeCodeOpen, setIsNativeCodeOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Data states
  const [peers, setPeers] = useState<DevicePeer[]>(INITIAL_PEERS);
  const [isScanning, setIsScanning] = useState(true);
  const [selectedPeer, setSelectedPeer] = useState<DevicePeer | null>(INITIAL_PEERS[0]); // Default to Galaxy S24 Ultra
  const [files, setFiles] = useState<TransferFile[]>(SAMPLE_FILES);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(['file-1', 'file-2']); // Default 4K Video + RAW Photo
  const [history, setHistory] = useState<TransferHistoryRecord[]>(INITIAL_HISTORY);

  // Transfer simulation state
  const [transferState, setTransferState] = useState<'idle' | 'transferring' | 'paused' | 'completed'>('idle');
  const [transferredBytes, setTransferredBytes] = useState(0);
  const [speedHistory, setSpeedHistory] = useState<number[]>([45, 58, 64, 72, 79, 82, 78, 84, 76, 81]);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    currentSpeedMBps: 0,
    peakSpeedMBps: 88.6,
    avgSpeedMBps: 78.4,
    frequencyMHz: 5240, // Channel 48
    channel: 48,
    rssiDb: -38,
    rttMs: 1.4,
    dynamicChunkSizeMB: 16,
    activeStreams: 8,
    packetsLost: 0,
    is5GHzActive: true,
  });

  const transferIntervalRef = useRef<number | null>(null);

  // Total selected bytes calculation
  const totalSelectedBytes = useMemo(() => {
    return files
      .filter((f) => selectedFileIds.includes(f.id))
      .reduce((acc, f) => acc + f.sizeBytes, 0);
  }, [files, selectedFileIds]);

  const progressPercent = totalSelectedBytes > 0 
    ? Math.min((transferredBytes / totalSelectedBytes) * 100, 100) 
    : 0;

  const etaSeconds = telemetry.currentSpeedMBps > 0 
    ? Math.max(0, Math.round((totalSelectedBytes - transferredBytes) / (telemetry.currentSpeedMBps * 1024 * 1024))) 
    : 0;

  // Handle Selection
  const handleToggleSelectFile = (id: string) => {
    setSelectedFileIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedFileIds(files.map((f) => f.id));
  };

  const handleClearSelection = () => {
    setSelectedFileIds([]);
  };

  const handleAddCustomFiles = (newFiles: TransferFile[]) => {
    setFiles((prev) => [...newFiles, ...prev]);
    setSelectedFileIds((prev) => [...newFiles.map((f) => f.id), ...prev]);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    haptics.setSoundEnabled(next);
    if (next) haptics.triggerTick();
  };

  // Start Transfer Engine
  const startTransfer = () => {
    if (!selectedPeer || selectedFileIds.length === 0) return;
    haptics.triggerMagneticLock();
    setTransferredBytes(0);
    setTransferState('transferring');
  };

  // Transfer simulation tick loop
  useEffect(() => {
    if (transferState !== 'transferring') {
      if (transferIntervalRef.current) {
        clearInterval(transferIntervalRef.current);
        transferIntervalRef.current = null;
      }
      return;
    }

    transferIntervalRef.current = window.setInterval(() => {
      // Fluctuate between 72 and 86 MB/s realistic 5 GHz 80MHz channel throughput
      const instantSpeed = 74 + (Math.random() * 12 - 4);
      const bytesPerTick = (instantSpeed * 1024 * 1024) * 0.15; // 150ms step

      setTransferredBytes((prev) => {
        const next = prev + bytesPerTick;
        if (next >= totalSelectedBytes) {
          // Transfer Completed!
          setTransferState('completed');
          haptics.triggerCompletionChime();

          // Trigger Confetti Burst
          try {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.65 },
              colors: ['#22d3ee', '#38bdf8', '#818cf8', '#34d399', '#ffffff'],
            });
          } catch {}

          // Append to history
          if (selectedPeer) {
            const newRecord: TransferHistoryRecord = {
              id: `hist-${Date.now()}`,
              timestamp: 'Just now',
              peerName: selectedPeer.name,
              peerOS: selectedPeer.os,
              direction: appRole === 'sender' ? 'sent' : 'received',
              filesCount: selectedFileIds.length,
              totalSizeFormatted: formatBytes(totalSelectedBytes),
              durationSeconds: Math.max(1, Math.round(totalSelectedBytes / (78 * 1024 * 1024))),
              avgSpeedMBps: 79.4,
              band: '5GHz',
              files: files
                .filter((f) => selectedFileIds.includes(f.id))
                .map((f) => ({ name: f.name, sizeFormatted: formatBytes(f.sizeBytes) })),
            };
            setHistory((prevHistory) => [newRecord, ...prevHistory]);
          }

          return totalSelectedBytes;
        }
        return next;
      });

      setTelemetry((prev) => ({
        ...prev,
        currentSpeedMBps: instantSpeed,
        peakSpeedMBps: Math.max(prev.peakSpeedMBps, instantSpeed),
        rttMs: 1.2 + Math.random() * 0.4,
      }));

      setSpeedHistory((prev) => {
        const updated = [...prev.slice(1), instantSpeed];
        return updated;
      });
    }, 150);

    return () => {
      if (transferIntervalRef.current) {
        clearInterval(transferIntervalRef.current);
      }
    };
  }, [transferState, totalSelectedBytes, selectedPeer, selectedFileIds, files, appRole]);

  const handleTogglePause = () => {
    if (transferState === 'transferring') {
      setTransferState('paused');
      setTelemetry((prev) => ({ ...prev, currentSpeedMBps: 0 }));
    } else if (transferState === 'paused') {
      setTransferState('transferring');
    }
  };

  const handleCancelTransfer = () => {
    setTransferState('idle');
    setTransferredBytes(0);
    setTelemetry((prev) => ({ ...prev, currentSpeedMBps: 0 }));
  };

  const handleRefreshRadar = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setTimeout(() => setIsScanning(true), 300);
    }, 1800);
  };

  const senderInfo = appRole === 'sender' 
    ? { name: 'My Host Device', os: 'android', model: 'SWAT5G Host Station' }
    : { name: selectedPeer?.name || 'Remote Host', os: selectedPeer?.os || 'ios', model: selectedPeer?.model || 'Device' };

  return (
    <DeviceSimulatorFrame
      frameMode={frameMode}
      onChangeFrameMode={setFrameMode}
      appRole={appRole}
      onChangeAppRole={setAppRole}
      isSoundEnabled={isSoundEnabled}
      onToggleSound={handleToggleSound}
      onOpenNativeCode={() => setIsNativeCodeOpen(true)}
      onOpenQR={() => setIsQROpen(true)}
      onOpenHistory={() => setIsHistoryOpen(true)}
    >
      <div className="flex flex-col space-y-5">
        {/* Top 5 GHz Locked Telemetry Pill */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold tracking-wider text-cyan-300 font-mono">
                5 GHz BAND ENFORCED
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                5240 MHz · Ch 48 · Zero 2.4G Interference
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.triggerTick();
              setIsQROpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-400 transition-colors cursor-pointer"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>WPA3 Hotspot</span>
          </button>
        </div>

        {/* View Switch: Transfer In Progress vs Radar Discovery */}
        {transferState === 'idle' ? (
          <>
            {/* Radar Discovery Screen */}
            <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3 overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between mb-1 px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>5 GHz Radar Discovery</span>
                </div>
                <button
                  onClick={() => {
                    haptics.triggerRadarPing();
                    handleRefreshRadar();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  title="Rescan Spectrum"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Concentric Radar Canvas */}
              <RadarScanner
                peers={peers}
                onSelectPeer={setSelectedPeer}
                selectedPeerId={selectedPeer?.id}
                isScanning={isScanning}
                onRefreshScan={handleRefreshRadar}
              />

              {/* Selected Peer Snapshot */}
              {selectedPeer && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={selectedPeer.avatar}
                      alt={selectedPeer.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{selectedPeer.name}</span>
                        <span className="text-[9px] font-mono px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 uppercase">
                          {selectedPeer.os}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        5GHz Locked · {selectedPeer.frequencyMHz} MHz (Ch {selectedPeer.channel})
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                    READY
                  </span>
                </div>
              )}
            </div>

            {/* Smart Categorized File Picker */}
            <FilePickerDrawer
              files={files}
              selectedFileIds={selectedFileIds}
              onToggleSelectFile={handleToggleSelectFile}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onAddCustomFiles={handleAddCustomFiles}
            />

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                disabled={!selectedPeer || selectedFileIds.length === 0}
                onClick={startTransfer}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {appRole === 'sender'
                    ? `Send ${selectedFileIds.length} Items (${formatBytes(totalSelectedBytes)})`
                    : `Receive Payload from ${selectedPeer?.name.split("'s ")[0] || 'Peer'}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* Live File Transfer Mode */
          <div className="space-y-4">
            {/* Particle Stream Visualizer */}
            {selectedPeer && (
              <TransferParticleBeam
                senderPeer={senderInfo}
                receiverPeer={selectedPeer}
                currentSpeedMBps={telemetry.currentSpeedMBps}
                isPaused={transferState === 'paused'}
                isCompleted={transferState === 'completed'}
              />
            )}

            {/* Cyber Speedometer & Waveform */}
            <SpeedometerGauge
              telemetry={telemetry}
              speedHistory={speedHistory}
            />

            {/* Liquid Fill Progress Ring */}
            <LiquidProgressRing
              progressPercent={progressPercent}
              transferredBytes={transferredBytes}
              totalBytes={totalSelectedBytes}
              etaSeconds={etaSeconds}
              currentSpeedMBps={telemetry.currentSpeedMBps}
              isPaused={transferState === 'paused'}
              isCompleted={transferState === 'completed'}
              onTogglePause={handleTogglePause}
              onCancel={handleCancelTransfer}
            />
          </div>
        )}
      </div>

      {/* Cross-Platform Handshake Modal */}
      <QRHandshakeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        onHandshakeConfirmed={() => {
          haptics.triggerCompletionChime();
          if (peers.length > 0) setSelectedPeer(peers[0]);
        }}
        senderName={senderInfo.name}
      />

      {/* Transfer History Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />

      {/* Production Architecture & Native Code Studio */}
      <NativeCodeModal
        isOpen={isNativeCodeOpen}
        onClose={() => setIsNativeCodeOpen(false)}
      />
    </DeviceSimulatorFrame>
  );
}
