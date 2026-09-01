import React, { useState, useEffect } from 'react';
import { contentApi } from '../../../services/api';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Edit2, X, Cog } from 'lucide-react';
import { faIcon } from '../../../utils/faIcon';

export default function ServicesCMS() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    icon: '',
    features: '',
    order: 0,
    active: true
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    setLoading(true);
    contentApi.getServices()
      .then((res: any) => setItems(res.data.data))
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false));
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setFormData({
        _id: item._id,
        title: item.title,
        description: item.description,
        icon: item.icon,
        features: item.features ? item.features.join(', ') : '',
        order: item.order,
        active: item.active
      });
      setIsEditing(true);
    } else {
      setFormData({
        title: '',
        description: '',
        icon: '',
        features: '',
        order: items.length,
        active: true
      });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      features: formData.features.split(',').map((f: string) => f.trim()).filter((f: string) => f)
    };
    try {
      if (isEditing) {
        await contentApi.updateService(formData._id, data);
        toast.success('Service updated');
      } else {
        await contentApi.createService(data);
        toast.success('Service added');
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await contentApi.deleteService(id);
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
          <h2 className="text-xl font-bold text-ink">Domain Specialization</h2>
          <p className="text-sm text-ink-mute">Manage technical services and expertises.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-ok hover:bg-[#0c6543] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Specialization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-paper border border-line rounded-2xl p-6 relative group hover:border-ok/50 transition-all">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => handleOpenModal(item)} className="p-2 bg-raise text-ink-soft rounded-xl hover:bg-line hover:text-ink"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item._id)} className="p-2 bg-danger/10 text-danger rounded-xl hover:bg-danger/10"><Trash2 className="w-4 h-4" /></button>
            </div>

            <div className="flex gap-6">
              <div className="w-16 h-16 bg-ok/10 rounded-2xl flex items-center justify-center text-ok text-3xl font-semibold shrink-0">
                {item.icon ? <i className={`fa-solid ${faIcon(item.icon)}`} /> : <Cog className="w-8 h-8" />}
              </div>
              <div>
                <h4 className="text-lg font-bold text-ink mb-2">{item.title}</h4>
                <p className="text-sm text-ink-mute leading-relaxed mb-4">{item.description}</p>

                {item.features && item.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((f: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-raise/50 text-ink-soft text-[10px] font-bold rounded-md uppercase tracking-wider border border-line">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-line flex justify-between items-center">
               <span className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-widest ${item.active ? 'bg-ok/10 text-ok' : 'bg-raise text-ink-soft-faint'}`}>
                 {item.active ? 'Active' : 'Draft'}
               </span>
               <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">Order: {item.order}</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 backdrop-blur-sm p-4">
          <div className="bg-paper border border-line rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-line flex justify-between items-center bg-raise">
              <h3 className="text-lg font-bold text-ink">{isEditing ? 'Edit Specialization' : 'Add New Specialization'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-ink-mute hover:text-ink p-2 hover:bg-raise rounded-full transition-colors"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-semibold text-ink-mute uppercase tracking-widest mb-2">Title</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-3 bg-paper border border-line rounded-xl text-ink focus:border-ok transition-colors"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-ink-mute uppercase tracking-widest mb-2">FA Icon Class</label>
                  <input
                    type="text" required
                    placeholder="fa-building-shield"
                    className="w-full px-4 py-3 bg-paper border border-line rounded-xl text-ink focus:border-ok transition-colors"
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink-mute uppercase tracking-widest mb-2">Description</label>
                <textarea
                  required rows={3}
                  className="w-full px-4 py-3 bg-paper border border-line rounded-xl text-ink resize-none focus:border-ok transition-colors"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink-mute uppercase tracking-widest mb-2">Key Features (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Structural Engineering, MEP, Turn-key, etc."
                  className="w-full px-4 py-3 bg-paper border border-line rounded-xl text-ink focus:border-ok transition-colors"
                  value={formData.features}
                  onChange={e => setFormData({ ...formData, features: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-semibold text-ink-mute uppercase tracking-widest mb-2">Display Order</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-paper border border-line rounded-xl text-ink focus:border-ok transition-colors"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-end pb-1">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.active}
                          onChange={e => setFormData({ ...formData, active: e.target.checked })}
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${formData.active ? 'bg-ok' : 'bg-raise'}`} />
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.active ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-xs font-bold text-ink-soft">Published</span>
                   </label>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 py-4 bg-ok hover:bg-[#0c6543] text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-500/20">
                  {isEditing ? 'Save Changes' : 'Add Specialization'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-8 py-4 bg-paper hover:bg-raise text-ink-soft font-semibold rounded-2xl transition-all">
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
