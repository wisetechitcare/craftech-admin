import React, { useState, useEffect } from 'react';
import { cmsApi } from '../../../services/api';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Edit2, X, Star } from 'lucide-react';

export default function TestimonialsList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    author: '',
    role: '',
    company: '',
    text: '',
    rating: 5,
    image: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    setLoading(true);
    cmsApi.getTestimonials()
      .then((res: any) => setItems(res.data.data))
      .catch(() => toast.error('Failed to load testimonials'))
      .finally(() => setLoading(false));
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setFormData({
        _id: item._id,
        author: item.author,
        role: item.role,
        company: item.company,
        text: item.text,
        rating: item.rating,
        image: item.image
      });
      setIsEditing(true);
    } else {
      setFormData({
        author: '',
        role: '',
        company: '',
        text: '',
        rating: 5,
        image: ''
      });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await cmsApi.updateTestimonial(formData._id, formData);
        toast.success('Testimonial updated');
      } else {
        await cmsApi.createTestimonial(formData);
        toast.success('Testimonial added');
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await cmsApi.deleteTestimonial(id);
      toast.success('Deleted successfully');
      fetchItems();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-ink-faint" /></div>;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Testimonials</h2>
          <p className="text-sm text-ink-mute">Manage client reviews and industry feedback.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-info hover:bg-info text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item._id} className="bg-paper border border-line rounded-xl p-5 relative group">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => handleOpenModal(item)} className="p-1.5 bg-raise text-ink-soft rounded-lg hover:bg-line hover:text-ink"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/10"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'text-warn fill-yellow-400' : 'text-ink-soft'}`} />
              ))}
            </div>

            <p className="text-sm text-ink-soft italic mb-4">"{item.text}"</p>

            <div className="flex items-center gap-3">
              {item.image ? (
                <img src={item.image} alt={item.author} className="w-10 h-10 rounded-full object-cover bg-raise" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-raise flex items-center justify-center text-ink font-bold">{item.author?.charAt(0)}</div>
              )}
              <div>
                <p className="text-sm font-bold text-ink">{item.author}</p>
                <p className="text-xs text-ink-faint">{item.role} {item.company && `at ${item.company}`}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="bg-paper border border-line rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-line flex justify-between items-center">
              <h3 className="text-lg font-bold text-ink">{isEditing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-ink-mute hover:text-ink"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-mute uppercase mb-2">Author Name</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                    value={formData.author}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-mute uppercase mb-2">Role/Designation</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-mute uppercase mb-2">Company (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-mute uppercase mb-2">Testimonial Text</label>
                <textarea
                  required rows={4}
                  className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink resize-none"
                  value={formData.text}
                  onChange={e => setFormData({ ...formData, text: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-mute uppercase mb-2">Rating (1-5)</label>
                  <select
                    className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-mute uppercase mb-2">Avatar URL (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-info hover:bg-info text-white font-bold rounded-xl transition-all">
                  {isEditing ? 'Save Changes' : 'Add Testimonial'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 bg-paper hover:bg-raise text-ink-soft font-bold rounded-xl transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
