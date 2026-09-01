import React, { useState, useEffect } from 'react';
import { cmsApi } from '../../../services/api';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Edit2, X } from 'lucide-react';

export default function ProcessCMS() {
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<any>({ number: '', title: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      const res = await cmsApi.getProcessSteps();
      setSteps(res.data.data);
    } catch (err) {
      toast.error('Failed to load steps');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (step: any = { number: '', title: '', description: '' }) => {
    setCurrentStep(step);
    setIsEditing(!!step._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await cmsApi.updateProcessStep(currentStep._id, currentStep);
        toast.success('Step updated');
      } else {
        await cmsApi.createProcessStep(currentStep);
        toast.success('Step created');
      }
      setModalOpen(false);
      fetchSteps();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this step?')) return;
    try {
      await cmsApi.deleteProcessStep(id);
      toast.success('Step deleted');
      fetchSteps();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-ink-faint" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-ink">Process Management</h2>
          <p className="text-sm text-ink-mute">Manage the 4-step technical blueprint.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-info hover:bg-info text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Step
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {steps.map((step) => (
          <div key={step._id} className="bg-paper border border-line rounded-xl p-5 flex justify-between items-center group">
            <div className="flex items-center gap-6">
              <span className="text-3xl font-semibold text-ink group-hover:text-info transition-colors">{step.number}</span>
              <div>
                <h3 className="font-bold text-ink">{step.title}</h3>
                <p className="text-sm text-ink-mute max-w-md">{step.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleOpenModal(step)} className="p-2 text-ink-mute hover:text-ink transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(step._id)} className="p-2 text-ink-mute hover:text-danger transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="bg-paper border border-line rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-line flex justify-between items-center">
              <h3 className="text-lg font-bold text-ink">{isEditing ? 'Edit Step' : 'Add New Step'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-ink-mute hover:text-ink"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-mute uppercase mb-2">Step Number (e.g. 01)</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                  value={currentStep.number}
                  onChange={e => setCurrentStep({ ...currentStep, number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-mute uppercase mb-2">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                  value={currentStep.title}
                  onChange={e => setCurrentStep({ ...currentStep, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-mute uppercase mb-2">Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                  value={currentStep.description}
                  onChange={e => setCurrentStep({ ...currentStep, description: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-info hover:bg-info text-white font-bold rounded-xl transition-all"
                >
                  {isEditing ? 'Save Changes' : 'Create Step'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 bg-paper hover:bg-raise text-ink-soft font-bold rounded-xl transition-all"
                >
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
