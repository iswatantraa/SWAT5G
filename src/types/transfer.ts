export type DeviceOS = 'android' | 'ios' | 'mac' | 'windows';

export type BandType = '5GHz' | '2.4GHz';

export interface DevicePeer {
  id: string;
  name: string;
  model: string;
  os: DeviceOS;
  avatar: string;
  ip: string;
  port: number;
  rssi: number; // dBm e.g. -42
  frequencyMHz: number; // e.g. 5180 for Ch 36
  channel: number;
  band: BandType;
  is5GHzLocked: boolean;
  status: 'discovered' | 'connecting' | 'connected' | 'transferring' | 'rejected';
  distanceMeters: number;
}

export type FileCategory = 'all' | 'video' | 'photo' | 'app' | 'file' | 'folder';

export interface TransferFile {
  id: string;
  name: string;
  sizeBytes: number;
  category: FileCategory;
  extension: string;
  previewUrl?: string;
  mimeType: string;
  rawFile?: File;
  chunksTotal: number;
  chunksCompleted: number;
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'failed';
  speedMBps?: number;
}

export interface TelemetryData {
  currentSpeedMBps: number;
  peakSpeedMBps: number;
  avgSpeedMBps: number;
  frequencyMHz: number;
  channel: number;
  rssiDb: number;
  rttMs: number;
  dynamicChunkSizeMB: number;
  activeStreams: number;
  packetsLost: number;
  is5GHzActive: boolean;
}

export interface QRHandshakePayload {
  version: string;
  ssid: string;
  wpaKey: string;
  ip: string;
  port: number;
  band: '5GHz';
  channel: number;
  frequencyMHz: number;
  security: 'WPA3_SAE' | 'WPA2_PSK';
  token: string;
  senderName: string;
  os: DeviceOS;
}

export interface TransferHistoryRecord {
  id: string;
  timestamp: string;
  peerName: string;
  peerOS: DeviceOS;
  direction: 'sent' | 'received';
  filesCount: number;
  totalSizeFormatted: string;
  durationSeconds: number;
  avgSpeedMBps: number;
  band: '5GHz';
  files: { name: string; sizeFormatted: string }[];
}
