import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { projectsApi, uploadApi } from '../../../services/api';
import ImageDropzone from '../../../components/admin/ui/ImageDropzone';
import VideoDropzone from '../../../components/admin/ui/VideoDropzone';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import toast from 'react-hot-toast';
import {
  Save, ArrowLeft, Loader2, Trash2, Upload, Star,
  Film, Image as ImageIcon, ImagePlus,
} from 'lucide-react';

const CATEGORIES = [
  'Structural Evolution', 'Luxury Fit-Out', 'Architecture & MEP',
  'Building Construction', 'Interior Fit Outs', 'MEP Execution', 'Project Management',
];

const slugify = (str: string) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/* ── Thumbnail dropzone (single image, inline) ──────────────────────── */
function ThumbnailDropzone({ currentUrl, onDrop: onDropProp }: { currentUrl?: string; onDrop: (file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(f);
    setPreview(url);
    onDropProp(f);
  }, [preview, onDropProp]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: false,
  });

  const displayed = preview || currentUrl;

  return (
    <div
      {...getRootProps()}
      className="relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 group"
      style={{
        aspectRatio: '4/3',
        border: `2px dashed ${isDragActive ? '#C41B1F' : displayed ? 'transparent' : '#9fb0c4'}`,
        background: displayed ? 'transparent' : isDragActive ? 'rgba(196,27,31,0.06)' : 'rgba(10,38,71,0.25)',
        boxShadow: isDragActive ? '0 0 0 4px rgba(196,27,31,0.1)' : 'none',
      }}
    >
      <input {...getInputProps()} />
      {displayed ? (
        <>
          <img src={displayed} alt="Thumbnail" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(10,38,71,0.45)', backdropFilter: 'blur(4px)' }}
          >
            <ImagePlus className="w-8 h-8 text-ink mb-2" />
            <p className="text-sm font-semibold text-ink">Change Thumbnail</p>
            <p className="text-xs mt-1" style={{ color: '#47596e' }}>Drop or click to replace</p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: isDragActive ? 'rgba(196,27,31,0.15)' : '#f6f8fb' }}
          >
            <ImageIcon className="w-5 h-5" style={{ color: isDragActive ? '#C41B1F' : '#7386a0' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: isDragActive ? '#C41B1F' : '#47596e' }}>
            {isDragActive ? 'Drop thumbnail' : 'Drag & drop thumbnail'}
          </p>
          <p className="text-xs mt-1" style={{ color: '#7386a0' }}>or click to browse</p>
        </div>
      )}
    </div>
  );
}

/* ── Section card ───────────────────────────────────────────────────── */
function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid #dfe6ee',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #dfe6ee' }}
      >
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Field helpers ──────────────────────────────────────────────────── */
const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid #dfe6ee',
  background: '#ffffff',
  color: '#0A2647',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color .2s',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#7386a0' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState<any>({
    title: '', category: CATEGORIES[0], description: '',
    client: '', year: new Date().getFullYear(), location: '',
    thumbnail: '', featured: false, order: 0,
  });
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImage, setDeletingImage] = useState<number | null>(null);

  const [videoLabel, setVideoLabel] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      projectsApi.getById(id!)
        .then((res: any) => {
          const p = res.data.data;
          setProject(p);
          setForm({
            title: p.title, category: p.category, description: p.description,
            client: p.client, year: p.year, location: p.location,
            thumbnail: p.thumbnail, featured: p.featured, order: p.order,
          });
        })
        .catch(() => { toast.error('Project not found'); navigate('/admin/projects'); })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const res = await projectsApi.create(form);
        toast.success('Project created!');
        navigate(`/admin/projects/${res.data.data._id}`);
      } else {
        await projectsApi.update(id!, form);
        toast.success('Project saved!');
        setProject((prev: any) => ({ ...prev, ...form }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleThumbUpload = async () => {
    if (!thumbFile || !project?.slug) return;
    setUploadingThumb(true);
    try {
      const fd = new FormData();
      fd.append('thumbnail', thumbFile);
      const res = await uploadApi.thumbnail(project.slug, fd);
      const { url, publicId } = res.data.data;
      await projectsApi.update(id!, { thumbnail: url, thumbnailPublicId: publicId });
      setForm((prev: any) => ({ ...prev, thumbnail: url }));
      setProject((prev: any) => ({ ...prev, thumbnail: url }));
      setThumbFile(null);
      toast.success('Thumbnail updated');
    } catch {
      toast.error('Thumbnail upload failed');
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleImagesUpload = async (files: File[]) => {
    if (!project?.slug) return;
    setUploadingImages(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const res = await uploadApi.images(project.slug, fd);
      const uploaded = res.data.data;
      await projectsApi.addImages(id!, {
        urls: uploaded.map((u: any) => u.url),
        publicIds: uploaded.map((u: any) => u.publicId),
      });
      const updated = await projectsApi.getById(id!);
      setProject(updated.data.data);
      toast.success(`${files.length} image(s) uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageDelete = async (index: number) => {
    setDeletingImage(index);
    try {
      await projectsApi.removeImage(id!, index);
      const updated = await projectsApi.getById(id!);
      setProject(updated.data.data);
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    } finally {
      setDeletingImage(null);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !videoLabel.trim() || !project?.slug) return;
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append('video', videoFile);
      const res = await uploadApi.video(project.slug, fd);
      const { url, publicId } = res.data.data;
      await projectsApi.addVideo(id!, { label: videoLabel.trim(), url, publicId });
      const updated = await projectsApi.getById(id!);
      setProject(updated.data.data);
      setVideoLabel('');
      setVideoFile(null);
      toast.success('Video uploaded');
    } catch {
      toast.error('Video upload failed');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleVideoDelete = async (videoId: string) => {
    setDeletingVideo(videoId);
    try {
      await projectsApi.removeVideo(id!, videoId);
      setProject((prev: any) => ({ ...prev, videos: prev.videos.filter((v: any) => v._id !== videoId) }));
      toast.success('Video removed');
    } catch {
      toast.error('Failed to remove video');
    } finally {
      setDeletingVideo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#C41B1F' }} />
          <p className="text-sm" style={{ color: '#7386a0' }}>Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/projects')}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: '#f6f8fb', border: '1px solid #dfe6ee', color: '#47596e' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#9fb0c4'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#9fb0c4'; e.currentTarget.style.color = '#47596e'; }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-ink">{isNew ? 'New Project' : (form.title || 'Edit Project')}</h2>
          {!isNew && (
            <p className="text-xs mt-0.5" style={{ color: '#7386a0' }}>
              /{slugify(form.title)}
            </p>
          )}
        </div>
      </div>

      {/* Desktop: two-column; Mobile: single column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left — thumbnail (xl only) */}
        {!isNew && (
          <div className="xl:col-span-1 space-y-4">
            <SectionCard
              title="Thumbnail"
              action={
                thumbFile && (
                  <button
                    type="button"
                    onClick={handleThumbUpload}
                    disabled={uploadingThumb}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    style={{ background: 'rgba(196,27,31,0.15)', color: '#C41B1F', border: '1px solid rgba(196,27,31,0.25)' }}
                  >
                    {uploadingThumb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploadingThumb ? 'Uploading...' : 'Save'}
                  </button>
                )
              }
            >
              <ThumbnailDropzone
                currentUrl={project?.thumbnail}
                onDrop={(f) => setThumbFile(f)}
              />
              {thumbFile && (
                <p className="text-xs text-center mt-2" style={{ color: '#7386a0' }}>
                  New thumbnail selected — click Save to upload.
                </p>
              )}
            </SectionCard>
          </div>
        )}

        {/* Right — project details form */}
        <div className={isNew ? 'xl:col-span-3' : 'xl:col-span-2'}>
          <form onSubmit={handleSubmit}>
            <SectionCard
              title="Project Details"
              action={
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #C41B1F 0%, #8b0000 100%)',
                    boxShadow: '0 2px 8px rgba(196,27,31,0.18)',
                  }}
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? 'Saving...' : (isNew ? 'Create Project' : 'Save Changes')}
                </button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Title *">
                  <input
                    style={fieldStyle}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. Luxury Tower Dubai"
                    onFocus={e => e.target.style.borderColor = 'rgba(196,27,31,0.5)'}
                    onBlur={e => e.target.style.borderColor = '#dfe6ee'}
                    className="sm:col-span-2"
                  />
                </Field>

                <Field label="Category *">
                  <select
                    style={{ ...fieldStyle, cursor: 'pointer' }}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'rgba(196,27,31,0.5)'}
                    onBlur={e => e.target.style.borderColor = '#dfe6ee'}
                  >
                    {CATEGORIES.map((c) => <option key={c} style={{ background: '#f2f5f8' }}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Client *">
                  <input
                    style={fieldStyle}
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    required
                    placeholder="Client name"
                    onFocus={e => e.target.style.borderColor = 'rgba(196,27,31,0.5)'}
                    onBlur={e => e.target.style.borderColor = '#dfe6ee'}
                  />
                </Field>

                <Field label="Year *">
                  <input
                    type="number"
                    style={fieldStyle}
                    min="2000" max="2100"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    required
                    onFocus={e => e.target.style.borderColor = 'rgba(196,27,31,0.5)'}
                    onBlur={e => e.target.style.borderColor = '#dfe6ee'}
                  />
                </Field>

                <Field label="Location *">
                  <input
                    style={fieldStyle}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                    placeholder="City, Country"
                    onFocus={e => e.target.style.borderColor = 'rgba(196,27,31,0.5)'}
                    onBlur={e => e.target.style.borderColor = '#dfe6ee'}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Description *">
                    <textarea
                      style={{ ...fieldStyle, minHeight: '110px', resize: 'vertical' }}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                      placeholder="Describe the project scope, materials, and outcomes..."
                      onFocus={e => e.target.style.borderColor = 'rgba(196,27,31,0.5)'}
                      onBlur={e => e.target.style.borderColor = '#dfe6ee'}
                    />
                  </Field>
                </div>

                {isNew && (
                  <div className="sm:col-span-2">
                    <Field label="Initial Thumbnail URL">
                      <input
                        style={fieldStyle}
                        placeholder="https://res.cloudinary.com/... (optional, upload after creating)"
                        value={form.thumbnail}
                        onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                        onFocus={e => e.target.style.borderColor = 'rgba(196,27,31,0.5)'}
                        onBlur={e => e.target.style.borderColor = '#dfe6ee'}
                      />
                      <p className="text-xs mt-1.5" style={{ color: '#7386a0' }}>
                        You can drag & drop a thumbnail after creating the project.
                      </p>
                    </Field>
                  </div>
                )}

                {/* Featured toggle */}
                <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, featured: !form.featured })}
                    className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                    style={{
                      background: form.featured
                        ? 'linear-gradient(135deg, #a86a00 0%, #b8962e 100%)'
                        : '#9fb0c4',
                    }}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow"
                      style={{ left: form.featured ? '26px' : '4px' }}
                    />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4" style={{ color: form.featured ? '#a86a00' : '#7386a0', fill: form.featured ? '#a86a00' : 'none' }} />
                    <span className="text-sm font-medium" style={{ color: form.featured ? '#a86a00' : '#47596e' }}>
                      Featured project
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </form>
        </div>
      </div>

      {/* Thumbnail on mobile (when editing) */}
      {!isNew && (
        <div className="xl:hidden">
          <SectionCard
            title="Thumbnail"
            action={
              thumbFile && (
                <button
                  type="button"
                  onClick={handleThumbUpload}
                  disabled={uploadingThumb}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  style={{ background: 'rgba(196,27,31,0.15)', color: '#C41B1F', border: '1px solid rgba(196,27,31,0.25)' }}
                >
                  {uploadingThumb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploadingThumb ? 'Uploading...' : 'Save Thumbnail'}
                </button>
              )
            }
          >
            <div className="max-w-sm">
              <ThumbnailDropzone
                currentUrl={project?.thumbnail}
                onDrop={(f) => setThumbFile(f)}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* Gallery Images */}
      {!isNew && (
        <SectionCard
          title={`Gallery Images (${project?.images?.length || 0})`}
          action={
            <span className="text-xs" style={{ color: '#7386a0' }}>
              Drag & drop multiple images
            </span>
          }
        >
          <div className="space-y-5">
            <ImageDropzone
              onUpload={handleImagesUpload}
              uploading={uploadingImages}
              label="Drop project images here"
              multiple
            />

            {project?.images?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#7386a0' }}>
                  Uploaded · {project.images.length} files
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                  {project.images.map((url: string, i: number) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                      style={{ background: '#f6f8fb' }}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(10,38,71,0.45)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(i)}
                        disabled={deletingImage === i}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        style={{ background: 'rgba(196,27,31,0.9)' }}
                      >
                        {deletingImage === i
                          ? <Loader2 className="w-3 h-3 animate-spin text-ink" />
                          : <Trash2 className="w-3 h-3 text-ink" />
                        }
                      </button>
                      <span
                        className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                        style={{ background: 'rgba(10,38,71,0.45)', color: '#0A2647' }}
                      >
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Videos */}
      {!isNew && (
        <SectionCard title={`Videos (${project?.videos?.length || 0})`}>
          <div className="space-y-5">
            {/* Upload new video */}
            <div
              className="rounded-xl p-4 space-y-4"
              style={{ background: '#ffffff', border: '1px solid #dfe6ee' }}
            >
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7386a0' }}>
                Upload New Video
              </p>

              <Field label="Video Label *">
                <input
                  style={fieldStyle}
                  placeholder="e.g. Project Walkthrough, Site Aerial"
                  value={videoLabel}
                  onChange={(e) => setVideoLabel(e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                  onBlur={e => e.target.style.borderColor = '#dfe6ee'}
                />
              </Field>

              <VideoDropzone
                onSelect={(f: File) => setVideoFile(f)}
                onClear={() => setVideoFile(null)}
                label="Drop project video here"
                hint="MP4, MOV, WebM · Max recommended 200MB"
              />

              {videoFile && videoLabel.trim() && (
                <button
                  type="button"
                  onClick={handleVideoUpload}
                  disabled={uploadingVideo}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                  }}
                >
                  {uploadingVideo
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                    : <><Film className="w-4 h-4" /> Upload Video</>
                  }
                </button>
              )}
            </div>

            {/* Existing videos list */}
            {project?.videos?.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7386a0' }}>
                  Uploaded videos
                </p>
                {project.videos.map((v: any) => (
                  <div
                    key={v._id}
                    className="rounded-xl overflow-hidden"
                    style={{ background: '#f6f8fb', border: '1px solid #dfe6ee' }}
                  >
                    <div className="aspect-video bg-black">
                      <video src={v.url} className="w-full h-full object-contain" controls />
                    </div>
                    <div
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderTop: '1px solid #dfe6ee' }}
                    >
                      <Film className="w-4 h-4 flex-shrink-0" style={{ color: '#7c3aed' }} />
                      <p className="flex-1 text-sm font-medium text-ink truncate">{v.label}</p>
                      <button
                        type="button"
                        onClick={() => handleVideoDelete(v._id)}
                        disabled={deletingVideo === v._id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50"
                        style={{ background: 'rgba(196,27,31,0.12)', border: '1px solid rgba(196,27,31,0.2)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,27,31,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(196,27,31,0.12)'}
                      >
                        {deletingVideo === v._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#c0271f' }} />
                          : <Trash2 className="w-3.5 h-3.5" style={{ color: '#c0271f' }} />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
