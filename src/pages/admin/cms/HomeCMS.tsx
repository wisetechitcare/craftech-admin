import React, { useState, useEffect } from 'react';
import { cmsApi } from '../../../services/api';
import toast from 'react-hot-toast';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';

export default function HomeCMS() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cmsApi.getHome()
      .then((res: any) => setData(res.data.data))
      .catch(() => toast.error('Failed to load home page data'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await cmsApi.updateHome(data);
      setData(res.data.data);
      toast.success('Home page updated successfully');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const addStat = () => {
    setData((prev: any) => ({ ...prev, stats: [...(prev.stats || []), { label: '', value: '' }] }));
  };

  const removeStat = (index: number) => {
    setData((prev: any) => ({ ...prev, stats: prev.stats.filter((_: any, i: number) => i !== index) }));
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...data.stats];
    newStats[index][field] = value;
    setData((prev: any) => ({ ...prev, stats: newStats }));
  };

  const sectionOptions = [
    { name: 'hero', label: 'Hero Banner' },
    { name: 'stats', label: 'Statistics' },
    { name: 'about', label: 'About Us' },
    { name: 'services', label: 'Services' },
    { name: 'pillars', label: 'Core Pillars' },
    { name: 'process', label: 'Our Process' },
    { name: 'portfolio', label: 'Portfolio' },
    { name: 'videos', label: 'Video Gallery' },
    { name: 'why', label: 'Why Choose Us' },
    { name: 'testimonials', label: 'Testimonials' },
    { name: 'clients', label: 'Our Clients' },
    { name: 'contact', label: 'Contact' },
  ];

  const handleReorderSection = (fromIndex: number, toIndex: number) => {
    const newOrder = [...(data?.sectionOrder || [])];
    const [movedSection] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedSection);
    setData((prev: any) => ({ ...prev, sectionOrder: newOrder }));
  };

  const toggleSectionVisibility = (index: number) => {
    const newOrder = [...(data?.sectionOrder || [])];
    newOrder[index].isVisible = !newOrder[index].isVisible;
    setData((prev: any) => ({ ...prev, sectionOrder: newOrder }));
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-ink-faint" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Home Page CMS</h2>
        <p className="text-sm text-ink-mute">Manage the hero section, statistics, and section visibility/order.</p>
      </div>

      {/* Section Visibility & Order */}
      <div className="bg-paper border border-line rounded-xl p-6">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">Homepage Section Order</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {(data?.sectionOrder || []).map((section: any, idx: number) => (
            <div key={section.sectionName} className="flex items-center gap-3 p-3 bg-raise rounded-lg">
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.isVisible}
                    onChange={() => toggleSectionVisibility(idx)}
                    className="w-4 h-4 rounded border-line"
                  />
                  <span className="text-sm text-ink font-medium">
                    {sectionOptions.find(o => o.name === section.sectionName)?.label || section.sectionName}
                  </span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => idx > 0 && handleReorderSection(idx, idx - 1)}
                  disabled={idx === 0}
                  className="px-2 py-1 bg-raise text-ink-soft-soft text-xs rounded disabled:opacity-30 hover:bg-line hover:text-ink"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => idx < (data?.sectionOrder?.length - 1) && handleReorderSection(idx, idx + 1)}
                  disabled={idx === (data?.sectionOrder?.length - 1)}
                  className="px-2 py-1 bg-raise text-ink-soft-soft text-xs rounded disabled:opacity-30 hover:bg-line hover:text-ink"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-xl p-6 space-y-6">
        <div className="pt-6 border-b border-line pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Hero Slides</h3>
            <button
              type="button"
              onClick={() => setData((prev: any) => ({ ...prev, heroSlides: [...(prev.heroSlides || []), { image: '', title: '', subtitle: '', pos: 'center center' }] }))}
              className="text-xs flex items-center gap-1 text-info hover:text-info"
            >
              <Plus className="w-4 h-4" /> Add Slide
            </button>
          </div>
          <div className="space-y-4">
            {(data?.heroSlides || []).map((slide: any, i: number) => (
              <div key={i} className="bg-raise border border-line rounded-xl p-4 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => setData((prev: any) => ({ ...prev, heroSlides: prev.heroSlides.filter((_: any, idx: number) => idx !== i) }))}
                  className="absolute top-2 right-2 p-1.5 text-ink-faint hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-ink-faint uppercase mb-1">Slide Title (Use comma for accent color)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
                      value={slide.title}
                      onChange={e => {
                        const newSlides = [...data.heroSlides];
                        newSlides[i].title = e.target.value;
                        setData({ ...data, heroSlides: newSlides });
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-ink-faint uppercase mb-1">Slide Subtitle</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
                      value={slide.subtitle}
                      onChange={e => {
                        const newSlides = [...data.heroSlides];
                        newSlides[i].subtitle = e.target.value;
                        setData({ ...data, heroSlides: newSlides });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-faint uppercase mb-1">Image URL</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
                      value={slide.image}
                      onChange={e => {
                        const newSlides = [...data.heroSlides];
                        newSlides[i].image = e.target.value;
                        setData({ ...data, heroSlides: newSlides });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-faint uppercase mb-1">Image Position (e.g. center center)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
                      value={slide.pos}
                      onChange={e => {
                        const newSlides = [...data.heroSlides];
                        newSlides[i].pos = e.target.value;
                        setData({ ...data, heroSlides: newSlides });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 opacity-50 grayscale pointer-events-none">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">Hero Title</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
              value={data?.heroTitle || ''}
              onChange={e => setData({ ...data, heroTitle: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">Hero Subtitle</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
              value={data?.heroSubtitle || ''}
              onChange={e => setData({ ...data, heroSubtitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">CTA Text</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
              value={data?.ctaText || ''}
              onChange={e => setData({ ...data, ctaText: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">CTA Link</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
              value={data?.ctaLink || ''}
              onChange={e => setData({ ...data, ctaLink: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-line">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Statistics</h3>
            <button
              type="button"
              onClick={addStat}
              className="text-xs flex items-center gap-1 text-info hover:text-info"
            >
              <Plus className="w-4 h-4" /> Add Stat
            </button>
          </div>
          <div className="space-y-3">
            {(data?.stats || []).map((stat: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Value (e.g. 50+)"
                  className="w-1/3 px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                  value={stat.value}
                  onChange={e => updateStat(i, 'value', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Label (e.g. Projects Completed)"
                  className="flex-1 px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                  value={stat.label}
                  onChange={e => updateStat(i, 'label', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeStat(i)}
                  className="p-2 text-ink-mute hover:text-danger transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-line">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">About Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">About Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                value={data?.aboutTitle || ''}
                onChange={e => setData({ ...data, aboutTitle: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">About Description</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                value={data?.aboutDescription || ''}
                onChange={e => setData({ ...data, aboutDescription: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">Experience Years</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                value={data?.aboutExperienceYears || 0}
                onChange={e => setData({ ...data, aboutExperienceYears: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">About Quote Author</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                value={data?.aboutQuoteAuthor || ''}
                onChange={e => setData({ ...data, aboutQuoteAuthor: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">About Quote</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                value={data?.aboutQuote || ''}
                onChange={e => setData({ ...data, aboutQuote: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-line">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">SEO Settings</h3>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">Meta Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                value={data?.seo?.metaTitle || ''}
                onChange={e => setData({ ...data, seo: { ...data.seo, metaTitle: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">Meta Description</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink"
                value={data?.seo?.metaDescription || ''}
                onChange={e => setData({ ...data, seo: { ...data.seo, metaDescription: e.target.value } })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a3a6b] hover:bg-[#1d4080] text-white font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
