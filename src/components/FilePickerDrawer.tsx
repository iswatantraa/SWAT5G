import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Film, Image, Smartphone, FileArchive, Folder, Search, 
  CheckSquare, Square, Upload, HardDrive, Zap, Plus, X 
} from 'lucide-react';
import { TransferFile, FileCategory } from '../types/transfer';
import { formatBytes } from '../data/mockFiles';
import { haptics } from '../utils/haptics';

interface FilePickerDrawerProps {
  files: TransferFile[];
  selectedFileIds: string[];
  onToggleSelectFile: (fileId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAddCustomFiles: (newFiles: TransferFile[]) => void;
}

export const FilePickerDrawer: React.FC<FilePickerDrawerProps> = ({
  files,
  selectedFileIds,
  onToggleSelectFile,
  onSelectAll,
  onClearSelection,
  onAddCustomFiles,
}) => {
  const [activeCategory, setActiveCategory] = useState<FileCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories: { id: FileCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', icon: <HardDrive className="w-3.5 h-3.5" /> },
    { id: 'video', label: 'Videos', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'photo', label: 'Photos', icon: <Image className="w-3.5 h-3.5" /> },
    { id: 'app', label: 'Apps', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'file', label: 'Files', icon: <FileArchive className="w-3.5 h-3.5" /> },
    { id: 'folder', label: 'Folders', icon: <Folder className="w-3.5 h-3.5" /> },
  ];

  // Filter files by category & query
  const filteredFiles = files.filter((f) => {
    const matchesCat = activeCategory === 'all' || f.category === activeCategory;
    const matchesQuery = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         f.extension.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Calculate selected total bytes
  const selectedFiles = files.filter((f) => selectedFileIds.includes(f.id));
  const totalSelectedBytes = selectedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const estimatedSecondsAt80MBps = Math.max(1, Math.round(totalSelectedBytes / (78 * 1024 * 1024)));

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    const newItems: TransferFile[] = Array.from(uploaded).map((file, idx) => {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      let cat: FileCategory = 'file';
      if (file.type.startsWith('video/')) cat = 'video';
      else if (file.type.startsWith('image/')) cat = 'photo';
      else if (ext === 'APK' || ext === 'IPA') cat = 'app';

      return {
        id: `custom-${Date.now()}-${idx}`,
        name: file.name,
        sizeBytes: file.size,
        category: cat,
        extension: ext,
        mimeType: file.type || 'application/octet-stream',
        rawFile: file,
        chunksTotal: Math.ceil(file.size / (16 * 1024 * 1024)) || 1,
        chunksCompleted: 0,
        status: 'pending',
      };
    });

    onAddCustomFiles(newItems);
    haptics.triggerMagneticLock();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const newItems: TransferFile[] = Array.from(e.dataTransfer.files).map((file, idx) => {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      let cat: FileCategory = 'file';
      if (file.type.startsWith('video/')) cat = 'video';
      else if (file.type.startsWith('image/')) cat = 'photo';

      return {
        id: `dropped-${Date.now()}-${idx}`,
        name: file.name,
        sizeBytes: file.size,
        category: cat,
        extension: ext,
        mimeType: file.type || 'application/octet-stream',
        rawFile: file,
        chunksTotal: Math.ceil(file.size / (16 * 1024 * 1024)) || 1,
        chunksCompleted: 0,
        status: 'pending',
      };
    });

    onAddCustomFiles(newItems);
    haptics.triggerMagneticLock();
  };

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'video': return <Film className="w-4 h-4 text-rose-400" />;
      case 'photo': return <Image className="w-4 h-4 text-emerald-400" />;
      case 'app': return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'folder': return <Folder className="w-4 h-4 text-amber-400" />;
      default: return <FileArchive className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur-md flex flex-col space-y-4">
      {/* Header with Search and Drop Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search raw videos, APKs, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Upload Custom Native Files Button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleNativeFileUpload}
        />
        <button
          onClick={() => {
            haptics.triggerTick();
            fileInputRef.current?.click();
          }}
          className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 text-xs font-medium text-slate-200 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pick Real Files</span>
        </button>
      </div>

      {/* Category Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                haptics.triggerTick();
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-500/50 text-cyan-300 shadow-sm'
                  : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full py-2.5 px-4 rounded-xl border border-dashed transition-all text-center flex items-center justify-center gap-2 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
        }`}
      >
        <Plus className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px]">
          Drop ProRes / RAW files or entire directories here (Zero Size Limits)
        </span>
      </div>

      {/* Batch Select Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              haptics.triggerTick();
              if (selectedFileIds.length === files.length) {
                onClearSelection();
              } else {
                onSelectAll();
              }
            }}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            {selectedFileIds.length === files.length && files.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            <span>Select All ({files.length})</span>
          </button>
          {selectedFileIds.length > 0 && (
            <button
              onClick={() => {
                haptics.triggerTick();
                onClearSelection();
              }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Deselect
            </button>
          )}
        </div>

        <div className="font-mono text-cyan-400 font-medium">
          {selectedFileIds.length} Selected · {formatBytes(totalSelectedBytes)}
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {filteredFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No files found matching your criteria.
          </div>
        ) : (
          filteredFiles.map((file) => {
            const isSelected = selectedFileIds.includes(file.id);

            return (
              <motion.div
                key={file.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  haptics.triggerTick();
                  onToggleSelectFile(file.id);
                }}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-500/40'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {getCategoryIcon(file.category)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span className="uppercase">{file.extension}</span>
                      <span>·</span>
                      <span>{formatBytes(file.sizeBytes)}</span>
                      <span>·</span>
                      <span>{file.chunksTotal} chunks (16MB)</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected && <CheckSquare className="w-3.5 h-3.5 fill-current" />}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Selected Payload Summary Footer */}
      {selectedFileIds.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Est. 5 GHz Transfer Time:</span>
            <span className="font-mono text-cyan-300 font-bold">~{estimatedSecondsAt80MBps}s</span>
            <span className="text-[10px] text-slate-500">(@ 78 MB/s)</span>
          </div>
        </div>
      )}
    </div>
  );
};
