import React, { useEffect, useState } from 'react';
import { cmsApi } from '../../services/api';
import AdminLoading from '../../components/common/AdminLoading';

const LeadsCRM = () => {
  const [leads, setLeads] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const statuses = ['new', 'contacted', 'quoted', 'negotiating', 'booked', 'rejected'];

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await cmsApi.getLeadsByStatus();
      setLeads(res.data.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await cmsApi.updateLead(leadId, { status: newStatus });
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead');
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      await cmsApi.updateLead(leadId, { notes });
      setEditingId(null);
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead:', err);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-navy mb-2">Lead Management</h1>
        <p className="text-mid text-sm">Manage your sales pipeline in real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {statuses.map(status => (
          <div key={status} className="bg-white p-4 rounded-lg border border-line">
            <div className="text-2xl font-semibold text-navy">{leads[status]?.length || 0}</div>
            <div className="text-xs font-bold text-mid uppercase tracking-[0.18em]">{status}</div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 overflow-x-auto pb-4">
        {statuses.map(status => (
          <div key={status} className="bg-gray-50 rounded-xl p-4 min-w-[300px] md:min-w-0">
            <h3 className="font-bold text-navy mb-4 capitalize text-sm sticky top-0 bg-gray-50 pb-2">
              {status}
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {leads[status]?.map((lead: any) => (
                <div
                  key={lead._id}
                  className="bg-white p-3 rounded-lg border-l-4 border-navy shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="font-bold text-navy text-sm">{lead.name}</div>
                  <div className="text-xs text-mid mt-1">{lead.email}</div>
                  <div className="text-xs text-mid">{lead.phone}</div>
                  {lead.projectType && (
                    <div className="text-xs bg-blue-50 text-info rounded px-2 py-1 mt-2 w-fit">
                      {lead.projectType}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 bg-ink/35 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-navy">{selectedLead.name}</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-xl text-mid hover:text-navy"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-mid uppercase mb-1">Email</div>
                  <div className="text-sm text-navy">{selectedLead.email}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-mid uppercase mb-1">Phone</div>
                  <div className="text-sm text-navy">{selectedLead.phone}</div>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-mid uppercase mb-1">Project Type</div>
                  <div className="text-sm text-navy">{selectedLead.projectType || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-mid uppercase mb-1">Budget</div>
                  <div className="text-sm text-navy">{selectedLead.budget || 'Not specified'}</div>
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="text-xs font-bold text-mid uppercase mb-2">Message</div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-navy">{selectedLead.message}</div>
              </div>

              {/* Status & Assignment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-mid uppercase mb-2">Status</div>
                  <select
                    value={selectedLead.status}
                    onChange={e => {
                      updateLeadStatus(selectedLead._id, e.target.value);
                      setSelectedLead({ ...selectedLead, status: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm font-medium text-navy"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-bold text-mid uppercase mb-2">Assigned To</div>
                  <input
                    type="text"
                    value={selectedLead.assignedTo || ''}
                    onChange={e => setSelectedLead({ ...selectedLead, assignedTo: e.target.value })}
                    onBlur={() => updateLeadNotes(selectedLead._id, selectedLead.notes)}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm"
                    placeholder="Sales rep name"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="text-xs font-bold text-mid uppercase mb-2">Notes</div>
                {editingId === selectedLead._id ? (
                  <div className="flex gap-2">
                    <textarea
                      value={selectedLead.notes || ''}
                      onChange={e => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                      className="flex-1 px-3 py-2 border border-line rounded-lg text-sm font-medium resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => updateLeadNotes(selectedLead._id, selectedLead.notes)}
                      className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold hover:bg-opacity-90"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingId(selectedLead._id)}
                    className="bg-gray-50 p-3 rounded-lg text-sm text-navy min-h-[60px] cursor-pointer hover:bg-raise"
                  >
                    {selectedLead.notes || 'Click to add notes...'}
                  </div>
                )}
              </div>

              {/* Source & Dates */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mid">Source:</span>
                  <span className="text-navy font-bold">{selectedLead.source || 'contact-form'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid">Created:</span>
                  <span className="text-navy">{new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedLead.conversions?.firstContactedAt && (
                  <div className="flex justify-between">
                    <span className="text-mid">First Contact:</span>
                    <span className="text-navy">{new Date(selectedLead.conversions.firstContactedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsCRM;
