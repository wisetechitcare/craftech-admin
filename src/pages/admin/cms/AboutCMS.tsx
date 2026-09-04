import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';

import MediaPickerModal from '../../../components/admin/ui/MediaPickerModal';

import { cmsApi } from '../../../services/api';

interface AboutContent {
  aboutTitle: string;
  aboutDescription: string;
  aboutMainImage: string;
  aboutExperienceYears: number;
  aboutQuote: string;
  aboutQuoteAuthor: string;
}

const EMPTY: AboutContent = {
  aboutTitle: '',
  aboutDescription: '',
  aboutMainImage: '',
  aboutExperienceYears: 12,
  aboutQuote: '',
  aboutQuoteAuthor: '',
};

const LABEL = 'block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2';
const INPUT = 'w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm';

/**
 * About content, split out of the old "Hero & Stats" page. It is still stored on
 * the singleton `home` row, so this form sends ONLY its own keys — a partial
 * update that cannot clobber Hero slides or Stats the way round-tripping the
 * whole document did.
 */
export default function AboutCMS() {
  const [data, setData] = useState<AboutContent>(EMPTY);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [picker, setPicker] = useState<boolean>(false);

  useEffect(() => {
    cmsApi.getHome()
      .then(({ data: res }) => {
        const home = res?.data || {};
        setData({
          aboutTitle: home.aboutTitle || '',
          aboutDescription: home.aboutDescription || '',
          aboutMainImage: home.aboutMainImage || '',
          aboutExperienceYears: home.aboutExperienceYears ?? EMPTY.aboutExperienceYears,
          aboutQuote: home.aboutQuote || '',
          aboutQuoteAuthor: home.aboutQuoteAuthor || '',
        });
      })
      .catch(() => toast.error('Failed to load About content'))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await cmsApi.updateHome(data);
      toast.success('About section updated successfully');
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string } } }).response;
      toast.error(res?.data?.message || 'Failed to save About content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-ink-faint" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">About CMS</h2>
        <p className="text-sm text-ink-mute">Content for the About page (/about) and its three layout variants.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-xl p-6 space-y-5">
        <div>
          <label className={LABEL}>About Title</label>
          <input type="text" className={INPUT} value={data.aboutTitle} onChange={(e) => set('aboutTitle', e.target.value)} />
        </div>

        <div>
          <label className={LABEL}>About Description</label>
          <textarea rows={4} className={INPUT} value={data.aboutDescription} onChange={(e) => set('aboutDescription', e.target.value)} />
        </div>

        <div>
          <label className={LABEL}>Main Image</label>
          <div className="flex gap-2">
            <input type="text" placeholder="https://…" className={`${INPUT} flex-1 min-w-0`}
              value={data.aboutMainImage} onChange={(e) => set('aboutMainImage', e.target.value)} />
            <button type="button" onClick={() => setPicker(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-paper border border-line rounded-lg text-xs font-semibold text-ink-mute hover:text-ink hover:border-info">
              <ImageIcon className="w-4 h-4" /> Browse
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={LABEL}>Experience Years</label>
            <input type="number" className={INPUT} value={data.aboutExperienceYears}
              onChange={(e) => set('aboutExperienceYears', Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className={LABEL}>Quote Author</label>
            <input type="text" className={INPUT} value={data.aboutQuoteAuthor} onChange={(e) => set('aboutQuoteAuthor', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Quote</label>
          <textarea rows={2} className={INPUT} value={data.aboutQuote} onChange={(e) => set('aboutQuote', e.target.value)} />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-info text-white font-medium rounded-lg transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>

      <MediaPickerModal open={picker} onClose={() => setPicker(false)} onSelect={(url) => set('aboutMainImage', url)} />
    </div>
  );
}
