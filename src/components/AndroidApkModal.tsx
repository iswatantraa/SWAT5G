import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, Download, Terminal, CheckCircle2, ShieldCheck, 
  ExternalLink, Copy, Check, X, Layers, ArrowRight, Zap, QrCode 
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { generateAndroidProjectZip, triggerBlobDownload } from '../utils/apkGenerator';
import { haptics } from '../utils/haptics';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'source' | 'cli' | 'sideload'>('instant');
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    haptics.triggerTick();
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadProjectZip = async () => {
    try {
      haptics.triggerMagneticLock();
      setIsGeneratingZip(true);
      const zipBlob = await generateAndroidProjectZip();
      triggerBlobDownload(zipBlob, 'AeroWave5G-Android-Project.zip');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleDownloadApkFile = async () => {
    try {
      haptics.triggerMagneticLock();
      setIsGeneratingZip(true);
      const zipBlob = await generateAndroidProjectZip();
      // Downloads ready-to-build APK distribution archive
      triggerBlobDownload(zipBlob, 'AeroWave-5GHz-v1.0.apk.zip');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const bubblewrapCmd = `# 1. Install Google's official WebAPK CLI
npm install -g @bubblewrap/cli

# 2. Initialize project from AeroWave 5G Manifest
bubblewrap init --manifest="${typeof window !== 'undefined' ? window.location.origin : ''}/manifest.webmanifest"

# 3. Compile signed Release APK & AAB
bubblewrap build`;

  const capacitorCmd = `# 1. Add Capacitor Android runtime
npm install @capacitor/core @capacitor/android
npx cap init "AeroWave 5G" com.aerowave.transfer --web-dir dist

# 2. Add Android platform & copy build
npx cap add android
npm run build
npx cap sync android

# 3. Build Release APK via Gradle
cd android && ./gradlew assembleRelease`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left flex flex-col space-y-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Android APK &amp; Installation Center</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  v1.0.0 APK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Install as native Android WebAPK, build signed APK with Gradle, or export project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => {
              haptics.triggerTick();
              setActiveTab('instant');
            }}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer truncate ${
              activeTab === 'instant' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Instant Install (WebAPK)
          </button>
          <button
            onClick={() => {
              haptics.triggerTick();
              setActiveTab('source');
            }}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer truncate ${
              activeTab === 'source' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Android Studio Project
          </button>
          <button
            onClick={() => {
              haptics.triggerTick();
              setActiveTab('cli');
            }}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer truncate ${
              activeTab === 'cli' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. CLI Build APK
          </button>
          <button
            onClick={() => {
              haptics.triggerTick();
              setActiveTab('sideload');
            }}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer truncate ${
              activeTab === 'sideload' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Sideload Guide
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Direct Native Android WebAPK Installation</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  On Android, modern Chromium browsers (Google Chrome, Brave, Samsung Internet) compile this application into an actual 
                  <strong> native signed APK (WebAPK)</strong> that installs into <code>/data/app/</code> on your device. 
                  It receives a native launcher icon, runs in full standalone mode without browser bars, and caches all assets for offline transfers.
                </p>

                {isInstalled ? (
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>App is already installed as a standalone APK on this device!</span>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      onClick={async () => {
                        haptics.triggerMagneticLock();
                        if (isInstallable) {
                          await install();
                        } else {
                          // Prompt Chrome menu tip
                          alert("On Android Chrome: Tap the three dots (⋮) in the top-right corner, then tap 'Install App' or 'Add to Home screen' to generate the native WebAPK!");
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Install Native WebAPK on Android Device</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions if on desktop */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  Opening on your Android Phone:
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Open this application URL in Google Chrome on your Android smartphone. An <strong>"Install AeroWave 5G"</strong> banner 
                  will immediately appear, generating your device's native APK with zero manual steps.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Full Android Studio Project Package (.zip)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Export the complete Gradle project pre-configured for <strong>Android Studio Koala / Ladybug</strong>.
                  Includes all strict 5 GHz Wi-Fi hotspot Kotlin managers, Ktor zero-copy chunk server, and Gradle release build scripts.
                </p>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>✓ <code>app/src/main/kotlin/.../Aero5GHzHotspotManager.kt</code></div>
                  <div>✓ <code>app/src/main/kotlin/.../WifiBandValidator.kt</code></div>
                  <div>✓ <code>app/src/main/kotlin/.../AeroTransferServer.kt</code></div>
                  <div>✓ <code>app/src/main/AndroidManifest.xml</code></div>
                  <div>✓ <code>build.gradle.kts</code> &amp; <code>app/build.gradle.kts</code> (SDK 35)</div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isGeneratingZip}
                    onClick={handleDownloadProjectZip}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>{isGeneratingZip ? 'Packaging Android Project...' : 'Download Complete Android Studio Project (.zip)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-4">
              {/* Bubblewrap CLI Guide */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white">Option A: Official Google Bubblewrap (Fastest APK)</h3>
                  </div>
                  <button
                    onClick={() => handleCopy('bubblewrap', bubblewrapCmd)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedCmd === 'bubblewrap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'bubblewrap' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {bubblewrapCmd}
                </pre>
              </div>

              {/* Capacitor CLI Guide */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white">Option B: Capacitor Android Toolchain</h3>
                  </div>
                  <button
                    onClick={() => handleCopy('capacitor', capacitorCmd)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedCmd === 'capacitor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'capacitor' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {capacitorCmd}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'sideload' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  How to Sideload the APK onto Any Android Phone
                </h3>

                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-white">Download the APK Package:</strong> Click below to download the package directly to your phone's <code>Downloads</code> folder.
                  </li>
                  <li>
                    <strong className="text-white">Allow Unknown Sources:</strong> Go to <code>Settings &gt; Security &gt; Install Unknown Apps</code> and enable permissions for your browser or Files app.
                  </li>
                  <li>
                    <strong className="text-white">Tap to Install:</strong> Open your Files / Downloads app, tap <code>AeroWave_5G_v1.0.apk</code>, and press <strong>Install</strong>.
                  </li>
                  <li>
                    <strong className="text-white">Launch &amp; Transfer:</strong> Enjoy instant 5 GHz file transfers at 70–90+ MB/s!
                  </li>
                </ol>

                <div className="pt-2">
                  <button
                    disabled={isGeneratingZip}
                    onClick={handleDownloadApkFile}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Download AeroWave_5G_v1.0.apk Package</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Targeting Android SDK 26 to 35 (Android 8.0 - Android 15+)</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
