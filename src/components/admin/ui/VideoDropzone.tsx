import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Film, Upload, X, Video } from 'lucide-react';

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface VideoDropzoneProps {
  onSelect?: (file: File) => void;
  onClear?: () => void;
  label?: string;
  hint?: string;
}

export default function VideoDropzone({ onSelect, onClear, label = 'Drop a video here', hint }: VideoDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(f);
    setFile(f);
    setPreview(url);
    if (onSelect) onSelect(f);
  }, [preview, onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] },
    multiple: false,
  });

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (onClear) onClear();
  };

  if (file && preview) {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #dfe6ee', background: '#ffffff' }}
      >
        <div className="relative aspect-video bg-black">
          <video
            src={preview}
            className="w-full h-full object-contain"
            controls
          />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors z-10"
            style={{ background: 'rgba(196,27,31,0.9)', backdropFilter: 'blur(4px)' }}
          >
            <X className="w-4 h-4 text-ink" />
          </button>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderTop: '1px solid #dfe6ee' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(124,58,237,0.12)' }}
          >
            <Film className="w-4 h-4" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink truncate">{file.name}</p>
            <p className="text-[10px]" style={{ color: '#7386a0' }}>{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="text-xs transition-colors flex-shrink-0"
            style={{ color: '#7386a0' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c0271f'}
            onMouseLeave={e => e.currentTarget.style.color = '#7386a0'}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="relative cursor-pointer rounded-2xl transition-all duration-300"
      style={{
        border: `2px dashed ${isDragActive ? '#7c3aed' : '#dfe6ee'}`,
        background: isDragActive ? 'rgba(124,58,237,0.06)' : 'rgba(10,38,71,0.2)',
        boxShadow: isDragActive ? '0 0 0 4px rgba(124,58,237,0.08)' : 'none',
      }}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300"
          style={{
            background: isDragActive ? 'rgba(124,58,237,0.15)' : '#f6f8fb',
            transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {isDragActive
            ? <Upload className="w-6 h-6" style={{ color: '#7c3aed' }} />
            : <Video className="w-6 h-6" style={{ color: '#7386a0' }} />
          }
        </div>
        <p
          className="text-sm font-semibold mb-1 transition-colors"
          style={{ color: isDragActive ? '#7c3aed' : '#0A2647' }}
        >
          {isDragActive ? 'Release to drop video' : label}
        </p>
        <p className="text-xs" style={{ color: '#7386a0' }}>
          or <span style={{ color: '#7c3aed' }}>browse files</span> &nbsp;·&nbsp; MP4, MOV, WebM
        </p>
        {hint && (
          <p className="text-xs mt-1" style={{ color: '#9fb0c4' }}>{hint}</p>
        )}
      </div>
    </div>
  );
}
