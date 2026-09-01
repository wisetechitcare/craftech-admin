import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { blogApi } from '../../../services/api';
import AdminLoading from '../../../components/common/AdminLoading';
import { ArrowLeft } from 'lucide-react';

const BlogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>({
    title: '',
    excerpt: '',
    content: '',
    category: 'interior-design',
    featuredImage: '',
    featuredImageAlt: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    tags: [],
    published: false,
  });

  const categories = [
    'interior-design',
    'mep-systems',
    'construction',
    'home-improvement',
    'design-tips',
    'case-study',
  ];

  useEffect(() => {
    if (!isNew) {
      fetchPost();
    }
  }, [id, isNew]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data } = await blogApi.adminGetById(id!);
      const post = data.data;
      if (post) {
        setForm({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          category: post.category || 'interior-design',
          featuredImage: post.featuredImage || '',
          featuredImageAlt: post.featuredImageAlt || '',
          metaTitle: post.metaTitle || '',
          metaDescription: post.metaDescription || '',
          keywords: post.keywords || [],
          tags: post.tags || [],
          published: post.published || false,
        });
      }
    } catch (err) {
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;
    setForm((prev: any) => ({
      ...prev,
      [field]: value.split(',').map(v => v.trim()).filter(v => v),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!form.excerpt.trim() || form.excerpt.length < 50) {
      toast.error('Excerpt must be at least 50 characters');
      return;
    }

    if (!form.content.trim() || form.content.length < 300) {
      toast.error('Content must be at least 300 characters');
      return;
    }

    if (!form.featuredImage.trim()) {
      toast.error('Featured image is required');
      return;
    }

    try {
      setSubmitting(true);
      // Omit optional string fields that are empty — the backend schema requires a
      // minimum length on metaTitle/metaDescription, so '' would fail validation.
      const payload: any = { ...form };
      ['metaTitle', 'metaDescription', 'featuredImageAlt'].forEach((k) => {
        if (!payload[k]?.trim()) delete payload[k];
      });

      if (isNew) {
        await blogApi.create(payload);
        toast.success('Blog post created successfully');
      } else {
        await blogApi.update(id!, payload);
        toast.success('Blog post updated successfully');
      }
      navigate('/admin/blog');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save blog post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <button
        onClick={() => navigate('/admin/blog')}
        className="flex items-center gap-2 text-ink-mute hover:text-ink transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </button>

      <h1 className="text-3xl font-bold text-ink">
        {isNew ? 'Create New Post' : 'Edit Post'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter blog post title"
            maxLength={120}
            className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors"
          />
          <p className="text-xs text-ink-faint mt-1">
            {form.title.length}/120
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            Category *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            Excerpt (50-200 chars) *
          </label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            placeholder="Brief summary of the post"
            maxLength={200}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors resize-none"
          />
          <p className="text-xs text-ink-faint mt-1">
            {form.excerpt.length}/200
          </p>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            Featured Image URL *
          </label>
          <input
            type="url"
            name="featuredImage"
            value={form.featuredImage}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors"
          />
          {form.featuredImage && (
            <img
              src={form.featuredImage}
              alt="Preview"
              className="mt-2 max-h-48 rounded-lg"
              onError={() => toast.error('Invalid image URL')}
            />
          )}
        </div>

        {/* Featured Image Alt */}
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            Featured Image Alt Text
          </label>
          <input
            type="text"
            name="featuredImageAlt"
            value={form.featuredImageAlt}
            onChange={handleChange}
            placeholder="Alt text for accessibility"
            className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            Content (min 300 chars) *
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Write your blog post content here. Supports plain text with line breaks."
            rows={12}
            className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors resize-none font-mono text-sm"
          />
          <p className="text-xs text-ink-faint mt-1">
            {form.content.length} characters
          </p>
        </div>

        {/* SEO Fields */}
        <div className="border-t border-line pt-6">
          <h3 className="text-lg font-bold text-ink mb-4">SEO Optimization</h3>

          <div>
            <label className="block text-sm font-medium text-ink-soft mb-2">
              Meta Title (30-60 chars)
            </label>
            <input
              type="text"
              name="metaTitle"
              value={form.metaTitle}
              onChange={handleChange}
              placeholder="SEO title"
              maxLength={60}
              className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors"
            />
            <p className="text-xs text-ink-faint mt-1">
              {form.metaTitle.length}/60
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-ink-soft mb-2">
              Meta Description (100-160 chars)
            </label>
            <textarea
              name="metaDescription"
              value={form.metaDescription}
              onChange={handleChange}
              placeholder="Meta description for search engines"
              maxLength={160}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors resize-none"
            />
            <p className="text-xs text-ink-faint mt-1">
              {form.metaDescription.length}/160
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-ink-soft mb-2">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={form.keywords.join(', ')}
              onChange={(e) => handleArrayChange(e, 'keywords')}
              placeholder="keyword1, keyword2, keyword3"
              className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-ink-soft mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={form.tags.join(', ')}
              onChange={(e) => handleArrayChange(e, 'tags')}
              placeholder="tag1, tag2, tag3"
              className="w-full px-4 py-2 rounded-lg bg-raise text-ink-soft border border-line focus:border-danger outline-none transition-colors"
            />
          </div>
        </div>

        {/* Publishing */}
        <div className="border-t border-line pt-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              className="w-4 h-4 rounded border-line text-danger focus:ring-red-600"
            />
            <span className="text-sm font-medium text-ink-soft">
              Publish this post
            </span>
          </label>
          {!form.published && (
            <p className="text-xs text-ink-faint mt-2">
              Post will be saved as a draft
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-danger text-white font-bold rounded-lg hover:bg-danger disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : isNew ? 'Create Post' : 'Update Post'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className="flex-1 px-6 py-3 bg-raise text-ink-soft font-bold rounded-lg hover:bg-line hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BlogForm;
