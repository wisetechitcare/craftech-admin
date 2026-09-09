import React, { useEffect, useState } from 'react';
import { X, ImageOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { mediaApi } from '../../../services/api';

interface MediaAsset {
  _id: string;
  name: string;
  url: string;
  category?: string;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

/**
 * Picks an existing image URL out of the Media Library. Deliberately read-only:
 * uploading stays on the Media Library page, so this stays a thin reuse of the
 * media list rather than a second asset-management surface.
 */
export default function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    mediaApi
      .list({ type: 'image', limit: 100 })
      .then(({ data }) => setAssets(data?.data || []))
      .catch(() => toast.error('Failed to load the media library'))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40">
      <div className="w-full max-w-3xl max-h-[80vh] flex flex-col bg-paper border border-line rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h3 className="text-sm font-bold text-ink">Media Library</h3>
            <p className="text-[11px] text-ink-mute">Pick an image, or close and paste a URL instead.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-mute hover:text-ink hover:bg-raise">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-ink-faint" /></div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-ink-faint">
              <ImageOff className="w-6 h-6" />
              <p className="text-xs">No images in the library yet. Add them under Media Library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {assets.map((asset) => (
                <button
                  key={asset._id}
                  type="button"
                  onClick={() => { onSelect(asset.url); onClose(); }}
                  className="group text-left rounded-lg overflow-hidden border border-line hover:border-info transition-colors"
                >
                  <img src={asset.url} alt={asset.name} loading="lazy"
                    className="w-full h-24 object-cover bg-raise" />
                  <p className="px-2 py-1.5 text-[11px] text-ink truncate">{asset.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
