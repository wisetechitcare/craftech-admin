import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';

import { cmsApi } from '../../../services/api';

interface Stat {
  label: string;
  value: string;
}

const INPUT = 'px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm';

/**
 * The homepage metrics counters, split out of the old "Hero & Stats" page.
 * Like About, this still lives on the singleton `home` row and sends only its
 * own key, so saving stats cannot overwrite Hero or About content.
 */
export default function StatsCMS() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    cmsApi.getHome()
      .then(({ data: res }) => setStats(res?.data?.stats || []))
      .catch(() => toast.error('Failed to load statistics'))
      .finally(() => setLoading(false));
  }, []);

  const update = (index: number, key: keyof Stat, value: string) =>
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await cmsApi.updateHome({ stats });
      toast.success('Statistics updated successfully');
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string } } }).response;
      toast.error(res?.data?.message || 'Failed to save statistics');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-ink-faint" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Statistics</h2>
        <p className="text-sm text-ink-mute">
          The animated counters below the Hero. The value is counted up from zero, so it should start with a number.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Metrics</h3>
          <button type="button" onClick={() => setStats((prev) => [...prev, { label: '', value: '' }])}
            className="text-xs flex items-center gap-1 text-info">
            <Plus className="w-4 h-4" /> Add Stat
          </button>
        </div>

        {stats.length === 0 && <p className="text-sm text-ink-mute">No statistics yet — the website falls back to its defaults.</p>}

        <div className="space-y-3">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="text" placeholder="Value (e.g. 25)" className={`${INPUT} w-1/3`}
                value={stat.value} onChange={(e) => update(i, 'value', e.target.value)} />
              <input type="text" placeholder="Label (e.g. Projects Executed)" className={`${INPUT} flex-1`}
                value={stat.label} onChange={(e) => update(i, 'label', e.target.value)} />
              <button type="button" aria-label={`Remove stat ${i + 1}`}
                onClick={() => setStats((prev) => prev.filter((_, idx) => idx !== i))}
                className="p-2 text-ink-mute hover:text-danger transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-info text-white font-medium rounded-lg transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
