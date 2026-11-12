import React, { useEffect, useRef } from 'react';
import { DevicePeer } from '../types/transfer';
import { Smartphone, Laptop, CheckCircle2, Zap } from 'lucide-react';

interface TransferParticleBeamProps {
  senderPeer: { name: string; os: string; model: string };
  receiverPeer: DevicePeer;
  currentSpeedMBps: number;
  isPaused: boolean;
  isCompleted: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  alpha: number;
  wobbleOffset: number;
  wobbleSpeed: number;
}

export const TransferParticleBeam: React.FC<TransferParticleBeamProps> = ({
  senderPeer,
  receiverPeer,
  currentSpeedMBps,
  isPaused,
  isCompleted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    const particles: Particle[] = [];
    const particleCount = 45;
    const colors = ['#22d3ee', '#38bdf8', '#818cf8', '#06b6d4', '#67e8f9'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: height / 2 + (Math.random() - 0.5) * 36,
        size: Math.random() * 2.8 + 1.2,
        speed: (Math.random() * 2.5 + 2.0) * (Math.max(currentSpeedMBps, 20) / 45),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const startX = width * 0.18;
      const endX = width * 0.82;
      const centerY = height / 2;

      // Draw baseline energy beam guide
      const gradient = ctx.createLinearGradient(startX, centerY, endX, centerY);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.45)');
      gradient.addColorStop(1, 'rgba(129, 140, 248, 0.15)');

      ctx.beginPath();
      ctx.moveTo(startX, centerY);
      ctx.lineTo(endX, centerY);
      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.stroke();

      // Pulsing glow waves along beam
      if (!isPaused && !isCompleted) {
        time += 0.03;
        const pulseX = startX + ((Math.sin(time * 2) + 1) / 2) * (endX - startX);
        const radialPulse = ctx.createRadialGradient(pulseX, centerY, 0, pulseX, centerY, 40);
        radialPulse.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
        radialPulse.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = radialPulse;
        ctx.beginPath();
        ctx.arc(pulseX, centerY, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render streaming particles
      if (!isPaused && !isCompleted) {
        particles.forEach((p) => {
          p.x += p.speed;
          p.wobbleOffset += p.wobbleSpeed;
          const wobbleY = Math.sin(p.wobbleOffset) * 14;

          // Wrap around when reaching receiver
          if (p.x > endX) {
            p.x = startX;
            p.speed = (Math.random() * 2.5 + 2.0) * (Math.max(currentSpeedMBps, 20) / 45);
          }

          // Glow trail
          ctx.beginPath();
          ctx.moveTo(p.x - p.speed * 4, centerY + wobbleY);
          ctx.lineTo(p.x, centerY + wobbleY);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.globalAlpha = p.alpha * 0.4;
          ctx.stroke();

          // Particle head
          ctx.beginPath();
          ctx.arc(p.x, centerY + wobbleY, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentSpeedMBps, isPaused, isCompleted]);

  return (
    <div className="relative w-full rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 overflow-hidden backdrop-blur-md">
      {/* Background canvas for high-fps particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      <div className="relative z-20 flex items-center justify-between">
        {/* Sender Device Node */}
        <div className="flex flex-col items-center max-w-[110px] text-center">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="absolute -top-1 -left-1 px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500">
              SENDER
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-200 mt-2 truncate w-full">
            {senderPeer.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">192.168.49.1</span>
        </div>

        {/* Center Live Stream Indicator */}
        <div className="flex flex-col items-center z-20">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-500/40 shadow-lg text-cyan-400">
            <Zap className={`w-3.5 h-3.5 ${!isPaused && !isCompleted ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-mono font-bold tracking-wider">
              {isCompleted ? 'VERIFIED' : isPaused ? 'PAUSED' : `${currentSpeedMBps.toFixed(1)} MB/s`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            4-16MB Dynamic Chunks
          </span>
        </div>

        {/* Receiver Device Node */}
        <div className="flex flex-col items-center max-w-[110px] text-center">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-indigo-400 overflow-hidden">
              <img
                src={receiverPeer.avatar}
                alt={receiverPeer.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500">
              RECEIVER
            </span>
            {isCompleted && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-200 mt-2 truncate w-full">
            {receiverPeer.name.split("'s ")[1] || receiverPeer.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{receiverPeer.ip}</span>
        </div>
      </div>
    </div>
  );
};
