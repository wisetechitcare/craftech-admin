import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Plus, Eye } from 'lucide-react';
import { teamApi } from '../../../services/api';
import toast from 'react-hot-toast';

const TeamManager = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await teamApi.adminList();
      if (data?.success) {
        setTeam(data.data);
      }
    } catch (err) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await teamApi.remove(id);
      setTeam(prev => prev.filter(m => m._id !== id));
      setDeleteModal(null);
      toast.success('Team member deleted');
    } catch (err) {
      toast.error('Failed to delete team member');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-ink">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Team Members</h1>
          <p className="text-ink-mute text-sm mt-2">Manage your team and showcase your expertise</p>
        </div>
        <button
          onClick={() => navigate('/admin/team/new')}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:shadow-lg hover:shadow-accent/50 transition-all"
        >
          <Plus size={18} /> New Member
        </button>
      </div>

      {/* Team List */}
      <div className="bg-paper rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-soft uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-ink-soft uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {team.map((member) => (
                  <motion.tr
                    key={member._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-line hover:bg-raise/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-accent overflow-hidden">
                          {member.image && <img src={member.image} alt={member.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-ink">{member.name}</p>
                          <p className="text-ink-mute text-sm">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-ink-soft">{member.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-navy/30 text-info text-xs font-bold rounded-full">
                        {member.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                        member.active ? 'bg-ok/10 text-ok' : 'bg-danger/10 text-danger'
                      }`}>
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/team/${member._id}`)}
                          className="p-2 rounded-lg bg-info/10 text-info hover:bg-info/15 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModal(member._id)}
                          className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/15 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {team.length === 0 && (
          <div className="text-center py-12 text-ink-mute">
            <Eye size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">No team members yet. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-paper rounded-2xl p-8 max-w-sm"
            >
              <h3 className="text-xl font-semibold text-ink mb-4">Delete Team Member?</h3>
              <p className="text-ink-mute mb-8">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-line text-ink-soft font-bold hover:bg-raise transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal)}
                  className="flex-1 px-4 py-2 rounded-lg bg-danger text-white font-bold hover:bg-danger transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManager;
