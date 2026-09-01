import React, { useEffect, useState } from 'react';
import { projectsApi } from '../../services/api';
import {
  Image as ImageIcon, Video, FolderOpen,
  ExternalLink, Loader2, ChevronDown, ChevronUp,
  Search, Grid3x3, LayoutList, X
} from 'lucide-react';

function formatCount(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,38,71,0.45)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: '#f6f8fb', color: '#0A2647' }}
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full object-contain rounded-xl"
        style={{ maxHeight: '90vh', maxWidth: '90vw' }}
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

export default function MediaManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [gridView, setGridView] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    projectsApi.getAll()
      .then((res: any) => {
        setProjects(res.data.data);
        if (res.data.data.length > 0) {
          setExpanded({ [res.data.data[0]._id]: true });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalImages = projects.reduce((s, p) => s + (p.images?.length || 0), 0);
  const totalVideos = projects.reduce((s, p) => s + (p.videos?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#C41B1F' }} />
          <p className="text-sm" style={{ color: '#7386a0' }}>Loading media library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-ink">Media Library</h2>
          <p className="text-sm mt-1" style={{ color: '#7386a0' }}>
            {formatCount(totalImages, 'image', 'images')} · {formatCount(totalVideos, 'video', 'videos')} across {projects.length} projects
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 sm:flex-none sm:w-52"
            style={{ background: '#f6f8fb', border: '1px solid #dfe6ee' }}
          >
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#7386a0' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter projects..."
              className="bg-transparent text-sm text-ink placeholder:text-ink/30 outline-none w-full"
            />
          </div>

          {/* Grid / List toggle */}
          <div
            className="flex items-center rounded-xl p-1 gap-1"
            style={{ background: '#f6f8fb', border: '1px solid #dfe6ee' }}
          >
            <button
              onClick={() => setGridView(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: gridView ? 'rgba(196,27,31,0.2)' : 'transparent',
                color: gridView ? '#C41B1F' : '#7386a0',
              }}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridView(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: !gridView ? 'rgba(196,27,31,0.2)' : 'transparent',
                color: !gridView ? '#C41B1F' : '#7386a0',
              }}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: FolderOpen, label: 'Projects', value: projects.length, color: '#1d5fd0' },
          { icon: ImageIcon, label: 'Images', value: totalImages, color: '#0f7a52' },
          { icon: Video, label: 'Videos', value: totalVideos, color: '#7c3aed' },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: '#ffffff', border: '1px solid #dfe6ee' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}15` }}
            >
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-ink leading-none">{item.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#7386a0' }}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects accordion */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: '#ffffff', border: '1px solid #dfe6ee' }}
          >
            <FolderOpen className="w-10 h-10 mx-auto mb-3" style={{ color: '#9fb0c4' }} />
            <p className="text-sm" style={{ color: '#7386a0' }}>No projects match "{search}"</p>
          </div>
        )}

        {filtered.map(project => {
          const isOpen = !!expanded[project._id];
          const imgCount = project.images?.length || 0;
          const vidCount = project.videos?.length || 0;

          return (
            <div
              key={project._id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#ffffff',
                border: `1px solid ${isOpen ? 'rgba(196,27,31,0.2)' : '#dfe6ee'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(project._id)}
                className="w-full flex items-center gap-4 px-4 sm:px-5 py-4 text-left transition-colors"
                style={{ background: isOpen ? 'rgba(196,27,31,0.04)' : 'transparent' }}
                onMouseEnter={e => !isOpen && (e.currentTarget.style.background = '#9fb0c4')}
                onMouseLeave={e => !isOpen && (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ background: '#f6f8fb' }}
                >
                  {project.thumbnail
                    ? <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <FolderOpen className="w-5 h-5 m-3.5" style={{ color: '#7386a0' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-ink truncate">{project.title}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#7386a0' }}>
                      <ImageIcon className="w-3 h-3" /> {imgCount}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#7386a0' }}>
                      <Video className="w-3 h-3" /> {vidCount}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#f6f8fb', color: '#7386a0' }}
                    >
                      {project.category}
                    </span>
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    background: isOpen ? 'rgba(196,27,31,0.15)' : '#f6f8fb',
                    color: isOpen ? '#C41B1F' : '#7386a0',
                  }}
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div
                  className="px-4 sm:px-5 pb-5 pt-4 space-y-6"
                  style={{ borderTop: '1px solid #dfe6ee' }}
                >
                  {/* Images section */}
                  {imgCount > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ImageIcon className="w-3.5 h-3.5" style={{ color: '#0f7a52' }} />
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7386a0' }}>
                          Images · {imgCount}
                        </p>
                      </div>
                      {gridView ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {project.images.map((url: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => setLightbox(url)}
                              className="aspect-square rounded-xl overflow-hidden relative group"
                              style={{ background: '#f6f8fb' }}
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                style={{ background: 'rgba(10,38,71,0.45)' }}
                              >
                                <ExternalLink className="w-4 h-4 text-ink" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {project.images.map((url: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-2 rounded-xl group"
                              style={{ background: '#f6f8fb' }}
                            >
                              <img
                                src={url}
                                alt=""
                                className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                                style={{ background: '#f6f8fb' }}
                              />
                              <p className="flex-1 text-xs text-ink truncate">{url.split('/').pop()}</p>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                style={{ background: '#f6f8fb', color: '#0A2647' }}
                                onClick={e => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {imgCount === 0 && (
                    <div
                      className="text-center py-6 rounded-xl"
                      style={{ background: '#f6f8fb', border: '1px dashed #dfe6ee' }}
                    >
                      <ImageIcon className="w-6 h-6 mx-auto mb-2" style={{ color: '#9fb0c4' }} />
                      <p className="text-xs" style={{ color: '#7386a0' }}>No images uploaded</p>
                    </div>
                  )}

                  {/* Videos section */}
                  {vidCount > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Video className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} />
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7386a0' }}>
                          Videos · {vidCount}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.videos.map((v: any, i: number) => (
                          <div
                            key={i}
                            className="rounded-2xl overflow-hidden"
                            style={{ background: '#f6f8fb', border: '1px solid #dfe6ee' }}
                          >
                            <div className="aspect-video bg-black">
                              <video src={v.url} className="w-full h-full object-contain" controls />
                            </div>
                            <div
                              className="flex items-center gap-2 px-3 py-2.5"
                              style={{ borderTop: '1px solid #dfe6ee' }}
                            >
                              <Video className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7c3aed' }} />
                              <p className="text-xs font-medium text-ink truncate flex-1">{v.label}</p>
                              <a
                                href={v.url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: '#f6f8fb', color: '#47596e' }}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
