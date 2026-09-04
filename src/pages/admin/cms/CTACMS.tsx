import React, { useState, useEffect } from 'react';
import { cmsApi } from '../../../services/api';
import toast from 'react-hot-toast';

const CTACMS = () => {
  const [ctas, setCtas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchCTAs();
  }, []);

  const fetchCTAs = async () => {
    try {
      const res = await cmsApi.getCTAs();
      setCtas(res.data.data || []);
    } catch (err) {
      console.error('Error fetching CTAs:', err);
      toast.error('Failed to load CTAs');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cta: any) => {
    setEditingId(cta._id);
    setEditData(cta);
  };

  const saveEdit = async () => {
    try {
      await cmsApi.updateCTA(editingId as string, editData);
      toast.success('CTA updated successfully');
      setEditingId(null);
      fetchCTAs();
    } catch (err) {
      toast.error('Failed to update CTA');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData({ ...editData, [field]: value });
  };

  // 'hero' is deliberately absent: the Hero CMS edits that same CTA row, next to
  // the copy it sits under and against the Hero's own length limits. Two forms
  // writing one row is how the old duplicate-CTA confusion started.
  const sections = ['services', 'portfolio', 'testimonials', 'contact'];

  if (loading) return <div className="p-8 text-center text-ink">Loading...</div>;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h2 className="text-3xl font-semibold text-ink mb-2">Context-Aware CTAs</h2>
        <p className="text-sm text-ink-mute">Manage call-to-action messaging across different sections</p>
      </div>

      <div className="space-y-6">
        {sections.map(section => {
          const cta = ctas.find(c => c.sectionName === section);
          const isEditing = editingId === cta?._id;

          return (
            <div
              key={section}
              className="rounded-xl p-6 border border-line bg-raise"
            >
              <h3 className="text-lg font-bold text-ink mb-6 capitalize">{section} Section</h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-soft uppercase mb-2">Primary Button Text</label>
                    <input
                      type="text"
                      value={editData.primaryText || ''}
                      onChange={(e) => handleInputChange('primaryText', e.target.value)}
                      className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-soft uppercase mb-2">Primary Action</label>
                      <select
                        value={editData.primaryAction || 'scroll'}
                        onChange={(e) => handleInputChange('primaryAction', e.target.value)}
                        className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
                      >
                        <option value="scroll">Scroll to Section</option>
                        <option value="modal">Open Modal</option>
                        <option value="link">External Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-soft uppercase mb-2">Primary URL</label>
                      <input
                        type="text"
                        value={editData.primaryUrl || ''}
                        onChange={(e) => handleInputChange('primaryUrl', e.target.value)}
                        placeholder="#contact or https://..."
                        className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-ok text-white rounded-lg font-bold text-sm hover:bg-ok"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-raise text-ink-soft rounded-lg font-bold text-sm hover:bg-line hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : cta ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-ink-mute mb-1">Primary Button</p>
                      <p className="text-ink font-medium">{cta.primaryText}</p>
                      <p className="text-xs text-ink-mute mt-1">
                        Action: {cta.primaryAction} → {cta.primaryUrl}
                      </p>
                    </div>
                    <button
                      onClick={() => startEdit(cta)}
                      className="px-4 py-2 bg-raise text-ink-soft rounded-lg font-bold text-sm hover:bg-line hover:text-ink"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-ink-mute text-sm italic">No CTA configured for this section</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CTACMS;
