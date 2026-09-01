import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Plus, Eye } from 'lucide-react';
import { faqApi } from '../../../services/api';
import toast from 'react-hot-toast';

const FAQManager = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data } = await faqApi.adminList();
      if (data?.success) {
        setFaqs(data.data);
      }
    } catch (err) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await faqApi.remove(id);
      setFaqs(prev => prev.filter(f => f._id !== id));
      setDeleteModal(null);
      toast.success('FAQ deleted');
    } catch (err) {
      toast.error('Failed to delete FAQ');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-ink">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-ink">FAQs</h1>
          <p className="text-ink-mute text-sm mt-2">Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => navigate('/admin/faq/new')}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:shadow-lg hover:shadow-accent/50 transition-all"
        >
          <Plus size={18} /> New FAQ
        </button>
      </div>

      {/* FAQ List */}
      <div className="bg-paper rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Question</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Helpful</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-ink-soft uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {faqs.map((faq) => (
                  <motion.tr
                    key={faq._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-line hover:bg-raise/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-ink truncate max-w-xs">{faq.question}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-navy/30 text-info text-xs font-bold rounded-full">
                        {faq.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                        faq.published ? 'bg-ok/10 text-ok' : 'bg-warn/30 text-warn'
                      }`}>
                        {faq.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-ok font-bold">👍 {faq.helpful?.yes || 0}</span>
                        <span className="text-danger font-bold">👎 {faq.helpful?.no || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/faq/${faq._id}`)}
                          className="p-2 rounded-lg bg-info/10 text-info hover:bg-info/15 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModal(faq._id)}
                          className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/15 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {faqs.length === 0 && (
          <div className="text-center py-12 text-ink-mute">
            <Eye size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">No FAQs yet. Create your first one!</p>
          </div>
        )}
      </div>

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
              <h3 className="text-xl font-semibold text-ink mb-4">Delete FAQ?</h3>
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

export default FAQManager;
