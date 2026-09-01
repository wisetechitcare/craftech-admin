import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../../services/api';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, Loader2, Star, MapPin, Calendar,
  Image as ImageIcon, Video, Search, FolderOpen, SlidersHorizontal
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Structural Evolution':  { bg: 'rgba(29,95,208,0.12)', text: '#1d5fd0', border: 'rgba(29,95,208,0.2)' },
  'Luxury Fit-Out':        { bg: 'rgba(168,106,0,0.12)',  text: '#a86a00', border: 'rgba(168,106,0,0.2)' },
  'Architecture & MEP':    { bg: 'rgba(15,122,82,0.12)',  text: '#0f7a52', border: 'rgba(15,122,82,0.2)' },
  'Building Construction': { bg: 'rgba(29,95,208,0.12)',  text: '#1d5fd0', border: 'rgba(29,95,208,0.2)' },
  'Interior Fit Outs':     { bg: 'rgba(168,106,0,0.12)',  text: '#a86a00', border: 'rgba(168,106,0,0.2)' },
  'MEP Execution':         { bg: 'rgba(15,122,82,0.12)',  text: '#0f7a52', border: 'rgba(15,122,82,0.2)' },
  'Project Management':    { bg: 'rgba(196,27,31,0.12)',   text: '#c0271f', border: 'rgba(196,27,31,0.2)' },
};

const CATEGORIES_ALL = ['All', ...Object.keys(CATEGORY_COLORS)];

function CategoryBadge({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] || { bg: '#f6f8fb', text: '#47596e', border: '#dfe6ee' };
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {category}
    </span>
  );
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchProjects = () => {
    setLoading(true);
    projectsApi.getAll()
      .then((res: any) => setProjects(res.data.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectsApi.delete(deleteTarget._id);
      toast.success('Project and all media deleted');
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-ink">Projects</h2>
          <p className="text-sm mt-0.5" style={{ color: '#7386a0' }}>
            {projects.length} total project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #C41B1F 0%, #8b0000 100%)',
            boxShadow: '0 2px 8px rgba(196,27,31,0.18)',
          }}
        >
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1"
          style={{ background: '#f6f8fb', border: '1px solid #dfe6ee' }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#7386a0' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or client..."
            className="bg-transparent text-sm text-ink placeholder:text-ink/30 outline-none flex-1"
          />
        </div>

        {/* Category filter */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: '#f6f8fb', border: '1px solid #dfe6ee' }}
        >
          <SlidersHorizontal className="w-4 h-4 flex-shrink-0" style={{ color: '#7386a0' }} />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-transparent text-sm text-ink outline-none cursor-pointer"
            style={{ color: categoryFilter === 'All' ? '#47596e' : '#fff' }}
          >
            {CATEGORIES_ALL.map(c => (
              <option key={c} style={{ background: '#f2f5f8' }}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-56">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#C41B1F' }} />
            <p className="text-sm" style={{ color: '#7386a0' }}>Loading projects...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ background: '#ffffff', border: '1px dashed #dfe6ee' }}
        >
          <FolderOpen className="w-12 h-12 mx-auto mb-4" style={{ color: '#9fb0c4' }} />
          <p className="text-ink font-semibold mb-1">
            {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
          </p>
          <p className="text-sm mb-5" style={{ color: '#7386a0' }}>
            {projects.length === 0 ? 'Add your first construction project.' : 'Try adjusting search or category.'}
          </p>
          {projects.length === 0 && (
            <Link
              to="/admin/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #C41B1F 0%, #8b0000 100%)' }}
            >
              <Plus className="w-4 h-4" /> Create First Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p._id}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: '#ffffff',
                border: '1px solid #dfe6ee',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(196,27,31,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#dfe6ee'}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden" style={{ background: '#f6f8fb' }}>
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="w-10 h-10" style={{ color: '#9fb0c4' }} />
                  </div>
                )}
                {/* Featured badge */}
                {p.featured && (
                  <div
                    className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(168,106,0,0.9)', backdropFilter: 'blur(4px)' }}
                  >
                    <Star className="w-2.5 h-2.5 text-ink fill-white" />
                    <span className="text-[10px] font-bold text-ink">Featured</span>
                  </div>
                )}
                {/* Overlay actions */}
                <div
                  className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(10,38,71,0.45)', backdropFilter: 'blur(4px)' }}
                >
                  <Link
                    to={`/admin/projects/${p._id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink transition-colors"
                    style={{ background: 'rgba(196,27,31,0.9)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                    style={{ background: '#f6f8fb', color: '#c0271f' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-ink leading-snug line-clamp-2 flex-1">{p.title}</h3>
                  </div>
                  <CategoryBadge category={p.category} />
                </div>

                <div className="flex items-center gap-3 text-xs" style={{ color: '#7386a0' }}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {p.year}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {p.location}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between pt-2"
                  style={{ borderTop: '1px solid #dfe6ee' }}
                >
                  <div className="flex items-center gap-3 text-xs" style={{ color: '#7386a0' }}>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> {p.images?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" /> {p.videos?.length || 0}
                    </span>
                    <span style={{ color: '#9fb0c4' }}>{p.client}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/admin/projects/${p._id}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: '#f6f8fb', color: '#47596e' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,27,31,0.15)'; e.currentTarget.style.color = '#C41B1F'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#9fb0c4'; e.currentTarget.style.color = '#47596e'; }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: '#f6f8fb', color: '#47596e' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,27,31,0.15)'; e.currentTarget.style.color = '#c0271f'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#9fb0c4'; e.currentTarget.style.color = '#47596e'; }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Project"
        message={`This will permanently delete "${deleteTarget?.title}" and ALL associated images and videos from Cloudinary. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
