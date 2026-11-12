import { TransferFile, DevicePeer, TransferHistoryRecord } from '../types/transfer';

export const INITIAL_PEERS: DevicePeer[] = [
  {
    id: 'peer-s24u',
    name: "Alex's Galaxy S24 Ultra",
    model: 'SM-S928B',
    os: 'android',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    ip: '192.168.49.24',
    port: 50505,
    rssi: -38,
    frequencyMHz: 5240, // Ch 48
    channel: 48,
    band: '5GHz',
    is5GHzLocked: true,
    status: 'discovered',
    distanceMeters: 1.2,
  },
  {
    id: 'peer-ip16p',
    name: "Elena's iPhone 16 Pro",
    model: 'iPhone 17,2',
    os: 'ios',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    ip: '192.168.49.88',
    port: 50505,
    rssi: -44,
    frequencyMHz: 5745, // Ch 149
    channel: 149,
    band: '5GHz',
    is5GHzLocked: true,
    status: 'discovered',
    distanceMeters: 2.1,
  },
  {
    id: 'peer-px9p',
    name: "Jordan's Pixel 9 Pro",
    model: 'Google Pixel 9 Pro XL',
    os: 'android',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    ip: '192.168.49.102',
    port: 50505,
    rssi: -52,
    frequencyMHz: 5180, // Ch 36
    channel: 36,
    band: '5GHz',
    is5GHzLocked: true,
    status: 'discovered',
    distanceMeters: 3.4,
  },
  {
    id: 'peer-ipadmini',
    name: "Studio iPad Pro M4",
    model: 'iPad16,3',
    os: 'ios',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    ip: '192.168.49.55',
    port: 50505,
    rssi: -49,
    frequencyMHz: 5500, // Ch 100 DFS
    channel: 100,
    band: '5GHz',
    is5GHzLocked: true,
    status: 'discovered',
    distanceMeters: 2.8,
  },
  {
    id: 'peer-legacy-24g',
    name: "Older Device (2.4 GHz Only)",
    model: 'Legacy Station',
    os: 'android',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    ip: '192.168.1.19',
    port: 50505,
    rssi: -78,
    frequencyMHz: 2437, // Ch 6 (2.4 GHz)
    channel: 6,
    band: '2.4GHz',
    is5GHzLocked: false,
    status: 'rejected',
    distanceMeters: 6.5,
  },
];

export const SAMPLE_FILES: TransferFile[] = [
  {
    id: 'file-1',
    name: 'Cinematic_Tokyo_4K_ProRes422HQ.mov',
    sizeBytes: 6442450944, // 6.0 GB
    category: 'video',
    extension: 'MOV',
    mimeType: 'video/quicktime',
    chunksTotal: 400,
    chunksCompleted: 0,
    status: 'pending',
  },
  {
    id: 'file-2',
    name: 'Sony_A7R_Astrophotography_RAW.arw',
    sizeBytes: 86507520, // 82.5 MB
    category: 'photo',
    extension: 'ARW',
    mimeType: 'image/x-sony-arw',
    chunksTotal: 6,
    chunksCompleted: 0,
    status: 'pending',
  },
  {
    id: 'file-3',
    name: 'AeroWave_Native_Release_v3.4.1.apk',
    sizeBytes: 98566144, // 94.0 MB
    category: 'app',
    extension: 'APK',
    mimeType: 'application/vnd.android.package-archive',
    chunksTotal: 7,
    chunksCompleted: 0,
    status: 'pending',
  },
  {
    id: 'file-4',
    name: 'Full_Camera_Roll_2026_Archive.zip',
    sizeBytes: 4294967296, // 4.0 GB
    category: 'file',
    extension: 'ZIP',
    mimeType: 'application/zip',
    chunksTotal: 268,
    chunksCompleted: 0,
    status: 'pending',
  },
  {
    id: 'file-5',
    name: 'DJI_Inspire3_8K_Master_Take04.mp4',
    sizeBytes: 12884901888, // 12.0 GB
    category: 'video',
    extension: 'MP4',
    mimeType: 'video/mp4',
    chunksTotal: 800,
    chunksCompleted: 0,
    status: 'pending',
  },
  {
    id: 'file-6',
    name: 'iOS_Xcode_Build_Artifacts.xcarchive',
    sizeBytes: 1468006400, // 1.36 GB
    category: 'folder',
    extension: 'XCARCHIVE',
    mimeType: 'application/octet-stream',
    chunksTotal: 92,
    chunksCompleted: 0,
    status: 'pending',
  },
  {
    id: 'file-7',
    name: 'Uncompressed_Street_Portraits.dng',
    sizeBytes: 67108864, // 64 MB
    category: 'photo',
    extension: 'DNG',
    mimeType: 'image/x-adobe-dng',
    chunksTotal: 5,
    chunksCompleted: 0,
    status: 'pending',
  },
  {
    id: 'file-8',
    name: 'PyTorch_VisionTransformer_Weights.bin',
    sizeBytes: 8589934592, // 8.0 GB
    category: 'file',
    extension: 'BIN',
    mimeType: 'application/octet-stream',
    chunksTotal: 536,
    chunksCompleted: 0,
    status: 'pending',
  },
];

export const INITIAL_HISTORY: TransferHistoryRecord[] = [
  {
    id: 'hist-1',
    timestamp: 'Today, 05:42 AM',
    peerName: "Alex's Galaxy S24 Ultra",
    peerOS: 'android',
    direction: 'sent',
    filesCount: 3,
    totalSizeFormatted: '14.2 GB',
    durationSeconds: 192,
    avgSpeedMBps: 74.8,
    band: '5GHz',
    files: [
      { name: 'RedBull_AirRace_4K60.mov', sizeFormatted: '8.4 GB' },
      { name: 'Production_Stills_RAW.zip', sizeFormatted: '4.6 GB' },
      { name: 'Config_ColorGrade.cube', sizeFormatted: '1.2 GB' },
    ],
  },
  {
    id: 'hist-2',
    timestamp: 'Yesterday, 09:15 PM',
    peerName: "Elena's iPhone 16 Pro",
    peerOS: 'ios',
    direction: 'received',
    filesCount: 1,
    totalSizeFormatted: '4.8 GB',
    durationSeconds: 61,
    avgSpeedMBps: 80.2,
    band: '5GHz',
    files: [
      { name: 'Apple_ProRes_Log_Broll.mov', sizeFormatted: '4.8 GB' },
    ],
  },
  {
    id: 'hist-3',
    timestamp: 'Nov 10, 03:20 PM',
    peerName: "Studio iPad Pro M4",
    peerOS: 'ios',
    direction: 'sent',
    filesCount: 5,
    totalSizeFormatted: '22.0 GB',
    durationSeconds: 278,
    avgSpeedMBps: 79.1,
    band: '5GHz',
    files: [
      { name: 'Keynote_Video_Master.mp4', sizeFormatted: '18.2 GB' },
      { name: 'Keynote_Deck_Vector.key', sizeFormatted: '3.8 GB' },
    ],
  },
];

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
