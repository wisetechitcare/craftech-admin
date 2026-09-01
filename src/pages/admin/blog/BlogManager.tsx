import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { blogApi } from '../../../services/api';
import AdminLoading from '../../../components/common/AdminLoading';
import { Trash2, Edit, Plus, Eye } from 'lucide-react';

const BlogManager = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await blogApi.adminList();
      setPosts(data.data);
    } catch (err) {
      toast.error('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await blogApi.remove(id);
      toast.success('Blog post deleted');
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-ink">Blog Posts</h1>
        <button
          onClick={() => navigate('/admin/blog/new')}
          className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ink-mute mb-4">No blog posts yet</p>
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger transition-colors"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4"
        >
          {posts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-line hover:border-danger transition-colors"
              style={{ background: '#f6f8fb' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-ink mb-1">{post.title}</h3>
                  <p className="text-sm text-ink-mute mb-2">{post.excerpt}</p>
                  <div className="flex gap-4 text-xs text-ink-faint">
                    <span className="px-2 py-1 bg-raise rounded capitalize">
                      {post.category.replace('-', ' ')}
                    </span>
                    <span>{post.readingTimeMinutes} min read</span>
                    <span>{post.viewCount} views</span>
                    <span>
                      {post.published ? (
                        <span className="text-ok">Published</span>
                      ) : (
                        <span className="text-warn">Draft</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-info hover:bg-info hover:text-white rounded transition-colors"
                    title="View post"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => navigate(`/admin/blog/${post._id}`)}
                    className="p-2 text-info hover:bg-info hover:text-white rounded transition-colors"
                    title="Edit post"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-2 text-danger hover:bg-danger hover:text-white rounded transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default BlogManager;
