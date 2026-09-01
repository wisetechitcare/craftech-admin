import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Eye, Plus } from 'lucide-react';
import { mediaApi } from '../../../services/api';
import toast from 'react-hot-toast';

const MediaLibrary = () => {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: '',
    url: '',
    category: '',
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const { data } = await mediaApi.list({ limit: 200 });
      if (data?.success) {
        setMedia(data.data);
      }
    } catch (err) {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadData.name || !uploadData.url || !uploadData.category) {
      toast.error('Please fill all fields');
      return;
    }

    setUploading(true);
    try {
      // The backend schema requires `type`; the modal only collects image URLs.
      await mediaApi.create({ ...uploadData, type: 'image' });
      toast.success('Media uploaded');
      setUploadModal(false);
      setUploadData({ name: '', url: '', category: '' });
      fetchMedia();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await mediaApi.remove(id);
      setMedia(prev => prev.filter(m => m._id !== id));
      setDeleteModal(null);
      toast.success('Media deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const categories = ['all', ...new Set(media.map(m => m.category))];
  const filteredMedia = selectedCategory === 'all' ? media : media.filter(m => m.category === selectedCategory);

  if (loading) return <div className="flex items-center justify-center h-screen text-ink">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Media Library</h1>
          <p className="text-ink-mute text-sm mt-2">Manage project images and assets</p>
        </div>
        <button
          onClick={() => setUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:shadow-lg hover:shadow-accent/50 transition-all"
        >
          <Plus size={18} /> Upload Media
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all ${
              selectedCategory === cat
                ? 'bg-accent text-white'
                : 'bg-raise text-ink-soft-soft hover:bg-line hover:text-ink'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredMedia.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="group relative rounded-lg overflow-hidden bg-raise aspect-square cursor-pointer"
              onClick={() => setSelectedMedia(item)}
            >
              {item.url && (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMedia(item);
                  }}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-ink"
                >
                  <Eye size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModal(item._id);
                  }}
                  className="p-2 rounded-lg bg-danger/80 hover:bg-danger transition-colors text-white"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-ink text-[0.75rem] font-bold truncate">{item.name}</p>
                <p className="text-accent text-[0.65rem] font-bold uppercase">{item.category}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-20 text-ink-mute">
          <p className="font-medium">No media in this category</p>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-paper rounded-2xl p-8 max-w-md w-full space-y-6"
            >
              <h3 className="text-2xl font-semibold text-ink">Upload Media</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Media name"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-raise border border-line rounded-lg text-ink focus:border-accent focus:outline-none"
                />

                <input
                  type="url"
                  placeholder="Image URL"
                  value={uploadData.url}
                  onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                  className="w-full px-4 py-3 bg-raise border border-line rounded-lg text-ink focus:border-accent focus:outline-none"
                />

                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-raise border border-line rounded-lg text-ink focus:border-accent focus:outline-none"
                >
                  <option value="">Select category</option>
                  {['Kitchen', 'Bedroom', 'Bathroom', 'Living', 'MEP', 'Process', 'Commercial'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setUploadModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-line text-ink-soft font-bold hover:bg-raise transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent text-white font-bold hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {selectedMedia && !deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMedia(null)}
            className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-paper rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-ink/35 text-ink flex items-center justify-center hover:bg-ink/45"
              >
                ✕
              </button>
              <img src={selectedMedia.url} alt={selectedMedia.name} className="w-full h-auto" />
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-ink-mute text-sm">Name</p>
                  <p className="text-ink font-semibold">{selectedMedia.name}</p>
                </div>
                <div>
                  <p className="text-ink-mute text-sm">Category</p>
                  <p className="text-accent font-bold">{selectedMedia.category}</p>
                </div>
                {selectedMedia.description && (
                  <div>
                    <p className="text-ink-mute text-sm">Description</p>
                    <p className="text-ink-soft">{selectedMedia.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-paper rounded-2xl p-8 max-w-sm"
            >
              <h3 className="text-xl font-semibold text-ink mb-4">Delete Media?</h3>
              <p className="text-ink-mute mb-8">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-line text-ink-soft font-bold hover:bg-raise transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal)}
                  className="flex-1 px-4 py-2 rounded-lg bg-danger text-white font-bold hover:bg-danger transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaLibrary;
